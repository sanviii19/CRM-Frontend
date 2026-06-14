import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../api';
import Card from '../components/Card';
import Button from '../components/Button';
import { ArrowLeft, Users, Send, CheckCircle, MailOpen, MousePointerClick, TrendingUp, Clock, Activity, XCircle } from 'lucide-react';

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isFailedModalOpen, setIsFailedModalOpen] = useState(false);
  const [failedMessages, setFailedMessages] = useState([]);
  const [loadingFailed, setLoadingFailed] = useState(false);

  const openFailedModal = async () => {
    if (campaign?.failed === 0) return; // Don't open if 0
    setIsFailedModalOpen(true);
    setLoadingFailed(true);
    try {
      const { data } = await api.get(`/campaigns/${id}/messages?status=FAILED`);
      if (data.success) {
        setFailedMessages(data.data);
      }
    } catch (err) {
      console.error('Error fetching failed messages', err);
    } finally {
      setLoadingFailed(false);
    }
  };

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await api.get(`/campaigns/${id}`);
        setCampaign(response.data.data);
      } catch (error) {
        console.error('Failed to fetch campaign details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  // Connect to Socket.io for live metric updates
  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    
    socket.emit('join-campaign', id);
    
    socket.on('metrics-update', (metrics) => {
      setCampaign((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          queued: metrics.queued,
          sent: metrics.sent,
          delivered: metrics.delivered,
          failed: metrics.failed,
          opened: metrics.opened,
          read: metrics.read,
          clicked: metrics.clicked,
          converted: metrics.converted
        };
      });
    });

    return () => {
      socket.emit('leave-campaign', id);
      socket.disconnect();
    };
  }, [id]);

  if (loading) {
    return <div className="text-muted" style={{ padding: '24px' }}>Loading campaign details...</div>;
  }

  if (!campaign) {
    return (
      <div style={{ padding: '24px' }}>
        <h2 style={{ marginBottom: '16px' }}>Campaign not found</h2>
        <Button variant="ghost" onClick={() => navigate('/campaigns')} icon={<ArrowLeft size={18} />}>Back to Campaigns</Button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return { bg: 'var(--success-bg)', text: 'var(--success)' };
      case 'PROCESSING': return { bg: 'var(--info-bg)', text: 'var(--info)' };
      case 'FAILED': return { bg: 'var(--danger-bg)', text: 'var(--danger)' };
      default: return { bg: 'var(--warning-bg)', text: 'var(--warning)' };
    }
  };

  const statusColors = getStatusColor(campaign.status);

  // Stats definition for easy mapping
  const metrics = [
    { label: 'Audience Size', value: campaign.audienceSize, icon: <Users size={20} />, color: 'var(--info)' },
    { label: 'Sent', value: campaign.sent, icon: <Send size={20} />, color: 'var(--primary)' },
    { label: 'Delivered', value: campaign.delivered, icon: <CheckCircle size={20} />, color: 'var(--success)' },
    { 
      label: 'Failed', 
      value: campaign.failed, 
      icon: <XCircle size={20} />, 
      color: 'var(--danger)',
      onClick: openFailedModal,
      clickable: campaign.failed > 0
    },
    { label: 'Opened', value: campaign.opened, icon: <MailOpen size={20} />, color: 'var(--warning)' },
    { label: 'Clicked', value: campaign.clicked, icon: <MousePointerClick size={20} />, color: 'var(--accent-secondary)' },
    { label: 'Converted', value: campaign.converted, icon: <TrendingUp size={20} />, color: 'var(--accent-primary)' },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <Button variant="ghost" icon={<ArrowLeft size={20} />} onClick={() => navigate('/campaigns')} style={{ padding: '8px' }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '1.75rem', margin: 0 }}>{campaign.name}</h2>
            <span style={{ 
              padding: '4px 12px', 
              borderRadius: '20px', 
              fontWeight: '600',
              fontSize: '0.875rem',
              background: statusColors.bg,
              color: statusColors.text,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Activity size={14} />
              {campaign.status}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <span>Targeting: <strong style={{ color: 'var(--text-secondary)' }}>{campaign.segmentName}</strong></span>
            <span>•</span>
            <span>Channels: <strong style={{ color: 'var(--text-secondary)' }}>{campaign.channels ? campaign.channels.join(', ') : 'SMS'}</strong></span>
          </div>
        </div>
      </div>

      {/* Overview Metrics */}
      <Card title="Campaign Overview" style={{ padding: '24px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: '20px',
          marginTop: '16px' 
        }}>
          {metrics.map((m, i) => (
            <div 
              key={i} 
              onClick={m.clickable ? m.onClick : undefined}
              style={{ 
                background: 'var(--bg-tertiary)', 
                padding: '16px', 
                borderRadius: '12px', 
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                cursor: m.clickable ? 'pointer' : 'default',
                transition: 'transform 0.2s',
                ...(m.clickable && { ':hover': { transform: 'translateY(-2px)' } })
              }}
              onMouseEnter={(e) => m.clickable && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => m.clickable && (e.currentTarget.style.transform = 'none')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                <span style={{ color: m.color, display: 'flex' }}>{m.icon}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{m.label}</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                {m.value.toLocaleString()}
              </div>
              {m.label === 'Failed' && m.clickable && (
                <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '-8px' }}>Click to view details</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Message Template */}
        <Card title="Message Strategy" style={{ padding: '24px', height: 'fit-content' }}>
          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginTop: '16px' }}>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>
              {campaign.messageTemplate}
            </p>
          </div>
        </Card>

        {/* Timeline */}
        <Card title="Timeline" style={{ padding: '24px' }}>
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {campaign.timeline && campaign.timeline.length > 0 ? (
              campaign.timeline.map((event, index) => (
                <div key={event.id} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                  {/* Timeline Line */}
                  {index !== campaign.timeline.length - 1 && (
                    <div style={{ 
                      position: 'absolute', 
                      left: '11px', 
                      top: '24px', 
                      bottom: '-24px', 
                      width: '2px', 
                      background: 'var(--border-subtle)' 
                    }} />
                  )}
                  
                  {/* Timeline Dot */}
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    background: 'var(--accent-primary-alpha)', 
                    color: 'var(--accent-primary)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0,
                    zIndex: 1
                  }}>
                    <Clock size={12} />
                  </div>
                  
                  {/* Timeline Content */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                        {event.event}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {event.detail}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted">No timeline events recorded.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Failed Messages Modal */}
      {isFailedModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setIsFailedModalOpen(false)}>
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: '16px',
            width: '90%', maxWidth: '600px', maxHeight: '80vh',
            display: 'flex', flexDirection: 'column',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
            overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
                <XCircle size={20} /> Failed Deliveries
              </h3>
              <button onClick={() => setIsFailedModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>✕</button>
            </div>
            
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {loadingFailed ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading failed messages...</div>
              ) : failedMessages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No detailed failure records found.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {failedMessages.map(msg => (
                    <div key={msg.id} style={{ 
                      background: 'var(--bg-tertiary)', padding: '16px', 
                      borderRadius: '8px', borderLeft: '4px solid var(--danger)'
                    }}>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>{msg.customer?.name || 'Unknown Customer'}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {msg.failureReason || 'Delivery failed without a specific reason.'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', textAlign: 'right' }}>
              <Button variant="ghost" onClick={() => setIsFailedModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CampaignDetails;
