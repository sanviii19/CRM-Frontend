import { useState, useEffect } from 'react';
import api from '../api';
import Card from '../components/Card';
import Button from '../components/Button';
import { Search, Filter } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [cityFilter, setCityFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [debouncedCity, setDebouncedCity] = useState('');
  const [debouncedTag, setDebouncedTag] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setDebouncedCity(cityFilter);
      setDebouncedTag(tagFilter);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, cityFilter, tagFilter]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, debouncedCity, debouncedTag]);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page,
          limit: 10,
        });
        if (debouncedSearchTerm) {
          query.append('search', debouncedSearchTerm);
        }
        if (debouncedCity) {
          query.append('city', debouncedCity);
        }
        if (debouncedTag) {
          query.append('tag', debouncedTag);
        }
        const response = await api.get(`/customers?${query.toString()}`);
        setCustomers(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch customers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [page, debouncedSearchTerm, debouncedCity, debouncedTag]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="flex-between">
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Customer Directory</h2>
          <p className="text-muted">Manage your customer database and tags.</p>
        </div>
      </div>

      <Card>
        <div className="flex-between" style={{ marginBottom: showFilters ? '16px' : '24px' }}>
          <div className="search-bar" style={{ width: '320px' }}>
            <Search size={18} className="search-icon text-muted" />
            <input 
              type="text" 
              placeholder="Search by name, email, or phone..." 
              style={{ width: '100%' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant={showFilters ? 'primary' : 'outline'} icon={<Filter size={18} />} onClick={() => setShowFilters(!showFilters)}>
            Filter
          </Button>
        </div>

        {showFilters && (
          <div className="animate-fade-in" style={{ display: 'flex', gap: '16px', marginBottom: '24px', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>City</label>
              <input 
                type="text" 
                placeholder="Filter by city..." 
                style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-primary)' }}
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Tag</label>
              <input 
                type="text" 
                placeholder="Filter by tag..." 
                style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-primary)' }}
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button variant="ghost" onClick={() => { setCityFilter(''); setTagFilter(''); }}>
                Clear
              </Button>
            </div>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 0', fontWeight: '500' }}>Name</th>
                <th style={{ padding: '12px 0', fontWeight: '500' }}>Contact</th>
                <th style={{ padding: '12px 0', fontWeight: '500' }}>Location</th>
                <th style={{ padding: '12px 0', fontWeight: '500' }}>Tags</th>
                <th style={{ padding: '12px 0', fontWeight: '500', textAlign: 'right' }}>Last Order</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map(customer => (
                  <tr key={customer.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background-color var(--transition-fast)' }} className="table-row-hover">
                    <td style={{ padding: '16px 0', fontWeight: '500' }}>{customer.name}</td>
                    <td style={{ padding: '16px 0' }}>
                      <div style={{ fontSize: '0.875rem' }}>{customer.email || '—'}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{customer.phone || '—'}</div>
                    </td>
                    <td style={{ padding: '16px 0', color: 'var(--text-secondary)' }}>{customer.city || '—'}</td>
                    <td style={{ padding: '16px 0' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {customer.tags?.slice(0, 2).map(tag => (
                          <span key={tag} style={{ padding: '2px 8px', background: 'var(--bg-tertiary)', borderRadius: '12px', fontSize: '0.75rem' }}>
                            {tag}
                          </span>
                        ))}
                        {customer.tags?.length > 2 && (
                          <span style={{ padding: '2px 8px', background: 'var(--bg-tertiary)', borderRadius: '12px', fontSize: '0.75rem' }}>
                            +{customer.tags.length - 2}
                          </span>
                        )}
                        {(!customer.tags || customer.tags.length === 0) && <span className="text-muted">—</span>}
                      </div>
                    </td>
                    <td style={{ padding: '16px 0', textAlign: 'right' }}>
                      {customer.orders && customer.orders.length > 0 ? (
                        <>
                          <div style={{ fontWeight: '500' }}>
                            {new Date(customer.orders[0].purchasedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {customer._count?.orders || 1} order{(customer._count?.orders || 1) !== 1 ? 's' : ''}
                          </div>
                        </>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.875rem' }}>No orders</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex-between" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <span className="text-muted" style={{ fontSize: '0.875rem' }}>Showing page {page}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>
              Previous
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setPage(p => p + 1)} disabled={loading || customers.length < 10}>
              Next
            </Button>
          </div>
        </div>
      </Card>
      {/* Quick hover row style injection */}
      <style>{`.table-row-hover:hover { background-color: rgba(255,255,255,0.02); }`}</style>
    </div>
  );
};

export default Customers;
