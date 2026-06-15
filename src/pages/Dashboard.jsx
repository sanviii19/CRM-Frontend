import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Card from '../components/Card';
import { Users, Send, Target, TrendingUp, CheckCircle, MailOpen, MousePointerClick, ShoppingCart, ChevronDown, XCircle } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard');
        setStats(response.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="flex-center" style={{ height: '100%' }}><div className="text-muted">Loading dashboard...</div></div>;
  }

  // Calculate metrics
  const global = stats?.globalMetrics || { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, failed: 0 };
  
  const displayFunnel = global;

  const openRate = global.delivered > 0 ? ((global.opened / global.delivered) * 100).toFixed(1) : '0.0';
  const conversionRate = global.delivered > 0 ? ((global.converted / global.delivered) * 100).toFixed(1) : '0.0';

  const funnelMax = Math.max(displayFunnel.sent, 1);
  const funnelStages = [
    { key: 'sent', label: 'Sent', value: displayFunnel.sent, color: 'var(--accent-primary)', bg: 'rgba(99, 102, 241, 0.1)', icon: Send, base: displayFunnel.sent, sub: 'Total Audience', connectorLabel: '' },
    { key: 'failed', label: 'Failed Delivery', value: displayFunnel.failed || 0, color: 'var(--danger)', bg: 'var(--danger-bg)', icon: XCircle, base: displayFunnel.sent, sub: 'Failure Rate', connectorLabel: 'failed' },
    { key: 'delivered', label: 'Delivered', value: displayFunnel.delivered, color: 'var(--info)', bg: 'var(--info-bg)', icon: CheckCircle, base: displayFunnel.sent, sub: 'Delivery Rate', connectorLabel: 'delivered' },
    { key: 'opened', label: 'Opened', value: displayFunnel.opened, color: 'var(--warning)', bg: 'var(--warning-bg)', icon: MailOpen, base: displayFunnel.delivered, sub: 'Open Rate', connectorLabel: 'opened' },
    { key: 'clicked', label: 'Clicked', value: displayFunnel.clicked, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)', icon: MousePointerClick, base: displayFunnel.opened, sub: 'Click-to-Open', connectorLabel: 'clicked' },
    { key: 'converted', label: 'Converted', value: displayFunnel.converted, color: 'var(--success)', bg: 'var(--success-bg)', icon: ShoppingCart, base: displayFunnel.clicked, sub: 'Conv. Rate', connectorLabel: 'converted' },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <Card>
          <div className="flex-between">
            <div>
              <p className="text-muted" style={{ marginBottom: '8px' }}>Total Customers</p>
              <h2 style={{ fontSize: '2rem' }}>{stats?.totalCustomers || 0}</h2>
            </div>
            <div style={{ padding: '12px', background: 'var(--info-bg)', color: 'var(--info)', borderRadius: '12px' }}>
              <Users size={24} />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex-between">
            <div>
              <p className="text-muted" style={{ marginBottom: '8px' }}>Total Campaigns</p>
              <h2 style={{ fontSize: '2rem' }}>{stats?.total || 0}</h2>
            </div>
            <div style={{ padding: '12px', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: '12px' }}>
              <Send size={24} />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex-between">
            <div>
              <p className="text-muted" style={{ marginBottom: '8px' }}>Avg Open Rate</p>
              <h2 style={{ fontSize: '2rem' }}>{openRate}%</h2>
            </div>
            <div style={{ padding: '12px', background: 'var(--warning-bg)', color: 'var(--warning)', borderRadius: '12px' }}>
              <Target size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex-between">
            <div>
              <p className="text-muted" style={{ marginBottom: '8px' }}>Conversion Rate</p>
              <h2 style={{ fontSize: '2rem' }}>{conversionRate}%</h2>
            </div>
            <div style={{ padding: '12px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '12px' }}>
              <TrendingUp size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Campaigns Table */}
      <Card title="Recent Campaigns" gradient={true}>
        <div style={{ overflowX: 'auto', marginTop: '16px' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '16px 24px', fontWeight: '500', width: '35%' }}>Campaign Name</th>
                <th style={{ padding: '16px 24px', fontWeight: '500' }}>Status</th>
                <th style={{ padding: '16px 24px', fontWeight: '500', textAlign: 'right' }}>Audience</th>
                <th style={{ padding: '16px 24px', fontWeight: '500', textAlign: 'right' }}>Failed</th>
                <th style={{ padding: '16px 24px', fontWeight: '500', textAlign: 'right' }}>Open Rate</th>
                <th style={{ padding: '16px 24px', fontWeight: '500', textAlign: 'right' }}>Conv. Rate</th>
                <th style={{ padding: '16px 24px', fontWeight: '500', textAlign: 'right' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentCampaigns?.map(campaign => {
                const openRate = campaign.delivered > 0 ? ((campaign.opened / campaign.delivered) * 100).toFixed(1) + '%' : '-';
                const convRate = campaign.delivered > 0 ? ((campaign.converted / campaign.delivered) * 100).toFixed(1) + '%' : '-';
                
                let statusLabel = campaign.status;
                let statusColor = 'var(--text-muted)';
                let statusBg = 'var(--bg-tertiary)';
                
                if (campaign.status === 'COMPLETED') {
                  statusLabel = 'Sent';
                  statusColor = 'var(--success)';
                  statusBg = 'var(--success-bg)';
                } else if (campaign.status === 'PROCESSING') {
                  statusLabel = 'Sending';
                  statusColor = 'var(--info)';
                  statusBg = 'var(--info-bg)';
                } else if (campaign.status === 'DRAFT') {
                  statusLabel = 'Draft';
                  statusColor = 'var(--warning)';
                  statusBg = 'var(--warning-bg)';
                } else if (campaign.status === 'FAILED') {
                  statusLabel = 'Failed';
                  statusColor = 'var(--danger)';
                  statusBg = 'var(--danger-bg)';
                }

                return (
                  <tr 
                    key={campaign.id} 
                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                    style={{ 
                      borderBottom: '1px solid rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '16px 24px', fontWeight: '500' }}>{campaign.name}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        padding: '6px 10px', 
                        borderRadius: '6px', 
                        fontSize: '0.75rem', 
                        fontWeight: '600',
                        background: statusBg,
                        color: statusColor,
                        whiteSpace: 'nowrap'
                      }}>
                        {statusLabel}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', textAlign: 'right' }}>{campaign.audienceSize?.toLocaleString() || 0}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--danger)', textAlign: 'right', fontWeight: '500' }}>{campaign.failed > 0 ? campaign.failed.toLocaleString() : '-'}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', textAlign: 'right' }}>{openRate}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', textAlign: 'right' }}>{convRate}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
              {(!stats?.recentCampaigns || stats.recentCampaigns.length === 0) && (
                <tr>
                  <td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No recent campaigns found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delivery Funnel */}
      <Card title="Delivery Pipeline" gradient={true}>
        <div style={{ padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {funnelStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isLast = idx === funnelStages.length - 1;
            const nextStage = !isLast ? funnelStages[idx + 1] : null;
            const nextPercentage = nextStage && nextStage.base > 0 ? Math.round((nextStage.value / nextStage.base) * 100) : 0;

            return (
              <div key={stage.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '640px' }}>
                
                {/* Stage Card */}
                <div style={{ 
                  width: '100%', 
                  background: 'var(--bg-secondary)', 
                  border: `1px solid var(--border-subtle)`,
                  borderRadius: '16px', 
                  padding: '24px 32px',
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = `${stage.color}60`;
                  e.currentTarget.style.boxShadow = `0 12px 24px -8px ${stage.color}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
                >
                  {/* Left Color Indicator */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px',
                    background: stage.color
                  }}></div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', zIndex: 1 }}>
                    <div style={{ 
                      padding: '16px', 
                      borderRadius: '14px', 
                      background: stage.bg,
                      color: stage.color 
                    }}>
                      <Icon size={28} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>{stage.label}</h3>
                      <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {idx === 0 ? 'Total starting audience' : stage.sub}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right', zIndex: 1 }}>
                    <div style={{ fontSize: '2.2rem', fontWeight: '700', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                      {stage.value.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Connector Line & Percentage Pill */}
                {!isLast && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '70px', position: 'relative' }}>
                    <div style={{ width: '2px', height: '100%', background: 'var(--border-subtle)', opacity: 0.8 }}></div>
                    <div style={{ 
                      position: 'absolute', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{ 
                        background: 'var(--bg-tertiary)',
                        border: `1px solid ${nextStage.color}40`,
                        padding: '6px 16px',
                        borderRadius: '24px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: 'var(--shadow-sm)',
                        zIndex: 2
                      }}>
                        <span style={{ color: nextStage.color, fontWeight: '700', fontSize: '0.95rem' }}>{nextPercentage}%</span> 
                        <span>{nextStage.connectorLabel}</span>
                        <ChevronDown size={14} style={{ color: 'var(--text-muted)', marginLeft: '4px' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>


    </div>
  );
};

export default Dashboard;
