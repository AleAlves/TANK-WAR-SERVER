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
  res.sendFile('index.html');
});

var client = new Array(0);
var clientId = new Array(0);
var acessos = 0;
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
                console.log(" Used position");
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
        console.log("New connection:  " +  socket.request.connection.remoteAddress +" Player Online:  "+client.length +" Index: "+client.indexOf(socket)+" "+socket.id+" Acessos:"+acessos+"  Par:"+par);

       if(par == 2){
            var i = clientId.indexOf(socket.id);
            var j = i;
            if(i%2 == 0)
                j++;
            else
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
              client[index] = null;
              clientId[index] = null;
              console.log("exited...Game over"+client.length+" - "+ socket.id+" removed at:"+index);
                if(par > 0)
                    par--;
              console.log("last element removed, size:"+ client.length +" id "+ clientId.length);
          }catch(e){ console.log("disconnect error:"+e);}
      });
    }
    else{
        console.log("server full");
        socket.emit("full",1);
    }
});
