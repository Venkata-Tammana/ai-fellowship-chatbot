import React, { useState, useEffect, useRef } from 'react';
import '../styles/Chat.css';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT ?? 'https://2pe5868qg6.execute-api.us-east-1.amazonaws.com/dev/ask';

export default function Chat() {
  const [input, setInput] = useState('');
  const [sessions, setSessions] = useState([]); // each { id, name, messages }
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!currentSessionId) createNewSession();
  }, [currentSessionId]);

  function createNewSession() {
    const newId = Date.now().toString();
    setSessions((prev) => [...prev, { id: newId, name: `Chat ${prev.length + 1}`, messages: [] }]);
    setCurrentSessionId(newId);
  }

  function addMessage(role, text) {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === currentSessionId
          ? { ...session, messages: [...session.messages, { role, text }] }
          : session
      )
    );
  }

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;

    addMessage('user', trimmed);
    setInput('');
    inputRef.current?.focus();

    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: trimmed }),
      });
      const data = await res.json();
      const botReply = data.text || 'Sorry, no response from API.';
      addMessage('bot', botReply);
    } catch (e) {
      addMessage('bot', 'Error: Could not reach the API.');
    }
  }

  const currentSession = sessions.find(s => s.id === currentSessionId);

  return (
    <div className="chat-app">
      <aside className="chat-sidebar">
        <header className="chat-sidebar-header">
          <h2>My Chats</h2>
          <button onClick={createNewSession}>+ New Chat</button>
        </header>
        <ul className="chat-session-list">
          {sessions.map((session) => (
            <li
              key={session.id}
              className={session.id === currentSessionId ? 'active' : ''}
              onClick={() => setCurrentSessionId(session.id)}
            >
              {session.name}
            </li>
          ))}
        </ul>
      </aside>

      <main className="chat-main">
        <header className="chat-main-header">
          <h1>AI Fellowship Chat</h1>
        </header>

        <div className="chat-messages">
          {currentSession?.messages.length === 0 && (
            <p className="chat-empty">Start the conversation below...</p>
          )}
          {currentSession?.messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-message ${msg.role}`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <form
          className="chat-input-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={!input.trim()}>
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
