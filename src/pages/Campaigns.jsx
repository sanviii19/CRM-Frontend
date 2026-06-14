import { useState, useEffect } from 'react';
import api from '../api';
import Card from '../components/Card';
import Button from '../components/Button';
import { Plus, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await api.get('/campaigns');
        setCampaigns(response.data.campaigns || response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch campaigns:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return { bg: 'var(--success-bg)', text: 'var(--success)' };
      case 'PROCESSING': return { bg: 'var(--info-bg)', text: 'var(--info)' };
      case 'FAILED': return { bg: 'var(--danger-bg)', text: 'var(--danger)' };
      default: return { bg: 'var(--warning-bg)', text: 'var(--warning)' };
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="flex-between">
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Campaigns</h2>
          <p className="text-muted">Manage and track your messaging campaigns.</p>
        </div>
        <Button variant="primary" icon={<Plus size={18} />} onClick={() => navigate('/campaigns/create')}>
          Create Campaign
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
        {loading ? (
          <div className="text-muted" style={{ padding: '24px' }}>Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <Card className="flex-center" style={{ minHeight: '200px', gridColumn: '1 / -1' }}>
            <div style={{ textAlign: 'center' }}>
              <p className="text-muted" style={{ marginBottom: '16px' }}>No campaigns created yet.</p>
              <Button variant="outline" onClick={() => navigate('/campaigns/create')}>Start Your First Campaign</Button>
            </div>
          </Card>
        ) : (
          campaigns.map(campaign => {
            const colors = getStatusColor(campaign.status);
            return (
              <Card key={campaign.id} className="campaign-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '4px' }}>{campaign.name}</h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.875rem' }}>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        fontWeight: '600',
                        fontSize: '0.75rem',
                        background: colors.bg,
                        color: colors.text
                      }}>
                        {campaign.status}
                      </span>
                      <span className="text-muted">•</span>
                      <span className="text-muted">{campaign.channels ? campaign.channels.join(', ') : 'SMS'}</span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    icon={<BarChart2 size={18} />} 
                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                  />
                </div>
                
                <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '4px' }}>Message Template</p>
                  <p style={{ fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {campaign.messageTemplate}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <div>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '1.125rem' }}>{campaign.audienceSize}</strong>
                    Audience
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '1.125rem' }}>{campaign.sent}</strong>
                    Sent
                  </div>
                  <div>
                    <strong style={{ color: 'var(--success)', display: 'block', fontSize: '1.125rem' }}>{campaign.delivered}</strong>
                    Delivered
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
      <style>{`.campaign-card:hover { border-color: var(--accent-primary); box-shadow: 0 0 20px rgba(99,102,241,0.1); }`}</style>
    </div>
  );
};

export default Campaigns;
