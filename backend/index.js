const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

// -------------------- APP SETUP --------------------
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// -------------------- MONGODB --------------------
mongoose
  .connect("mongodb://127.0.0.1:27017/chatapp")
  .then(() => console.log("MongoDB connected successfully ✅"))
  .catch((err) => console.log("MongoDB error ❌", err));

// -------------------- MESSAGE SCHEMA --------------------
const messageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // ⭐ createdAt & updatedAt auto
);

const Message = mongoose.model("Message", messageSchema);

// -------------------- SOCKET.IO --------------------
io.on("connection", async (socket) => {
  console.log("🟢 New user connected:", socket.id);

  // send old messages to new user
  const messages = await Message.find().sort({ createdAt: 1 });
  socket.emit("chatHistory", messages);

  // receive new message
  socket.on("chatMessage", async (msg) => {
    try {
      const message = new Message({
        text: msg.text,
        sender: msg.sender,
      });

      const savedMessage = await message.save();

      // send to ALL clients
      io.emit("chatMessage", savedMessage);
    } catch (err) {
      console.log("Message save error ❌", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// -------------------- SERVER START --------------------
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
