// server/server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/notes", require("./routes/notes"));

// Socket.io connection
io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  // Join a room
  socket.on("join-room", (roomId, username) => {
    socket.join(roomId);
    console.log(`${username} joined room: ${roomId}`);

    // Notify everyone in the room
    io.to(roomId).emit("user-joined", { username, socketId: socket.id });

    // Send list of connected users
    const room = io.sockets.adapter.rooms.get(roomId);
    const users = room ? Array.from(room) : [];
    io.to(roomId).emit("room-users", users);
  });

  // Listen for note updates
  socket.on("update-note", (data) => {
    socket.to(data.roomId).emit("note-updated", data);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
    // Notify rooms that user has left
    socket.rooms.forEach((room) => {
      io.to(room).emit("user-left", socket.id);
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
