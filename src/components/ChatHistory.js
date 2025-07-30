import React from 'react';

const ChatHistory = ({ chatHistory, currentChatId, onChatSelect, onChatDelete }) => {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getLastMessage = (chat) => {
    if (chat.messages && chat.messages.length > 0) {
      const lastMessage = chat.messages[chat.messages.length - 1];
      return lastMessage.text.substring(0, 50) + (lastMessage.text.length > 50 ? '...' : '');
    }
    return 'No messages yet';
  };

  const handleChatDelete = (e, chatId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      onChatDelete(chatId);
    }
  };

  if (chatHistory.length === 0) {
    return (
      <div className="chat-history-empty">
        <div className="empty-icon">💬</div>
        <p>No chat history yet</p>
        <span>Start a new conversation to see it here</span>
      </div>
    );
  }

  return (
    <div className="chat-history">
      <div className="history-header">
        <h3>Chat History</h3>
        <span className="chat-count">{chatHistory.length} chats</span>
      </div>
      
      <div className="history-list">
        {chatHistory.map((chat) => (
          <div
            key={chat.id}
            className={`history-item ${currentChatId === chat.id ? 'active' : ''}`}
            onClick={() => onChatSelect(chat)}
          >
            <div className="chat-info">
              <div className="chat-title">
                {chat.title || 'New Chat'}
              </div>
              <div className="chat-preview">
                {getLastMessage(chat)}
              </div>
              <div className="chat-meta">
                <span className="chat-time">
                  {formatDate(chat.timestamp)}
                </span>
                <span className="message-count">
                  {chat.messages ? chat.messages.length : 0} messages
                </span>
              </div>
            </div>
            
            <button
              className="delete-chat-btn"
              onClick={(e) => handleChatDelete(e, chat.id)}
              title="Delete chat"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistory; 