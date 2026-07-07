'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './StylistChat.module.css';

export default function StylistChat({ productContext, initialNotes, compact = false }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!compact);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Seed the chat with the initial stylist consultation
  useEffect(() => {
    if (initialNotes && messages.length === 0) {
      setMessages([{
        role: 'model',
        text: initialNotes,
        timestamp: Date.now()
      }]);
    }
  }, [initialNotes]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', text: trimmed, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build chat history for API (exclude timestamps)
      const chatHistory = messages.map(m => ({ role: m.role, text: m.text }));

      const res = await fetch('/api/stylist-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          chatHistory,
          productContext
        })
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setMessages(prev => [...prev, {
          role: 'model',
          text: data.reply,
          timestamp: Date.now()
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'model',
          text: 'I appreciate your interest. Could you rephrase your question so I can better assist you?',
          timestamp: Date.now()
        }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        role: 'model',
        text: 'My apologies, the styling service is momentarily unavailable. Please try again shortly.',
        timestamp: Date.now()
      }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    'What jewelry pairs best?',
    'Best occasion to wear this?',
    'How do I care for this fabric?',
    'Suggest matching footwear'
  ];

  if (compact && !isExpanded) {
    return (
      <button
        type="button"
        className={styles.expandBtn}
        onClick={() => setIsExpanded(true)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <polygon points="12 2 15 10 23 12 15 14 12 22 9 14 1 12 9 10 12 2"></polygon>
        </svg>
        Chat with Stylist
      </button>
    );
  }

  return (
    <div className={`${styles.chatContainer} ${compact ? styles.compact : ''}`}>
      {/* Header */}
      <div className={styles.chatHeader}>
        <div className={styles.chatHeaderLeft}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <polygon points="12 2 15 10 23 12 15 14 12 22 9 14 1 12 9 10 12 2"></polygon>
          </svg>
          <span className="serif">Rivaaz Stylist</span>
        </div>
        {compact && (
          <button
            type="button"
            className={styles.collapseBtn}
            onClick={() => setIsExpanded(false)}
            title="Minimize chat"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className={styles.chatMessages}>
        {messages.map((msg, i) => (
          <div key={i} className={`${styles.chatBubble} ${msg.role === 'user' ? styles.userBubble : styles.modelBubble}`}>
            {msg.role === 'model' && (
              <span className={styles.bubbleIcon}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15 10 23 12 15 14 12 22 9 14 1 12 9 10 12 2"></polygon>
                </svg>
              </span>
            )}
            <p className="sans">{msg.text}</p>
          </div>
        ))}
        {loading && (
          <div className={`${styles.chatBubble} ${styles.modelBubble}`}>
            <span className={styles.bubbleIcon}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15 10 23 12 15 14 12 22 9 14 1 12 9 10 12 2"></polygon>
              </svg>
            </span>
            <div className={styles.typingDots}>
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions (only if no user messages yet) */}
      {messages.filter(m => m.role === 'user').length === 0 && (
        <div className={styles.quickQuestions}>
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              type="button"
              className={styles.quickBtn}
              onClick={() => { setInput(q); inputRef.current?.focus(); }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className={styles.chatInputRow}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your stylist anything..."
          className={styles.chatInput}
          disabled={loading}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className={styles.sendBtn}
          title="Send"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
}
