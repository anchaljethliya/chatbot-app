import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ChatMessage = ({ message }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isUser = message.sender === 'user';
  const isError = message.isError;

  return (
    <div className={`message ${isUser ? 'user-message' : 'bot-message'} ${isError ? 'error-message' : ''}`}>
      <div className="message-content">
        <div className="message-avatar">
          {isUser ? '👤' : '🤖'}
        </div>
        
        <div className="message-bubble">
          <div className="message-text">
            {isUser ? (
              <p>{message.text}</p>
            ) : (
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={tomorrow}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  p: ({ children }) => <p style={{ margin: '0.5em 0' }}>{children}</p>,
                  h1: ({ children }) => <h1 style={{ margin: '0.5em 0', fontSize: '1.5em' }}>{children}</h1>,
                  h2: ({ children }) => <h2 style={{ margin: '0.5em 0', fontSize: '1.3em' }}>{children}</h2>,
                  h3: ({ children }) => <h3 style={{ margin: '0.5em 0', fontSize: '1.1em' }}>{children}</h3>,
                  ul: ({ children }) => <ul style={{ margin: '0.5em 0', paddingLeft: '1.5em' }}>{children}</ul>,
                  ol: ({ children }) => <ol style={{ margin: '0.5em 0', paddingLeft: '1.5em' }}>{children}</ol>,
                  li: ({ children }) => <li style={{ margin: '0.2em 0' }}>{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote style={{ 
                      borderLeft: '4px solid #007bff', 
                      margin: '0.5em 0', 
                      paddingLeft: '1em',
                      fontStyle: 'italic',
                      color: '#666'
                    }}>
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div style={{ overflowX: 'auto', margin: '0.5em 0' }}>
                      <table style={{ 
                        borderCollapse: 'collapse', 
                        width: '100%',
                        border: '1px solid #ddd'
                      }}>
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th style={{ 
                      border: '1px solid #ddd', 
                      padding: '8px', 
                      backgroundColor: '#f8f9fa',
                      fontWeight: 'bold'
                    }}>
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td style={{ 
                      border: '1px solid #ddd', 
                      padding: '8px'
                    }}>
                      {children}
                    </td>
                  ),
                }}
              >
                {message.text}
              </ReactMarkdown>
            )}
          </div>
          
          <div className="message-time">
            {formatTime(message.timestamp)}
            {isError && <span className="error-indicator">⚠️</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 