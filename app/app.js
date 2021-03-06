var server = require('server.js')
  , config = require('config.js')
  , machineLearning = require('machine_learning.js')
  , express = require('express')
  , https = require('https')
  , conLearning = require('conf_learning.js');

var app = express();
var httpServer = app.listen(config.APP_PORT);
var io = require('socket.io').listen(httpServer);

//App configurations
app.configure(function(){
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.static(__dirname+'/public'));
  app.use(express.static(__dirname+'/lib'));
});

app.get('/', function(req, res){
  res.sendfile('public/index.html');
});
app.get('/csv',function(req,res){
  res.sendfile('public/csv.html');
});
app.get('/pulse',function(req,res){
  res.sendfile('public/pulse.html');
//  machineLearning.pulseForecast([]);
});

app.post('/machine',function(req,res) {
  var x = req.files.file.path;
  var csv = require('ya-csv');
  var reader = csv.createCsvFileReader(x,{'columnsFromHeader':true, 'separator':','});
  var dataArray = [];
  reader.addListener('data',function(data){
    var nameMapping = {};
    nameMapping["date"] = data["Date"];
    nameMapping["radiation"] = parseFloat(data["Montreal Net Radiation - CWTA (W/m2)"]);
    nameMapping["humidity"] = parseFloat(data["Montreal Relative Humidity - CWTA"]);
    nameMapping["temperature"] = parseFloat(data["Montreal Temperature - CWTA (C)"]);
    nameMapping["wind"] = parseFloat(data["Montreal Wind Speed - CWTA (km/h)"]);
    nameMapping["power"] = parseFloat(data["Real Power Demand - Downtown Main Entrance (kW)"]);
    dataArray.push(nameMapping);
//    console.log(data);
  });
  reader.addListener('end',function(){
    if(dataArray.length != 0){
      var forecastedData = machineLearning.csvForecast(dataArray, 'csv');
      server.csvClientData(forecastedData);

      //We need to convert the JSON object into csv
      var csvString = 'Date,Real Power Demand - Downtown Main Entrance (kW)\n';
      for(var i=0; i<forecastedData.length; i++){
          if(forecastedData[i].forecast!=undefined && forecastedData[i].forecast)
            csvString += forecastedData[i].date + ',' + forecastedData[i].power+'\n';
      }
      res.send(csvString);
      dataArray = [];
    }
  });
});
app.post('/confidence-post',function(req,res) {

  var x = req.files.file.path;
  var csv = require('ya-csv');
  var reader = csv.createCsvFileReader(x,{'columnsFromHeader':true, 'separator':','});
  var dataArray = [];
  reader.addListener('data',function(data){
    var nameMapping = {};
    nameMapping["date"] = data["Date"];
    nameMapping["radiation"] = parseFloat(data["Montreal Net Radiation - CWTA (W/m2)"]);
    nameMapping["humidity"] = parseFloat(data["Montreal Relative Humidity - CWTA"]);
    nameMapping["temperature"] = parseFloat(data["Montreal Temperature - CWTA (C)"]);
    nameMapping["wind"] = parseFloat(data["Montreal Wind Speed - CWTA (km/h)"]);
    nameMapping["power"] = parseFloat(data["Real Power Demand - Downtown Main Entrance (kW)"]);
    dataArray.push(nameMapping);
    //console.log(data);
  });
  reader.addListener('end',function(){
    if(dataArray.length != 0){
      var forecastedData = conLearning.csvForecast(dataArray, 'csv');
      server.confidenceClientData(forecastedData);
      
      res.send(forecastedData);
    }
  });
});
app.get('/confidence-bound', function(req, res){
  res.sendfile('public/confidence.html');
});

app.get('/ml-performance', function(req, res){
  //machineLearning.trainAndTest();
  res.sendfile('public/performance.html');
});

app.get('/ml-test', function(req, res){
    machineLearning.brainTest();
});

server.start(io);
