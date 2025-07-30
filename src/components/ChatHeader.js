import React from 'react';

const ChatHeader = ({ currentChat, onNewChat }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="chat-header">
      <div className="header-content">
        <div className="chat-info">
          <h2>
            {currentChat ? currentChat.title : 'New Chat'}
          </h2>
          {currentChat && (
            <div className="chat-meta">
              <span className="chat-date">
                {formatDate(currentChat.timestamp)}
              </span>
              <span className="message-count">
                {currentChat.messages ? currentChat.messages.length : 0} messages
              </span>
            </div>
          )}
        </div>
        
        <div className="header-actions">
          <button 
            className="new-chat-header-btn"
            onClick={onNewChat}
            title="Start new chat"
          >
            <span>+</span>
            New Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader; 