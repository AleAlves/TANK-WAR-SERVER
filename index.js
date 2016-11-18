console.log("Server on");

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 8080;
io.set('heartbeat interval', 1);
io.set('heartbeat timeout', 240000);

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

app.get('/', function(req, res){
  res.sendfile('index.html');
});

var client = new Array(0);
var clientId = new Array(0);
var room = [];
var indexRoom = 0;
var acessos = 0;
var par = 2;
var count = 0;

for(var i = 0; i < 100; i++)
    room[i] = i.toString();

io.sockets.on('connection', function (socket) {
    if(client.length < 100 ){

      socket.emit('id',client.length%2);
      clientId[socket.id] = socket;
      client[client.length] = clientId[(socket.id).toString()];
      acessos++;
      if(acessos > par){
          par+=2;
          indexRoom++;
          room[indexRoom];
          count = 0;
      }
      socket.join(room[indexRoom]);
      count++;
      console.log("Entrou na sala: "+room[indexRoom]+"/"+count);
      console.log("New connection:  " +  socket.request.connection.remoteAddress +" Player Online:  "+client.length +" Index: "+client.indexOf(socket)+" "+socket.id);
    
       if(count == 2){
           var i = client.length;
           var j = client.length;
           i= i - 1;
           j = j - 2;
           console.log("i "+i+" j "+j);
            client[i].emit('gameOn',j);
            client[j].emit('gameOn',i);
            console.log('Game on');
        }

       socket.on('update', function(id,msg){
               client[id].emit("serverData",msg);
       });

      socket.on('disconnect', function() {

      console.log("saiu...Paritda encerrada"+client.length+" - "+socket.id);
      client.splice(clientId.indexOf(socket.id),1);
      console.log("Jogadores Online"+client.length);

    });
    }
    else{
        console.log("sala cheia");
        socket.emit("full",1);
    }
});
