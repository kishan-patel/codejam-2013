var server = require('server.js')
  , config = require('config.js')
  , express = require('express');

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

server.start(io);
