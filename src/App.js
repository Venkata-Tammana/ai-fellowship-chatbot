import React, { useState, useEffect, useRef } from 'react';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT ?? 'https://2pe5868qg6.execute-api.us-east-1.amazonaws.com/dev/ask';

export default function Chat() {
  const [input, setInput] = useState('');
  const [sessions, setSessions] = useState([]); // array of { id, messages }
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const inputRef = useRef(null);

  // Create new session on load if none
  useEffect(() => {
    if (!currentSessionId) {
      const newId = Date.now().toString();
      setCurrentSessionId(newId);
      setSessions([{ id: newId, messages: [] }]);
    }
  }, [currentSessionId]);

  // Helper: add message to current session
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
    inputRef.current.focus();

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

  // Create a new session (clear chat)
  function newSession() {
    const newId = Date.now().toString();
    setSessions([...sessions, { id: newId, messages: [] }]);
    setCurrentSessionId(newId);
  }

  // Render messages of current session
  const currentMessages =
    sessions.find((s) => s.id === currentSessionId)?.messages || [];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Welcome to AI Fellowship Chat</h1>
        <button onClick={newSession} style={styles.newSessionBtn}>
          + New Chat
        </button>
      </header>

      <div style={styles.chatWindow}>
        {currentMessages.length === 0 && (
          <p style={{ textAlign: 'center', color: '#666' }}>
            Start the conversation below...
          </p>
        )}
        {currentMessages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              ...styles.message,
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.role === 'user' ? '#007bff' : '#e5e5ea',
              color: msg.role === 'user' ? '#fff' : '#000',
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={styles.inputForm}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Type your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.sendBtn} disabled={!input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 900,
    margin: '2rem auto',
    display: 'flex',
    flexDirection: 'column',
    height: '80vh',
    border: '1px solid #ddd',
    borderRadius: 8,
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  },
  header: {
    padding: '1rem',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newSessionBtn: {
    padding: '0.3rem 0.6rem',
    fontSize: 14,
    cursor: 'pointer',
  },
  chatWindow: {
    flex: 1,
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    overflowY: 'auto',
    backgroundColor: '#fafafa',
  },
  message: {
    maxWidth: '75%',
    padding: '0.7rem 1rem',
    borderRadius: 20,
    wordBreak: 'break-word',
  },
  inputForm: {
    display: 'flex',
    borderTop: '1px solid #ddd',
  },
  input: {
    flex: 1,
    padding: '0.7rem 1rem',
    fontSize: 16,
    border: 'none',
    outline: 'none',
  },
  sendBtn: {
    padding: '0 1rem',
    border: 'none',
    backgroundColor: '#007bff',
    color: '#fff',
    cursor: 'pointer',
  },
};
