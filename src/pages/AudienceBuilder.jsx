import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sparkles, Users, ArrowRight, Loader2, RefreshCw,
  BookmarkPlus, ChevronRight, AlertCircle, Database,
  Layers, Trash2, Calendar, MapPin,
  TrendingUp, UserCheck, Repeat2, AlertTriangle, ShoppingBag,
  Copy, Check,
} from 'lucide-react';
import api from '../api';
import './AudienceBuilder.css';

const EXAMPLE_PROMPTS = [
  "Find customers who used to purchase frequently but haven't ordered recently.",
  "Show me high-value customers who haven't visited in the last 60 days.",
  "Customers who bought shoes but never bought accessories.",
  "Users who opened our emails but never made a purchase.",
];

// Pick an icon based on segment name keywords
function getSegmentIcon(name = '') {
  const n = name.toLowerCase();
  if (n.includes('high-value') || n.includes('₹') || n.includes('spend') || n.includes('lapsed') || n.includes('big')) return TrendingUp;
  if (n.includes('inactive') || n.includes('win-back') || n.includes('risk')) return RefreshCw;
  if (n.includes('new') || n.includes('recent')) return Sparkles;
  if (n.includes('repeat') || n.includes('loyal') || n.includes('buyer')) return Repeat2;
  if (n.includes('city') || n.includes('mumbai') || n.includes('delhi') || n.includes('local')) return MapPin;
  if (n.includes('refund') || n.includes('complaint')) return AlertTriangle;
  if (n.includes('one-time') || n.includes('single')) return ShoppingBag;
  return UserCheck;
}

// Generate a consistent avatar colour from a name
const AVATAR_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6',
];
function avatarColor(name = '') {
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/* ─────────────────────────────────────────
   SegmentCard — fetches its own live stats
   ───────────────────────────────────────── */
const SegmentCard = ({ seg, onDelete, deletingId }) => {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError(false);
      try {
        const { data } = await api.get(`/segments/${seg.id}/stats`);
        if (mounted.current && data.success) setStats(data.data);
      } catch {
        if (mounted.current) setStatsError(true);
      } finally {
        if (mounted.current) setStatsLoading(false);
      }
    };
    fetchStats();
    return () => { mounted.current = false; };
  }, [seg.id]);

  const Icon = getSegmentIcon(seg.name);

  return (
    <div className="ab-seg-card">
      <div className="ab-seg-card-top">
        <div className="ab-seg-icon"><Icon size={16} /></div>
        <div className="ab-seg-meta">
          <Calendar size={12} />
          {new Date(seg.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
          })}
        </div>
      </div>

      <h3 className="ab-seg-name">{seg.name}</h3>

      {/* Live stats */}
      {statsLoading ? (
        <div className="ab-seg-stats-loading">
          <Loader2 size={14} className="spin" />
          <span>Loading customer data…</span>
        </div>
      ) : statsError ? (
        <p className="ab-seg-no-stats">Could not load customer data</p>
      ) : stats ? (
        <>
          <div className="ab-seg-count-row">
            <span className="ab-seg-count">{stats.count.toLocaleString('en-IN')}</span>
            <span className="ab-seg-count-label">customers</span>
          </div>
          {stats.cities.length > 0 && (
            <div className="ab-seg-cities">
              <MapPin size={11} />
              {stats.cities.join(' · ')}
            </div>
          )}
          {stats.sampleCustomers.length > 0 && (
            <div className="ab-seg-avatars">
              {stats.sampleCustomers.map((c, i) => (
                <div
                  key={c.id || i}
                  className="ab-seg-avatar"
                  style={{ background: avatarColor(c.name || '') }}
                  title={c.name}
                >
                  {c.name ? c.name.charAt(0).toUpperCase() : '?'}
                </div>
              ))}
              {stats.count > stats.sampleCustomers.length && (
                <div className="ab-seg-avatar ab-seg-avatar--more">
                  +{(stats.count - stats.sampleCustomers.length).toLocaleString('en-IN')}
                </div>
              )}
            </div>
          )}
        </>
      ) : null}

      <div className="ab-seg-actions">
        {confirmDelete ? (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Are you sure?</span>
            <button
              className="ab-seg-delete-btn"
              onClick={() => onDelete(seg.id)}
              disabled={deletingId === seg.id}
              style={{ padding: '4px 10px', background: 'var(--danger-bg)' }}
            >
              {deletingId === seg.id ? <><Loader2 size={12} className="spin" />...</> : 'Yes'}
            </button>
            <button
              className="ab-seg-delete-btn"
              onClick={() => setConfirmDelete(false)}
              disabled={deletingId === seg.id}
              style={{ padding: '4px 10px', color: 'var(--text-secondary)', borderColor: 'var(--border-subtle)' }}
            >
              No
            </button>
          </div>
        ) : (
          <button
            className="ab-seg-delete-btn"
            onClick={() => setConfirmDelete(true)}
            disabled={deletingId === seg.id}
          >
            <Trash2 size={14} />Delete
          </button>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   CopyButton — clipboard copy with feedback
   ───────────────────────────────────────── */
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      className={`ab-copy-btn ${copied ? 'ab-copy-btn--copied' : ''}`}
      onClick={handleCopy}
      title="Copy message"
    >
      {copied ? <><Check size={13} />Copied!</> : <><Copy size={13} />Copy</>}
    </button>
  );
};

