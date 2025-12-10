import { useState } from 'react'
import axios from 'axios'
import { FileText, Link, Upload, Sparkles, AlertCircle, Copy, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './index.css'

// IMPORTANT: In production, use an env var. For this local demo, we assume localhost:8000
const API_BASE_URL = 'http://localhost:8000'

function App() {
  const [mode, setMode] = useState('text') // 'text' | 'url' | 'file'
  const [textInput, setTextInput] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [fileInput, setFileInput] = useState(null)

  const [summaryType, setSummaryType] = useState('short_abstract')
  const [tone, setTone] = useState('neutral')

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleSummarize = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      let response;
      if (mode === 'text') {
        response = await axios.post(`${API_BASE_URL}/summarize`, {
          text: textInput,
          summary_type: summaryType,
          tone: tone
        });
      } else if (mode === 'url') {
        response = await axios.post(`${API_BASE_URL}/summarize-url`, {
          url: urlInput,
          summary_type: summaryType,
          tone: tone
        });
      } else if (mode === 'file') {
        if (!fileInput) {
          throw new Error("Please select a file first.");
        }
        const formData = new FormData();
        formData.append('file', fileInput);
        formData.append('summary_type', summaryType);
        formData.append('tone', tone);

        response = await axios.post(`${API_BASE_URL}/summarize-file`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setResult(response.data);

    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.detail || err.message || "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (result?.summary) {
      navigator.clipboard.writeText(result.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="app-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel"
        style={{ maxWidth: '800px', margin: '0 auto' }}
      >
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', margin: 0, background: 'linear-gradient(to right, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AI Summarizer
          </h1>
          <p style={{ color: '#aaa' }}>Condense any content in seconds.</p>
        </header>

        {/* Mode Selection */}
        <div className="tabs">
          <button className={`tab-btn ${mode === 'text' ? 'active' : ''}`} onClick={() => setMode('text')}>
            <FileText size={18} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} /> Text
          </button>
          <button className={`tab-btn ${mode === 'url' ? 'active' : ''}`} onClick={() => setMode('url')}>
            <Link size={18} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} /> URL
          </button>
          <button className={`tab-btn ${mode === 'file' ? 'active' : ''}`} onClick={() => setMode('file')}>
            <Upload size={18} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} /> File
          </button>
        </div>

        {/* Inputs */}
        <div className="input-section">
          <AnimatePresence mode='wait'>
            {mode === 'text' && (
              <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <textarea
                  rows={6}
                  placeholder="Paste your text here..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                />
              </motion.div>
            )}
            {mode === 'url' && (
              <motion.div key="url" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <input
                  type="text"
                  placeholder="https://example.com/article"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
              </motion.div>
            )}
            {mode === 'file' && (
              <motion.div key="file" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ border: '2px dashed rgba(255,255,255,0.2)', padding: '2rem', borderRadius: '8px', cursor: 'pointer' }}>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,.md"
                    onChange={(e) => setFileInput(e.target.files[0])}
                    style={{ display: 'none' }}
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
                    <Upload size={48} color="#aaa" />
                    <p>{fileInput ? fileInput.name : "Click to upload PDF, DOCX, or TXT"}</p>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>Summary Type</label>
            <select value={summaryType} onChange={(e) => setSummaryType(e.target.value)}>
              <option value="short_abstract">Short Abstract</option>
              <option value="bullet_points">Bullet Points</option>
              <option value="eli5">Explain Like I'm 5</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)}>
              <option value="neutral">Neutral</option>
              <option value="formal">Formal</option>
              <option value="casual">Casual</option>
            </select>
          </div>
        </div>

        <button
          className="btn-primary"
          style={{ width: '100%', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          onClick={handleSummarize}
          disabled={loading}
        >
          {loading ? <div className="loading-spinner" style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderLeftColor: '#fff', margin: 0 }}></div> : <Sparkles size={18} />}
          {loading ? "Summarizing..." : "Summarize"}
        </button>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255, 59, 48, 0.1)', border: '1px solid rgba(255, 59, 48, 0.3)', borderRadius: '8px', color: '#ff4d4d', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        {/* Result */}
        {result && (
          <motion.div
            className="result-card glass-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="metadata-badge">{result.summary_type}</span>
                <span className="metadata-badge">{result.tone}</span>
                <span className="metadata-badge">{result.input_characters} chars</span>
              </div>
              <button onClick={copyToClipboard} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}>
                {copied ? <Check size={18} color="#4cd964" /> : <Copy size={18} />}
              </button>
            </div>
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {result.summary}
            </div>
          </motion.div>
        )}

      </motion.div>
    </div>
  )
}

export default App
