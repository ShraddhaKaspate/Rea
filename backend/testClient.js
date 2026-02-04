const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);

  setTimeout(() => {
    socket.emit("chatMessage", {
      text: "Hello WhatsApp style 👋",
      sender: "TestUser"
    });
  }, 500);
});

socket.on("chatMessage", (msg) => {
  console.log(`📩 ${msg.time} | ${msg.sender}: ${msg.text}`);
});
