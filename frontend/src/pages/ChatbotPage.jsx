import { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../services/chatbotApi';

const SUGGESTIONS = [
  'What should I eat for breakfast on a keto diet?',
  'How can I reach my calorie target without feeling hungry?',
  'What are good high-protein snacks?',
  'Can you suggest a simple healthy lunch idea?',
];

function Message({ role, content }) {
  const isUser = role === 'user';
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '0.6rem', flexDirection: isUser ? 'row-reverse' : 'row' }}>
      {!isUser && (
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>
          🥗
        </div>
      )}
      <div className={`chat-bubble ${isUser ? 'bubble-user' : 'bubble-bot'}`}>
        {content}
      </div>
    </div>
  );
}

function ChatbotPage() {
  const [history, setHistory] = useState([]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const bottomRef             = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  async function handleSend(text) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setHistory((prev) => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setError('');
    setLoading(true);
    try {
      const { data } = await sendMessage(msg, history);
      setHistory((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get a response. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <div className="chat-page">
      <div className="chat-card">
      {/* Header */}
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
          🥗
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Nutrition Assistant</h1>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            AI-powered · Ask anything about healthy eating
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {history.length === 0 && (
          <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>👋</div>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>How can I help you today?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Try one of these to get started:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
              {SUGGESTIONS.map((s) => (
                <button key={s} className="suggestion-chip" onClick={() => handleSend(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.map((msg, i) => <Message key={i} role={msg.role} content={msg.content} />)}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '0.6rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>
              🥗
            </div>
            <div className="chat-bubble bubble-bot" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.7)', display: 'inline-block', animation: 'bounce 1s infinite' }} />
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.7)', display: 'inline-block', animation: 'bounce 1s 0.15s infinite' }} />
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.7)', display: 'inline-block', animation: 'bounce 1s 0.3s infinite' }} />
            </div>
          </div>
        )}

        {error && (
          <div style={{ margin: '0.5rem 1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.6rem 0.9rem', color: '#DC2626', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '0.9rem 1.25rem', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about nutrition, recipes, or your diet goals…"
            rows={2}
            disabled={loading}
            className="form-textarea"
            style={{ flex: 1, resize: 'none', margin: 0 }}
          />
          <button
            className="btn btn-primary"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            style={{ flexShrink: 0, alignSelf: 'stretch' }}
          >
            Send
          </button>
        </div>
        <p style={{ margin: '0.3rem 0 0', fontSize: '0.73rem', color: 'var(--text-muted)' }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
      </div>{/* end chat-card */}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default ChatbotPage;
