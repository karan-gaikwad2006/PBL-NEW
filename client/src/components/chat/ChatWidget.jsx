/**
 * ChatWidget — floating, app-wide chat assistant bubble for PoshanSetu.
 *
 * Rendered ONCE in App.jsx at the root level so it persists across all routes
 * without unmounting. All state lives in ChatContext.
 *
 * ACCESSIBILITY
 * - aria-label on the toggle button
 * - Focus trap while the panel is open (Escape closes it)
 * - Keyboard-reachable send button (Enter to send, Shift+Enter for newline)
 * - role="log" + aria-live="polite" on the message list
 *
 * MVP NOTE: Message history is held in React state only (see ChatContext).
 * It clears on page refresh — this is intentional, not an oversight.
 */

import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
} from 'react';
import {
  Bot,
  CircleHelp,
  ClipboardList,
  Map as MapIcon,
  Sprout,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../../context/ChatContext';
import useAuth from '../../hooks/useAuth';

// ─── localStorage flag to show the first-visit attention pulse ───────────────
const CHAT_SEEN_KEY = 'poshansetu_chat_seen';
const QUICK_TOPICS = [
  { label: 'Priority Areas', prompt: 'Which areas need food support?', Icon: Sprout },
  { label: 'Submit Guide', prompt: 'How do I submit a food requirement?', Icon: ClipboardList },
  { label: 'Local Hubs', prompt: 'Show me local donation centres.', Icon: MapIcon },
  { label: 'General Help', prompt: 'What can PoshanSetu help me with?', Icon: CircleHelp },
];
const hasSeenChat = () => {
  try { return !!localStorage.getItem(CHAT_SEEN_KEY); }
  catch { return true; } // fail safe: no animation
};
const markChatSeen = () => {
  try { localStorage.setItem(CHAT_SEEN_KEY, '1'); }
  catch { /* ignore */ }
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatWidget() {
  const {
    isOpen,
    open,
    close,
    toggle,
    messages,
    isTyping,
    setIsTyping,
    appendMessage,
  } = useChat();

  const { user, firebaseUser } = useAuth();
  const navigate = useNavigate();

  const [inputValue, setInputValue] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [firstVisit, setFirstVisit] = useState(false);

  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const tooltipTimerRef = useRef(null);

  // ── First-visit attention pulse ──────────────────────────────────────────
  useEffect(() => {
    if (!hasSeenChat()) {
      setFirstVisit(true);
      setShowTooltip(true);
      tooltipTimerRef.current = setTimeout(() => {
        setShowTooltip(false);
      }, 6000);
    }
    return () => clearTimeout(tooltipTimerRef.current);
  }, []);

  const handleToggle = useCallback(() => {
    if (firstVisit) {
      setFirstVisit(false);
      setShowTooltip(false);
      markChatSeen();
    }
    toggle();
  }, [toggle, firstVisit]);

  // ── Focus management ─────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      // Short delay so the panel CSS transition completes
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // ── Escape key closes the panel (focus trap exit) ─────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  // ── Auto-scroll to the latest message ────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isTyping) return;

    setInputValue('');
    appendMessage('user', text);
    setIsTyping(true);

    try {
      // Build conversation history for context (last 6 user+assistant pairs)
      const history = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      // Get Firebase token for authenticated request
      const token = firebaseUser ? await firebaseUser.getIdToken() : null;
      if (!token) {
        appendMessage('assistant', 'Please sign in to use the chat assistant.');
        return;
      }

      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiBase}/v1/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: text,
          conversationHistory: history,
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        appendMessage('assistant', json.data.reply, json.data.suggestedAction || null);
      } else {
        appendMessage(
          'assistant',
          json.message || "I'm having trouble right now — try the Explore or Food Matching pages directly.",
        );
      }
    } catch {
      appendMessage(
        'assistant',
        "I'm having trouble reaching the server — check your connection and try again.",
      );
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, isTyping, messages, firebaseUser, appendMessage, setIsTyping]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickTopic = (prompt) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  // ── Welcome message on first open ────────────────────────────────────────
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      appendMessage(
        'assistant',
        `Hello${user?.full_name ? ', ' + user.full_name.split(' ')[0] : ''}! 👋 I can help you find where to donate food, learn about district nutrition needs, or check institution status. What would you like to know?`,
      );
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ─── Floating Action Button ─────────────────────────────────────── */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
        {/* First-visit tooltip */}
        {showTooltip && !isOpen && (
          <div className="mb-1 flex items-center gap-2 rounded-2xl border border-[#244b37]/10 bg-white px-4 py-2.5 text-right text-sm font-medium text-[#244b37] shadow-lg shadow-[#183d2b]/15 animate-fade-in max-w-[220px]">
            Have a question? Ask here
            <button
              onClick={() => setShowTooltip(false)}
              className="ml-1 text-[#244b37]/50 transition-colors hover:text-[#244b37]"
              aria-label="Dismiss tooltip"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Toggle button */}
        <button
          id="chat-widget-toggle"
          onClick={handleToggle}
          aria-label={isOpen ? 'Close chat assistant' : 'Open chat assistant'}
          aria-expanded={isOpen}
          aria-controls="chat-panel"
          className={[
            'relative flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-white bg-[#244b37] text-white shadow-xl shadow-[#183d2b]/30',
            'transition-colors duration-200 hover:bg-[#193b2a]',
            'focus:outline-none focus-visible:ring-4 focus-visible:ring-[#6f9b69]/50',
            firstVisit && !isOpen ? 'ring-4 ring-[#a8d597]/50' : '',
          ].join(' ')}
        >
          {isOpen ? (
            <X size={25} strokeWidth={2.2} aria-hidden="true" />
          ) : (
            <span className="flex h-11 w-11 items-center justify-center rounded-[1.15rem] bg-[#f5f2df] text-[#244b37] shadow-inner">
              <Bot size={27} strokeWidth={2} aria-hidden="true" />
            </span>
          )}

          {/* Unread badge when closed and there are messages */}
          {!isOpen && messages.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#d83f42] px-1 text-[10px] font-bold text-white" aria-hidden="true">
              {Math.min(messages.filter((m) => m.role === 'assistant').length, 9)}
            </span>
          )}
        </button>
      </div>

      {/* ─── Chat Panel ─────────────────────────────────────────────────── */}
      <div
        id="chat-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="false"
        aria-label="PoshanSetu Chat Assistant"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={[
          'fixed bottom-[5.75rem] right-3 z-[9998]',
          'flex h-[min(38rem,calc(100dvh-7rem))] w-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-[1.6rem]',
          'border border-[#244b37]/10 bg-[#fffef8] shadow-2xl shadow-[#183d2b]/20 sm:bottom-24 sm:right-6 sm:w-[380px]',
          'origin-bottom-right transition-all duration-300 ease-in-out',
          isOpen ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0',
        ].join(' ')}
      >
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex flex-shrink-0 items-center gap-3 bg-[#193b2a] px-4 py-3.5 text-white">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#f5f2df] text-[#244b37] shadow-sm">
            <Bot size={24} strokeWidth={2} aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.11em] leading-tight">POSHANSETU</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/75">
              <span className="h-1.5 w-1.5 rounded-full bg-[#a8d597]" />
              Digital Assistant
            </p>
          </div>
          <button
            onClick={close}
            aria-label="Close chat"
            className="rounded-xl p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <X size={19} strokeWidth={2.3} aria-hidden="true" />
          </button>
        </div>

        {/* ── Message list ─────────────────────────────────────────── */}
        <div
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
          className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#fbfaf2] px-4 py-4"
          style={{ scrollbarWidth: 'thin' }}
        >
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onNavigate={(path) => { close(); navigate(path); }}
            />
          ))}

          {messages.length <= 1 && !isTyping && (
            <div className="grid grid-cols-2 gap-2 pl-9" aria-label="Popular topics">
              {QUICK_TOPICS.map(({ label, prompt, Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleQuickTopic(prompt)}
                  disabled={!firebaseUser}
                  className="flex min-h-[58px] flex-col items-center justify-center gap-1.5 rounded-xl border border-[#244b37]/10 bg-white px-2 py-2 text-center text-[11px] font-semibold leading-tight text-[#294836] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#6f9b69]/50 hover:bg-[#f6f7ed] hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-end gap-2">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[#e9efdf] text-[#244b37]">
                <Bot size={17} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#52785c]" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#52785c]" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#52785c]" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input area ───────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-[#244b37]/10 bg-white px-3 py-3">
          {!firebaseUser && (
            <p className="mb-2 text-center text-xs text-[#244b37]/65">
              <a href="/login" className="font-semibold text-[#244b37] underline underline-offset-2 transition-colors hover:text-[#52785c]">Sign in</a> to use the assistant
            </p>
          )}
          <div className="flex items-end gap-2 rounded-2xl border border-[#244b37]/15 bg-[#fbfaf5] p-1.5 pl-3 focus-within:border-[#52785c]/50 focus-within:ring-2 focus-within:ring-[#52785c]/15">
            <textarea
              ref={inputRef}
              id="chat-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!firebaseUser || isTyping}
              placeholder={firebaseUser ? 'Describe your need or select a topic…' : 'Sign in to chat'}
              rows={1}
              aria-label="Chat message input"
              className={[
                'max-h-[100px] min-h-9 flex-1 resize-none overflow-y-auto bg-transparent py-2 text-sm leading-5 text-[#1f2933] placeholder-[#244b37]/45',
                'transition-colors focus:outline-none',
                (!firebaseUser || isTyping) ? 'cursor-not-allowed opacity-50' : '',
              ].join(' ')}
              style={{ scrollbarWidth: 'none' }}
            />
            <button
              id="chat-send-button"
              onClick={sendMessage}
              disabled={!firebaseUser || !inputValue.trim() || isTyping}
              aria-label="Send message"
              className={[
                'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-200',
                firebaseUser && inputValue.trim() && !isTyping
                  ? 'bg-[#244b37] text-white hover:bg-[#193b2a] active:scale-95'
                  : 'cursor-not-allowed bg-[#244b37]/15 text-[#244b37]/40',
              ].join(' ')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-[#244b37]/45">
            Answers are grounded in live PoshanSetu data. Not medical advice.
          </p>
        </div>
      </div>
    </>
  );
}

// ─── MessageBubble sub-component ─────────────────────────────────────────────

function MessageBubble({ message, onNavigate }) {
  const isUser = message.role === 'user';
  const { suggestedAction } = message;

  return (
    <div className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="mb-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[#e9efdf] text-[#244b37]">
          <Bot size={17} strokeWidth={1.8} aria-hidden="true" />
        </div>
      )}

      <div className={`max-w-[80%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Bubble */}
        <div
          className={[
            'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm',
            isUser
              ? 'rounded-br-sm bg-[#244b37] text-white'
              : 'rounded-bl-sm border border-[#244b37]/5 bg-white text-[#26362c]',
          ].join(' ')}
        >
          {message.content}
        </div>

        {/* suggestedAction inline button — user must click, no auto-navigation */}
        {!isUser && suggestedAction?.type === 'navigate' && (
          <button
            onClick={() => onNavigate(suggestedAction.path)}
            className="text-xs text-[#304355] font-semibold flex items-center gap-1 hover:gap-2 transition-all duration-200 px-0.5"
            aria-label={`Navigate to ${suggestedAction.label || suggestedAction.path}`}
          >
            {suggestedAction.label || 'Open'} →
          </button>
        )}
      </div>
    </div>
  );
}
