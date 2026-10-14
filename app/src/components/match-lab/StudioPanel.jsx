import { Check, Copy, Crosshair, Flame, Sparkles, Trophy } from 'lucide-react';
import { CLUB_ID } from '../../lib/constants.js';
import { formatNumber } from '../../lib/format.js';
import { getOpponentName } from '../../lib/matches.js';
import { POSITION_NAMES } from '../../lib/positions.js';
import { percentage, toNumber } from '../../lib/stats.js';

function LabAward({ label, player, detail, icon }) {
  return (
    <article className="lab-award">
      {icon}
      <span>{label}</span>
      <strong>{player?.playername || 'Non assegnato'}</strong>
      <p>
        {player
          ? detail
          : 'Nessuna prestazione soddisfa il criterio in questa gara.'}
      </p>
    </article>
  );
}

function Scoreboard({ dateLabel, outcome, ownClub, selectedMatch }) {
  return (
    <div className="lab-scoreboard">
      <div>
        <span className={`lab-outcome ${outcome}`}>{outcome}</span>
        <p>
          {dateLabel}
          {toNumber(ownClub.winnerByDnf) > 0
            ? ' · Vittoria per abbandono avversario'
            : ''}
        </p>
        <h3>
          {'BILLOCCHI CLUB '}
          <span>
            {'vs '}
            {getOpponentName(selectedMatch)}
          </span>
        </h3>
      </div>
      <strong>
        {ownClub.goals}
        <i>:</i>
        {ownClub.goalsAgainst}
      </strong>
    </div>
  );
}

function Verdict({ matchSummary, ownClub, topAssister, topRated }) {
  return (
    <div className="lab-story">
      <span>IL VERDETTO DELLO SPOGLIATOIO</span>
      <h3>
        {toNumber(ownClub.goalsAgainst) === 0
          ? 'Porta chiusa. Chat aperta.'
          : toNumber(ownClub.goals) > toNumber(ownClub.goalsAgainst)
            ? 'Tre punti, qualche brivido.'
            : toNumber(ownClub.goals) < toNumber(ownClub.goalsAgainst)
              ? 'La rivincita parte da qui.'
              : 'Equilibrio sul campo. Dibattito in chat.'}
      </h3>
      <p>
        {topRated
          ? `${topRated.playername} firma il miglior voto tra i Pro (${topRated.rating}). `
          : ''}
        {topAssister
          ? `${topAssister.playername} serve ${topAssister.assists} assist. `
          : ''}
        {matchSummary.shots
          ? `${matchSummary.goals} gol su ${matchSummary.shots} tiri dei Pro: conversione ${percentage(matchSummary.goals, matchSummary.shots)}%.`
          : 'Nessun tiro dei Pro registrato.'}{' '}
        {matchSummary.attempts
          ? `${matchSummary.attempts - matchSummary.passes} passaggi tentati non riusciti: un punto concreto da rivedere insieme.`
          : ''}
      </p>
    </div>
  );
}

function LabAwards({ bestPasser, mvp, topAssister, topRated, topTackler }) {
  return (
    <div className="lab-awards">
      <LabAward
        label={mvp ? 'MVP UFFICIALE EA' : 'MIGLIOR VOTO PRO'}
        player={mvp || topRated}
        detail={`Voto ${(mvp || topRated)?.rating} · ${POSITION_NAMES[(mvp || topRated)?.pos || ''] || 'Ruolo EA'}. La copertina è sua.`}
        icon={<Trophy />}
      />
      <LabAward
        label="IL CAMERIERE"
        player={topAssister}
        detail={`${topAssister?.assists} assist. Ha apparecchiato, gli altri hanno mangiato.`}
        icon={<Sparkles />}
      />
      <LabAward
        label="IL BUTTAFUORI"
        player={topTackler}
        detail={`${topTackler?.tacklesmade} contrasti riusciti su ${topTackler?.tackleattempts}. Il pallone non passa gratis.`}
        icon={<Crosshair />}
      />
      <LabAward
        label="PIEDI EDUCATI"
        player={bestPasser}
        detail={`${bestPasser?.passesmade}/${bestPasser?.passattempts} passaggi (${percentage(toNumber(bestPasser?.passesmade), toNumber(bestPasser?.passattempts))}%). Almeno 10 tentativi per il premio.`}
        icon={<Flame />}
      />
    </div>
  );
}

