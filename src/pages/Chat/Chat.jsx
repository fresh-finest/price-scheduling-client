import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import "./Chat.css"; // Optional: Add CSS for chatbot button and modal

const socket = io("http://localhost:3000"); // Connect to the backend server

const Chat = () => {
  const [messages, setMessages] = useState([]); // Local state for messages
  const [input, setInput] = useState(""); // Local state for input
  const [isOpen, setIsOpen] = useState(false); // Modal state
  const sellerId = "67640ec5f9f924bce321f574"; // Seller ID

  // Fetch previous messages from the backend
  const fetchMessages = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/message/${sellerId}`);
      if (response.data.status === "Success") {
        const fetchedMessages = response.data.result.map((msg) => {
          const formattedMessages = [];

          // Add seller messages
          formattedMessages.push({
            sender: "customer",
            text: msg.sellerMessage,
            timestamp: msg.createdAt,
          });

          // Add support responses
          msg.supportResponse.forEach((response) => {
            formattedMessages.push({
              sender: "support",
              text: response.text,
              timestamp: response.timestamps,
            });
          });

          return formattedMessages;
        });

        // Flatten and set messages
        setMessages(fetchedMessages.flat());
      }
    } catch (error) {
      console.error("Error fetching messages:", error.message);
    }
  };

  // Open chat and fetch previous messages
  const openChat = () => {
    setIsOpen(true);
    fetchMessages(); // Fetch messages when the chat opens
  };

  // Send a new message
  const sendMessage = () => {
    if (input.trim() === "") return;

    const newMessage = {
      sellerId,
      sellerMessage: input,
      sender: "customer",
      timestamp: new Date().toISOString(),
    };

    // Emit the message to the server
    socket.emit("customer_message", newMessage);

    // Add the message to the local state
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput(""); // Clear the input field
  };

  // Real-time listener for new messages
  useEffect(() => {
    socket.on("new_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]); // Add real-time messages
    });

    return () => {
      socket.off("new_message"); // Clean up the listener
    };
  }, []);

  // Fetch previous messages on initial load (for page reloads)
  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <>
      {/* Chatbot Button */}
      <button className="chatbot-button" onClick={openChat}>
        💬 
      </button>

      {/* Modal for Chat */}
      {isOpen && (
        <div className="chat-modal">
          <div className="chat-modal-content">
            <div className="chat-modal-header">
              <h3>Chat</h3>
              <button className="chat-modal-close" onClick={() => setIsOpen(false)}>
                &times;
              </button>
            </div>
            <div className="chat-modal-body">
              <div className="messages" style={{ maxHeight: "300px", overflowY: "auto" }}>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      textAlign: msg.sender === "customer" ? "right" : "left",
                      margin: "5px 0",
                    }}
                  >
                    <p>
                      <strong>{msg.sender === "customer" ? "You" : "Support"}:</strong> {msg.text}
                    </p>
                    <small style={{ fontSize: "0.8em", color: "gray" }}>
                      {new Date(msg.timestamp).toLocaleString()}
                    </small>
                  </div>
                ))}
              </div>
              <div className="chat-input">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message"
                  style={{ width: "70%", marginRight: "5px" }}
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;
