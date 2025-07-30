import React, { useState, useEffect } from 'react';
import './App.css';
import ChatHeader from './components/ChatHeader';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import ChatHistory from './components/ChatHistory';
import { sendMessage } from './services/chatbotService';
import {
  createUser,
  signInUser,
  signOutUser,
  getCurrentUser,
  onAuthStateChange,
  createChat,
  getUserChats,
  getChatMessages,
  addMessage,
  updateChatTitle,
  deleteChat,
  subscribeToUserChats,
  subscribeToChatMessages,
  getChatStats
} from './services/database';

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [chatStats, setChatStats] = useState(null);
  const [unsubscribeChats, setUnsubscribeChats] = useState(null);
  const [unsubscribeMessages, setUnsubscribeMessages] = useState(null);

  // Check if user is logged in on app start
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName || user.email}`
        });
        setIsAuthenticated(true);
        loadUserData(user.uid);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setChatHistory([]);
        setMessages([]);
        setCurrentChatId(null);
        setChatStats(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async (userId) => {
    try {
      // Subscribe to user's chats
      const unsubscribe = subscribeToUserChats(userId, (chats) => {
        setChatHistory(chats);
      });
      setUnsubscribeChats(() => unsubscribe);

      // Load chat statistics
      const stats = await getChatStats(userId);
      setChatStats(stats);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim() || !currentUser) return;

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Create new chat if none exists
      let chatId = currentChatId;
      if (!chatId) {
        chatId = await createChat(currentUser.uid, messageText.substring(0, 50), messageText);
        setCurrentChatId(chatId);
      } else {
        // Add user message to database
        await addMessage(chatId, currentUser.uid, messageText, 'user');
      }

      // Get AI response
      const response = await sendMessage(messageText);
      
      const botMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Add bot message to database
      await addMessage(chatId, currentUser.uid, response, 'bot');

      // Update chat title if it's the first message
      if (!currentChatId) {
        await updateChatTitle(chatId, messageText.substring(0, 50) + (messageText.length > 50 ? '...' : ''));
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I couldn't process your request. Please try again.",
        sender: 'bot',
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (userData) => {
    try {
      const user = await signInUser(userData.email, userData.password);
      setCurrentUser(user);
      setIsAuthenticated(true);
      await loadUserData(user.uid);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleSignUp = async (userData) => {
    try {
      const user = await createUser(userData);
      setCurrentUser(user);
      setIsAuthenticated(true);
      await loadUserData(user.uid);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      // Unsubscribe from real-time listeners
      if (unsubscribeChats) unsubscribeChats();
      if (unsubscribeMessages) unsubscribeMessages();

      await signOutUser();
      setCurrentUser(null);
      setIsAuthenticated(false);
      setMessages([]);
      setCurrentChatId(null);
      setChatHistory([]);
      setChatStats(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    
    // Unsubscribe from current chat messages
    if (unsubscribeMessages) {
      unsubscribeMessages();
      setUnsubscribeMessages(null);
    }
  };

  const loadChat = async (chat) => {
    try {
      // Unsubscribe from previous chat messages
      if (unsubscribeMessages) {
        unsubscribeMessages();
      }

      // Subscribe to chat messages
      const unsubscribe = subscribeToChatMessages(chat.id, (messages) => {
        setMessages(messages);
      });
      setUnsubscribeMessages(() => unsubscribe);

      setCurrentChatId(chat.id);
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const deleteChat = async (chatId) => {
    try {
      await deleteChat(chatId);
      
      if (currentChatId === chatId) {
        setMessages([]);
        setCurrentChatId(null);
        
        // Unsubscribe from messages
        if (unsubscribeMessages) {
          unsubscribeMessages();
          setUnsubscribeMessages(null);
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeChats) unsubscribeChats();
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, [unsubscribeChats, unsubscribeMessages]);

  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>🤖 AI Chatbot</h1>
            <p>Sign in to start chatting with AI</p>
          </div>
          <div className="auth-tabs">
            <button 
              className="auth-tab active" 
              onClick={() => setShowSidebar(true)}
            >
              Login
            </button>
            <button 
              className="auth-tab" 
              onClick={() => setShowSidebar(false)}
            >
              Sign Up
            </button>
          </div>
          {showSidebar ? (
            <Login onLogin={handleLogin} />
          ) : (
            <SignUp onSignUp={handleSignUp} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>🤖 AI Chat</h2>
          <button className="new-chat-btn" onClick={startNewChat}>
            + New Chat
          </button>
        </div>
        
        <div className="user-info">
          <div className="user-avatar">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div className="user-details">
            <span className="user-name">{currentUser?.name || 'User'}</span>
            <span className="user-email">{currentUser?.email}</span>
            {chatStats && (
              <span className="user-stats">
                {chatStats.totalChats} chats • {chatStats.totalMessages} messages
              </span>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            🚪
          </button>
        </div>

        <ChatHistory 
          chatHistory={chatHistory}
          currentChatId={currentChatId}
          onChatSelect={loadChat}
          onChatDelete={deleteChat}
        />
      </div>

      <div className="main-content">
        <ChatHeader 
          currentChat={chatHistory.find(chat => chat.id === currentChatId)}
          onNewChat={startNewChat}
        />
        
        <div className="chat-container">
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="welcome-message">
                <div className="welcome-icon">🤖</div>
                <h2>Welcome to AI Chatbot!</h2>
                <p>I'm here to help you with any questions. Just type your message below and I'll respond.</p>
                <div className="suggestions">
                  <button onClick={() => handleSendMessage("What can you help me with?")}>
                    What can you help me with?
                  </button>
                  <button onClick={() => handleSendMessage("Tell me a joke")}>
                    Tell me a joke
                  </button>
                  <button onClick={() => handleSendMessage("Explain quantum physics")}>
                    Explain quantum physics
                  </button>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))
            )}
            {isLoading && (
              <div className="loading-message">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>
        </div>

        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default App;
