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

        var j = 0;
        for(var i = 0;i < clientId.length;i++)
            if(clientId[i]==null){
                clientId[i] = socket.id;
                j++;
                break;
            }
        if(j == 0){
            clientId.push(socket.id);
            console.log(" New position");
        }

        var j = 0;
        for(var i = 0;i < client.length;i++)
            if(client[i]==null){
                client[i] = socket;
                j++;
                break;
            }
        if(j == 0){
            client.push(socket);
        }
        client[clientId.indexOf(socket.id)].emit('id',client.length);
        console.log("New connection:  " +  socket.request.connection.remoteAddress +" Players Online:  "+client.length +" Index: "+client.indexOf(socket)+" "+socket.id+" Acessos:"+acessos+"  Par:"+par);

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
                console.log("Player has disconnected");
            }
       });

      socket.on('disconnect', function() {
          try{
              var index = clientId.indexOf(socket.id);
              client[index] = null;
              clientId[index] = null;
              console.log("exit..game over "+client.length+" - "+ socket.id+" removed in:"+index);
              if(index == client.length-1){
                client.pop();
                clientId.pop();
                console.log("last element removed")
              }
              if(par > 0){
                par--;
              }
          }catch(e){ console.log("disconnect error:"+e);}
      });
    }
    else{
        console.log("Server fulll");
        socket.emit("full",1);
    }
});