/* ─────────────────────────────────────────
   Main page
   ───────────────────────────────────────── */
const AudienceBuilder = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const [segments, setSegments] = useState([]);
  const [segmentsLoading, setSegmentsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchSegments = useCallback(async () => {
    setSegmentsLoading(true);
    try {
      const { data } = await api.get('/segments');
      if (data.success) setSegments(data.data);
    } catch (_) { /* non-fatal */ }
    finally { setSegmentsLoading(false); }
  }, []);

  useEffect(() => { fetchSegments(); }, [fetchSegments]);

  const isBuildingRef = useRef(false);

  const handleBuild = async () => {
    if (!prompt.trim() || isBuildingRef.current) return;
    isBuildingRef.current = true;
    setIsLoading(true);
    setSaved(false);
    setResult(null);
    setError(null);
    try {
      const { data } = await api.post('/ai/parse-segment', { prompt });
      if (data.success) setResult(data.data);
      else setError('Something went wrong. Please try again.');
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to reach the server.'
      );
    } finally { 
      setIsLoading(false);
      isBuildingRef.current = false;
    }
  };


  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!isBuildingRef.current) handleBuild();
    }
  };

  const handleExampleClick = (ex) => { setPrompt(ex); setResult(null); setError(null); setSaved(false); };
  const handleReset = () => { setPrompt(''); setResult(null); setError(null); setSaved(false); };

  const handleSave = async () => {
    try {
      await api.post('/segments', {
        name: result.segmentName,
        sql: result.sql,
        params: result.params,
      });
      setSaved(true);
      fetchSegments();
    } catch (err) {
      alert('Failed to save audience: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/segments/${id}`);
      setSegments((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data?.message || err.message));
    } finally { setDeletingId(null); }
  };

  return (
    <div className="audience-builder animate-fade-in">

      {/* ── Header ── */}
      <div className="ab-header">
        <div className="ab-header-left">
          <div className="ab-icon-badge"><Sparkles size={22} /></div>
          <div>
            <h1 className="ab-title">AI Audience Builder</h1>
            <p className="ab-subtitle">
              Describe your target audience in plain English — AI finds the right customers and shows you who they are.
            </p>
          </div>
        </div>
        <div className="ab-live-badge"><Database size={13} />Live Data</div>
      </div>

      {/* ── Builder Panel ── */}
      <div className="ab-body">
        {/* Left */}
        <div className="ab-left">
          <div className="ab-card ab-input-card">
            <div className="ab-card-label">
              <span className="ab-step">01</span>
              <span>Describe Your Audience</span>
            </div>
            <textarea
              className="ab-textarea"
              placeholder="e.g. Find customers who used to purchase frequently but haven't ordered recently."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={5}
            />
            <p className="ab-hint">Tip: Press Ctrl + Enter to build</p>
            <div className="ab-actions">
              {(result || error) && (
                <button className="ab-btn ab-btn-ghost" onClick={handleReset}>
                  <RefreshCw size={16} /> Reset
                </button>
              )}
              <button
                className={`ab-btn ab-btn-primary ${isLoading ? 'loading' : ''}`}
                onClick={handleBuild}
                disabled={isLoading || !prompt.trim()}
              >
                {isLoading
                  ? <><Loader2 size={16} className="spin" />Finding Customers…</>
                  : <><Sparkles size={16} />Build Audience<ArrowRight size={16} /></>}
              </button>
            </div>
          </div>

          <div className="ab-card ab-examples-card">
            <p className="ab-examples-title">Try an example</p>
            <ul className="ab-examples-list">
              {EXAMPLE_PROMPTS.map((ex, i) => (
                <li key={i}>
                  <button className="ab-example-btn" onClick={() => handleExampleClick(ex)}>
                    <ChevronRight size={14} className="ex-arrow" />{ex}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right */}
        <div className="ab-right">
          {!result && !isLoading && !error && (
            <div className="ab-placeholder">
              <div className="ab-placeholder-icon"><Users size={40} /></div>
              <p className="ab-placeholder-title">Your audience will appear here</p>
              <p className="ab-placeholder-sub">Describe a segment on the left and hit <strong>Build Audience</strong></p>
            </div>
          )}

          {isLoading && (
            <div className="ab-placeholder">
              <div className="ab-loading-ring"><Loader2 size={36} className="spin" /></div>
              <p className="ab-placeholder-title">Finding your customers…</p>
              <p className="ab-placeholder-sub">Searching through your live database</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="ab-error-card">
              <div className="ab-error-icon"><AlertCircle size={28} /></div>
              <p className="ab-error-title">Could not build segment</p>
              <p className="ab-error-msg">{error}</p>
              <button className="ab-btn ab-btn-ghost ab-error-retry" onClick={handleBuild} disabled={!prompt.trim()}>
                <RefreshCw size={15} /> Try Again
              </button>
            </div>
          )}

          {result && !isLoading && (
            <div className="ab-result animate-fade-in">
              <div className="ab-card-label">
                <span className="ab-step">02</span>
                <span>Audience Ready — Live Results</span>
              </div>

              {/* Count hero */}
              <div className="ab-result-hero">
                <div className="ab-result-count-block">
                  <div className="ab-result-count-number">
                    {result.preview?.count != null
                      ? result.preview.count.toLocaleString('en-IN')
                      : '—'}
                  </div>
                  <div className="ab-result-count-label">customers matched</div>
                </div>
                <div className="ab-result-name-block">
                  <p className="ab-result-label">Segment Name</p>
                  <h2 className="ab-result-name">{result.segmentName}</h2>
                  {result.preview?.sample?.length > 0 && (() => {
                    const cities = [...new Set(result.preview.sample.map(c => c.city).filter(Boolean))].slice(0, 3);
                    return cities.length ? (
                      <div className="ab-result-cities">
                        <MapPin size={12} />{cities.join(' · ')}
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>

              {result.preview?.error && (
                <div className="ab-preview-error">
                  <AlertCircle size={14} />
                  <span><strong>Note:</strong> Could not count customers — {result.preview.error}. Try rephrasing.</span>
                </div>
              )}

              {/* Who's in this audience */}
              {result.preview?.sample?.length > 0 && (
                <div className="ab-sample">
                  <p className="ab-section-label"><UserCheck size={13} />Who's in this audience</p>
                  <div className="ab-sample-grid">
                    {result.preview.sample.map((c) => (
                      <div key={c.id} className="ab-sample-item">
                        <div className="ab-sample-avatar" style={{ background: avatarColor(c.name || '') }}>
                          {c.name ? c.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="ab-sample-info">
                          <p className="ab-sample-name">{c.name || 'Unknown'}</p>
                          <p className="ab-sample-meta">{c.city || '—'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {result.preview.count > result.preview.sample.length && (
                    <p className="ab-sample-more">
                      + {(result.preview.count - result.preview.sample.length).toLocaleString('en-IN')} more customers
                    </p>
                  )}
                </div>
              )}

              {/* Suggested message with copy button */}
              {result.messageTemplate && (
                <div className="ab-message-box">
                  <div className="ab-message-header">
                    <p className="ab-message-label">💬 Suggested Message</p>
                    <CopyButton text={result.messageTemplate} />
                  </div>
                  <p className="ab-message-text">{result.messageTemplate}</p>
                </div>
              )}

              <div className="ab-result-actions">
                <button
                  className={`ab-btn ${saved ? 'ab-btn-saved' : 'ab-btn-primary'}`}
                  onClick={handleSave}
                  disabled={saved}
                >
                  <BookmarkPlus size={16} />
                  {saved ? 'Audience Saved!' : 'Save Audience'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Saved Audiences ── */}
      <div className="ab-saved-section">
        <div className="ab-saved-header">
          <div className="ab-saved-title-row">
            <div className="ab-saved-icon"><Layers size={18} /></div>
            <div>
              <h2 className="ab-saved-title">Saved Audiences</h2>
              <p className="ab-saved-subtitle">
                {segments.length > 0
                  ? `${segments.length} audience${segments.length !== 1 ? 's' : ''} — live customer data loaded per card`
                  : 'Save an audience above to use it in campaigns'}
              </p>
            </div>
          </div>
          <button className="ab-btn ab-btn-ghost ab-refresh-btn" onClick={fetchSegments} disabled={segmentsLoading}>
            <RefreshCw size={15} className={segmentsLoading ? 'spin' : ''} />
            Refresh
          </button>
        </div>

        {segmentsLoading ? (
          <div className="ab-saved-loading">
            <Loader2 size={28} className="spin" />
            <p>Loading audiences…</p>
          </div>
        ) : segments.length === 0 ? (
          <div className="ab-saved-empty">
            <div className="ab-saved-empty-icon"><Layers size={32} /></div>
            <p className="ab-saved-empty-title">No audiences saved yet</p>
            <p className="ab-saved-empty-sub">Build an audience above and hit <strong>Save Audience</strong>.</p>
          </div>
        ) : (
          <div className="ab-segments-grid">
            {segments.map((seg) => (
              <SegmentCard
                key={seg.id}
                seg={seg}
                onDelete={handleDelete}
                deletingId={deletingId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AudienceBuilder;
