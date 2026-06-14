import { useState, useEffect } from 'react';
import {
  TrendingUp, Trophy, Zap, MailOpen, RefreshCw,
  Loader2, BarChart3, Send, CheckCircle, MousePointerClick,
  ArrowRight, Antenna, Sparkles,
} from 'lucide-react';
import api from '../api';
import './Insights.css';

/* ── Mini Spark-line chart (pure SVG, no dependency) ── */
const SparkLine = ({ data, color = '#6366f1', height = 80 }) => {
  if (!data || data.length < 2) return (
    <div className="ins-empty-spark">Not enough data yet</div>
  );

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 560; const H = height;
  const pad = 8;

  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = H - pad - ((d.value - min) / range) * (H - pad * 2);
    return [x, y];
  });

  const polyline = pts.map(p => p.join(',')).join(' ');
  // Fill path: go to bottom-right then bottom-left
  const fill = `${polyline} ${W - pad},${H} ${pad},${H}`;

  return (
    <div className="ins-spark-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="ins-spark-svg">
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon
          points={fill}
          fill={`url(#grad-${color.replace('#', '')})`}
        />
        <polyline
          points={polyline}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.5" fill={color} opacity="0.85" />
        ))}
      </svg>

      {/* X-axis labels */}
      <div className="ins-spark-labels">
        {data.map((d, i) => (
          <span key={i} className="ins-spark-label"
            style={{ left: `${(i / (data.length - 1)) * 100}%` }}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ── Stat pill ── */
const Pill = ({ label, value, color }) => (
  <div className="ins-pill" style={{ '--pill-color': color }}>
    <span className="ins-pill-val">{value}</span>
    <span className="ins-pill-label">{label}</span>
  </div>
);

/* ── Section card ── */
const SectionCard = ({ icon, title, children, accent = '#6366f1' }) => (
  <div className="ins-section-card">
    <div className="ins-section-header" style={{ '--accent': accent }}>
      <span className="ins-section-icon" style={{ background: `${accent}22`, color: accent }}>
        {icon}
      </span>
      <h2 className="ins-section-title">{title}</h2>
    </div>
    {children}
  </div>
);

/* ── Main component ── */
const Insights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [aiBullets, setAiBullets] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiCached, setAiCached] = useState(false);
  const [aiNextRefresh, setAiNextRefresh] = useState(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/insights');
      if (res.data.success) setData(res.data.data);
    } catch (err) {
      setError('Failed to load insights. Make sure campaigns have been run.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAISummary = async (force = false) => {
    setAiLoading(true);
    setAiError(null);
    try {
      const url = force ? '/insights/ai-summary?force=true' : '/insights/ai-summary';
      const res = await api.get(url);
      if (res.data.success) {
        setAiBullets(res.data.data.bullets || []);
        setAiCached(res.data.data.cached || false);
        setAiNextRefresh(res.data.data.nextRefreshIn || null);
      }
    } catch {
      setAiError('Could not generate AI insights. Check your Gemini API key.');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    fetchAISummary();
  }, []);

  const handleRefresh = () => {
    fetchInsights();
    fetchAISummary(false); // don't force — respect 24h cache
  };

  const { bestCampaign, bestChannel, openRateTrend, conversionTrend } = data || {};

  return (
    <div className="insights-page animate-fade-in">

      {/* ── Header ── */}
      <div className="insights-header">
        <div className="insights-icon-badge">
          <TrendingUp size={22} />
        </div>
        <div style={{ flex: 1 }}>
          <h1 className="insights-title">Insights</h1>
          <p className="insights-subtitle">Live campaign analytics — powered by your real data.</p>
        </div>
        <button className="ins-refresh-btn" onClick={handleRefresh} disabled={loading || aiLoading}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="ins-loading">
          <Loader2 size={32} className="spin" />
          <p>Loading insights…</p>
        </div>
      )}

      {error && !loading && (
        <div className="ins-error">{error}</div>
      )}

      {!loading && data && data.totalCampaigns === 0 && (
        <div className="ins-empty">
          <BarChart3 size={48} />
          <p>No completed campaigns found.</p>
          <span>Run a campaign to start seeing insights here!</span>
        </div>
      )}

      {!loading && data && data.totalCampaigns > 0 && (
        <div className="ins-grid">

          {/* ── Best Performing Campaign ── */}
          {bestCampaign && (
            <SectionCard icon={<Trophy size={18} />} title="Best Performing Campaign" accent="#f59e0b">
              <div className="ins-best-campaign">
                <div className="ins-best-name">{bestCampaign.name}</div>
                <div className="ins-best-pills">
                  <Pill label="Open Rate"     value={`${bestCampaign.openRate}%`}       color="#f59e0b" />
                  <Pill label="Click Rate"    value={`${bestCampaign.clickRate}%`}      color="#8b5cf6" />
                  <Pill label="Conversion"    value={`${bestCampaign.conversionRate}%`} color="#10b981" />
                  <Pill label="Delivery Rate" value={`${bestCampaign.deliveryRate}%`}   color="#3b82f6" />
                </div>
                <div className="ins-best-funnel">
                  {[
                    { icon: <Send size={14} />,              label: 'Sent',      val: bestCampaign.sent },
                    { icon: <CheckCircle size={14} />,       label: 'Delivered', val: bestCampaign.delivered },
                    { icon: <MailOpen size={14} />,          label: 'Opened',    val: bestCampaign.opened },
                    { icon: <MousePointerClick size={14} />, label: 'Clicked',   val: bestCampaign.clicked },
                    { icon: <TrendingUp size={14} />,        label: 'Converted', val: bestCampaign.converted },
                  ].map((s, i, arr) => (
                    <div key={i} className="ins-funnel-step">
                      <div className="ins-funnel-icon">{s.icon}</div>
                      <div className="ins-funnel-val">{s.val.toLocaleString()}</div>
                      <div className="ins-funnel-label">{s.label}</div>
                      {i < arr.length - 1 && <ArrowRight size={12} className="ins-funnel-arrow" />}
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          )}

          {/* ── Best Channel ── */}
          {bestChannel && (
            <SectionCard icon={<Antenna size={18} />} title="Best Channel" accent="#3b82f6">
              <div className="ins-channel-wrap">
                <div className="ins-channel-badge">
                  <Zap size={28} />
                  <span>{bestChannel.channel}</span>
                </div>
                <div className="ins-channel-stats">
                  <div className="ins-channel-stat">
                    <span className="ins-channel-stat-val">{parseFloat(bestChannel.openRate.toFixed(1))}%</span>
                    <span className="ins-channel-stat-label">Avg Open Rate</span>
                  </div>
                  <div className="ins-channel-stat">
                    <span className="ins-channel-stat-val">{parseFloat(bestChannel.conversionRate.toFixed(1))}%</span>
                    <span className="ins-channel-stat-label">Avg Conversion</span>
                  </div>
                  <div className="ins-channel-stat">
                    <span className="ins-channel-stat-val">{bestChannel.count}</span>
                    <span className="ins-channel-stat-label">Campaigns</span>
                  </div>
                  <div className="ins-channel-stat">
                    <span className="ins-channel-stat-val">{bestChannel.totalDelivered.toLocaleString()}</span>
                    <span className="ins-channel-stat-label">Messages Delivered</span>
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* ── Open Rate Trend ── */}
          <SectionCard icon={<MailOpen size={18} />} title="Open Rate Trend" accent="#10b981">
            <p className="ins-trend-sub">% of delivered messages opened, per campaign</p>
            <SparkLine data={openRateTrend} color="#10b981" height={90} />
          </SectionCard>

          {/* ── Conversion Rate Trend ── */}
          <SectionCard icon={<TrendingUp size={18} />} title="Conversion Rate Trend" accent="#6366f1">
            <p className="ins-trend-sub">% of delivered messages converted, per campaign</p>
            <SparkLine data={conversionTrend} color="#6366f1" height={90} />
          </SectionCard>

        </div>
      )}

      {/* ── AI Insights Section ── */}
      {!loading && data && data.totalCampaigns > 0 && (
        <div className="ins-ai-section">
          <div className="ins-ai-header">
            <span className="ins-ai-icon"><Sparkles size={18} /></span>
            <h2 className="ins-ai-title">AI Insights</h2>
            <span className="ins-ai-badge">Gemini Powered</span>
            {aiCached && aiNextRefresh && (
              <span className="ins-ai-cache-hint">Refreshes in ~{aiNextRefresh >= 60 ? `${Math.round(aiNextRefresh / 60)}h` : `${aiNextRefresh}m`}</span>
            )}
            <button
              className="ins-ai-regen-btn"
              onClick={() => fetchAISummary(true)}
              disabled={aiLoading}
              title="Force re-generate AI insights (uses 1 Gemini request)"
            >
              <RefreshCw size={13} className={aiLoading ? 'spin' : ''} />
              {aiLoading ? 'Thinking…' : 'Re-generate'}
            </button>
          </div>

          {aiLoading && (
            <div className="ins-ai-loading">
              <Loader2 size={20} className="spin" />
              <span>Gemini is analyzing your campaign data…</span>
            </div>
          )}

          {aiError && !aiLoading && (
            <div className="ins-ai-error">{aiError}</div>
          )}

          {!aiLoading && aiBullets.length > 0 && (
            <div className="ins-ai-bullets">
              {aiBullets.map((bullet, i) => (
                <div key={i} className="ins-ai-bullet">
                  <span className="ins-ai-bullet-num">{i + 1}</span>
                  <span className="ins-ai-bullet-text">{bullet}</span>
                </div>
              ))}
            </div>
          )}

          {!aiLoading && !aiError && aiBullets.length === 0 && (
            <p className="ins-ai-empty">No AI insights yet. Run more campaigns to get deeper analysis.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Insights;
