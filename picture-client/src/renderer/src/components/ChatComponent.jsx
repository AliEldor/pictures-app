import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import '../styles/ChatComponent.css';

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Init socket connection
  useEffect(() => {
    
    const CHAT_SERVER_URL = 'http://localhost:3001';
    console.log('Connecting to chat server at:', CHAT_SERVER_URL);
    
    const newSocket = io(CHAT_SERVER_URL, {
      withCredentials: false,
      transports: ['websocket', 'polling']
    });
    
    newSocket.on('connect', () => {
      console.log('Connected to chat server with ID:', newSocket.id);
      setIsConnected(true);
      setError(null);
    });
    
    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setIsConnected(false);
      setError(`Connection error: ${err.message}`);
    });
    
    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from chat server:', reason);
      setIsConnected(false);
    });
    
    // chat history when connecting
    newSocket.on('chat_history', (chatHistory) => {
      console.log('Received chat history:', chatHistory);
      setMessages(chatHistory);
    });
    
    // listen for new messages
    newSocket.on('new_message', (message) => {
      console.log('Received new message:', message);
      setMessages(prevMessages => [...prevMessages, message]);
    });
    
    setSocket(newSocket);
    
    
    return () => {
      console.log('Disconnecting socket');
      newSocket.disconnect();
    };
  }, []);
  
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !isConnected) return;
    
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    
    if (!userId) {
      alert('You must be logged in to send messages');
      return;
    }
    
    console.log('Sending message:', {
      userId: userId,
      text: newMessage.trim(),
      username: userName
    });
    
    // Send the message through socket
    socket.emit('send_message', {
      userId: parseInt(userId, 10),
      text: newMessage.trim()
    });
    
    // Clear the input
    setNewMessage('');
  };
  
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    // When opening chat, scroll to bottom
    if (!isChatOpen) {
      setTimeout(scrollToBottom, 100);
    }
  };
  
  
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };
  
  return (
    <div className="chat-container">
      <button 
        className={`chat-toggle-btn ${isChatOpen ? 'open' : ''}`} 
        onClick={toggleChat}
      >
        {isChatOpen ? 'Close Chat' : 'Open Chat'}
      </button>
      
      <div className={`chat-window ${isChatOpen ? 'open' : 'closed'}`}>
        <div className="chat-header">
          <h3>Gallery Community Chat</h3>
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        
        {error && <div className="chat-error">{error}</div>}
        
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="no-messages">No messages yet. Be the first to say hello!</div>
          ) : (
            messages.map((msg) => {
              const isCurrentUser = msg.userId === parseInt(localStorage.getItem('userId'), 10);
              
              return (
                <div 
                  key={msg.id} 
                  className={`message-bubble ${isCurrentUser ? 'sent' : 'received'}`}
                >
                  {!isCurrentUser && <div className="message-sender">{msg.username}</div>}
                  <div className="message-content">{msg.text}</div>
                  <div className="message-timestamp">{formatTimestamp(msg.timestamp)}</div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form className="message-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={!isConnected}
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim() || !isConnected}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatComponent;