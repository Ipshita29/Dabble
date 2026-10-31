import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SUGGESTIONS = ["Where do I start?", "Can you give me some ideas?", "How can I make it easier?"];

// The task arrives through router state; sessionStorage lets the page survive a refresh
function loadTask(state) {
  if (state?.task) return state.task;
  try {
    const saved = sessionStorage.getItem("dabble:task");
    return saved ? JSON.parse(saved) : null;
  } catch (err) {
    console.warn("Dabble: could not read the saved task", err);
    return null;
  }
}

export default function Hint() {
  const location = useLocation();
  const navigate = useNavigate();
  const [task] = useState(() => loadTask(location.state));
  const [messages, setMessages] = useState([]); // real conversation only: { role, content }
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, loading, error]);

  if (!task) {
    return (
      <section className="hint">
        <div className="hint-task">
          <span className="script hint-label">your task</span>
          <h1 className="hint-title">No task picked yet.</h1>
          <div className="hint-links">
            <Link to="/" className="text-link">
              Back to discovery
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const send = async (text, history = messages) => {
    const question = text.trim();
    if (!question || loading) return;
    setMessages([...history, { role: "user", content: question }]);
    setInput("");
    setError("");
    setLastQuestion(question);
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: task.task, question, history: history.slice(-10) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (err) {
      console.error("Chat request failed", err);
      setError(err instanceof TypeError ? "Couldn’t reach the server. Make sure it is running on port 5000." : err.message);
    } finally {
      setLoading(false);
    }
  };

  const retry = () => send(lastQuestion, messages.slice(0, -1));

  return (
    <section className="hint">
      <div className="hint-task">
        <span className="script hint-label">your task</span>
        <h1 className="hint-title">{task.task}</h1>
        {task.description && <p className="hint-description">{task.description}</p>}
        <svg className="doodle" viewBox="0 0 220 90" fill="none" aria-hidden="true">
          <path
            d="M6 66 C 14 20, 62 8, 52 58 C 48 80, 96 74, 150 40 C 168 28, 176 30, 190 56 C 196 66, 204 70, 214 62"
            stroke="#f5c3d6"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>
        <div className="hint-links">
          <Link to="/" className="text-link">
            Back to discovery
          </Link>
          <button className="btn btn-light btn-small" onClick={() => navigate("/", { state: { shuffle: true } })}>
            Shuffle again
          </button>
        </div>
      </div>

      <div className="chat">
        <div className="chat-head">
          <span className="chat-avatar">D</span>
          <div>
            <div className="chat-name">Dabble guide</div>
            <div className="chat-status">Ask anything about this task</div>
          </div>
        </div>

        <div className="chat-body">
          <div className="bubble assistant">
            Hi, I’m the Dabble guide. You picked “{task.task}” Ask me for a first step, some ideas, or an easier way in.
          </div>
          {messages.map((m, i) => (
            <div key={i} className={`bubble ${m.role}`}>
              {m.content}
            </div>
          ))}
          {loading && <div className="bubble assistant typing">Thinking…</div>}
          {error && (
            <div className="chat-error" role="alert">
              {error} <button className="link-button" onClick={retry}>Try again</button>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="chat-foot">
          {messages.length === 0 && (
            <div className="chips">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="chip" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}
          <form
            className="chat-form"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about this task…" aria-label="Ask about this task" />
            <button type="submit" className="send" disabled={loading || !input.trim()} aria-label="Send">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 13V3M8 3L3.5 7.5M8 3l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
