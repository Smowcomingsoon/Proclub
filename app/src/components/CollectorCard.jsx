import { formatProOverall } from '../lib/format.js';

/** Figurina da collezione di un Pro (tier e "on fire" dal profilo calcolato). */
export function CollectorCard({ member, profile, onClick }) {
  const stats = [
    [member.goals, 'GOL'],
    [member.assists, 'AST'],
    [member.gamesPlayed, 'PRE'],
    [`${member.passSuccessRate}%`, 'PAS'],
    [member.tacklesMade, 'CTR'],
    [member.ratingAve, 'MED'],
  ];
  // Senza onClick la figurina è solo illustrativa (pagina del giocatore).
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      className={`collector-card ${profile.tier} ${profile.hot ? 'on-fire' : ''}`}
      onClick={onClick}
      role={onClick ? undefined : 'img'}
      aria-label={`${member.name}, overall EA ${formatProOverall(member)}, ${profile.label}, ${member.goals} gol e ${member.assists} assist stagionali${profile.hot ? ', in forma eccezionale' : ''}${onClick ? '. Apri la pagella' : ''}`}
    >
      <span className="collector-rating">
        {formatProOverall(member)}
        <small>{profile.label}</small>
      </span>
      <img className="collector-crest" src="/logo-billocchi.svg" alt="" />
      <span className="collector-tier">
        {profile.basis === 'season'
          ? `INDICE STAG. ${profile.score}`
          : profile.basis === 'recent'
            ? `FORMA ${profile.score}`
            : 'EA OVERALL'}
      </span>
      {profile.hot && <span className="collector-fire-label">ON FIRE</span>}
      {member.name.toLowerCase() === 'we_belen' ? (
        <img
          className="collector-player-image"
          src="/cards/we-belen-portrait.webp"
          alt=""
        />
      ) : (
        <span className="collector-portrait" aria-hidden="true">
          {member.name.slice(0, 1).toUpperCase()}
        </span>
      )}
      <span className="collector-name">{member.name}</span>
      <span className="collector-stats">
        {stats.map(([value, label]) => (
          <span key={label}>
            <b>{value}</b>
            <small>{label}</small>
          </span>
        ))}
      </span>
    </Tag>
  );
}
