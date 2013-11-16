var server = require('server.js')
  , config = require('config.js')
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
  var dataArray = [];
  var counter = 1000;
  reader.addListener('data',function(data){
//    if(counter >=0){
        dataArray.push(data);
        counter--;
 //   }
   // dataArray.push(data);
    if(dataArray.length >=100){
//      server.csvClientData(dataArray);
 //     dataArray =[];
    }
    console.log(data);
  });
  reader.addListener('end',function(){
    if(dataArray.length != 0){
      server.csvClientData(dataArray);
      dataArray = [];
    }
  });
  res.send("hello");
});

app.get('/pulse', function(req, res){
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

server.start(io);
