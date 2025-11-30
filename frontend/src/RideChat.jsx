import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

// const API_URL = "http://localhost:4000";
const API_URL = "https://student-pool.onrender.com";

export default function RideChat({ rideId, currentUserId, currentUserName }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const newSocket = io(API_URL);
    setSocket(newSocket);

    newSocket.emit("join_ride", {
      rideId,
      userId: currentUserId,
      userName: currentUserName
    });

    newSocket.on("previous_messages", (previousMessages) => {
      setMessages(previousMessages);
    });

    newSocket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      newSocket.emit("leave_ride", { rideId, userName: currentUserName });
      newSocket.disconnect();
    };
  }, [rideId, currentUserId, currentUserName]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !socket) return;

    socket.emit("send_message", {
      rideId,
      userId: currentUserId,
      message: newMessage.trim()
    });

    setNewMessage("");
  };

  const formatTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  return (
    <div className="ride-chat-card">
      <div className="chat-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <h2>Ride Chat</h2>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwnMessage = msg.userId === currentUserId;
            
            return (
              <div
                key={index}
                className={`chat-message ${
                  isOwnMessage ? "chat-message-own" : "chat-message-other"
                }`}
              >
                <div className="chat-message-header">
                  <span className="chat-message-author">
                    {isOwnMessage ? "You" : msg.user.name}
                  </span>
                  <span className="chat-message-time">{formatTime(msg.createdAt)}</span>
                </div>
                <div className="chat-message-content">{msg.message}</div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-container">
        <input
          type="text"
          placeholder="Type a message..."
          className="chat-input"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="chat-send-btn" disabled={!newMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}