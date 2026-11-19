import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color = 'cyan' }) => {
  const colors = {
    cyan: { bg: 'rgba(0,212,255,0.08)', border: 'rgba(0,212,255,0.25)', text: '#00d4ff' },
    violet: { bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.25)', text: '#a78bfa' },
    green: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', text: '#34d399' },
    amber: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', text: '#fbbf24' },
  };
  const c = colors[color] || colors.cyan;

  return (
    <div
      className="glass fade-in"
      style={{
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        border: `1px solid ${c.border}`,
        borderRadius: '16px',
        transition: 'all 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 12,
          background: c.bg,
          border: `1px solid ${c.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {Icon && <Icon size={24} color={c.text} />}
      </div>
      <div>
        <div style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 500, marginBottom: 4 }}>
          {title}
        </div>
        <div style={{ color: '#e2e8f0', fontSize: '1.9rem', fontWeight: 700, lineHeight: 1 }}>
          {value !== undefined && value !== null ? (
            value
          ) : (
            <div className="spinner" style={{ marginTop: 4 }}></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
