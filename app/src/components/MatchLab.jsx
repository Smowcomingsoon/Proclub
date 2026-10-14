import { Swords } from '../lib/icons.js';
import {
  ChartNoAxesCombined,
  Check,
  Copy,
  Crosshair,
  Flame,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useState } from 'react';
import { CLUB_ID } from '../lib/constants.js';
import { formatNumber } from '../lib/format.js';
import { getClubPlayers, getOpponentName } from '../lib/matches.js';
import { POSITION_NAMES } from '../lib/positions.js';
import {
  averageRating,
  percentage,
  summarizePlayers,
  toNumber,
  topPerformer,
} from '../lib/stats.js';

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

export function MatchLab({ matches }) {
  const sortedMatches = [...matches].sort(
    (a, b) => toNumber(b.timestamp) - toNumber(a.timestamp),
  );
  const [tab, setTab] = useState('studio');
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [sortKey, setSortKey] = useState('rating');
  const [formPlayerChoice, setFormPlayerChoice] = useState('');
  const [formRoleChoice, setFormRoleChoice] = useState('');
  const [duelChoiceA, setDuelChoiceA] = useState('');
  const [duelChoiceB, setDuelChoiceB] = useState('');
  const [duelRole, setDuelRole] = useState('midfielder');
  const [copyStatus, setCopyStatus] = useState('');
  if (!sortedMatches.length)
    return (
      <section className="content match-lab" id="spogliatoio">
        <h2>Lo spogliatoio.</h2>
        <p>Le pagelle si accendono quando EA rende disponibili le partite.</p>
      </section>
    );
  const selectedMatch =
    sortedMatches.find(
      (sortedMatch) => sortedMatch.matchId === selectedMatchId,
    ) || sortedMatches[0];
  const matchPlayers = getClubPlayers(selectedMatch);
  const ownClub = selectedMatch.clubs[CLUB_ID];
  const allAppearances = sortedMatches.flatMap(getClubPlayers);
  const playerNames = [
    ...new Set(allAppearances.map((appearance) => appearance.playername)),
  ].sort((a, b) => a.localeCompare(b));
  const formPlayer = playerNames.includes(formPlayerChoice)
    ? formPlayerChoice
    : playerNames[0];
  const formRoles = [
    ...new Set(
      allAppearances
        .filter((appearance) => appearance.playername === formPlayer)
        .map((appearance) => appearance.pos),
    ),
  ];
  const formRole = formRoles.includes(formRoleChoice)
    ? formRoleChoice
    : formRoles[0];
  const formGames = [...sortedMatches].reverse().map((sortedMatch) => ({
    match: sortedMatch,
    entry: getClubPlayers(sortedMatch).find(
      (player) => player.playername === formPlayer && player.pos === formRole,
    ),
  }));
  const formEntries = formGames.flatMap((game) =>
    game.entry ? [game.entry] : [],
  );
  const formSummary = summarizePlayers(formEntries);
  const latestEntry = formEntries.at(-1);
  const previousEntries = formEntries.slice(0, -1);
  const previousAverage = averageRating(previousEntries);
  const ratingDelta =
    latestEntry && previousAverage !== null
      ? toNumber(latestEntry.rating) - previousAverage
      : null;
  const topRated = [...matchPlayers].sort(
    (a, b) =>
      toNumber(b.rating) - toNumber(a.rating) ||
      toNumber(b.goals) +
        toNumber(b.assists) -
        toNumber(a.goals) -
        toNumber(a.assists),
  )[0];
  const mvp = matchPlayers.find((player) => toNumber(player.mom) > 0);
  const topScorer = topPerformer(matchPlayers, 'goals');
  const topAssister = topPerformer(matchPlayers, 'assists');
  const topTackler = topPerformer(matchPlayers, 'tacklesmade');
  const bestPasser = [...matchPlayers]
    .filter((player) => toNumber(player.passattempts) >= 10)
    .sort(
      (a, b) =>
        toNumber(b.passesmade) / toNumber(b.passattempts) -
          toNumber(a.passesmade) / toNumber(a.passattempts) ||
        toNumber(b.rating) - toNumber(a.rating),
    )[0];
  const nightSummary = summarizePlayers(matchPlayers);
  const outcome =
    toNumber(ownClub.goals) > toNumber(ownClub.goalsAgainst)
      ? 'VITTORIA'
      : toNumber(ownClub.goals) < toNumber(ownClub.goalsAgainst)
        ? 'SCONFITTA'
        : 'PAREGGIO';
  const sortedPlayers = [...matchPlayers].sort((a, b) =>
    sortKey === 'passes'
      ? (toNumber(b.passattempts)
          ? toNumber(b.passesmade) / toNumber(b.passattempts)
          : -1) -
        (toNumber(a.passattempts)
          ? toNumber(a.passesmade) / toNumber(a.passattempts)
          : -1)
      : toNumber(b[sortKey]) - toNumber(a[sortKey]),
  );
  const duelCandidates = playerNames.filter((playerName) =>
    allAppearances.some(
      (appearance) =>
        appearance.playername === playerName && appearance.pos === duelRole,
    ),
  );
  const duelPlayerA = duelCandidates.includes(duelChoiceA)
    ? duelChoiceA
    : duelCandidates[0];
  const duelPlayerB =
    duelCandidates.includes(duelChoiceB) && duelChoiceB !== duelPlayerA
      ? duelChoiceB
      : duelCandidates.find((duelCandidate) => duelCandidate !== duelPlayerA);
  const duelSummaryA = summarizePlayers(
    allAppearances.filter(
      (appearance) =>
        appearance.playername === duelPlayerA && appearance.pos === duelRole,
    ),
  );
  const duelSummaryB = summarizePlayers(
    allAppearances.filter(
      (appearance) =>
        appearance.playername === duelPlayerB && appearance.pos === duelRole,
    ),
  );
  const dateLabel = new Date(
    toNumber(selectedMatch.timestamp) * 1e3,
  ).toLocaleString('it-IT', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  async function copySummary() {
    const text = `BILLOCCHI CLUB ${ownClub.goals}–${ownClub.goalsAgainst} ${getOpponentName(selectedMatch)} · ${dateLabel}\n${outcome}\nMiglior voto Pro: ${topRated?.playername || '—'} (${topRated?.rating || '—'})${mvp ? `\nMVP EA: ${mvp.playername}` : ''}\n${topScorer ? `Bomber: ${topScorer.playername}, ${topScorer.goals} gol\n` : ''}${topAssister ? `Regista: ${topAssister.playername}, ${topAssister.assists} assist\n` : ''}Passaggi dei Pro: ${nightSummary.passes}/${nightSummary.attempts}.\nhttps://billocchi-club.kr3n.chatgpt.site/#spogliatoio`;
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('Copiato: pronto per la chat del club.');
    } catch {
      setCopyStatus('Copia manualmente il riepilogo qui sotto.');
    }
  }
  return (
    <section className="content match-lab" id="spogliatoio">
      <div className="section-head">
        <div>
          <span className="overline">EXTRA TIME / LO SPOGLIATOIO</span>
          <h2>La partita dopo la partita.</h2>
          <p className="sub">
            Chi ha acceso la serata? Chi sta crescendo? Qui i numeri diventano
            argomenti da chat.
          </p>
        </div>
        <span className="lab-live">
          <Sparkles size={17} /> {sortedMatches.length}
          {' GARE DA ESPLORARE'}
        </span>
      </div>
      <div
        className="lab-tabs"
        role="tablist"
        aria-label="Analisi delle performance"
      >
        {[
          ['studio', 'Match studio', Trophy],
          ['forma', 'La mia curva', ChartNoAxesCombined],
          ['duello', 'Testa a testa', Swords],
        ].map(([tabId, tabLabel, icon]) => {
          const Icon = icon;
          return (
            <button
              key={String(tabId)}
              id={`tab-${tabId}`}
              role="tab"
              aria-selected={tab === tabId}
              aria-controls={`panel-${tabId}`}
              tabIndex={tab === tabId ? 0 : -1}
              onKeyDown={(event) => {
                if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                  event.preventDefault();
                  const tabOrder = ['studio', 'forma', 'duello'];
                  const nextTab =
                    tabOrder[
                      (tabOrder.indexOf(tab) +
                        (event.key === 'ArrowRight' ? 1 : 2)) %
                        3
                    ];
                  setTab(nextTab);
                  document.getElementById(`tab-${nextTab}`)?.focus();
                }
              }}
              onClick={() => setTab(String(tabId))}
            >
              <Icon size={19} />
              {String(tabLabel)}
            </button>
          );
        })}
      </div>
      {tab === 'studio' && (
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
              {nightSummary.shots
                ? `${nightSummary.goals} gol su ${nightSummary.shots} tiri dei Pro: conversione ${percentage(nightSummary.goals, nightSummary.shots)}%.`
                : 'Nessun tiro dei Pro registrato.'}{' '}
              {nightSummary.attempts
                ? `${nightSummary.attempts - nightSummary.passes} passaggi tentati non riusciti: un punto concreto da rivedere insieme.`
                : ''}
            </p>
          </div>
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
          <div className="lab-table-scroll">
            <table className="lab-table">
              <caption>
                {'Prestazioni dei Pro contro '}
                {getOpponentName(selectedMatch)}. PAS indica riusciti/tentati;
                CTR contrasti riusciti/tentati.
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
          <p className="lab-note">
            I premi sono assegnati automaticamente dai dati della gara; in
            parità decide il voto EA. I passaggi e i tiri riguardano solo i Pro
            registrati, non l’intera squadra. Conversione = gol/tiri, non
            precisione nello specchio. Nessuna cronaca minuto per minuto è
            disponibile.
          </p>
        </div>
      )}
      {tab === 'forma' && (
        <div
          className="lab-panel"
          id="panel-forma"
          role="tabpanel"
          aria-labelledby="tab-forma"
        >
          <div className="lab-toolbar">
            <label>
              Il tuo Pro
              <select
                value={formPlayer || ''}
                onChange={(event) => {
                  setFormPlayerChoice(event.target.value);
                  setFormRoleChoice('');
                }}
              >
                {playerNames.map((playerName) => (
                  <option key={playerName}>{playerName}</option>
                ))}
              </select>
            </label>
            <label>
              Reparto osservato
              <select
                value={formRole || ''}
                onChange={(event) => setFormRoleChoice(event.target.value)}
              >
                {formRoles.map((role) => (
                  <option key={role} value={role}>
                    {POSITION_NAMES[role] || role}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="lab-curve-head">
            <div>
              <span className="overline">
                {POSITION_NAMES[formRole] || 'REPARTO'}
                {' / '}
                {formSummary.games}
                {' PRESENZE'}
              </span>
              <h3>{formPlayer || 'Nessun Pro disponibile'}</h3>
              <p>
                {ratingDelta === null
                  ? 'Servono due presenze nello stesso reparto per confrontare l’ultimo voto.'
                  : `${ratingDelta >= 0 ? '+' : ''}${ratingDelta.toFixed(1)} nell’ultima gara rispetto alla media delle ${previousEntries.length} precedenti in questo reparto.`}
              </p>
            </div>
            <strong>
              {formatNumber(formSummary.rating, 1)}
              <small>VOTO MEDIO EA</small>
            </strong>
          </div>
          <div
            className="lab-curve"
            aria-label={`Voti di ${formPlayer} nel reparto ${POSITION_NAMES[formRole]}, dal più vecchio al più recente`}
          >
            {formGames.map(({ match, entry }, index) => (
              <div
                key={match.matchId}
                className={`lab-curve-game ${entry ? '' : 'absent'}`}
              >
                <span>{entry ? entry.rating : '—'}</span>
                <div className="lab-curve-track">
                  {entry && (
                    <i
                      style={{
                        height: `${Math.max(0, Math.min(100, toNumber(entry.rating) * 10))}%`,
                      }}
                    />
                  )}
                </div>
                <b>
                  {'GARA '}
                  {index + 1}
                </b>
                <small>{getOpponentName(match)}</small>
                <em>
                  {entry
                    ? `${entry.goals}G · ${entry.assists}A`
                    : getClubPlayers(match).some(
                          (player) => player.playername === formPlayer,
                        )
                      ? 'Altro reparto'
                      : 'Non presente'}
                </em>
              </div>
            ))}
          </div>
          <div className="lab-stat-grid">
            <div>
              <strong>{formSummary.goals}</strong>
              <span>GOL</span>
            </div>
            <div>
              <strong>{formSummary.assists}</strong>
              <span>ASSIST</span>
            </div>
            <div>
              <strong>
                {formatNumber(formSummary.pass)}
                {formSummary.pass === null ? '' : '%'}
              </strong>
              <span>
                {'PASSAGGI · '}
                {formSummary.passes}/{formSummary.attempts}
              </span>
            </div>
            <div>
              <strong>{formSummary.tackles}</strong>
              <span>CONTRASTI RIUSCITI</span>
            </div>
          </div>
          <div className="lab-story">
            <span>IL PROSSIMO OBIETTIVO</span>
            <h3>
              {formSummary.games
                ? formSummary.attempts >= 10 && toNumber(formSummary.pass) < 75
                  ? 'Far arrivare un pallone in più.'
                  : formSummary.shots >= 5 && formSummary.goals === 0
                    ? 'Trasformare il volume in gol.'
                    : ratingDelta !== null && ratingDelta < 0
                      ? 'Riprendere il proprio ritmo.'
                      : 'Alzare il proprio riferimento.'
                : 'Aspettiamo il campo.'}
            </h3>
            <p>
              {formSummary.games
                ? formSummary.attempts >= 10 && toNumber(formSummary.pass) < 75
                  ? `${formSummary.attempts - formSummary.passes} passaggi non riusciti su ${formSummary.attempts}. Prova a scegliere una soluzione semplice in più: il dato da seguire è la percentuale nel medesimo reparto.`
                  : formSummary.shots >= 5 && formSummary.goals === 0
                    ? `${formSummary.shots} tiri senza gol nelle gare osservate. Il prossimo traguardo è il primo gol; dai dati non possiamo dedurre la qualità delle occasioni.`
                    : `Il riferimento attuale è ${formatNumber(formSummary.rating, 1)} di media EA in ${formSummary.games} presenze. Prova a superarlo nella prossima gara nello stesso reparto, senza confonderlo con l’overall dell’avatar.`
                : 'Nessuna presenza consultabile.'}
            </p>
          </div>
          <p className="lab-note">
            {'Solo le ultime '}
            {sortedMatches.length}
            {
              ' gare di campionato disponibili da EA. I reparti non vengono mescolati; EA distingue ATT, CEN, DIF e POR, non le singole posizioni come COC e CDC. Una gara in un altro reparto o un’assenza resta vuota, non vale zero. Il campione è breve: descrive queste gare, non tutta la stagione.'
            }
          </p>
        </div>
      )}
      {tab === 'duello' && (
        <div
          className="lab-panel"
          id="panel-duello"
          role="tabpanel"
          aria-labelledby="tab-duello"
        >
          <div className="lab-toolbar">
            <label>
              Stesso reparto
              <select
                value={duelRole}
                onChange={(event) => setDuelRole(event.target.value)}
              >
                {Object.entries(POSITION_NAMES).map(([role, roleName]) => (
                  <option key={role} value={role}>
                    {roleName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Pro A
              <select
                value={duelPlayerA || ''}
                onChange={(event) => setDuelChoiceA(event.target.value)}
              >
                {duelCandidates.map((duelCandidate) => (
                  <option key={duelCandidate}>{duelCandidate}</option>
                ))}
              </select>
            </label>
            <label>
              Pro B
              <select
                value={duelPlayerB || ''}
                onChange={(event) => setDuelChoiceB(event.target.value)}
              >
                {duelCandidates
                  .filter((duelCandidate) => duelCandidate !== duelPlayerA)
                  .map((duelCandidate) => (
                    <option key={duelCandidate}>{duelCandidate}</option>
                  ))}
              </select>
            </label>
          </div>
          {duelCandidates.length < 2 ? (
            <div className="lab-empty">
              <Swords size={32} />
              <h3>Il duello aspetta un avversario.</h3>
              <p>
                Servono almeno due Pro con una presenza in questo reparto nelle
                gare disponibili. Prova un altro reparto.
              </p>
            </div>
          ) : (
            <>
              <div className="lab-duel-names">
                <div>
                  <strong>{duelPlayerA}</strong>
                  <small>
                    {duelSummaryA.games}
                    {' presenze · '}
                    {POSITION_NAMES[duelRole]}
                  </small>
                </div>
                <span>VS</span>
                <div>
                  <strong>{duelPlayerB}</strong>
                  <small>
                    {duelSummaryB.games}
                    {' presenze · '}
                    {POSITION_NAMES[duelRole]}
                  </small>
                </div>
              </div>
              <div className="lab-duel-metrics">
                {[
                  [
                    'Voto medio EA',
                    duelSummaryA.rating,
                    duelSummaryB.rating,
                    1,
                  ],
                  [
                    'Gol / presenza',
                    duelSummaryA.goals / duelSummaryA.games,
                    duelSummaryB.goals / duelSummaryB.games,
                    2,
                  ],
                  [
                    'Assist / presenza',
                    duelSummaryA.assists / duelSummaryA.games,
                    duelSummaryB.assists / duelSummaryB.games,
                    2,
                  ],
                  [
                    'Passaggi riusciti %',
                    duelSummaryA.pass,
                    duelSummaryB.pass,
                    0,
                  ],
                  [
                    'Contrasti / presenza',
                    duelSummaryA.tackles / duelSummaryA.games,
                    duelSummaryB.tackles / duelSummaryB.games,
                    2,
                  ],
                  ...(duelRole === 'goalkeeper'
                    ? [
                        [
                          'Parate / presenza',
                          duelSummaryA.saves / duelSummaryA.games,
                          duelSummaryB.saves / duelSummaryB.games,
                          2,
                        ],
                      ]
                    : []),
                ].map(([label, leftValue, rightValue, digits]) => {
                  const left = leftValue;
                  const right = rightValue;
                  const total = Math.max(
                    0.01,
                    toNumber(left) + toNumber(right),
                  );
                  return (
                    <div key={String(label)} className="lab-duel-row">
                      <b
                        className={
                          left !== null && right !== null && left > right
                            ? 'ahead'
                            : ''
                        }
                      >
                        {formatNumber(left, Number(digits))}
                      </b>
                      <div>
                        <span>{String(label)}</span>
                        <div className="lab-duel-bar">
                          <i
                            style={{
                              width: `${left === null || right === null ? 50 : (toNumber(left) / total) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <b
                        className={
                          left !== null && right !== null && right > left
                            ? 'ahead'
                            : ''
                        }
                      >
                        {formatNumber(right, Number(digits))}
                      </b>
                    </div>
                  );
                })}
              </div>
              <div className="lab-story">
                <span>IL VERDETTO? DIPENDE DAL COMPITO.</span>
                <h3>Nessun vincitore per decreto.</h3>
                <p>
                  Il voto racconta il giudizio EA; gol e assist raccontano
                  produzione; passaggi e contrasti raccontano altre parti del
                  lavoro. I valori per presenza rendono leggibili campioni
                  diversi. Il confronto non corregge avversari, minuti o
                  difficoltà delle gare.
                </p>
              </div>
            </>
          )}
          <p className="lab-note">
            {'Confronto sulle ultime '}
            {sortedMatches.length}
            {
              ' gare disponibili, solo nel reparto scelto. Le presenze possono appartenere a partite diverse. Percentuale passaggi calcolata sui tentativi totali; — significa nessun tentativo. Colore = valore più alto, non miglior giocatore in assoluto.'
            }
          </p>
        </div>
      )}
    </section>
  );
}
