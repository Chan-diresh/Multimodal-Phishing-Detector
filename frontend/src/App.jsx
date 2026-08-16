import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  Github,
  Globe2,
  History,
  Loader2,
  LockKeyhole,
  Radar,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  XCircle,
} from "lucide-react";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const DEMO_URLS = [
  { label: "GitHub", url: "https://github.com" },
  { label: "Wikipedia", url: "https://wikipedia.org" },
  { label: "Google", url: "https://google.com" },
];

function isValidUrl(value) {
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol) && parsed.hostname.includes(".");
  } catch {
    return false;
  }
}

function formatTime(value) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(value);
}

function RiskIcon({ risk }) {
  if (risk === "High Risk") return <ShieldAlert size={22} />;
  if (risk === "Medium Risk") return <AlertTriangle size={22} />;
  return <ShieldCheck size={22} />;
}

function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiState, setApiState] = useState("checking");
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("phishguard-history") || "[]");
    } catch {
      return [];
    }
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem("phishguard-history", JSON.stringify(history.slice(0, 8)));
  }, [history]);

  const endpoint = useMemo(() => API_URL ? `${API_URL}/predict` : "", []);

  async function checkApi() {
    if (!API_URL) {
      setApiState("offline");
      return;
    }
    setApiState("checking");
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 60000);
      const response = await fetch(`${API_URL}/`, { signal: controller.signal });
      clearTimeout(timer);
      setApiState(response.ok ? "online" : "offline");
    } catch {
      setApiState("offline");
    }
  }

  useEffect(() => {
    checkApi();
  }, []);

  async function analyze(target = url) {
    const value = target.trim();

    if (!isValidUrl(value)) {
      setError("Enter a complete URL such as https://example.com");
      setResult(null);
      return;
    }

    if (!API_URL) {
      setError("API URL is not configured. Create a .env file and set VITE_API_URL.");
      return;
    }

    setUrl(value);
    setError("");
    setResult(null);
    setCopied(false);
    setLoading(true);

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 90000);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.error) {
        throw new Error(data.error || `API returned HTTP ${response.status}`);
      }

      const scan = {
        id: Date.now(),
        url: value,
        prediction: data.prediction,
        confidence: Number(data.confidence),
        risk: data.risk,
        time: new Date().toISOString(),
      };

      setResult(scan);
      setHistory((items) => [scan, ...items].slice(0, 8));
      setApiState("online");
    } catch (err) {
      setApiState("offline");
      if (err.name === "AbortError") {
        setError("The backend took too long to respond. Render may be waking from sleep. Try again.");
      } else {
        setError(err.message || "Unable to reach the prediction API.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    if (!result) return;
    const text = `${result.url}\nPrediction: ${result.prediction}\nConfidence: ${result.confidence}%\nRisk: ${result.risk}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const riskClass =
    result?.risk === "High Risk"
      ? "high"
      : result?.risk === "Medium Risk"
        ? "medium"
        : "low";

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-mark"><Shield size={21} /></span>
          <span>PhishGuard <b>AI</b></span>
        </a>

        <div className="status-pill">
          <span className={`status-dot ${apiState}`} />
          {apiState === "online" ? "API Online" : apiState === "checking" ? "Checking API" : "API Sleeping / Offline"}
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="eyebrow"><Sparkles size={15} /> AI-POWERED URL INTELLIGENCE</div>
          <h1>Detect phishing threats<br /><span>before they reach you.</span></h1>
          <p className="hero-copy">
            Analyze a URL with your deployed machine-learning inference service and get
            an immediate prediction, confidence score, and risk level.
          </p>

          <div className="analyzer-card">
            <div className="input-wrap">
              <Globe2 size={20} />
              <input
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && analyze()}
                placeholder="https://example.com"
                aria-label="URL to analyze"
              />
              {url && (
                <button className="clear-btn" onClick={() => setUrl("")} aria-label="Clear URL">
                  <XCircle size={18} />
                </button>
              )}
            </div>

            <button className="analyze-btn" onClick={() => analyze()} disabled={loading}>
              {loading ? <Loader2 className="spin" size={19} /> : <Radar size={19} />}
              {loading ? "Analyzing..." : "Analyze URL"}
              {!loading && <ArrowRight size={18} />}
            </button>

            {error && <div className="error-banner"><AlertTriangle size={17} /> {error}</div>}
          </div>

          <div className="demo-row">
            <span>Quick demo:</span>
            {DEMO_URLS.map((item) => (
              <button key={item.label} onClick={() => analyze(item.url)} disabled={loading}>
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section className="dashboard-grid">
          <div className={`result-card ${result ? riskClass : "empty"}`}>
            <div className="card-heading">
              <div>
                <div className="section-label"><Activity size={15} /> LIVE ANALYSIS</div>
                <h2>{result ? "Threat assessment" : "Ready for analysis"}</h2>
              </div>
              {result && (
                <button className="icon-btn" onClick={copyResult} title="Copy result">
                  {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                </button>
              )}
            </div>

            {!result ? (
              <div className="empty-state">
                <div className="radar-orb"><Radar size={38} /></div>
                <p>Paste a URL above to run your live ML prediction.</p>
                <span>The result will appear here with confidence and risk classification.</span>
              </div>
            ) : (
              <>
                <div className="verdict">
                  <div className="verdict-icon"><RiskIcon risk={result.risk} /></div>
                  <div>
                    <span className="muted">Prediction</span>
                    <strong>{result.prediction}</strong>
                  </div>
                </div>

                <div className="metric-grid">
                  <div className="metric">
                    <span>Confidence</span>
                    <strong>{result.confidence}%</strong>
                    <div className="progress"><i style={{ width: `${Math.min(result.confidence, 100)}%` }} /></div>
                  </div>
                  <div className="metric">
                    <span>Risk level</span>
                    <strong>{result.risk}</strong>
                    <small><LockKeyhole size={13} /> Model response</small>
                  </div>
                </div>

                <div className="scanned-url">
                  <span>Analyzed URL</span>
                  <code>{result.url}</code>
                </div>
              </>
            )}
          </div>

          <div className="side-card">
            <div className="card-heading">
              <div>
                <div className="section-label"><History size={15} /> SCAN HISTORY</div>
                <h2>Recent checks</h2>
              </div>
              {history.length > 0 && (
                <button className="text-btn" onClick={() => setHistory([])}>Clear</button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="history-empty">
                <Clock3 size={25} />
                <p>No scans yet</p>
                <span>Your recent analyses will appear here.</span>
              </div>
            ) : (
              <div className="history-list">
                {history.map((item) => (
                  <button className="history-item" key={item.id} onClick={() => analyze(item.url)}>
                    <span className={`mini-status ${item.risk === "High Risk" ? "high" : item.risk === "Medium Risk" ? "medium" : "low"}`}>
                      {item.risk === "Low Risk" ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
                    </span>
                    <span className="history-main">
                      <b>{item.prediction}</b>
                      <small>{item.url}</small>
                    </span>
                    <span className="history-time">{formatTime(new Date(item.time))}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="tech-strip">
          <div><Terminal size={17} /><span>FastAPI REST API</span></div>
          <div><Shield size={17} /><span>ML Inference</span></div>
          <div><Activity size={17} /><span>Real-time Analysis</span></div>
          <div><LockKeyhole size={17} /><span>HTTPS Ready</span></div>
        </section>

        <section className="architecture">
          <div>
            <div className="section-label"><Sparkles size={15} /> SYSTEM FLOW</div>
            <h2>From URL to threat decision.</h2>
            <p>
              The interface sends only the URL payload expected by your existing
              <code>/predict</code> endpoint, so the frontend does not alter your ML pipeline.
            </p>
          </div>
          <div className="flow">
            <div className="flow-node"><Globe2 /><span>URL</span></div>
            <ArrowRight className="flow-arrow" />
            <div className="flow-node"><Radar /><span>FastAPI</span></div>
            <ArrowRight className="flow-arrow" />
            <div className="flow-node"><Activity /><span>ML Model</span></div>
            <ArrowRight className="flow-arrow" />
            <div className="flow-node"><ShieldCheck /><span>Decision</span></div>
          </div>
        </section>
      </main>

      <footer>
        <span>PhishGuard AI</span>
        <span>Built with React • FastAPI • Docker • Machine Learning</span>
        <a href="https://github.com/Chan-diresh/Multimodal-Phishing-Detector" target="_blank" rel="noreferrer">
          <Github size={16} /> Source <ExternalLink size={13} />
        </a>
      </footer>
    </div>
  );
}

export default App;