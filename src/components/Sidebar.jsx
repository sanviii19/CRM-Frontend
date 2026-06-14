import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Sparkles, Send, TrendingUp, Settings } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Customers', path: '/customers', icon: <Users size={20} /> },
    { name: 'Audiences', path: '/audiences', icon: <Sparkles size={20} />, badge: 'AI' },
    { name: 'Campaigns', path: '/campaigns', icon: <Send size={20} /> },
    { name: 'Insights', path: '/insights', icon: <TrendingUp size={20} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-box">
          <span className="logo-x">X</span>
        </div>
        <h2 className="brand-name text-gradient">Xeno CRM</h2>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="nav-link settings-btn">
          <span className="nav-icon"><Settings size={20} /></span>
          <span className="nav-text">Settings</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
