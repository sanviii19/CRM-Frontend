import './Card.css';

const Card = ({ children, className = '', title, subtitle, action, gradient = false }) => {
  return (
    <div className={`card ${gradient ? 'card-gradient' : ''} ${className}`}>
      {(title || action) && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle text-muted">{subtitle}</p>}
          </div>
          {action && <div className="card-action">{action}</div>}
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default Card;
