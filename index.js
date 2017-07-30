const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const PORT = 3000

//signalling via websockets
io.on('connection', function(socket) {
  console.log('Socket IO connection established')

  //listen for signal from client
  socket.on('message', function(message) {
    console.log(message)

    // For a real app, should be room only (not broadcast)
		socket.broadcast.emit('textMessage', message);
  })
})

app.get('/', function(req, res) {
  res.send('Hello, world')
})

server.listen(PORT, function() {
  console.log(`Express currently listening on port ${PORT}`)
})

