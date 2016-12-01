console.log("Starting server v1.0");

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 8080;
io.set('heartbeat interval', 100000);
io.set('heartbeat timeout', 240000);

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

app.get('/', function(req, res){
  res.sendfile('index.html');
});

var client = new Array(0);
var clientId = new Array(0);
var acessos = 0;
var par = 0;

io.sockets.on('connection', function (socket) {

    if(client.length < 1000 ){
        acessos++;
        par++;
        clientId.push(socket.id);
        client.push(socket);
        socket.emit('id',par%2);
        console.log("New connection:  " +  socket.request.connection.remoteAddress +" Player Online:  "+client.length +" Index: "+client.indexOf(socket)+" "+socket.id+" Access n#:"+acessos+"  Par:"+par);
       
       try{
        if(par == 2){
            var i = clientId.indexOf(socket.id);
            var j = i;
            if(i%2 == 0)
                j++;
            else
                j--;
            client[j].emit('gameOn',clientId[i]);
            client[i].emit('gameOn',clientId[j]);
            console.log("Send id:"+i+" to :"+j);
            console.log("Send id:"+j+" to :"+i);
            console.log('Game on');
            par = 0;
        }

       }catch(e){ console.log("Could not start a game");}
        
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
              
                for(var i = 0; i < client.length; i++){
                            if(client[i] == null){
                                var k = i;
                                for(var j = i + 1; j< client.length;j++)
                                    if(client[j] != null){
                                        client[k] = client[j];
                                        client[j] = null;
                                        k++;
                                    }
                                client.pop();
                            }
                        }

                for(var i = 0; i < clientId.length; i++){
                        if(clientId[i] == null){
                            var k = i;
                            for(var j = i + 1; j< clientId.length;j++)
                                if(clientId[j] != null){
                                    clientId[k] = clientId[j];
                                    clientId[j] = null;
                                    k++;
                                }
                            clientId.pop();
                        }
                    }
                if(client.length == 0 && clientId.length == 0 && par > 0)
                    par = 0;
                if(client.length == 0 && clientId.length == 0 && par%2 == 1)
                    par--;
              console.log("Player exited...Game over, "+client.length+" - "+ socket.id+" removed");
          }catch(e){ console.log("disconnect error:"+e);}
      });
    }
    else{
        console.log("Server full");
        socket.emit("full",1);
    }
});
