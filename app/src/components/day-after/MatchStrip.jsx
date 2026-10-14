import { formatMatchTime, formatScore } from '../../lib/format.js';
import { getOpponentName, getResultLetter } from '../../lib/matches.js';

export function MatchStrip({ matches }) {
  return (
    <div className="paper-proof-matches">
      {matches.map((match) => (
        <div key={match.matchId}>
          <time>{formatMatchTime(match)}</time>
          <span>{getOpponentName(match)}</span>
          <b>{formatScore(match)}</b>
          <i className={getResultLetter(match)}>{getResultLetter(match)}</i>
        </div>
      ))}
    </div>
  );
}
