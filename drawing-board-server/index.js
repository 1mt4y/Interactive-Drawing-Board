// imports
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// initialize http and socket.io servers:
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // <- TODO: change this to only allow our front-end's hostname
    methods: ["GET", "POST"],
  },
});

app.use(cors());

let roomStates = new Map();

io.on("connection", (socket) => {
  console.log(`user ${socket.id} connected`);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`user ${socket.id} joined room ${roomId}`);

    if (!roomStates.has(roomId)) {
      // first one to join this room (no previous state):
      roomStates.set(roomId, {
        state: null,
        numberOfConnectedClients: 1,
      });
    } else {
      roomStates.get(roomId).numberOfConnectedClients++;
    }

    // send current state to the newly connected client (will be null if he's first)
    socket.emit("draw", roomStates.get(roomId).state);

    socket.on("draw", (newState) => {
      socket.to(roomId).emit("draw", newState);
      roomStates.set(roomId, {
        state: newState,
        numberOfConnectedClients:
          roomStates.get(roomId).numberOfConnectedClients,
      });
    });

    socket.on("disconnect", () => {
      roomStates.get(roomId).numberOfConnectedClients--;
      // when all users leave a room we delete its latest state from memory
      if (roomStates.get(roomId).numberOfConnectedClients === 0) {
        roomStates.delete(roomId);
        console.log(`deleted room ${roomId}`);
      }
      console.log(`user ${socket.id} disconnected`);
    });
  });
});

httpServer.listen(10000);
