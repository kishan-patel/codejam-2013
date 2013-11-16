var server = require('server.js')
  , config = require('config.js')
  , ml = require('machine_learning.js')
  , express = require('express')
  , https = require('https');

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
});

app.post('/machine',function(req,res) {
  var x = req.files.file.path;
  var csv = require('ya-csv');
  var reader = csv.createCsvFileReader(x,{'columnsFromHeader':true, 'separator':','});
  reader.addListener('data',function(data){
    server.csvClientData(data);
    console.log(data);
  });
  res.send("hello");
});

app.get('/pulseapi', function(req, res){
  var key = '8DCCE9C23F108A00F14E806BD21D8936';
  var interval = 'day';
  var start = '2013-11-05T08:15:30-05:00'
  var url = 'https://api.pulseenergy.com/pulse/1/points/50578/data.json?key='+key+'&interval='+interval+'&start='+start;
  
  https.get(url, function(res){
    res.on('data', function(chunk){
      var obj = JSON.parse(chunk);
      console.log(obj);
    });
  }).on('error', function(e){
    console.error('APP.js: '+e);
  });
});

app.get('/ml', function(req, res){
    ml.pulseForecast([]);
});

app.get('/ml-test', function(req, res){
    ml.brainTest();
});

server.start(io);
