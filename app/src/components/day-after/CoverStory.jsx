import { Trophy } from 'lucide-react';
import { formatRating } from '../../lib/format.js';
import { buildTrial } from '../../lib/newsroom.js';
import { MatchStrip } from './MatchStrip.jsx';

function CoverLead({ cover, coverPlayer, nightStats, selectedNight }) {
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
        <summary>Apri la storia e le cifre</summary>
        <p>
          {nightStats.wins}
          {' vittorie, '}
          {nightStats.draws}
          {' pareggi e '}
          {nightStats.losses}
          {' sconfitte. '}
          {nightStats.goals}
          {' reti segnate e '}
          {nightStats.against}
          {' subite: '}
          {nightStats.goals > nightStats.against
            ? 'l’attacco sostiene un saldo positivo'
            : nightStats.goals < nightStats.against
              ? 'il saldo chiede più efficacia e più tenuta del risultato'
              : 'la serata chiude in equilibrio anche nelle reti'}
          .
        </p>
        {coverPlayer && (
          <p>{buildTrial(coverPlayer, selectedNight.day).praise}</p>
        )}
        <MatchStrip matches={selectedNight.games} />
      </details>
    </article>
  );
}

function CoverSide({ nightStats, selectedNight }) {
  return (
    <aside className="paper-cover-side">
      <div className="paper-cover-award">
        <Trophy size={20} />
        <span>
          {nightStats.winners.length > 1
            ? 'I MIGLIORI DELLE GARE REGISTRATE'
            : 'IL MIGLIORE DELLE GARE REGISTRATE'}
        </span>
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
      <p>
        {nightStats.wins > nightStats.losses
          ? 'Il bilancio sorride. Il tribunale, però, apre lo stesso.'
          : nightStats.losses > nightStats.wins
            ? 'Il bilancio punge. Le cifre decidono chi merita l’applauso.'
            : 'Il bilancio resta in equilibrio. Gli spunti per parlarne, molto meno.'}
      </p>
    </aside>
  );
}

export function CoverStory({ cover, coverPlayer, nightStats, selectedNight }) {
  return (
    <div className="paper-cover">
      <CoverLead
        cover={cover}
        coverPlayer={coverPlayer}
        nightStats={nightStats}
        selectedNight={selectedNight}
      />
      <CoverSide nightStats={nightStats} selectedNight={selectedNight} />
    </div>
  );
}
