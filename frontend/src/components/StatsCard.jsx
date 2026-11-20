import React from 'react';

const THEMES = {
  cyan: {
    bg: 'rgba(0, 212, 255, 0.08)',
    border: 'rgba(0, 212, 255, 0.2)',
    iconColor: '#00d4ff',
    shadow: '0 0 20px rgba(0, 212, 255, 0.15)',
  },
  violet: {
    bg: 'rgba(124, 58, 237, 0.08)',
    border: 'rgba(124, 58, 237, 0.2)',
    iconColor: '#a78bfa',
    shadow: '0 0 20px rgba(124, 58, 237, 0.15)',
  },
  green: {
    bg: 'rgba(16, 185, 129, 0.08)',
    border: 'rgba(16, 185, 129, 0.2)',
    iconColor: '#34d399',
    shadow: '0 0 20px rgba(16, 185, 129, 0.15)',
  },
  amber: {
    bg: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.2)',
    iconColor: '#fbbf24',
    shadow: '0 0 20px rgba(245, 158, 11, 0.15)',
  },
};

const StatsCard = ({ title, value, icon: Icon, color = 'cyan', subtitle }) => {
  const t = THEMES[color] || THEMES.cyan;

  return (
    <div
      className="stat-card fade-in"
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = t.border)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div
        className="stat-icon-wrap"
        style={{
          background: t.bg,
          border: `1px solid ${t.border}`,
          boxShadow: t.shadow,
        }}
      >
        {Icon && <Icon size={22} color={t.iconColor} strokeWidth={1.5} />}
      </div>
      <div className="stat-label">{title}</div>
      <div className="stat-value">
        {value !== undefined && value !== null ? (
          value.toLocaleString()
        ) : (
          <div className="spinner" style={{ marginTop: 4 }}></div>
        )}
      </div>
      {subtitle && <div className="stat-change">{subtitle}</div>}
    </div>
  );
};

export default StatsCard;
