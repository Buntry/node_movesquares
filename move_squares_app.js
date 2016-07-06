var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

var path = require('path');

server.listen(8082, "104.131.8.231");

var objects = {};

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
   res.sendFile(__dirname + '/index.html'); 
});

io.sockets.on('connection', function(socket){
    console.log('user connected: ', socket.id);
    objects[socket.id] = new User();
    io.to(socket.id).emit('connected', GAME_SETTINGS);
    
    socket.on('disconnect', function(){
       delete objects[socket.id];
       console.log('user disconnected: ', socket.id);
    });
    
    socket.on('keydown', function(keyCode){
        objects[socket.id].keypress[keyCode] = true;
    });
    
    socket.on('keyup', function(keyCode){
        delete objects[socket.id].keypress[keyCode];
    })
    
});

var LEFT = 65, UP = 87, RIGHT = 68, DOWN = 83;
var GAME_SETTINGS = {
    WIDTH : 600, HEIGHT : 400, BG : "#FFFFFF"
};

var update = setInterval(function(){
   var idArray = [];
   var statusArray = {};
   for(var id in io.sockets.clients().connected){
       if(objects[id].keypress[LEFT]) objects[id].status.x -= 2;
       if(objects[id].keypress[UP]) objects[id].status.y -= 2;
       if(objects[id].keypress[RIGHT]) objects[id].status.x += 2;
       if(objects[id].keypress[DOWN]) objects[id].status.y += 2;
       
       idArray.push(id);
       statusArray[id] = objects[id].status;
   }
   
   io.emit('update', idArray, statusArray)
}, 10);

function User(){
    var color="#";
    for( var i = 0; i < 6; i++ ){
        color += (Math.floor(Math.random()*16)).toString(16);
    }
    
    this.status = {};
    this.status.x = 0;
    this.status.y = 0;
    this.status.height = 20;
    this.status.width = 20;
    this.status.color = color;
    this.keypress = [];
}