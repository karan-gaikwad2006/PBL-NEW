/**
 * ChatContext — app-wide state for the floating chat widget.
 *
 * Lifted here so the widget persists across route changes without resetting its
 * open/closed state or message history. Both the floating ChatWidget and the
 * Navbar chat icon button read/write from this single context instance.
 *
 * MVP NOTE: Message history is intentionally held only in React state. It is NOT
 * persisted to localStorage or the database. History clears on page refresh.
 * This is a known MVP limitation, not an oversight — a future phase can add
 * session persistence once authentication is stable.
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  /** Whether the chat panel is expanded or collapsed. */
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Message list — each entry: { id, role: 'user'|'assistant', content, suggestedAction? }
   * MVP: cleared on page refresh (React state only).
   */
  const [messages, setMessages] = useState([]);

  /** True while waiting for the backend reply (drives typing indicator). */
  const [isTyping, setIsTyping] = useState(false);

  /** Incremental ID for messages. */
  const idRef = useRef(0);
  const nextId = () => {
    idRef.current += 1;
    return idRef.current;
  };

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  /**
   * Append a message to the list.
   * @param {'user'|'assistant'} role
   * @param {string} content
   * @param {object} [suggestedAction]
   */
  const appendMessage = useCallback((role, content, suggestedAction = null) => {
    setMessages((prev) => [
      ...prev,
      {
        id: nextId(),
        role,
        content,
        suggestedAction,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  /**
   * Remove the last message (used to replace the optimistic user message with the
   * final reply when needed, though for now we simply append both).
   */
  const clearMessages = useCallback(() => setMessages([]), []);

  const value = {
    isOpen,
    open,
    close,
    toggle,
    messages,
    isTyping,
    setIsTyping,
    appendMessage,
    clearMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

/** Hook to access the chat context. */
export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within a ChatProvider');
  return ctx;
}

export default ChatContext;
