var server = require('server.js')
  , config = require('config.js')
  , express = require('express');

var app = express();
var httpServer = app.listen(config.APP_PORT);
var io = require('socket.io').listen(httpServer);

//App configurations
app.configure(function(){
  app.use(app.router);
  app.use(express.static(__dirname+'/public'));
  app.use(express.static(__dirname+'/lib'));
});

app.get('/', function(req, res){
  res.sendfile('public/index.html');
});

server.start(io);
