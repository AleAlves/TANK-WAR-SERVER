console.log("Server on");

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 80;
io.set('heartbeat interval', 1);
io.set('heartbeat timeout', 240000);

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

app.get('/', function(req, res){
  res.sendfile('index.html');
});

var client = new Array(0);

io.sockets.on('connection', function (socket) {
    if(client.length < 2 ){

      socket.emit('id',client.length%2);

      client[client.length%2] = socket;

      if(client.length == 2){
            for(var i = 0; i < client.length;i++){
                client[i].emit('gameOn',1);
            }
            console.log('Game on');
        }

      console.log("New connection:  " +  socket.request.connection.remoteAddress +" Player Online:  "+client.length +" Index: "+client.indexOf(socket));

      socket.on('update', function(id,msg){

          switch(id)
          {
            case 0:
                if(client.length == 2){
                  client[1].emit('serverData', msg);
                }
              break;
            case 1:
                if(client.length == 2){
                  client[0].emit('serverData', msg);
                }
              break;
          }

    }, 0);

    socket.on('disconnect', function(socket) {
      for(var i = 0; i < client.length; i++){
            client[i].emit("off",1);
      }
      for(var j = 0; j < 2; j++)
          client.pop();
        console.log("saiu...Paritda encerrada"+client.length);
    });
    }
    else{
        console.log("sala cheia");
        socket.emit("full",1);
    }
});
