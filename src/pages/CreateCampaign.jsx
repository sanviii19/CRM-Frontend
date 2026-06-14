import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Card from '../components/Card';
import Button from '../components/Button';
import { ArrowLeft, Send, Sparkles, Target, Tag, MessageSquare, Users, Smartphone } from 'lucide-react';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Prompt, 2: Review

  // Step 1 State
  const [segments, setSegments] = useState([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [goal, setGoal] = useState('');
  const [tone, setTone] = useState('Friendly');

  // Step 2 State
  const [strategy, setStrategy] = useState(null);
  const [audienceCount, setAudienceCount] = useState(null);
  const [campaignName, setCampaignName] = useState('');
  const [selectedChannels, setSelectedChannels] = useState(['SMS']);
  const [launchError, setLaunchError] = useState('');

  const tones = ['Friendly', 'Professional', 'Urgent', 'Luxury'];
  const CHANNELS = ['SMS', 'EMAIL', 'WHATSAPP', 'RCS'];

  useEffect(() => {
    api.get('/segments').then(res => setSegments(res.data.data || [])).catch(console.error);
  }, []);

  const isGeneratingRef = React.useRef(false);

  const handleGenerate = async () => {
    const isCustom = !selectedSegmentId;
    if (isCustom && !targetAudience) return alert('Please enter a target audience.');
    if (!goal) return alert('Please enter a campaign goal.');
    if (isGeneratingRef.current) return;
    
    isGeneratingRef.current = true;
    const savedSegment = selectedSegmentId ? segments.find(s => s.id === selectedSegmentId) : null;
    
    setLoading(true);
    try {
      const response = await api.post('/ai/generate-strategy', { 
        targetAudience: isCustom ? targetAudience : savedSegment.name, 
        goal, 
        tone: tone.toLowerCase(),
        savedSegment
      });
      setStrategy(response.data.data);
      setCampaignName(`Campaign for ${response.data.data.segmentName}`);
      setAudienceCount(null);
      setLaunchError('');
      
      // Preview audience size immediately
      try {
        const previewRes = await api.post('/segments/preview', {
          sql: response.data.data.sql,
          params: response.data.data.params || []
        });
        setAudienceCount(previewRes.data.count);
      } catch (e) {
        console.warn('Preview failed:', e);
      }
      
      setStep(2);
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate campaign strategy.');
    } finally {
      setLoading(false);
      isGeneratingRef.current = false;
    }
  };

  const handleLaunch = async () => {
    setLaunchError('');
    setLoading(true);
    try {
      const payload = {
        name: campaignName,
        channels: selectedChannels,
        messageTemplate: strategy.message,
        segmentQuery: {
          sql: strategy.sql,
          params: strategy.params,
          segmentName: strategy.segmentName
        }
      };
      await api.post('/campaigns', payload);
      navigate('/campaigns');
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to launch campaign. Please try again.';
      setLaunchError(msg);
      console.error('Launch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Button variant="ghost" icon={<ArrowLeft size={20} />} onClick={() => navigate('/campaigns')} style={{ padding: '8px' }} />
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>AI Campaign Generator</h2>
          <p className="text-muted">Describe your goal, and AI will build the perfect campaign.</p>
        </div>
      </div>

      {step === 1 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '1rem', fontWeight: '500' }}>
                  <Users size={18} className="text-primary" /> Target Audience
                </label>
                {segments.length > 0 && (
                  <select
                    value={selectedSegmentId}
                    onChange={(e) => setSelectedSegmentId(e.target.value)}
                    style={{ ...inputStyle, marginBottom: selectedSegmentId ? '0' : '12px' }}
                  >
                    <option value="">+ Create Custom Audience</option>
                    {segments.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                )}
                
                {!selectedSegmentId && (
                  <>
                    <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '12px' }}>Who do you want to reach?</p>
                    <textarea
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      rows="2"
                      placeholder="e.g., Inactive customers who haven't purchased in 60 days."
                      style={inputStyle}
                    />
                  </>
                )}
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '1rem', fontWeight: '500' }}>
                  <Target size={18} className="text-primary" /> Campaign Goal
                </label>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '12px' }}>What are you trying to achieve?</p>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  rows="2"
                  placeholder="e.g., Bring them back and clear out old inventory."
                  style={inputStyle}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '1rem', fontWeight: '500' }}>
                  <MessageSquare size={18} className="text-primary" /> Tone
                </label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {tones.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      type="button"
                      style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: `1px solid ${tone === t ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                        background: tone === t ? 'var(--accent-primary-alpha)' : 'transparent',
                        color: tone === t ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: tone === t ? '600' : '400',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <Button variant="secondary" onClick={() => navigate('/campaigns')}>Cancel</Button>
            <Button variant="primary" onClick={handleGenerate} icon={<Sparkles size={18} />} disabled={loading || (!selectedSegmentId && !targetAudience) || !goal}>
              {loading ? 'Generating...' : 'Generate Campaign'}
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card title="Generated Strategy" className="glow-border">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '16px' }}>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Campaign Name</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--accent-primary)' }}>
                    <Users size={18} />
                    <strong style={{ fontSize: '0.875rem' }}>Audience Suggestion</strong>
                  </div>
                  <p style={{ fontSize: '1rem', fontWeight: '500' }}>{strategy?.segmentName}</p>
                  {audienceCount !== null && (
                    <p style={{ marginTop: '8px', fontSize: '0.875rem', color: audienceCount === 0 ? 'var(--danger)' : 'var(--success)', fontWeight: '600' }}>
                      {audienceCount === 0
                        ? '⚠️ No customers match this audience. Go back and adjust your targeting.'
                        : `✓ ${audienceCount.toLocaleString()} customers will receive this campaign`}
                    </p>
                  )}
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)', gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--accent-primary)' }}>
                    <Smartphone size={18} />
                    <strong style={{ fontSize: '0.875rem' }}>Select Channels (Multi-select)</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {CHANNELS.map((ch) => {
                      const isSelected = selectedChannels.includes(ch);
                      return (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => {
                            if (isSelected && selectedChannels.length > 1) {
                              setSelectedChannels(selectedChannels.filter(c => c !== ch));
                            } else if (!isSelected) {
                              setSelectedChannels([...selectedChannels, ch]);
                            }
                          }}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                            background: isSelected ? 'var(--accent-primary-alpha)' : 'transparent',
                            color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontWeight: isSelected ? '600' : '400',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {ch}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--accent-primary)' }}>
                  <MessageSquare size={18} />
                  <strong style={{ fontSize: '0.875rem' }}>Message</strong>
                </div>
                <textarea
                  value={strategy?.message || ''}
                  onChange={(e) => setStrategy({ ...strategy, message: e.target.value })}
                  rows="4"
                  style={{ ...inputStyle, background: 'transparent', border: 'none', padding: 0 }}
                />
              </div>
            </div>
          </Card>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', flexDirection: 'column', alignItems: 'flex-end' }}>
            {launchError && (
              <div style={{ 
                background: 'var(--danger-bg)', 
                border: '1px solid var(--danger)', 
                borderRadius: '8px', 
                padding: '12px 16px', 
                color: 'var(--danger)', 
                fontSize: '0.875rem',
                width: '100%'
              }}>
                ⚠️ {launchError}
              </div>
            )}
            <div style={{ display: 'flex', gap: '16px' }}>
              <Button variant="ghost" onClick={() => setStep(1)} disabled={loading}>Back to Edit</Button>
              <Button 
                variant="primary" 
                onClick={handleLaunch} 
                icon={<Send size={18} />} 
                disabled={loading || audienceCount === 0}
              >
                {loading ? 'Launching...' : 'Launch Campaign'}
              </Button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .glow-border {
          position: relative;
        }
        .glow-border::before {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(45deg, var(--accent-primary), transparent 40%, transparent 60%, var(--accent-primary));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  backgroundColor: 'var(--bg-tertiary)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '0.875rem',
  outline: 'none',
  transition: 'border-color var(--transition-fast)'
};

export default CreateCampaign;
