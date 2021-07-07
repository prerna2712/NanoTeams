require('dotenv').config();
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

const rooms = {};
// Pusher start
const Pusher = require("pusher");

const pusher = new Pusher({
  appId: "1231591",
  key: "1f126db1115d0d274821",
  secret: "9017383c9e03b8c87f9b",
  cluster: "ap2",
  useTLS: true
});

// pusher.trigger("my-channel", "my-event", {
//   message: "hello world"
// });
// Pusher end

app.use(express.static('./build'));
app.get('/*', function (req, res) {
    res.sendFile('index.html', { root: './build' })
})

const PORT = process.env.PORT || 8000;

io.on("connection", socket => {
    socket.on("join room", roomID => {
        if (rooms[roomID]) {
            rooms[roomID].push(socket.id);
        } else {
            rooms[roomID] = [socket.id];
        }
        const otherUser = rooms[roomID].find(id => id !== socket.id);
        if (otherUser) {
            socket.emit("other user", otherUser);
            socket.to(otherUser).emit("user joined", socket.id);
        }
        socket.on('disconnect', () => {
            delete rooms[roomID];
        })
    });

    socket.on("offer", payload => {
        io.to(payload.target).emit("offer", payload);
    });

    socket.on("answer", payload => {
        io.to(payload.target).emit("answer", payload);
    });

    socket.on("ice-candidate", incoming => {
        io.to(incoming.target).emit("ice-candidate", incoming.candidate);
    });
});

// if (process.env.PORT) {
//     app.use(express.static('./client/build'));
//     app.get('/*', function (req, res) {
//         res.sendFile('index.html', { root: './client/build' })
//     })
// }

server.listen(PORT, () => console.log('server is running on port 8000'));
