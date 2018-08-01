var baseUrl = 'http://dct-api-data.herokuapp.com'
var countHandle = document.getElementById('count');
var tableBodyHandle = document.getElementById('tableBody');
var ticketFormHandle = document.getElementById('ticketForm'); 

var nameHandle = document.getElementById('name');
var departmentHandle = document.getElementById('department');
var priorityHandle = document.getElementById('priority');
var priorityNames = document.getElementsByName('priority'); 
var messageHandle = document.getElementById('message'); 

var allHandle = document.getElementById('all');
var highHandle = document.getElementById('high');
var mediumHandle = document.getElementById('medium');
var lowHandle = document.getElementById('low');

var searchHandle = document.getElementById('search');

var tickets;

var tr;

var progressHandle = document.getElementById('progress');
var containerHandle = document.getElementById('container');

var completeCount;
var highPersent;
var lowPersent;
var mediumPersent;

function buildProgress()
{
  var percentage = (completeCount/tickets.length)*100;
  console.log(percentage);
  progressHandle.setAttribute("style",`width: ${percentage}%`);
}

function stats(ticketCode)
{
    var tick = document.getElementById(ticketCode);
    var parent = tick.parentNode;
    var value = (tick.checked)? 'completed' : 'open';
        axios.put(`${baseUrl}/tickets/${ticketCode}?api_key=${key}`,{status : value})
        .then(response => {
           var ticket = response.data;
           console.log(`status = ${ticket.status}`)
           parent.childNodes[1].innerHTML = ticket.status;
           (ticket.status === 'completed')? completeCount++ : completeCount--; 
           buildProgress();
        })
        .catch(err => {
            console.log(err);
        }); 
}

function onlygetTickets()
{
        axios.get(`${baseUrl}/tickets?api_key=${key}`)
            .then(response => {
                tickets = response.data;
            })
            .catch(err => {
                console.log(err);
            });
}

function filterTickets(priority){
    onlygetTickets();
    tableBodyHandle.innerHTML = '';
    var count = 0;
    tickets.forEach(function (ticket) {
        if (ticket.priority === priority) {
            count++;
            buildRow(ticket);
        }
    });
    countHandle.innerHTML = count; 
}

searchHandle.addEventListener('keyup',function(){
   tableBodyHandle.innerHTML = '';
   var searchResults = tickets.filter(function(ticket){
        return ticket.ticket_code.toLowerCase().indexOf(searchHandle.value.toLowerCase()) >= 0; 
   });

   searchResults.forEach(function(ticket){
        buildRow(ticket); 
   })
   countHandle.innerHTML = searchResults.length; 
}, false);


highHandle.addEventListener('click', function(){
 filterTickets('High');
}, false); 

mediumHandle.addEventListener('click', function(){
  filterTickets('Medium');
}, false);

lowHandle.addEventListener('click', function(){
    filterTickets('low');
}, false);

allHandle.addEventListener('click', function () {
    tableBodyHandle.innerHTML = '';
    tickets.forEach(function (ticket) {
        buildRow(ticket);
    });
    countHandle.innerHTML = tickets.length;``
}, false);

function buildRow(ticket){
    var tr = document.createElement('tr'); 
    if(ticket.status === 'completed')
    {
        tr.innerHTML = `
        <td>${ticket.ticket_code}</td>
        <td>${ticket.name}</td>
        <td>${ticket.department}</td>
        <td>${ticket.priority}</td>
        <td>${ticket.message}</td>     
        <td><input type="checkbox" id="${ticket.ticket_code}" checked="true" onclick="stats(this.id)"><span>${ticket.status}</span></td>`;
    }else{
        tr.innerHTML = `
        <td>${ticket.ticket_code}</td>
        <td>${ticket.name}</td>
        <td>${ticket.department}</td>
        <td>${ticket.priority}</td>
        <td>${ticket.message}</td>     
        <td><input type="checkbox" id="${ticket.ticket_code}" onclick="stats(this.id)"><span>${ticket.status}</span></td>`;
    }
    tableBodyHandle.appendChild(tr); 
}

function getTickets() {
    axios.get(`${baseUrl}/tickets?api_key=${key}`)
        .then(function (response) {
            tickets = response.data;
            countHandle.innerHTML = tickets.length;
            tickets.forEach(function (ticket) {
                buildRow(ticket);
            })
            completeCount = tickets.filter(ele => ele.status === 'completed').length;
            highPersent = calculate('High');
            lowPersent = calculate('low');
            mediumPersent = calculate('Medium');
            buildProgress();
            buildChart();
        })
        .catch(err => {
        console.log(err); 
        });
}

function calculate(value)
{
  var count = (tickets.filter(ele => ele.priority === value).length/tickets.length)*100;
  return count;
}

function getPriorityValue(){
    for(var i = 0; i < priorityNames.length; i++) {
        if(priorityNames[i].checked){
            return priorityNames[i].value; 
        }
    }
}

ticketFormHandle.addEventListener('submit', function(e){
    e.preventDefault(); 
    var formData = {
        name: nameHandle.value,
        department: departmentHandle.value,
        priority: getPriorityValue(),
        message: messageHandle.value 
    }; 

    axios.post(`${baseUrl}/tickets?api_key=${key}`, formData)
    .then(function(response){
        var ticket = response.data; 
        getTickets();
        buildRow(ticket); 
        countHandle.innerHTML = parseInt(countHandle.innerHTML) + 1; 
        ticketFormHandle.reset(); 
    })
    .catch(function(err){
        console.log(err); 
    })
}, false); 

var myChart;

function buildChart(){
myChart = Highcharts.chart('container', {
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
    },
    title: {
        text: 'priority'
    },
    tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                style: {
                    color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                }
            }
        }
    },
    series: [{
        name: 'Priority',
        colorByPoint: true,
        data: [{
            name: 'High',
            y: highPersent,
        }, {
            name: 'Medium',
            y: mediumPersent,
        }, {
            name: 'Low',
            y: lowPersent,
        }]
    }]
});
}


window.addEventListener('load', function(){
    getTickets(); 
}, false)
