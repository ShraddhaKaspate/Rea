import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // same browser → different tab → different user
  const sender =
    window.name || (window.name = Math.random() > 0.5 ? "Shraddha" : "Tanu");

  useEffect(() => {
    socket.on("chatHistory", (msgs) => {
      setMessages(msgs);
    });

    socket.on("chatMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("chatHistory");
      socket.off("chatMessage");
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;

    socket.emit("chatMessage", {
      text: input,
      sender,
    });

    setInput("");
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.avatar}>{sender[0]}</div>
        <div>
          <div style={styles.name}>{sender}</div>
          <div style={styles.status}>online</div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div style={styles.chat}>
        {messages.map((msg, i) => {
          const isSender = msg.sender === sender;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: isSender ? "flex-end" : "flex-start",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  ...styles.bubble,
                  background: isSender ? "#dcf8c6" : "#ffffff",
                }}
              >
                <div>{msg.text}</div>

                <div style={styles.time}>
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT */}
      <div style={styles.inputBar}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message"
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.sendBtn}>
          ➤
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#0f172a",
    fontFamily: "sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    padding: "12px 16px",
    background: "#020617",
    color: "#fff",
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "#22c55e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
  name: {
    fontWeight: "bold",
  },
  status: {
    fontSize: 12,
    color: "#94a3b8",
  },
  chat: {
    flex: 1,
    padding: 16,
    overflowY: "auto",
    background: "#e5ddd5",
  },
  bubble: {
    padding: "8px 12px",
    borderRadius: 12,
    maxWidth: "70%",
    fontSize: 14,
  },
  time: {
    fontSize: 10,
    textAlign: "right",
    color: "#555",
    marginTop: 4,
  },
  inputBar: {
    display: "flex",
    padding: 10,
    background: "#020617",
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    border: "none",
    outline: "none",
  },
  sendBtn: {
    marginLeft: 10,
    background: "#22c55e",
    border: "none",
    color: "#fff",
    borderRadius: "50%",
    width: 40,
    height: 40,
    cursor: "pointer",
  },
};

export default App;
