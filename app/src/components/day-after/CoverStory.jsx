import { Trophy } from 'lucide-react';
import { formatRating } from '../../lib/format.js';
import { MatchStrip } from './MatchStrip.jsx';

function CoverLead({ cover, selectedNight }) {
  return (
    <article className="paper-lead">
      <span className="paper-eyebrow">
        {'LA COPERTINA / '}
        {selectedNight.games.length}
        {' PARTITE DELL’EDIZIONE'}
      </span>
      <h2>{cover.title}</h2>
      <p className="paper-deck">{cover.deck}</p>
      <details className="paper-lead-details">
        <summary>Apri il bilancio e le cifre</summary>
        <p>
          {cover.balance}
        </p>
        {cover.note && <p>{cover.note}</p>}
        <MatchStrip matches={selectedNight.games} />
      </details>
    </article>
  );
}

function CoverSide({ cover, nightStats, selectedNight }) {
  return (
    <aside className="paper-cover-side">
      <div className="paper-cover-award">
        <Trophy size={20} />
        <span>{cover.awardLabel}</span>
        <strong>
          {nightStats.winners.length
            ? nightStats.winners.map((winner) => winner.name).join(' + ')
            : 'Premio non assegnato'}
        </strong>
        {nightStats.winners.length > 0 && (
          <div>
            <b>{formatRating(nightStats.winners[0].rating)}</b>
            <small>
              MEDIA EA / 10
              <br />
              {nightStats.winners[0].games}/{selectedNight.games.length}
              {' PRESENZE'}
            </small>
          </div>
        )}
      </div>
      <div className="paper-cover-number">
        <b>{nightStats.goals}</b>
        <span>
          GOL DEL CLUB
          <br />
          NELLA SERATA
        </span>
      </div>
      <p>{cover.closing}</p>
    </aside>
  );
}

export function CoverStory({ cover, nightStats, selectedNight }) {
  return (
    <div className="paper-cover">
      <CoverLead cover={cover} selectedNight={selectedNight} />
      <CoverSide
        cover={cover}
        nightStats={nightStats}
        selectedNight={selectedNight}
      />
    </div>
  );
}
