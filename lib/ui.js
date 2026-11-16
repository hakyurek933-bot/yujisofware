export const CATEGORY_GRAD = {
  valorant: 'linear-gradient(135deg,#ff4655,#7a1220)',
  cs2: 'linear-gradient(135deg,#f5a623,#5b3a00)',
  lol: 'linear-gradient(135deg,#c8a44d,#1e3a8a)',
  minecraft: 'linear-gradient(135deg,#3ddc84,#14532d)',
  roblox: 'linear-gradient(135deg,#e11d48,#4c0519)',
  fortnite: 'linear-gradient(135deg,#7c5cff,#2b1a66)',
  underground: 'linear-gradient(135deg,#2b2b3a,#000)',
  booster: 'linear-gradient(135deg,#ff8ae0,#7c5cff)'
};

export const Stars = ({ n = 5 }) => (
  <span className="stars" aria-label={`${n} yıldız`}>
    {'★'.repeat(Math.max(1, Math.min(5, n)))}
    {'☆'.repeat(5 - Math.max(1, Math.min(5, n)))}
  </span>
);

export const RoleBadge = ({ role }) => <span className={`role-badge role-${role}`}>{role}</span>;

export const Empty = ({ icon = '🕳️', text }) => (
  <div className="empty">
    <div className="big">{icon}</div>
    <div>{text}</div>
  </div>
);
