import { Quote, Trophy } from 'lucide-react';
import { formatRating } from '../../lib/format.js';
import { POSITION_ABBREVIATIONS } from '../../lib/positions.js';
import { AdaniComment } from '../AdaniComment.jsx';

function TrialCard({ index, isCoverPro, nightQuotes, player, trial }) {
  return (
    <details className={`paper-trial ${isCoverPro ? 'is-cover-pro' : ''}`}>
      <summary>
        <div className="paper-trial-top">
          <span>
            {'FASCICOLO '}
            {String(index + 1).padStart(2, '0')}
          </span>
          {isCoverPro && (
            <Trophy size={17} aria-label="Migliore delle gare registrate" />
          )}
          <b>
            {formatRating(player.rating)}
            <small>EA / 10</small>
          </b>
        </div>
        <h4>{player.name}</h4>
        <p className="paper-trial-title">{trial.title}</p>
        <div className="paper-trial-stats">
          <span>
            {player.games}
            {' PRES.'}
          </span>
          <span>
            {player.goals}
            {' GOL'}
          </span>
          <span>
            {player.assists}
            {' ASSIST'}
          </span>
        </div>
        <span className="paper-open-case">Leggi accusa e verdetto</span>
      </summary>
      <div className="paper-case-body">
        {trial.praise && (
          <div className="paper-praise">
            <span>L’ELOGIO</span>
            <p>{trial.praise}</p>
          </div>
        )}
        <blockquote>
          <span>L’ACCUSA DELLO SPOGLIATOIO</span>
          <Quote size={18} aria-hidden="true" />
          <p>{trial.charge}</p>
        </blockquote>
        <AdaniComment player={player} quote={nightQuotes.get(player.name)} />
        <details className="paper-verdict">
          <summary>Le prove e il verdetto</summary>
          <div>
            <span>AGLI ATTI</span>
            <p>{trial.proof}</p>
            <div className="paper-trial-evidence">
              <span>
                {player.passPct === null ? '—' : `${player.passPct}%`}
                {' passaggi'}
              </span>
              <span>
                {player.tackles}/{player.tackleAttempts}
                {' contrasti'}
              </span>
              <span>
                {player.saves}
                {' parate'}
              </span>
              <span>
                {player.reds}
                {' rossi'}
              </span>
            </div>
            <span>IL VERDETTO</span>
            <p>{trial.verdict}</p>
            {trial.coachNote && (
              <>
                <span>LA NOTA DELL’ALLENATORE</span>
                <p>{trial.coachNote}</p>
              </>
            )}
            <small>
              {'Reparti giocati: '}
              {player.roles
                .map((role) => POSITION_ABBREVIATIONS[role] || role)
                .join(' / ')}
              {'. Totali sulle '}
              {player.games}
              {' presenze registrate.'}
            </small>
          </div>
        </details>
      </div>
    </details>
  );
}

export function Trials({ nightQuotes, nightStats, trials }) {
  return (
    <section className="paper-trials" id="processo">
      <div className="paper-section-heading">
        <div>
          <span>02 / IL PROCESSO DEL PALLONE</span>
          <h3>
            Tutti alla sbarra.
            <br />
            <em>Sconti solo oltre l’8.</em>
          </h3>
        </div>
        <p>
          Accusa, prove e verdetto per tutti quelli scesi in campo. L’elogio
          si merita sopra l’8 di media stagionale, e con un limite sempre
          indicato; sotto il 6.5 si viene bocciati. Le cifre sono di EA.
        </p>
      </div>
      <div className="paper-trial-grid">
        {trials.map(({ player, trial }, index) => {
          const isCoverPro = nightStats.winners.some(
            (winner) => winner.id === player.id,
          );
          return (
            <TrialCard
              key={player.id}
              index={index}
              isCoverPro={isCoverPro}
              nightQuotes={nightQuotes}
              player={player}
              trial={trial}
            />
          );
        })}
      </div>
    </section>
  );
}
