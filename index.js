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
var acessos = -1;
var par = 0;

io.sockets.on('connection', function (socket) {
    if(client.length < 100 ){

        acessos++;
        par++;
        clientId[acessos] = socket.id;
        client[acessos] = socket;
        client[clientId.indexOf(socket.id)].emit('id',client.length);
        console.log("New connection:  " +  socket.request.connection.remoteAddress +" Player Online:  "+client.length +" Index: "+client.indexOf(socket)+" "+socket.id+" Acessos:"+acessos+"  Par:"+par);
    
       if(par == 2){
            var i = client.indexOf(socket);
            var j = i;
            j--;
            client[i].emit('gameOn',clientId[j]);
            client[j].emit('gameOn',clientId[i]);
            console.log('Game on');
            par = 0;
        }

        socket.on('update', function(id,msg){
            try{
                client[clientId.indexOf(id)].emit('serverData', msg);
            }catch(e){
                socket.emit('off',1);
                console.log("Oponente desconectou");
            }
       });

      socket.on('disconnect', function() {
          try{
              var index = clientId.indexOf(socket.id);
              console.log("saiu...Paritda encerrada "+client.length+" - "+ socket.id);
              if(clientId.indexOf(socket.id)%2 == 0)
                index++;
                else
                if(clientId.indexOf(socket.id)%2 == 1)
                    index--;
              client[index].emit('off',1);
              acessos--;
              par = 0;
          }catch(e){ console.log(e);}
      });
    }
    else{
        console.log("sala cheia");
        socket.emit("full",1);
    }
});
