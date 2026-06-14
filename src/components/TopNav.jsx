import { Bell, Search, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import './TopNav.css';

const TopNav = () => {
  const location = useLocation();
  
  // Quick hack for page titles based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/customers')) return 'Customers';
    if (path.startsWith('/campaigns')) return 'Campaigns';
    if (path.startsWith('/segments')) return 'Segments';
    return 'Overview';
  };

  return (
    <header className="top-nav">
      <div className="page-title-wrapper">
        <h1 className="page-title">{getPageTitle()}</h1>
        <div className="breadcrumbs text-muted">
          <span>App</span> <span className="separator">/</span> <span>{getPageTitle()}</span>
        </div>
      </div>

      <div className="top-nav-actions">
        <div className="search-bar">
          <Search size={18} className="search-icon text-muted" />
          <input type="text" placeholder="Search anything..." />
        </div>
        
        <button className="icon-button notification-btn">
          <Bell size={20} />
          <span className="badge"></span>
        </button>

        <div className="user-profile">
          <div className="avatar">
            <User size={18} />
          </div>
          <div className="user-info">
            <span className="user-name">Admin User</span>
            <span className="user-role text-muted">Superadmin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