function PlayersTable({ selectedMatch, sortedPlayers }) {
  return (
    <div className="lab-table-scroll">
      <table className="lab-table">
        <caption>
          {'Prestazioni dei Pro contro '}
          {getOpponentName(selectedMatch)}. PAS indica riusciti/tentati; CTR
          contrasti riusciti/tentati.
        </caption>
        <thead>
          <tr>
            <th>PRO / REPARTO</th>
            <th>VOTO EA</th>
            <th>GOL</th>
            <th>AST</th>
            <th>TIRI</th>
            <th>PAS</th>
            <th>CTR</th>
            <th>PARATE</th>
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((sortedPlayer) => (
            <tr key={sortedPlayer.playername}>
              <th scope="row">
                {sortedPlayer.playername}
                <small>
                  {POSITION_NAMES[sortedPlayer.pos] || sortedPlayer.pos}
                </small>
              </th>
              <td className="lab-rating">{sortedPlayer.rating}</td>
              <td>{sortedPlayer.goals}</td>
              <td>{sortedPlayer.assists}</td>
              <td>{sortedPlayer.shots}</td>
              <td>
                {sortedPlayer.passesmade}/{sortedPlayer.passattempts}
                <small>
                  {formatNumber(
                    percentage(
                      toNumber(sortedPlayer.passesmade),
                      toNumber(sortedPlayer.passattempts),
                    ),
                  )}
                  {toNumber(sortedPlayer.passattempts) ? '%' : ''}
                </small>
              </td>
              <td>
                {sortedPlayer.tacklesmade}/{sortedPlayer.tackleattempts}
              </td>
              <td>{sortedPlayer.saves}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StudioPanel({
  bestPasser,
  copyStatus,
  copySummary,
  dateLabel,
  mvp,
  matchSummary,
  outcome,
  ownClub,
  selectedMatch,
  setCopyStatus,
  setSelectedMatchId,
  setSortKey,
  sortKey,
  sortedMatches,
  sortedPlayers,
  topAssister,
  topRated,
  topTackler,
}) {
  return (
    <div
      className="lab-panel"
      id="panel-studio"
      role="tabpanel"
      aria-labelledby="tab-studio"
    >
      <div className="lab-toolbar">
        <label>
          Seleziona la gara
          <select
            value={selectedMatch.matchId}
            onChange={(event) => {
              setSelectedMatchId(event.target.value);
              setCopyStatus('');
            }}
          >
            {sortedMatches.map((sortedMatch) => (
              <option key={sortedMatch.matchId} value={sortedMatch.matchId}>
                {new Date(
                  toNumber(sortedMatch.timestamp) * 1e3,
                ).toLocaleDateString('it-IT', {
                  day: 'numeric',
                  month: 'short',
                })}
                {' · '}
                {sortedMatch.clubs[CLUB_ID].goals}–
                {sortedMatch.clubs[CLUB_ID].goalsAgainst}
                {' vs '}
                {getOpponentName(sortedMatch)}
              </option>
            ))}
          </select>
        </label>
        <button className="lab-copy" onClick={copySummary}>
          {copyStatus.startsWith('Copiato') ? (
            <Check size={17} />
          ) : (
            <Copy size={17} />
          )}
          {' Copia per la chat'}
        </button>
      </div>
      <p className="lab-copy-status" role="status">
        {copyStatus}
      </p>
      {copyStatus.startsWith('Copia manualmente') && (
        <textarea
          aria-label="Riepilogo da copiare"
          readOnly
          value={`BILLOCCHI CLUB ${ownClub.goals}–${ownClub.goalsAgainst} ${getOpponentName(selectedMatch)} · ${dateLabel}\nMiglior voto: ${topRated?.playername} (${topRated?.rating})\nhttps://billocchi-club.kr3n.chatgpt.site/#spogliatoio`}
        />
      )}
      <Scoreboard
        dateLabel={dateLabel}
        outcome={outcome}
        ownClub={ownClub}
        selectedMatch={selectedMatch}
      />
      <Verdict
        matchSummary={matchSummary}
        ownClub={ownClub}
        topAssister={topAssister}
        topRated={topRated}
      />
      <LabAwards
        bestPasser={bestPasser}
        mvp={mvp}
        topAssister={topAssister}
        topRated={topRated}
        topTackler={topTackler}
      />
      <div className="lab-table-head">
        <h3>La pagella completa.</h3>
        <label>
          Ordina per
          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value)}
          >
            <option value="rating">Voto EA</option>
            <option value="goals">Gol</option>
            <option value="assists">Assist</option>
            <option value="passes">Passaggi %</option>
            <option value="tacklesmade">Contrasti</option>
          </select>
        </label>
      </div>
      <PlayersTable
        selectedMatch={selectedMatch}
        sortedPlayers={sortedPlayers}
      />
      <p className="lab-note">
        I premi sono assegnati automaticamente dai dati della gara; in parità
        decide il voto EA. I passaggi e i tiri riguardano solo i Pro registrati,
        non l’intera squadra. Conversione = gol/tiri, non precisione nello
        specchio. Nessuna cronaca minuto per minuto è disponibile.
      </p>
    </div>
  );
}
