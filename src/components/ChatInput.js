import React, { useState, useRef, useEffect } from 'react';

const ChatInput = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef(null);

  const maxChars = 1000;

  useEffect(() => {
    setCharCount(message.length);
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading && charCount <= maxChars) {
      onSendMessage(message.trim());
      setMessage('');
      setCharCount(0);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    autoResize();
  }, [message]);

  const getCharCountClass = () => {
    if (charCount > maxChars) return 'error';
    if (charCount > maxChars * 0.8) return 'warning';
    return '';
  };

  const isSendDisabled = !message.trim() || isLoading || charCount > maxChars;

  return (
    <div className="chat-input-container">
      <form onSubmit={handleSubmit} className="chat-input">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            disabled={isLoading}
            maxLength={maxChars}
          />
          {charCount > 0 && (
            <div className={`char-counter ${getCharCountClass()}`}>
              {charCount}/{maxChars}
            </div>
          )}
        </div>
        
        <button
          type="submit"
          className="send-button"
          disabled={isSendDisabled}
          title={isSendDisabled ? "Message cannot be empty" : "Send message"}
        >
          {isLoading ? (
            <div className="loading-spinner">
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            <span className="send-icon">➤</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatInput; 