var express = require("express"),
app = express(),
http = require("http"),
socketIo = require("socket.io");

Player = require("./Player.js");


var nextClientId = 0;
var server = http.createServer(app);
var io = socketIo.listen(server);
server.listen(8080);
// app.use(express.static(__dirname + "/assets"));
app.use(express.static(__dirname + "/../dist"));
console.log("Server running on 127.0.0.1:8080");

// // History of all lines ever drawn
// var line_history = [];

var allClients = [];
var playerMap = {};
// Handler for new incoming connections
io.on("connection", function(socket) {
  socket.gameId = nextClientId;
  nextClientId++;
  allClients.push(socket);
  playerMap[socket.gameId] = new Player(0, 0);
  socket.emit("setup", {gameId: socket.gameId});
  console.log("Socket connected");

  socket.on("disconnect", function(data) {
    console.log("Socket", socket.gameId, "disconnected.");
    var i = allClients.indexOf(socket);
    allClients.splice(i, 1);
    delete playerMap[socket.gameId];
  });

  socket.on("gameUpdate", function(data) {
    playerMap[socket.gameId].move(data.x, data.y);
    // console.log("received game update");
  });

  setInterval(function() {
    io.emit("serverUpdate", {numPlayers: allClients.length, playerMap: playerMap});
    // console.log("server update sent");
  // }, 1000 / 10)
  }, 1000 / 10)


});
