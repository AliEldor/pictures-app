const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mysql = require("mysql2/promise");
const app = express();

app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: true,
  },
});


const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "pictures-app",
  port: process.env.DB_PORT || 3306
};

const pool = mysql.createPool(dbConfig);

// get last 50 msgs

async function getMessages(limit = 50) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      `
      SELECT m.id, m.user_id as userId, u.full_name as username, m.message as text, m.created_at as timestamp
      FROM chat_messages m
      JOIN users u ON m.user_id = u.id
      ORDER BY m.created_at DESC
      LIMIT ?
    `,
      [limit]
    );
    connection.release();
    return rows.reverse();
  } catch (error) {
    console.error("Database error:", error);
    return [];
  }
}

async function saveMessage(userId, message) {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      `
      INSERT INTO chat_messages (user_id, message, created_at, updated_at)
      VALUES (?, ?, NOW(), NOW())
    `,
      [userId, message]
    );
    connection.release();
    return result.insertId;
  } catch (error) {
    console.error("Error saving message:", error);
    return null;
  }
}

async function getUserName(userId) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      `
      SELECT full_name FROM users WHERE id = ?
    `,
      [userId]
    );
    connection.release();
    return rows.length > 0 ? rows[0].full_name : "Unknown User";
  } catch (error) {
    console.error("Error getting username:", error);
    return "Unknown User";
  }
}

io.on("connection", async (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Send chat history to newly connected user
  const messages = await getMessages();
  socket.emit("chat_history", messages);
  
  // Handle new messages
  socket.on("send_message", async (messageData) => {
    try {
      const messageId = await saveMessage(messageData.userId, messageData.text);
      if (messageId) {
        const username = await getUserName(messageData.userId);
        const fullMessage = {
          id: messageId,
          userId: messageData.userId,
          username: username,
          text: messageData.text,
          timestamp: new Date().toISOString(),
        };
        io.emit("new_message", fullMessage);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });
  
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.get("/", (req, res) => {
  res.send("Chat server is running");
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Chat server running on port ${PORT}`);
});