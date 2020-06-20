
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const util = require('util');
const port = 3000;
const clients = [];	//track connected clients

//Server Web Client
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

//make one reference to event name so it can be easily renamed 
const chatEvent = "chatMessage";
const UpdateEvent = "UpdateMessage";
const PlayerEvent1 = "PlayerConnected";
const PlayerEvent2 = "PlayerDisconnected";
const PlayerEvent3 = "GetAllPlayer";
const BroadCastEvent = "BroadCastMessage";

//When a client connects, bind each desired event to the client socket
io.on('connection', socket =>{
    //track connected clients via log

    var OldPlayers = {};
    for (var i = 0; i < clients.length; i++) {
        OldPlayers["OldPlayer" + (i + 1)] = clients[i];
    }
    OldPlayers["OldPlayer0"] = clients.length + "";

    io.to(socket.id).emit(PlayerEvent3, OldPlayers);

    clients.push(socket.id);

	const clientConnectedMsg = 'User connected ' + util.inspect(socket.id) + ', total: ' + clients.length;
    //io.emit(PlayerEvent1, util.inspect(socket.id) + '');
	console.log(clientConnectedMsg);

	//track disconnected clients via log
    socket.on('disconnect', () => {
        clients.pop(socket.id);
        const clientDisconnectedMsg = 'User disconnected ' + util.inspect(socket.id) + ', total: ' + clients.length;
        //io.emit(PlayerEvent2, util.inspect(socket.id) + '');
        var DisConPlayer = {};
        DisConPlayer["DisConPlayer"] = util.inspect(socket.id) + "";
        io.emit(PlayerEvent2, DisConPlayer);
        console.log(clientDisconnectedMsg);
    });

    socket.on(chatEvent, msg => {
        //const combinedMsg = socket.id.substring(0, 4) + ': ' + msg;
        //io.emit(chatEvent, msg);
        io.to(msg["RecieverID"]).emit(chatEvent, msg["Message"]);
        //console.log('multicast: ' + combinedMsg);
    });

	//multicast received message from client
    socket.on(BroadCastEvent, msg =>{
		const combinedMsg = socket.id.substring(0,4) + ': ' + msg;
        io.emit(BroadCastEvent, msg);
		console.log('multicast: ' + combinedMsg);
    });

    socket.on(UpdateEvent, msg => {
        const combinedMsg = socket.id.substring(0, 4) + ': ' + msg;
        io.emit(UpdateEvent, msg);
        //console.log('multicast: ' + combinedMsg);
    });

    socket.on(PlayerEvent1, msg => {
        const combinedMsg = socket.id.substring(0, 4) + ': ' + msg;
        io.emit(PlayerEvent1, msg);
        console.log('multicast: ' + combinedMsg);
    });

    //socket.on(PlayerEvent2, msg => {
    //    const combinedMsg = socket.id.substring(0, 4) + ': ' + msg;
    //    io.emit(PlayerEvent2, msg);
    //    console.log('multicast: ' + combinedMsg);
    //});
});

//Start the Server
http.listen(port, () => {
  console.log('listening on *:' + port);
});
