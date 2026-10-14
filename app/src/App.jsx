import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import fallbackJson from './lib/fallback-data.json';
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  Copy,
  Crosshair,
  Flame,
  Newspaper,
  Quote,
  RefreshCw,
  ScanLine,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { Swords } from './lib/icons.js';
import './styles.css';
const fallbackData = fallbackJson;
const toNumber = (value) => Number(value || 0);
const POSITION_NAMES = {
  forward: 'Attacco',
  midfielder: 'Centrocampo',
  defender: 'Difesa',
  goalkeeper: 'Porta',
};
const getClubPlayers = (match) =>
  Object.values(match.players?.['70375'] || {}).filter((player) => !!player);
const getOpponentName = (match) =>
  Object.entries(match.clubs).find(([clubId]) => clubId !== '70375')?.[1]
    ?.details?.name || 'Avversario';
const averageRating = (players) =>
  players.length
    ? players.reduce((total, player) => total + toNumber(player.rating), 0) /
      players.length
    : null;
const sumBy = (items, key) =>
  items.reduce((total, item) => total + toNumber(item[key]), 0);
const percentage = (part, whole) =>
  whole ? Math.round((part / whole) * 100) : null;
const formatNumber = (value, digits = 0) =>
  value === null ? '—' : value.toFixed(digits);
function summarizePlayers(players) {
  return {
    games: players.length,
    rating: averageRating(players),
    goals: sumBy(players, 'goals'),
    assists: sumBy(players, 'assists'),
    shots: sumBy(players, 'shots'),
    passes: sumBy(players, 'passesmade'),
    attempts: sumBy(players, 'passattempts'),
    tackles: sumBy(players, 'tacklesmade'),
    saves: sumBy(players, 'saves'),
    pass: percentage(
      sumBy(players, 'passesmade'),
      sumBy(players, 'passattempts'),
    ),
  };
}
function topPerformer(players, key, minimum = 1) {
  return [...players]
    .filter((player) => toNumber(player[key]) >= minimum)
    .sort(
      (event, b) =>
        toNumber(b[key]) - toNumber(event[key]) ||
        toNumber(b.rating) - toNumber(event.rating),
    )[0];
}
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
function MatchLab({ matches }) {
  let sortedMatches = [...matches].sort(
      (a, b) => toNumber(b.timestamp) - toNumber(a.timestamp),
    ),
    [tab, setTab] = useState('studio'),
    [selectedMatchId, setSelectedMatchId] = useState(''),
    [sortKey, setSortKey] = useState('rating'),
    [formPlayerChoice, setFormPlayerChoice] = useState(''),
    [formRoleChoice, setFormRoleChoice] = useState(''),
    [duelChoiceA, setDuelChoiceA] = useState(''),
    [duelChoiceB, setDuelChoiceB] = useState(''),
    [duelRole, setDuelRole] = useState('midfielder'),
    [copyStatus, setCopyStatus] = useState('');
  if (!sortedMatches.length)
    return (
      <section className="content match-lab" id="spogliatoio">
        <h2>Lo spogliatoio.</h2>
        <p>Le pagelle si accendono quando EA rende disponibili le partite.</p>
      </section>
    );
  let selectedMatch =
      sortedMatches.find(
        (sortedMatch) => sortedMatch.matchId === selectedMatchId,
      ) || sortedMatches[0],
    matchPlayers = getClubPlayers(selectedMatch),
    ownClub = selectedMatch.clubs[70375],
    allAppearances = sortedMatches.flatMap(getClubPlayers),
    playerNames = [
      ...new Set(allAppearances.map((appearance) => appearance.playername)),
    ].sort((a, b) => a.localeCompare(b)),
    formPlayer = playerNames.includes(formPlayerChoice)
      ? formPlayerChoice
      : playerNames[0],
    formRoles = [
      ...new Set(
        allAppearances
          .filter((appearance) => appearance.playername === formPlayer)
          .map((appearance) => appearance.pos),
      ),
    ],
    formRole = formRoles.includes(formRoleChoice)
      ? formRoleChoice
      : formRoles[0],
    formGames = [...sortedMatches].reverse().map((sortedMatch) => ({
      match: sortedMatch,
      entry: getClubPlayers(sortedMatch).find(
        (player) => player.playername === formPlayer && player.pos === formRole,
      ),
    })),
    formEntries = formGames.flatMap((game) => (game.entry ? [game.entry] : [])),
    formSummary = summarizePlayers(formEntries),
    latestEntry = formEntries.at(-1),
    previousEntries = formEntries.slice(0, -1),
    previousAverage = averageRating(previousEntries),
    ratingDelta =
      latestEntry && previousAverage !== null
        ? toNumber(latestEntry.rating) - previousAverage
        : null,
    topRated = [...matchPlayers].sort(
      (a, b) =>
        toNumber(b.rating) - toNumber(a.rating) ||
        toNumber(b.goals) +
          toNumber(b.assists) -
          toNumber(a.goals) -
          toNumber(a.assists),
    )[0],
    mvp = matchPlayers.find((player) => toNumber(player.mom) > 0),
    topScorer = topPerformer(matchPlayers, 'goals'),
    topAssister = topPerformer(matchPlayers, 'assists'),
    topTackler = topPerformer(matchPlayers, 'tacklesmade'),
    bestPasser = [...matchPlayers]
      .filter((player) => toNumber(player.passattempts) >= 10)
      .sort(
        (a, b) =>
          toNumber(b.passesmade) / toNumber(b.passattempts) -
            toNumber(a.passesmade) / toNumber(a.passattempts) ||
          toNumber(b.rating) - toNumber(a.rating),
      )[0],
    nightSummary = summarizePlayers(matchPlayers),
    outcome =
      toNumber(ownClub.goals) > toNumber(ownClub.goalsAgainst)
        ? 'VITTORIA'
        : toNumber(ownClub.goals) < toNumber(ownClub.goalsAgainst)
          ? 'SCONFITTA'
          : 'PAREGGIO',
    sortedPlayers = [...matchPlayers].sort((a, b) =>
      sortKey === 'passes'
        ? (toNumber(b.passattempts)
            ? toNumber(b.passesmade) / toNumber(b.passattempts)
            : -1) -
          (toNumber(a.passattempts)
            ? toNumber(a.passesmade) / toNumber(a.passattempts)
            : -1)
        : toNumber(b[sortKey]) - toNumber(a[sortKey]),
    ),
    duelCandidates = playerNames.filter((playerName) =>
      allAppearances.some(
        (appearance) =>
          appearance.playername === playerName && appearance.pos === duelRole,
      ),
    ),
    duelPlayerA = duelCandidates.includes(duelChoiceA)
      ? duelChoiceA
      : duelCandidates[0],
    duelPlayerB =
      duelCandidates.includes(duelChoiceB) && duelChoiceB !== duelPlayerA
        ? duelChoiceB
        : duelCandidates.find((duelCandidate) => duelCandidate !== duelPlayerA),
    duelSummaryA = summarizePlayers(
      allAppearances.filter(
        (appearance) =>
          appearance.playername === duelPlayerA && appearance.pos === duelRole,
      ),
    ),
    duelSummaryB = summarizePlayers(
      allAppearances.filter(
        (appearance) =>
          appearance.playername === duelPlayerB && appearance.pos === duelRole,
      ),
    ),
    dateLabel = new Date(
      toNumber(selectedMatch.timestamp) * 1e3,
    ).toLocaleString('it-IT', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  async function copySummary() {
    let text = `BILLOCCHI CLUB ${ownClub.goals}–${ownClub.goalsAgainst} ${getOpponentName(selectedMatch)} · ${dateLabel}\n${outcome}\nMiglior voto Pro: ${topRated?.playername || '—'} (${topRated?.rating || '—'})${mvp ? `\nMVP EA: ${mvp.playername}` : ''}\n${topScorer ? `Bomber: ${topScorer.playername}, ${topScorer.goals} gol\n` : ''}${topAssister ? `Regista: ${topAssister.playername}, ${topAssister.assists} assist\n` : ''}Passaggi dei Pro: ${nightSummary.passes}/${nightSummary.attempts}.\nhttps://billocchi-club.kr3n.chatgpt.site/#spogliatoio`;
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
          let Icon = icon;
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
                  let tabOrder = ['studio', 'forma', 'duello'],
                    nextTab =
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
                    {sortedMatch.clubs[70375].goals}–
                    {sortedMatch.clubs[70375].goalsAgainst}
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
                  let left = leftValue,
                    right = rightValue,
                    total = Math.max(0.01, toNumber(left) + toNumber(right));
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
function AdaniMini() {
  let canvasRef = useRef(null),
    [status, setStatus] = useState('loading'),
    [paused, setPaused] = useState(false),
    pausedRef = useRef(false);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  useEffect(() => {
    let canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false,
      started = false,
      visible = false,
      disposeScene,
      observer = new IntersectionObserver(async ([entry]) => {
        if (((visible = entry.isIntersecting), !(!visible || started))) {
          started = true;
          try {
            let { createAdaniScene } = await import('./vendor/adani-scene.js');
            if (disposed) return;
            if (
              ((disposeScene = await createAdaniScene(
                canvas,
                () => visible && !pausedRef.current && !document.hidden,
                () => disposed,
              )),
              disposed)
            ) {
              disposeScene();
              return;
            }
            setStatus('ready');
          } catch {
            disposed || setStatus('unavailable');
          }
        }
      });
    observer.observe(canvas);
    return () => {
      disposed = true;
      observer.disconnect();
      disposeScene?.();
    };
  }, []);
  return (
    <div className="adani-mini">
      <div
        ref={canvasRef}
        className="adani-canvas"
        role="img"
        aria-label="Il modello 3D allegato, animato mentre scrive una pagella sul taccuino"
      />
      {status === 'loading' && (
        <span className="adani-loading">Apre il taccuino…</span>
      )}
      {status === 'unavailable' && (
        <span className="adani-loading">La pagella resta qui sotto.</span>
      )}
      {status === 'ready' && (
        <button
          className="adani-motion"
          onClick={() => setPaused(!paused)}
          aria-pressed={paused}
          aria-label={
            paused ? 'Riprendi la scrittura 3D' : 'Ferma la scrittura 3D'
          }
        >
          {paused ? 'Riprendi' : 'In redazione · pausa'}
        </button>
      )}
    </div>
  );
}
const RAI_NEWS_URL =
  'https://www.rainews.it/articoli/2022/12/il-dio-del-calcio-si-chiama-messi-non-solo-per-gli-argentini-4adbf32b-7698-49a9-97f8-d51671071449.html';
const FANPAGE_URL =
  'https://www.fanpage.it/sport/calcio/adani-posseduto-in-telecronaca-messi-e-dentro-di-lui-e-gli-appare-maradona-cosa-abbiamo-visto/';
const UNSHOW_URL = 'https://www.unshow.it/lele-adani-tormentoni';
const REPUBBLICA_URL =
  'https://www.repubblica.it/sport/calcio/2022/11/26/news/adani_esultanza_messi_argentina-376333822/';
const ADANI_QUOTES = [
  {
    id: 'facciamo',
    text: 'Facciamo calcio',
    url: 'https://www.goal.com/it/liste/adani-canzone-testo-significato-citazioni/blt60072252ea0bbab2',
    source: 'GOAL',
    context: 'Il tormentone diventato anche un brano nel 2024.',
    categories: ['quality', 'welcome'],
  },
  {
    id: 'garra',
    text: 'La garra charrúa!',
    url: 'https://www.ilgiorno.it/cultura/adani-lascia-sky-a5d4ccda',
    source: 'Il Giorno',
    context: 'Inter–Tottenham, 18 settembre 2018: il gol di Vecino.',
    categories: ['duel', 'quality'],
  },
  {
    id: 'questo',
    text: 'Questo è il calcio!',
    url: 'https://www.ilgiorno.it/cultura/adani-lascia-sky-a5d4ccda',
    source: 'Il Giorno',
    context:
      'Uno dei suoi tormentoni in telecronaca, ricordato l’8 luglio 2021.',
    categories: ['goal', 'quality'],
  },
  {
    id: 'cammelli',
    text: 'Dribbla tutti, anche i cammelli del deserto',
    url: RAI_NEWS_URL,
    source: 'Rai News',
    context:
      'Messi in Argentina–Croazia, 13 dicembre 2022. Qui è una citazione, non una descrizione dei dribbling EA.',
    categories: ['goal', 'quality'],
  },
  {
    id: 'impensato',
    text: 'La dinamica dell’impensato è il football',
    url: RAI_NEWS_URL,
    source: 'Rai News',
    context:
      'Argentina–Croazia, 13 dicembre 2022: l’azione di Messi per il terzo gol.',
    categories: ['assist', 'quality'],
  },
  {
    id: 'alzatevi',
    text: 'Alzatevi in piedi',
    url: RAI_NEWS_URL,
    source: 'Rai News',
    context:
      'Argentina–Croazia, 13 dicembre 2022: l’esaltazione della giocata di Messi.',
    categories: ['goal', 'quality'],
  },
  {
    id: 'palla',
    text: 'Ma che palla ha dato Messi?',
    url: FANPAGE_URL,
    source: 'Fanpage',
    context: 'Argentina–Paesi Bassi, 9 dicembre 2022: l’assist per Molina.',
    categories: ['assist'],
  },
  {
    id: 'piugol',
    text: 'Questo vale più di un gol',
    url: FANPAGE_URL,
    source: 'Fanpage',
    context:
      'Argentina–Paesi Bassi, 9 dicembre 2022: il commento all’assist di Messi.',
    categories: ['assist', 'duel'],
  },
  {
    id: 'viva',
    text: 'Viva el Fútbol',
    url: FANPAGE_URL,
    source: 'Fanpage',
    context:
      'Argentina–Paesi Bassi, 9 dicembre 2022: l’invito a celebrare il calcio.',
    categories: ['assist', 'quality', 'welcome'],
  },
  {
    id: 'allena',
    text: 'Allena di più e parla di meno',
    url: 'https://www.tuttosport.com/news/calcio/2020/02/01-66274654/adani_ancora_contro_allegri_e_bravo_quando_allena_ma_non_quando_parla_',
    source: 'Tuttosport',
    context: 'La frecciata ad Allegri, riportata il 1º febbraio 2020.',
    categories: ['roast', 'welcome'],
  },
  {
    id: 'zitto',
    text: 'Stai zitto lo dici a tuo fratello',
    url: 'https://www.gazzetta.it/Calcio/Serie-A/Juventus/storie/17-02-2023/sfuriate-allegri-bordo-campo-tv-adani-giacca-buttata-460272755247/duello-filosofico-lele-adani.shtml',
    source: 'Gazzetta',
    context:
      'Il confronto televisivo con Allegri: una battuta d’archivio, non un giudizio sul Pro.',
    categories: ['roast', 'duel'],
  },
  {
    id: 'pranzo',
    text: 'In area di rigore c’è il pranzo al sacco!',
    url: UNSHOW_URL,
    source: 'UnShow',
    context:
      'Israele–Italia, settembre 2025: il finale pieno di gol e disattenzioni difensive.',
    categories: ['roast'],
  },
  {
    id: 'analizza',
    text: 'Nessuno analizza il calcio più di me',
    url: UNSHOW_URL,
    source: 'UnShow',
    context:
      'La rivendicazione sulla Bobo TV, ricordata nella raccolta dei tormentoni.',
    categories: ['quality', 'welcome'],
  },
  {
    id: 'effe',
    text: 'Il calcio con la Effe',
    url: UNSHOW_URL,
    source: 'UnShow',
    context: 'Uno dei tormentoni della Bobo TV.',
    categories: ['quality', 'welcome'],
  },
  {
    id: 'complesso',
    text: 'Il calcio non è semplice',
    url: 'https://www.pianetamilan.it/news-milan/interviste/milan-feyenoord-adani-il-calcio-non-e-semplice-se-lo-fosse-stato-i-rossoneri-19-02-2025/',
    source: 'Pianeta Milan',
    context: 'Il commento su Milan–Feyenoord, 19 febbraio 2025.',
    categories: ['roast', 'welcome', 'duel'],
  },
  {
    id: 'spirito',
    text: 'Non c’è posto per i deboli di spirito',
    url: 'https://it.wikiquote.org/wiki/Daniele_Adani',
    source: 'Wikiquote',
    context: 'Brasile–Corea del Sud, 5 dicembre 2022.',
    categories: ['duel', 'welcome'],
  },
  {
    id: 'sinistro',
    text: 'Il sinistro migliore del Mondo!',
    url: REPUBBLICA_URL,
    source: 'Repubblica',
    context:
      'Messi in Argentina–Messico, 26 novembre 2022. Il piede dei Pro non è deducibile dai dati.',
    categories: ['goal'],
  },
  {
    id: 'rispetto',
    text: 'Rispetto per il numero uno',
    url: REPUBBLICA_URL,
    source: 'Repubblica',
    context: 'Argentina–Messico, 26 novembre 2022: l’omaggio a Messi.',
    categories: ['quality', 'goal'],
  },
];
const hashString = (text) =>
  [...text].reduce((total, char) => (total * 31 + char.charCodeAt(0)) >>> 0, 7);
function classifyProfile(profile) {
  return profile.games
    ? (profile.rating !== null && profile.rating < 6.5) ||
      (profile.passPct !== null &&
        profile.passPct !== undefined &&
        profile.passPct < 70)
      ? 'roast'
      : profile.assists > profile.goals && profile.assists
        ? 'assist'
        : profile.goals >= profile.games * 0.7
          ? 'goal'
          : (profile.tackles || 0) > profile.goals + profile.assists ||
              (profile.saves || 0) > 0
            ? 'duel'
            : 'quality'
    : 'welcome';
}
function assignQuotes(players, salt) {
  let usedIds = new Set();
  return new Map(
    players.map((player) => {
      let category = classifyProfile(player),
        ranked = [...ADANI_QUOTES].sort(
          (a, b) =>
            Number(b.categories.includes(category)) -
              Number(a.categories.includes(category)) ||
            hashString(player.name + salt + a.id) -
              hashString(player.name + salt + b.id),
        ),
        quote =
          ranked.find((candidate) => !usedIds.has(candidate.id)) || ranked[0];
      usedIds.add(quote.id);
      return [player.name, quote];
    }),
  );
}
function toQuotePlayer(member) {
  let count = (value) => Number(value) || 0;
  return {
    name: member.name,
    games: count(member.gamesPlayed),
    goals: count(member.goals),
    assists: count(member.assists),
    rating: count(member.gamesPlayed) ? count(member.ratingAve) : null,
    passPct: count(member.passSuccessRate),
    tackles: count(member.tacklesMade),
  };
}
function AdaniComment({ player, quote }) {
  let summary = player.games
    ? `${player.name}: ${player.goals} gol e ${player.assists} assist in ${player.games} presenze${player.rating === null ? '' : `, media EA ${player.rating.toFixed(2)}`}. ` +
      (classifyProfile(player) === 'assist'
        ? 'La redazione gli dedica l’Adani degli assist: le cifre raccontano il servizio ai compagni.'
        : classifyProfile(player) === 'goal'
          ? 'La produzione offensiva dà il tono a questa citazione. La porta avversaria avrà un’opinione diversa.'
          : classifyProfile(player) === 'duel'
            ? 'Lavoro e duelli entrano nel fascicolo: non tutto il contributo finisce nella colonna dei gol.'
            : classifyProfile(player) === 'roast'
              ? 'Le cifre chiedono una risposta: la battuta punge, il prossimo tabellino può ribattere.'
              : 'Il rendimento ha materiale per il taccuino. Il prossimo capitolo si scrive in campo.')
    : 'Aspetta le prime presenze: il taccuino è aperto, la pagella deve ancora nascere.';
  return (
    <aside
      className="adani-comment"
      aria-label={`Archivio Adani per ${player.name}`}
    >
      <AdaniMini />
      <div>
        <span className="adani-kicker">LA VOCE DI ADANI · ARCHIVIO</span>
        <blockquote>«{quote.text}»</blockquote>
        <p>{summary}</p>
        <details>
          <summary>Citazione e fonte</summary>
          <p>
            {quote.context}{' '}
            <a href={quote.url} target="_blank" rel="noreferrer">
              {quote.source}
            </a>
          </p>
          <small>
            Citazione di Lele Adani. L’abbinamento e il commento sul giocatore
            sono della redazione BILLOCCHI.
          </small>
        </details>
      </div>
    </aside>
  );
}
const perGame = (value, games) =>
  (toNumber(value) / Math.max(1, games)).toFixed(2);
function buildSeasonProfile(member, members, recent) {
  let games = toNumber(member.gamesPlayed),
    goals = toNumber(member.goals),
    assists = toNumber(member.assists),
    contributions = goals + assists,
    rating = toNumber(member.ratingAve),
    passes = toNumber(member.passesMade),
    tackles = toNumber(member.tacklesMade),
    mvps = toNumber(member.manOfTheMatch),
    reds = toNumber(member.redCards),
    stage =
      games >= 30
        ? 'Ritratto esteso'
        : games >= 15
          ? 'Profilo in profondità'
          : games >= 5
            ? 'La stagione prende forma'
            : 'Prime impressioni';
  if (!games)
    return {
      stage: 'Profilo in attesa',
      title: 'La sua stagione deve ancora raccontarsi.',
      intro:
        'EA non registra presenze stagionali per questo Pro. Non attribuiamo punti forti o difetti senza prestazioni.',
      sections: [],
      note: 'La descrizione si aggiorna insieme ai dati EA dopo le prime presenze.',
    };
  let title =
      contributions === 0
        ? 'Il lavoro oltre il tabellino.'
        : goals > assists * 2
          ? 'La stagione passa dai suoi gol.'
          : assists > goals
            ? 'Più assist che gol, finora.'
            : 'Gol e assist nello stesso repertorio.',
    intro = `${member.name} ha disputato ${games} gare: ${goals} gol e ${assists} assist, ${perGame(contributions, games)} contributi offensivi per presenza. Il voto medio EA è ${member.ratingAve}. ${games < 5 ? 'Sono i primi indizi: poche gare possono cambiare molto questa fotografia.' : games < 15 ? 'Il profilo comincia a delinearsi, ma il campione resta breve.' : games < 30 ? 'Il volume di presenze permette una lettura più articolata dei totali.' : 'Una stagione ormai ricca di presenze, da leggere anche oltre gol e assist.'}`,
    sections = [
      {
        label: 'IL TABELLINO',
        text: `${perGame(goals, games)} gol e ${perGame(assists, games)} assist a partita. ${contributions ? `${Math.round((goals / contributions) * 100)}% dei suoi gol + assist sono reti segnate direttamente.` : 'Non ci sono ancora gol o assist registrati: questo, da solo, non giudica il lavoro difensivo.'} ${goals >= assists && goals > 0 ? 'La voce più pesante della sua produzione è la finalizzazione.' : assists > 0 ? 'Gli assist pesano più dei gol nella sua produzione offensiva.' : 'Il primo contributo offensivo resta un traguardo da seguire.'}`,
      },
    ];
  if (
    (games >= 5 &&
      sections.push({
        label: 'IL PALLONE TRA I PIEDI',
        text: `${passes} passaggi riusciti (${perGame(passes, games)} per presenza), con ${member.passSuccessRate}% di successo secondo EA. ${passes ? (toNumber(member.passSuccessRate) >= 85 ? 'È la parte più ordinata della sua fotografia: conserva un’alta percentuale di passaggi riusciti.' : toNumber(member.passSuccessRate) < 75 ? 'La precisione dei passaggi è una voce concreta da migliorare: il dato resta sotto il 75%.' : 'La percentuale offre un riferimento da provare a superare nelle prossime gare.') : 'Non ci sono passaggi riusciti da interpretare.'} ${games >= 15 ? `${tackles} contrasti riusciti (${perGame(tackles, games)} per gara). Il loro volume dipende anche dai ruoli giocati; non equivale da solo a qualità difensiva.` : ''}`,
      }),
    games >= 15)
  ) {
    let peerRatings = members
        .filter(
          (peer) =>
            peer.name !== member.name && toNumber(peer.gamesPlayed) >= 10,
        )
        .map((peer) => toNumber(peer.ratingAve))
        .sort((a, b) => a - b),
      middle = Math.floor(peerRatings.length / 2),
      median = peerRatings.length
        ? peerRatings.length % 2
          ? peerRatings[middle]
          : (peerRatings[middle - 1] + peerRatings[middle]) / 2
        : null;
    sections.push({
      label: 'RENDIMENTO E RICONOSCIMENTI',
      text: `Media EA ${member.ratingAve}; ${mvps} premi uomo partita in ${games} presenze. ${median !== null && peerRatings.length >= 3 ? `Il voto medio è ${rating - median >= 0 ? '+' : ''}${(rating - median).toFixed(1)} rispetto alla mediana degli altri ${peerRatings.length} Pro del club con almeno 10 gare. È un confronto fra tutti i ruoli, non una classifica per posizione.` : 'Il numero di premi e la media descrivono il rendimento complessivo; non provano che ogni gara sia stata costante.'} ${reds ? `${reds} espulsioni registrate: anche la disciplina entra nel bilancio.` : 'Nessuna espulsione registrata.'}`,
    });
  }
  games >= 30 &&
    sections.push({
      label: 'LA PROSSIMA PAGINA',
      text:
        passes && toNumber(member.passSuccessRate) < 75
          ? `Il bersaglio più leggibile è migliorare il ${member.passSuccessRate}% nei passaggi mantenendo il proprio volume di gioco. Gol e assist sono già ${contributions}: il prossimo aggiornamento mostrerà come cambiano i totali e le medie.`
          : contributions
            ? `Il riferimento offensivo è ${perGame(contributions, games)} gol + assist a presenza. Mantenerlo mentre crescono le gare è un obiettivo misurabile. ${mvps ? `I ${mvps} premi EA sono un secondo traguardo da incrementare.` : 'Il primo premio uomo partita EA resta da conquistare.'}`
            : `Il prossimo contributo offensivo darà una nuova pagina al profilo. Per ora i ${tackles} contrasti e i ${passes} passaggi riusciti sono il lavoro registrato oltre al tabellino.`,
    });
  recent.games &&
    sections.push({
      label: `ZOOM RECENTE / ${recent.label}`,
      text: `Nelle ${recent.games} presenze recenti in questo reparto: media EA ${recent.rating.toFixed(1)}, ${recent.goals} gol e ${recent.assists} assist${recent.passAttempts ? `, ${recent.passPct}% nei passaggi` : ''}. Questa finestra è separata dai totali stagionali e può includere al massimo le cinque gare esposte da EA.`,
    });
  return {
    stage,
    title,
    intro,
    sections,
    note: 'Tutti i totali stagionali includono i ruoli giocati. Il profilo si ricalcola ad ogni lettura EA riuscita; la profondità aumenta a 5, 15 e 30 presenze. Non disponiamo dello storico completo delle singole gare: continuità, progressi mese per mese e statistiche stagionali per posizione non sono deducibili.',
  };
}
function SeasonProfile({ member, players, recent }) {
  let profile = buildSeasonProfile(member, players, recent),
    quote = assignQuotes(players.map(toQuotePlayer), 'stagione').get(
      member.name,
    );
  return (
    <section
      className="season-profile"
      aria-label={`Ritratto stagionale di ${member.name}`}
    >
      <div className="season-profile-heading">
        <span>IL ROMANZO DELLA STAGIONE</span>
        <b>
          {profile.stage}
          {' · '}
          {member.gamesPlayed}
          {' presenze'}
        </b>
      </div>
      <h4>{profile.title}</h4>
      <p>{profile.intro}</p>
      <AdaniComment player={toQuotePlayer(member)} quote={quote} />
      {profile.sections.map((section) => (
        <div key={section.label} className="season-chapter">
          <strong>{section.label}</strong>
          <p>{section.text}</p>
        </div>
      ))}
      <p className="season-profile-note">{profile.note}</p>
    </section>
  );
}
function getRomeDate(timestamp) {
  let parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Rome',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(toNumber(timestamp) * 1e3));
  return ['year', 'month', 'day']
    .map((partType) => parts.find((part) => part.type === partType)?.value)
    .join('-');
}
function getSessionDay(timestamp) {
  let date = new Date(toNumber(timestamp) * 1e3),
    hour = Number(
      new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome',
        hour: '2-digit',
        hourCycle: 'h23',
      }).format(date),
    ),
    romeDate = getRomeDate(timestamp);
  if (hour >= 6) return romeDate;
  let previousDay = new Date(romeDate + 'T12:00:00Z');
  previousDay.setUTCDate(previousDay.getUTCDate() - 1);
  return previousDay.toISOString().slice(0, 10);
}
function groupByNight(matches) {
  let matchesById = new Map(
      matches
        .filter((match) => match.clubs?.['70375'] && match.matchId)
        .map((match) => [String(match.matchId), match]),
    ),
    nights = new Map();
  for (let match of matchesById.values()) {
    let day = getSessionDay(match.timestamp);
    nights.set(day, [...(nights.get(day) || []), match]);
  }
  return [...nights.entries()]
    .sort(([dayA], [dayB]) => dayB.localeCompare(dayA))
    .map(([day, games]) => ({
      day,
      games: games.sort(
        (a, b) => toNumber(a.timestamp) - toNumber(b.timestamp),
      ),
    }));
}
function summarizeNight(matches) {
  let byPlayer = new Map();
  for (let match of matches)
    for (let [playerId, appearance] of Object.entries(
      match.players?.['70375'] || {},
    )) {
      if (!appearance) continue;
      let record = byPlayer.get(playerId) || {
        id: playerId,
        name: appearance.playername,
        appearances: [],
      };
      record.name = appearance.playername;
      record.appearances.push(appearance);
      byPlayer.set(playerId, record);
    }
  let players = [...byPlayer.values()]
      .map((record) => {
        let sumOf = (key) =>
            record.appearances.reduce(
              (total, appearance) => total + toNumber(appearance[key]),
              0,
            ),
          ratedAppearances = record.appearances.filter(
            (appearance) =>
              Number.isFinite(Number(appearance.rating)) &&
              toNumber(appearance.rating) > 0,
          ),
          goals = sumOf('goals'),
          assists = sumOf('assists'),
          shots = sumOf('shots'),
          passes = sumOf('passesmade'),
          passAttempts = sumOf('passattempts'),
          tackles = sumOf('tacklesmade'),
          tackleAttempts = sumOf('tackleattempts'),
          saves = sumOf('saves'),
          reds = sumOf('redcards'),
          mvps = sumOf('mom');
        return {
          ...record,
          games: record.appearances.length,
          rating: ratedAppearances.length
            ? ratedAppearances.reduce(
                (total, ratedAppearance) =>
                  total + toNumber(ratedAppearance.rating),
                0,
              ) / ratedAppearances.length
            : null,
          ratedGames: ratedAppearances.length,
          goals,
          assists,
          shots,
          passes,
          passAttempts,
          tackles,
          tackleAttempts,
          saves,
          reds,
          mvp: mvps,
          roles: [
            ...new Set(record.appearances.map((appearance) => appearance.pos)),
          ],
          passPct: passAttempts
            ? Math.round((passes / passAttempts) * 100)
            : null,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name)),
    required = Math.ceil(matches.length / 2),
    qualified = players.filter(
      (player) =>
        player.games >= required && player.ratedGames === player.games,
    ),
    fallback = false;
  if (!qualified.length) {
    fallback = true;
    let rated = players.filter(
        (player) =>
          player.ratedGames === player.games && player.rating !== null,
      ),
      maxGames = Math.max(0, ...rated.map((player) => player.games));
    qualified = rated.filter((player) => player.games === maxGames);
  }
  let bestRating = Math.max(
      -1,
      ...qualified.map((player) => player.rating ?? -1),
    ),
    winners = qualified.filter(
      (player) => Math.abs((player.rating ?? -1) - bestRating) < 1e-6,
    ),
    results = matches.map((match) => ({
      match,
      own: match.clubs[70375],
    }));
  return {
    players,
    winners,
    required,
    fallback,
    wins: results.filter(
      (result) =>
        toNumber(result.own.goals) > toNumber(result.own.goalsAgainst),
    ).length,
    draws: results.filter(
      (result) =>
        toNumber(result.own.goals) === toNumber(result.own.goalsAgainst),
    ).length,
    losses: results.filter(
      (result) =>
        toNumber(result.own.goals) < toNumber(result.own.goalsAgainst),
    ).length,
    goals: results.reduce(
      (total, result) => total + toNumber(result.own.goals),
      0,
    ),
    against: results.reduce(
      (total, result) => total + toNumber(result.own.goalsAgainst),
      0,
    ),
  };
}
function buildGradeComments(stats, variant = 0) {
  let pick = (options) => options[variant % options.length],
    praise = [],
    criticism = [],
    goalsPerGame = stats.goals / Math.max(1, stats.games),
    assistsPerGame = stats.assists / Math.max(1, stats.games);
  stats.assists > stats.goals &&
    stats.assists > 0 &&
    praise.push(
      pick([
        `La rifinitura è il suo territorio: ${stats.assists} assist in ${stats.games} gare. Il suo ultimo passaggio ha prodotto gol, non soltanto possesso.`,
        `Fa segnare gli altri: ${stats.assists} assist. La sua qualità pesa soprattutto nella preparazione della conclusione; il contributo è quello di un rifinitore decisivo.`,
        `${stats.assists} assist: mette sostanza nel servizio ai compagni. La prestazione vive nel passaggio che precede il gol.`,
        `L’impronta è nella rifinitura, con ${assistsPerGame.toFixed(2)} assist per gara. La giocata non finisce nei suoi piedi: diventa il gol di un compagno.`,
      ]),
    );
  stats.goals &&
    praise.push(
      pick([
        `${stats.goals} gol: presenza concreta in finalizzazione${goalsPerGame >= 1 ? ', con almeno una rete per presenza di media' : ''}. Ha portato peso al tabellino.`,
        `Davanti lascia il segno: ${stats.goals} reti in ${stats.games} presenze. La produzione offensiva ha un risultato concreto.`,
        `Il contributo sotto porta è di ${stats.goals} gol. Non soltanto partecipazione: conclusioni trasformate in reti.`,
        `${goalsPerGame.toFixed(2)} gol per gara: la sua parte di attacco si misura nell’efficacia realizzativa.`,
      ]),
    );
  stats.assists &&
    stats.assists <= stats.goals &&
    praise.push(
      `Ai gol affianca ${stats.assists} assist: sa contribuire anche alla conclusione degli altri.`,
    );
  stats.passPct !== null &&
    stats.passPct >= 85 &&
    stats.passAttempts >= 10 &&
    praise.push(
      pick([
        `Pulizia nella distribuzione: ${stats.passPct}% nei passaggi (${stats.passes}/${stats.passAttempts}). La trasmissione del pallone è una base affidabile.`,
        `Precisione tecnica all’${stats.passPct}% su ${stats.passAttempts} passaggi: il dato premia l’esecuzione nella circolazione.`,
        `${stats.passes} passaggi riusciti e ${stats.passPct}% di precisione: una prova ordinata con il pallone.`,
        `Nel fraseggio mantiene un’alta precisione: ${stats.passPct}% di passaggi riusciti. La qualità è nella continuità dell’esecuzione.`,
      ]),
    );
  stats.tackles &&
    praise.length < 2 &&
    praise.push(
      `${stats.tackles} contrasti riusciti su ${stats.tackleAttempts}: aggiunge sostanza nei duelli e nel recupero del pallone.`,
    );
  stats.saves &&
    praise.unshift(
      `${stats.saves} parate: la sua prestazione trova peso negli interventi a protezione della porta.`,
    );
  praise.length ||
    praise.push(
      `${stats.games} presenze, ${stats.passes} passaggi riusciti e ${stats.tackles} contrasti. Il lavoro registrato è soprattutto nella partecipazione alla manovra e nei duelli; manca un contributo diretto al gol.`,
    );
  let missedPasses = Math.max(0, stats.passAttempts - stats.passes),
    missedTackles = Math.max(0, stats.tackleAttempts - stats.tackles);
  stats.reds &&
    criticism.push(
      `${stats.reds} espulsioni: la disciplina rovina la prestazione. Il protagonismo va cercato col pallone, non con un appuntamento anticipato negli spogliatoi.`,
    );
  stats.shots >= 3 &&
    stats.goals / stats.shots < 0.3 &&
    criticism.push(
      pick([
        `${stats.goals} gol su ${stats.shots} tiri: manca efficacia in finalizzazione. L’attacco non vive di intenzioni: qui il portiere avversario ringrazia.`,
        `La conversione è ${Math.round((stats.goals / stats.shots) * 100)}%: ${stats.shots - stats.goals} tiri senza rete. Tanto lavoro al tiro, poca ferocia sul tabellino.`,
        `${stats.shots} conclusioni per ${stats.goals} gol: la produzione al tiro deve diventare più concreta. Le reti non si assegnano per partecipazione.`,
        `Sotto porta lascia margine: ${stats.goals}/${stats.shots}. Il volume c’è, ma il colpo decisivo non arriva abbastanza spesso. Il pallone va in rete, non in terapia.`,
      ]),
    );
  missedPasses &&
    stats.passPct !== null &&
    stats.passPct < 85 &&
    criticism.push(
      pick([
        `La trasmissione va ripulita: ${missedPasses} passaggi non riusciti, precisione ${stats.passPct}%. Una squadra non può costruire soltanto sulle buone intenzioni: meno fretta, più qualità.`,
        `${stats.passPct}% nei passaggi: ${missedPasses} errori su ${stats.passAttempts} tentativi. Il fraseggio chiede un’esecuzione migliore; il compagno non può ricevere una promessa.`,
        `Con ${missedPasses} passaggi non riusciti, la pulizia tecnica è il punto da correggere. Qui il pallone scotta troppo: trattalo da alleato, non da patata bollente.`,
        `Distribuzione al ${stats.passPct}%: resta troppo margine nei passaggi. L’idea di gioco ha bisogno di piedi che la accompagnino, non che la sabotino.`,
        `${missedPasses}/${stats.passAttempts} passaggi non arrivano: serve precisione nell’esecuzione. Il possesso non è un regalo da distribuire all’avversario.`,
        `Il ${stats.passPct}% nei passaggi frena la qualità del fraseggio. ${missedPasses} tentativi non riusciti: prima di cercare il capolavoro, facciamo arrivare il pallone.`,
      ]),
    );
  missedTackles >= 3 &&
    stats.tackleAttempts &&
    stats.tackles / stats.tackleAttempts < 0.5 &&
    criticism.push(
      pick([
        `Nei contrasti riesce in ${stats.tackles} tentativi su ${stats.tackleAttempts}: va alzata l’efficacia del duello. L’aggressività senza recupero fa rumore, non difesa.`,
        `${missedTackles} contrasti non riusciti: il dato chiede più efficacia nell’intervento. Entrare nel duello è facile; uscirne col pallone sarebbe la parte interessante.`,
        `Il bilancio dei duelli è ${stats.tackles}/${stats.tackleAttempts}. C’è da migliorare la riuscita del contrasto: la garra da sola non porta il pallone a casa.`,
        `Troppi tentativi di contrasto senza recupero (${missedTackles}). La voglia di intervenire non basta: bisogna far pesare l’intervento.`,
      ]),
    );
  criticism.length ||
    criticism.push(
      pick([
        'Non emerge un difetto netto nelle cifre della serata. Ora deve confermare questa pulizia: una bella pagella non è un abbonamento al posto da titolare.',
        'I numeri non isolano una criticità evidente. Il prossimo esame è ripetere la prova: lo spogliatoio applaude, ma non firma assegni in bianco.',
        'Nessuna sbavatura significativa da inchiodare al tabellino. Stavolta niente processo: la continuità, però, si dimostra nella prossima partita.',
        'La prova non offre un bersaglio statistico concreto. Si prende il merito, senza cominciare già a progettare la propria statua.',
      ]),
    );
  return {
    positive: praise.slice(0, 2).join(' '),
    negative: criticism.slice(0, 2).join(' '),
  };
}
const formatRating = (value) => (value === null ? '—' : value.toFixed(2));
function buildGradeRows(members, matches) {
  let uniqueMatches = [
      ...new Map(matches.map((match) => [match.matchId, match])).values(),
    ].sort((a, b) => b.timestamp - a.timestamp),
    recentMatches = uniqueMatches.slice(0, 15),
    latestNight = groupByNight(uniqueMatches)[0],
    recentPlayers = summarizeNight(recentMatches).players,
    nightPlayers = summarizeNight(latestNight?.games || []).players,
    names = [
      ...new Set([
        ...members.map((member) => member.name),
        ...recentPlayers.map((player) => player.name),
      ]),
    ];
  return {
    windowSize: recentMatches.length,
    nightGames: latestNight?.games.length || 0,
    nightDate: latestNight?.day,
    rows: names
      .map((name) => {
        let seasonRow = members.find(
            (member) => member.name.toLowerCase() === name.toLowerCase(),
          ),
          recentRow = recentPlayers.find(
            (player) => player.name.toLowerCase() === name.toLowerCase(),
          ),
          eveningRow = nightPlayers.find(
            (player) => player.name.toLowerCase() === name.toLowerCase(),
          );
        return {
          name,
          season:
            toNumber(seasonRow?.gamesPlayed) > 0 &&
            toNumber(seasonRow?.ratingAve) > 0
              ? toNumber(seasonRow?.ratingAve)
              : null,
          seasonGames: toNumber(seasonRow?.gamesPlayed),
          recent: recentRow?.rating ?? null,
          recentGames: recentRow?.ratedGames || 0,
          evening: eveningRow?.rating ?? null,
          eveningGames: eveningRow?.ratedGames || 0,
          session: eveningRow,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}
function PerformanceGrades({ members, matches }) {
  let [sortKey, setSortKey] = useState('name'),
    [openName, setOpenName] = useState(null),
    grades = buildGradeRows(members, matches),
    sortedRows = [...grades.rows].sort((a, b) =>
      sortKey === 'name'
        ? a.name.localeCompare(b.name)
        : (b[sortKey] ?? -1) - (a[sortKey] ?? -1),
    ),
    openRow = grades.rows.find((row) => row.name === openName),
    openIndex = grades.rows.findIndex((row) => row.name === openName);
  return (
    <section className="content performance-grades" id="voti">
      <div className="section-head">
        <div>
          <span className="overline">IL RENDIMENTO / VOTI SU 10</span>
          <h2>Tre voti. Un colpo d’occhio.</h2>
          <p className="sub">
            Stagione, ultima serata e forma recente. Le medie EA sono separate
            dall’overall dell’avatar.
          </p>
        </div>
        <label>
          Ordina per
          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value)}
          >
            <option value="name">Nome</option>
            <option value="season">Stagione</option>
            <option value="evening">Ultima serata</option>
            <option value="recent">Ultime 15 gare</option>
          </select>
        </label>
      </div>
      <div className="grades-scroll">
        <table className="grades-table">
          <thead>
            <tr>
              <th>PRO</th>
              <th>
                STAGIONE<small>Dall’inizio · tutti i ruoli</small>
              </th>
              <th>
                ULTIMA SERATA
                <small>
                  {grades.nightDate
                    ? new Date(
                        grades.nightDate + 'T12:00:00Z',
                      ).toLocaleDateString('it-IT', {
                        day: 'numeric',
                        month: 'short',
                      })
                    : '—'}
                  {' · '}
                  {grades.nightGames}
                  {' gare analizzate'}
                </small>
              </th>
              <th>
                ULTIME 15 GARE
                <small>{grades.windowSize}/15 gare in archivio</small>
              </th>
              <th>LETTURA</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((sortedRow) => (
              <tr key={sortedRow.name}>
                <th scope="row">{sortedRow.name}</th>
                <td>
                  <b>{formatRating(sortedRow.season)}</b>
                  <small>
                    {sortedRow.seasonGames}
                    {' presenze stagionali'}
                  </small>
                </td>
                <td>
                  <b>{formatRating(sortedRow.evening)}</b>
                  <small>
                    {sortedRow.eveningGames}
                    {' presenze con voto'}
                  </small>
                </td>
                <td>
                  <b>{formatRating(sortedRow.recent)}</b>
                  <small>
                    {sortedRow.recentGames}
                    {' presenze con voto'}
                  </small>
                </td>
                <td>
                  <button
                    onClick={() =>
                      setOpenName(
                        openName === sortedRow.name ? null : sortedRow.name,
                      )
                    }
                    aria-expanded={openName === sortedRow.name}
                    aria-controls="grade-comment"
                  >
                    {openName === sortedRow.name ? 'Chiudi' : 'Commento'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {openRow && (
        <div id="grade-comment" className="grade-selected">
          <span className="overline">
            {openRow.name}
            {' / LETTURA DEL RENDIMENTO'}
          </span>
          <h3>
            {openRow.evening !== null && openRow.season !== null
              ? openRow.evening >= openRow.season + 0.3
                ? 'Una serata sopra il suo riferimento.'
                : openRow.evening <= openRow.season - 0.3
                  ? 'Una prova sotto la sua media stagionale.'
                  : 'La serata segue il suo livello stagionale.'
              : 'Il rendimento prende forma.'}
          </h3>
          <p>
            {openRow.season === null
              ? ''
              : `La stagione vale ${formatRating(openRow.season)} di media EA in ${openRow.seasonGames} presenze. `}
            {openRow.evening === null
              ? 'Assente dalle gare dell’ultima serata in archivio. '
              : `Nell’ultima serata la media è ${formatRating(openRow.evening)} in ${openRow.eveningGames} presenze. `}
            {openRow.recent === null
              ? ''
              : `La finestra recente vale ${formatRating(openRow.recent)} in ${openRow.recentGames} presenze sulle ultime ${grades.windowSize} gare del club.`}
          </p>
          {openRow.session && (
            <>
              <strong>IL CALCIO CHE HA PORTATO</strong>
              <p>{buildGradeComments(openRow.session, openIndex).positive}</p>
              <strong>DOVE SERVE QUALITÀ IN PIÙ</strong>
              <p>{buildGradeComments(openRow.session, openIndex).negative}</p>
            </>
          )}
        </div>
      )}
      <details className="grade-method">
        <summary>Come leggere i voti</summary>
        <p>
          Stagione: media cumulativa fornita da EA. Serata: media delle presenze
          nella sessione più recente, unita oltre mezzanotte fino alle 06:00
          italiane. Ultime 15: media delle presenze nelle 15 gare più recenti
          conservate; se sono meno, il numero è dichiarato. Assenze e voti
          mancanti non valgono zero. Tutti i reparti sono inclusi e nessuna
          media è corretta per ruolo o minuti. Questi sono voti EA, non indici
          di forma del sito.
        </p>
      </details>
    </section>
  );
}
const toFiniteNumber = (value) => {
  let number = Number(value);
  return Number.isFinite(number) ? number : 0;
};
const POSITION_ABBREVIATIONS = {
  forward: 'ATT',
  midfielder: 'CEN',
  defender: 'DIF',
  goalkeeper: 'POR',
};
const mean = (values) =>
  values.length
    ? values.reduce((total, value) => total + value, 0) / values.length
    : null;
const formatLongDate = (day) =>
  new Date(day + 'T12:00:00Z').toLocaleDateString('it-IT', {
    timeZone: 'Europe/Rome',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
const formatMatchTime = (match) =>
  new Date(match.timestamp * 1e3).toLocaleTimeString('it-IT', {
    timeZone: 'Europe/Rome',
    hour: '2-digit',
    minute: '2-digit',
  });
const getResultLetter = (match) => {
  let own = match.clubs[70375];
  return toFiniteNumber(own.goals) > toFiniteNumber(own.goalsAgainst)
    ? 'V'
    : toFiniteNumber(own.goals) < toFiniteNumber(own.goalsAgainst)
      ? 'S'
      : 'P';
};
const formatScore = (match) =>
  `${match.clubs[70375]?.goals}–${match.clubs[70375]?.goalsAgainst}`;
const charCodeSum = (text) =>
  [...text].reduce((total, char) => total + char.charCodeAt(0), 0);
function buildCover(players, winners, clubGoals, day = '') {
  let leader =
    winners[0] ||
    [...players].sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1))[0];
  if (!leader)
    return {
      name: 'BILLOCCHI CLUB',
      title: 'La prossima storia aspetta il fischio d’inizio.',
      deck: 'Le prime gare registrate apriranno la prima pagina del club.',
    };
  let dayNumber = day ? Math.floor(Date.parse(day + 'T12:00:00Z') / 864e5) : 0,
    pick = (options, offset = 0) =>
      options[
        ((Number.isFinite(dayNumber) ? dayNumber : 0) +
          charCodeSum(leader.name) +
          offset) %
          options.length
      ],
    name = leader.name,
    statLine = `${leader.goals} gol, ${leader.assists} assist e media EA ${formatRating(leader.rating)} in ${leader.games} presenze.`,
    headlines = {
      assist: [
        `${name} firma l’ultimo passaggio.`,
        `${name}, la regia dei gol.`,
        `${name} distribuisce occasioni, non alibi.`,
        `${name}, il tabellino ringrazia.`,
        `${name} mette gli assist in prima pagina.`,
        `${name}, copyright sulla rifinitura.`,
        `${name} fa segnare anche il titolo.`,
        `${name}, il conto lo saldano gli assist.`,
        `${name} manda i compagni in copertina.`,
        `${name}, la firma dietro al gol.`,
        `${name} prepara, il club incassa.`,
        `${name}, gli assist fanno notizia.`,
      ],
      goal: [
        `${name} riscrive il tabellino.`,
        `${name}, la porta è un appuntamento fisso.`,
        `${name} lascia il segno, più volte.`,
        `${name}, la rete ha il suo nome.`,
        `${name} fa parlare i gol.`,
        `${name}, prima pagina a suon di reti.`,
        `${name} presenta il conto in area.`,
        `${name}, la contabilità della rete.`,
        `${name} colleziona firme sul risultato.`,
        `${name}, gol da mettere agli atti.`,
        `${name} cambia i numeri del club.`,
        `${name}, la copertina passa dalla porta.`,
      ],
      save: [
        `${name} difende la copertina.`,
        `${name}, le parate fanno notizia.`,
        `${name} risponde tra i pali.`,
        `${name}, il presidio della porta.`,
        `${name} mette le mani sul titolo.`,
        `${name}, la rete trova un custode.`,
        `${name} porta le parate in prima pagina.`,
        `${name}, gli interventi lasciano traccia.`,
        `${name} fa valere i guanti.`,
        `${name}, una firma tra i pali.`,
        `${name} chiama in causa il tabellino.`,
        `${name}, la porta ha voce in redazione.`,
      ],
      pass: [
        `${name} tiene insieme il racconto.`,
        `${name}, precisione da prima pagina.`,
        `${name} dà ordine ai numeri.`,
        `${name}, i passaggi trovano destinatario.`,
        `${name} firma il fraseggio.`,
        `${name}, la precisione lascia il segno.`,
        `${name} tiene il filo della serata.`,
        `${name}, il pallone arriva a destinazione.`,
        `${name} convince col possesso.`,
        `${name}, qualità nella distribuzione.`,
        `${name} fa circolare la copertina.`,
        `${name}, la manovra ha la sua firma.`,
      ],
      overall: [
        `${name} si prende il titolo.`,
        `${name}, una serata da raccontare.`,
        `${name} lascia la firma sulla notte.`,
        `${name}, i voti lo portano in copertina.`,
        `${name} sale sul tavolo della redazione.`,
        `${name}, la prova che vale la prima pagina.`,
        `${name} chiude la serata in evidenza.`,
        `${name}, il tabellino sostiene l’applauso.`,
        `${name} conquista la cronaca del club.`,
        `${name}, una firma sopra la media.`,
        `${name} guida questa edizione.`,
        `${name}, il rendimento diventa notizia.`,
      ],
      shared: [
        'La prima pagina si divide.',
        'Più firme sulla stessa copertina.',
        'La redazione allarga il podio.',
        'Il titolo ha più protagonisti.',
        'Una copertina, più autori.',
        'La notte trova firme alla pari.',
        'Il voto non scioglie il pari merito.',
        'Gli applausi si dividono equamente.',
        'La prima pagina fa spazio a tutti.',
        'Il riconoscimento ha più nomi.',
        'La copertina è un lavoro a più mani.',
        'Il verdetto lascia il titolo condiviso.',
      ],
    };
  if (winners.length > 1)
    return {
      name: winners.map((winner) => winner.name).join(' + '),
      title: pick(headlines.shared),
      deck:
        `${winners.map((winner) => winner.name).join(' e ')} condividono il riconoscimento: media EA ${formatRating(leader.rating)}. ` +
        pick(
          [
            'Il pari merito è nei numeri.',
            'La redazione assegna una copertina condivisa.',
            'Stesso voto, stesso applauso.',
            'Nessun nome viene escluso dal titolo.',
          ],
          3,
        ),
    };
  let category =
      leader.assists >= 3 && leader.assists > leader.goals
        ? 'assist'
        : leader.goals >= 3
          ? 'goal'
          : leader.saves >= 3
            ? 'save'
            : leader.passPct !== null && leader.passPct >= 85
              ? 'pass'
              : 'overall',
    extra =
      category === 'save'
        ? ` ${leader.saves} parate registrate.`
        : category === 'pass'
          ? ` ${leader.passPct}% di passaggi riusciti.`
          : '';
  return {
    name,
    title: pick(headlines[category]),
    deck:
      statLine +
      extra +
      ' ' +
      pick(
        [
          'Le cifre sostengono la copertina di questa edizione.',
          'La redazione parte dai numeri, poi si prende la libertà dell’applauso.',
          'Il riconoscimento arriva dalle gare registrate della serata.',
          'È la firma che emerge dal voto EA di questa edizione.',
          'Il verdetto del club ha questi numeri agli atti.',
          'La cronaca delle partite raccolte comincia da qui.',
        ],
        5,
      ),
  };
}
function buildTurningPoints(games) {
  let sorted = [...games].sort((a, b) => a.timestamp - b.timestamp),
    points = [],
    wins = sorted
      .filter((game) => getResultLetter(game) === 'V')
      .sort((first, second) => {
        let firstOwn = first.clubs[70375],
          secondOwn = second.clubs[70375];
        return (
          toFiniteNumber(secondOwn.goals) -
          toFiniteNumber(secondOwn.goalsAgainst) -
          (toFiniteNumber(firstOwn.goals) -
            toFiniteNumber(firstOwn.goalsAgainst))
        );
      });
  wins[0] &&
    points.push({
      tag: 'LA VITTORIA PIÙ LARGA',
      title: `${formatScore(wins[0])}. Il tabellino parla forte.`,
      text: `Contro ${getOpponentName(wins[0])}, alle ${formatMatchTime(wins[0])}: il margine più ampio tra le vittorie di questa edizione.`,
      games: [wins[0]],
    });
  let reaction = sorted.find(
    (game, index) =>
      index > 0 &&
      getResultLetter(game) === 'V' &&
      getResultLetter(sorted[index - 1]) === 'S',
  );
  if (reaction) {
    let index = sorted.indexOf(reaction);
    points.push({
      tag: 'LA RISPOSTA',
      title: 'Una sconfitta, poi la replica.',
      text: `Dopo il ${formatScore(sorted[index - 1])} contro ${getOpponentName(sorted[index - 1])}, arriva il ${formatScore(reaction)} contro ${getOpponentName(reaction)}. La partita successiva rimette una vittoria nel bilancio.`,
      games: [sorted[index - 1], reaction],
    });
  }
  let currentRun = [],
    bestRun = [];
  for (let game of sorted)
    getResultLetter(game) === 'S'
      ? (currentRun = [])
      : (currentRun.push(game),
        currentRun.length > bestRun.length && (bestRun = [...currentRun]));
  bestRun.length >= 3 &&
    points.push({
      tag: 'LA SERIE POSITIVA',
      title: `${bestRun.length} gare senza cedere.`,
      text: `${bestRun.filter((game) => getResultLetter(game) === 'V').length} vittorie e ${bestRun.filter((game) => getResultLetter(game) === 'P').length} pareggi consecutivi nelle partite registrate della serata.`,
      games: bestRun,
    });
  let closest = sorted
    .filter(
      (game) =>
        Math.abs(
          toFiniteNumber(game.clubs[70375]?.goals) -
            toFiniteNumber(game.clubs[70375]?.goalsAgainst),
        ) <= 1,
    )
    .sort(
      (a, b) =>
        toFiniteNumber(b.clubs[70375]?.goals) +
        toFiniteNumber(b.clubs[70375]?.goalsAgainst) -
        toFiniteNumber(a.clubs[70375]?.goals) -
        toFiniteNumber(a.clubs[70375]?.goalsAgainst),
    )[0];
  closest &&
    points.push({
      tag: 'IL RISULTATO IN BILICO',
      title: `${formatScore(closest)}. Margine minimo.`,
      text: `${getOpponentName(closest)}, alle ${formatMatchTime(closest)}: ${getResultLetter(closest) === 'P' ? 'un pareggio' : 'una gara chiusa con un solo gol di scarto'}. Il risultato finale racconta quanto fossero vicine le squadre.`,
      games: [closest],
    });
  !points.length &&
    sorted[0] &&
    points.push({
      tag: 'IL BILANCIO',
      title: 'Una notte da cui ripartire.',
      text: `${sorted.length} gare registrate. Apri i tabellini per vedere dove è finito il contributo di ciascun Pro.`,
      games: sorted,
    });
  return points.slice(0, 3);
}
function buildTrial(player, salt, seed = charCodeSum(player.name + salt)) {
  let comments = buildGradeComments(player, seed),
    goalsPerGame = player.goals / Math.max(1, player.games),
    missedPasses = Math.max(0, player.passAttempts - player.passes),
    missedTackles = Math.max(0, player.tackleAttempts - player.tackles),
    charge,
    proof,
    verdict,
    pick = (options) => options[seed % options.length];
  player.reds
    ? ((charge = `${player.reds} rossi. Ha prenotato la doccia prima degli altri.`),
      (proof = `${player.reds} espulsioni in ${player.games} presenze.`),
      (verdict =
        'La qualità va lasciata in campo. Il prossimo colpo di genio può risparmiarsi il cartellino.'))
    : player.shots >= 3 && player.goals / player.shots < 0.3
      ? ((charge = pick([
          'Il portiere avversario sta valutando di mandargli un biglietto di ringraziamento.',
          'Tanta produzione al tiro. Il tabellino, però, non accetta preventivi.',
          'La porta è un obiettivo, non un suggerimento geografico.',
          'Il pallone vuole la rete. Lui, ogni tanto, gli concede un anno sabbatico.',
          'Le conclusioni ci sono. Il killer instinct ha chiesto un permesso retribuito.',
          'Il tabellino non assegna gol per entusiasmo: serve il colpo che chiude il discorso.',
        ])),
        (proof = `${player.goals} gol su ${player.shots} tiri: conversione ${Math.round((player.goals / player.shots) * 100)}%. Non distingue tiri fuori, parati o bloccati.`),
        (verdict =
          player.assists >= 2
            ? `La rifinitura lo difende (${player.assists} assist). La finalizzazione resta il prossimo esame.`
            : 'Il volume è agli atti. Ora servono più reti per ogni tentativo.'))
      : player.passAttempts >= 10 &&
          player.passPct !== null &&
          player.passPct < 85
        ? ((charge = pick([
            'Il compagno chiede un pallone, non una promessa elettorale.',
            'Il possesso non è una raccolta fondi per gli avversari.',
            'La visione di gioco c’è. Ogni tanto i piedi leggono un altro copione.',
            'Prima del passaggio della vita, facciamo riuscire quello della serata.',
            'Nel fraseggio serve meno improvvisazione: il compagno non è un investigatore privato.',
            'Il pallone non scotta. Si può tenere abbastanza a lungo da passarlo bene.',
          ])),
          (proof = `${missedPasses} passaggi non riusciti su ${player.passAttempts}; precisione ${player.passPct}%.`),
          (verdict =
            player.goals + player.assists
              ? `I ${player.goals + player.assists} gol + assist gli danno argomenti. La precisione deve raggiungere l’ambizione.`
              : 'La partecipazione alla manovra è registrata. L’esecuzione va ripulita.'))
        : player.tackleAttempts >= 4 &&
            player.tackles / player.tackleAttempts < 0.5
          ? ((charge = pick([
              'La garra si sente. Il recupero del pallone, un po’ meno.',
              'Ha presentato domanda per ogni duello. Troppi colloqui senza assunzione.',
              'L’aggressività fa rumore; il pallone si riprende con un intervento riuscito.',
              'Entrare nel contrasto è il primo capitolo. Uscirne col pallone sarebbe il finale preferito.',
            ])),
            (proof = `${player.tackles} contrasti riusciti su ${player.tackleAttempts}; ${missedTackles} tentativi non riusciti.`),
            (verdict =
              'La voglia di intervenire è agli atti. Il duello deve diventare più efficace, oltre che più rumoroso.'))
          : ((charge = pick([
              'L’accusa non trova un difetto netto. Non è il momento di farsi costruire una statua.',
              'Le cifre lo difendono. Il contratto da fenomeno resta da rinnovare alla prossima gara.',
              'Per questa volta il tribunale resta senza munizioni. Il parcheggio dello stadio conserva il vecchio nome.',
              'Nessuna criticità evidente da inchiodare ai numeri. La prossima partita riapre comunque il fascicolo.',
              'Il tabellino non offre un bersaglio serio. Si prenda l’applauso, senza ordinare il busto in marmo.',
              'Oggi niente condanna statistica. Il posto nell’Olimpo si conferma col prossimo pallone.',
            ])),
            (proof = `Media EA ${formatRating(player.rating)}, ${player.games} presenze, ${player.goals} gol e ${player.assists} assist.`),
            (verdict =
              'Assolto sulle cifre di questa serata. La continuità si dimostra nelle prossime presenze.'));
  return {
    title: player.saves
      ? 'Il custode del risultato.'
      : player.assists > player.goals && player.assists
        ? 'Il servizio ai compagni.'
        : goalsPerGame >= 1
          ? 'Il tabellino lo conosce.'
          : player.goals
            ? 'La firma davanti.'
            : player.tackles
              ? 'Il lavoro nei duelli.'
              : 'La manovra passa anche qui.',
    praise: comments.positive,
    charge,
    proof,
    verdict,
  };
}
function buildTrials(players, salt) {
  let usedCharges = new Set();
  return players.map((player) => {
    let trial = buildTrial(player, salt),
      attempt = 0;
    for (; usedCharges.has(trial.charge) && attempt < 12; ) {
      attempt++;
      trial = buildTrial(
        player,
        salt,
        charCodeSum(player.name + salt) + attempt,
      );
    }
    usedCharges.has(trial.charge) &&
      (trial = {
        ...trial,
        charge: `Il fascicolo di ${player.name}: ${trial.proof} La prossima partita può migliorare la risposta; per ora la statua resta in magazzino.`,
      });
    usedCharges.add(trial.charge);
    return {
      player,
      trial,
    };
  });
}
function buildRoleTrend(playerName, matches) {
  let appearances = [
      ...new Map(
        matches
          .filter((match) => match.clubs?.['70375'])
          .map((match) => [String(match.matchId), match]),
      ).values(),
    ]
      .sort((a, b) => a.timestamp - b.timestamp)
      .flatMap((match) =>
        Object.values(match.players?.['70375'] || {})
          .filter(
            (player) =>
              player &&
              player.playername.toLowerCase() === playerName.toLowerCase(),
          )
          .map((appearance) => ({
            appearance,
            match,
          })),
      ),
    role = appearances.at(-1)?.appearance.pos,
    points = appearances
      .filter((entry) => entry.appearance.pos === role)
      .slice(-12)
      .filter((entry) => toFiniteNumber(entry.appearance.rating) > 0)
      .map((entry) => ({
        rating: toFiniteNumber(entry.appearance.rating),
        date: entry.match.timestamp,
        matchId: entry.match.matchId,
      }));
  if (points.length < 4)
    return {
      role: POSITION_ABBREVIATIONS[role || ''] || '—',
      points,
      previous: null,
      recent: null,
      previousCount: 0,
      recentCount: points.length,
      delta: null,
    };
  let half = Math.floor(points.length / 2),
    previous = mean(points.slice(0, half).map((point) => point.rating)),
    recent = mean(points.slice(half).map((point) => point.rating));
  return {
    role: POSITION_ABBREVIATIONS[role || ''] || role || '—',
    points,
    previous,
    recent,
    previousCount: half,
    recentCount: points.length - half,
    delta: recent - previous,
  };
}
function MatchStrip({ matches }) {
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
function DayAfter({ members, matches }) {
  let nights = useMemo(() => groupByNight(matches), [matches]),
    [nightChoice, setNightChoice] = useState(''),
    [protagonistChoice, setProtagonistChoice] = useState(''),
    [copyState, setCopyState] = useState(''),
    selectedNight =
      nights.find((night) => night.day === nightChoice) || nights[0],
    nightStats = useMemo(
      () => summarizeNight(selectedNight?.games || []),
      [selectedNight],
    ),
    trials = buildTrials(nightStats.players, selectedNight?.day || ''),
    cover = buildCover(
      nightStats.players,
      nightStats.winners,
      nightStats.goals,
      selectedNight?.day,
    ),
    turningPoints = buildTurningPoints(selectedNight?.games || []),
    coverPlayer =
      nightStats.winners[0] ||
      nightStats.players.find((player) => player.name === cover.name),
    nightQuotes = assignQuotes(nightStats.players, selectedNight?.day || ''),
    seasonQuotes = assignQuotes(members.map(toQuotePlayer), 'stagione'),
    protagonist =
      members.find((member) => member.name === protagonistChoice) ||
      members.find(
        (member) =>
          member.name.toLowerCase() === coverPlayer?.name.toLowerCase(),
      ) ||
      members[0],
    roleTrend = protagonist ? buildRoleTrend(protagonist.name, matches) : null,
    seasonProfile = protagonist
      ? buildSeasonProfile(protagonist, members, {
          games: 0,
          label: '',
          rating: 0,
          goals: 0,
          assists: 0,
          passPct: 0,
          passAttempts: 0,
          tackles: 0,
        })
      : null,
    shareText = selectedNight
      ? `BILLOCCHI · IL GIORNO DOPO\nSerata del ${formatLongDate(selectedNight.day)}\n${cover.title}\n${cover.deck}\n${selectedNight.games.length} gare: ${nightStats.wins}V ${nightStats.draws}P ${nightStats.losses}S · ${nightStats.goals} gol fatti, ${nightStats.against} subiti.\n${nightStats.winners.length ? `Migliore delle gare registrate: ${nightStats.winners.map((winner) => winner.name).join(' + ')} · media EA ${formatRating(nightStats.winners[0].rating)}.\n` : ''}${trials
          .map(
            ({ player, trial }) =>
              `\n${player.name} · ${formatRating(player.rating)} EA\nElogio: ${trial.praise}\nAccusa: ${trial.charge}\nProva: ${trial.proof}\nVerdetto: ${trial.verdict}`,
          )
          .join('\n')}\nhttps://billocchi-club.kr3n.chatgpt.site/`
      : '';
  async function copyEdition() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopyState('ok');
    } catch {
      setCopyState('manual');
    }
  }
  let topScorer = [...nightStats.players].sort((a, b) => b.goals - a.goals)[0],
    topAssister = [...nightStats.players].sort(
      (a, b) => b.assists - a.assists,
    )[0];
  return (
    <section className="day-after" id="giorno-dopo">
      <div className="paper-edition-bar">
        <span>LA VOCE DELLO SPOGLIATOIO</span>
        {selectedNight ? (
          <label>
            Serata
            <select
              value={selectedNight.day}
              onChange={(event) => {
                setNightChoice(event.target.value);
                setCopyState('');
              }}
              aria-label="Scegli la serata del giornale"
            >
              {nights.map((night) => (
                <option key={night.day} value={night.day}>
                  {formatLongDate(night.day)}
                  {' · '}
                  {night.games.length}
                  {' gare'}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <span>IN ATTESA DELLA PRIMA GARA</span>
        )}
      </div>
      <header className="paper-masthead">
        <img src="/logo-billocchi.svg" alt="Stemma BILLOCCHI CLUB" />
        <div>
          <h1>BILLOCCHI</h1>
          <p>IL GIORNO DOPO</p>
        </div>
        <span>
          LA GAZZETTA DEL CLUB
          <br />
          CRONACA · PAGELLE · STORIE
          <br />
          <b>REDAZIONE BILLOCCHI</b>
        </span>
      </header>
      <div className="paper-nav">
        <a href="#processo">Il processo del pallone</a>
        <a href="#svolte">Le svolte della notte</a>
        <a href="#romanzo">Il romanzo dei Pro</a>
        <a href="#voti">I voti</a>
      </div>
      {selectedNight ? (
        <>
          <div className="paper-cover">
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
                    ? nightStats.winners
                        .map((winner) => winner.name)
                        .join(' + ')
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
          </div>
          <div className="paper-results">
            <div className="paper-record">
              <span>IL BILANCIO</span>
              <strong>
                {nightStats.wins}
                <small>V</small> {nightStats.draws}
                <small>P</small> {nightStats.losses}
                <small>S</small>
              </strong>
              <p>
                {nightStats.goals}
                {' fatti · '}
                {nightStats.against}
                {' subiti'}
              </p>
            </div>
            <div
              className="paper-score-strip"
              aria-label="Partite della serata, dalla prima all’ultima"
            >
              {selectedNight.games.map((game, index) => (
                <details
                  key={game.matchId}
                  className={`paper-score ${getResultLetter(game)}`}
                >
                  <summary>
                    <span>
                      {'GARA '}
                      {index + 1}
                      {' · '}
                      {formatMatchTime(game)}
                    </span>
                    <b>{formatScore(game)}</b>
                    <small>{getOpponentName(game)}</small>
                  </summary>
                  <div className="paper-match-pros">
                    {summarizeNight([game]).players.map((player) => (
                      <div key={player.id}>
                        <strong>{player.name}</strong>
                        <span>
                          {player.goals}
                          {' G · '}
                          {player.assists}
                          {' A'}
                        </span>
                        <b>{formatRating(player.rating)}</b>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
          <section className="paper-turning" id="svolte">
            <div className="paper-section-heading">
              <span>01 / LE SVOLTE DELLA NOTTE</span>
              <h3>Le partite lasciano il segno.</h3>
            </div>
            <div className="paper-turning-grid">
              {turningPoints.map((turningPoint, index) => (
                <article key={turningPoint.tag}>
                  <span className="paper-story-no">0{index + 1}</span>
                  <span className="paper-eyebrow">{turningPoint.tag}</span>
                  <h4>{turningPoint.title}</h4>
                  <p>{turningPoint.text}</p>
                  <details>
                    <summary>Le partite che lo raccontano</summary>
                    <MatchStrip matches={turningPoint.games} />
                  </details>
                </article>
              ))}
            </div>
          </section>
          <section className="paper-trials" id="processo">
            <div className="paper-section-heading">
              <div>
                <span>02 / IL PROCESSO DEL PALLONE</span>
                <h3>
                  Tutti alla sbarra.
                  <br />
                  <em>Nessuno alla gogna.</em>
                </h3>
              </div>
              <p>
                Elogio, accusa e verdetto per tutti quelli scesi in campo. Le
                battute sono nostre. Le cifre sono di EA.
              </p>
            </div>
            <div className="paper-trial-grid">
              {trials.map(({ player, trial }, index) => {
                let isCoverPro = nightStats.winners.some(
                  (winner) => winner.id === player.id,
                );
                return (
                  <details
                    key={player.id}
                    className={`paper-trial ${isCoverPro ? 'is-cover-pro' : ''}`}
                  >
                    <summary>
                      <div className="paper-trial-top">
                        <span>
                          {'FASCICOLO '}
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        {isCoverPro && (
                          <Trophy
                            size={17}
                            aria-label="Migliore delle gare registrate"
                          />
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
                      <span className="paper-open-case">
                        Leggi elogio e accusa
                      </span>
                    </summary>
                    <div className="paper-case-body">
                      <div className="paper-praise">
                        <span>L’ELOGIO</span>
                        <p>{trial.praise}</p>
                      </div>
                      <blockquote>
                        <span>L’ACCUSA DELLO SPOGLIATOIO</span>
                        <Quote size={18} aria-hidden="true" />
                        <p>{trial.charge}</p>
                      </blockquote>
                      <AdaniComment
                        player={player}
                        quote={nightQuotes.get(player.name)}
                      />
                      <details className="paper-verdict">
                        <summary>Le prove e il verdetto</summary>
                        <div>
                          <span>AGLI ATTI</span>
                          <p>{trial.proof}</p>
                          <div className="paper-trial-evidence">
                            <span>
                              {player.passPct === null
                                ? '—'
                                : `${player.passPct}%`}
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
                          <small>
                            {'Reparti giocati: '}
                            {player.roles
                              .map(
                                (role) => POSITION_ABBREVIATIONS[role] || role,
                              )
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
              })}
            </div>
          </section>
          <div className="paper-notebook">
            <Newspaper size={25} />
            <div>
              <span>ANNOTAZIONI A MARGINE</span>
              <p>
                {topScorer?.goals
                  ? `${topScorer.name}: ${topScorer.goals} gol. `
                  : ''}
                {topAssister?.assists
                  ? `${topAssister.name}: ${topAssister.assists} assist. `
                  : ''}
                {nightStats.players.length}
                {' Pro hanno lasciato una riga in questa edizione.'}
              </p>
            </div>
            <button onClick={copyEdition}>
              {copyState === 'ok' ? <Check size={17} /> : <Copy size={17} />}{' '}
              {copyState === 'ok'
                ? 'Edizione copiata'
                : 'Copia per lo spogliatoio'}
            </button>
          </div>
          {copyState === 'manual' && (
            <label className="paper-manual-copy">
              Seleziona e copia il testo
              <textarea
                readOnly
                value={shareText}
                onFocus={(event) => event.currentTarget.select()}
              />
            </label>
          )}
        </>
      ) : (
        <div className="paper-empty">
          <h2>La prossima storia aspetta il fischio d’inizio.</h2>
          <p>
            Le prime gare registrate apriranno copertina, pagelle e tabellini. I
            profili stagionali sono già qui sotto.
          </p>
        </div>
      )}
      {protagonist && seasonProfile && (
        <section className="paper-season" id="romanzo">
          <div className="paper-section-heading">
            <div>
              <span>03 / IL ROMANZO DEI PRO</span>
              <h3>La stagione ha memoria.</h3>
            </div>
            <label>
              Scegli il protagonista
              <select
                aria-label="Protagonista del romanzo"
                value={protagonist.name}
                onChange={(event) => setProtagonistChoice(event.target.value)}
              >
                {members.map((member) => (
                  <option key={member.name} value={member.name}>
                    {member.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <details className="paper-longread">
            <summary>
              {'Leggi il ritratto e l’andamento di '}
              {protagonist.name}
            </summary>
            <div className="paper-season-layout">
              <aside className="paper-season-index">
                <BookOpen size={23} />
                <span>{seasonProfile.stage}</span>
                <h4>{protagonist.name}</h4>
                <div>
                  <b>{protagonist.gamesPlayed}</b>
                  <span>PRESENZE STAGIONALI</span>
                </div>
                <div className="paper-season-totals">
                  <span>
                    <b>{protagonist.goals}</b>
                    {' GOL'}
                  </span>
                  <span>
                    <b>{protagonist.assists}</b>
                    {' ASSIST'}
                  </span>
                </div>
                <p>
                  {'Media EA '}
                  <strong>
                    {toFiniteNumber(protagonist.gamesPlayed)
                      ? protagonist.ratingAve
                      : '—'}
                  </strong>
                  <br />
                  Totali stagionali · tutti i ruoli
                </p>
                <a href="#rosa">Apri le figurine del club</a>
              </aside>
              <article className="paper-season-story">
                <h4>{seasonProfile.title}</h4>
                <p>{seasonProfile.intro}</p>
                <AdaniComment
                  player={toQuotePlayer(protagonist)}
                  quote={seasonQuotes.get(protagonist.name)}
                />
                {roleTrend && (
                  <div className="paper-trend">
                    <div>
                      <span>
                        {'L’ARCO RECENTE / '}
                        {roleTrend.role}
                      </span>
                      <strong>
                        {roleTrend.delta === null
                          ? 'La storia sta raccogliendo le prime prove.'
                          : roleTrend.delta >= 0.3
                            ? 'Il capitolo recente alza il livello.'
                            : roleTrend.delta <= -0.3
                              ? 'Il capitolo recente chiede una risposta.'
                              : 'Il capitolo recente segue il suo riferimento.'}
                      </strong>
                    </div>
                    {roleTrend.points.length > 0 && (
                      <svg
                        viewBox="0 0 320 90"
                        role="img"
                        aria-label={`Voti EA cronologici nelle ${roleTrend.points.length} presenze archiviate da ${roleTrend.role}: ${roleTrend.points.map((point) => point.rating).join(', ')}`}
                      >
                        <line x1="10" y1="74" x2="310" y2="74" />
                        <line x1="10" y1="39" x2="310" y2="39" />
                        {roleTrend.points.length > 1 && (
                          <polyline
                            points={roleTrend.points
                              .map(
                                (point, index) =>
                                  `${10 + (index * 300) / (roleTrend.points.length - 1)},${81 - point.rating * 7}`,
                              )
                              .join(' ')}
                          />
                        )}
                        {roleTrend.points.map((point, index) => (
                          <circle
                            key={point.matchId}
                            cx={
                              roleTrend.points.length === 1
                                ? 160
                                : 10 +
                                  (index * 300) / (roleTrend.points.length - 1)
                            }
                            cy={81 - point.rating * 7}
                            r="3.5"
                          />
                        ))}
                      </svg>
                    )}
                    <p>
                      {roleTrend.delta === null
                        ? `${roleTrend.points.length} presenze con voto archiviate nell’ultimo reparto giocato (${roleTrend.role}). Il confronto tra due blocchi parte da quattro presenze con voto nello stesso reparto.`
                        : `Le ultime ${roleTrend.recentCount} presenze archiviate da ${roleTrend.role} valgono ${formatRating(roleTrend.recent)}, contro ${formatRating(roleTrend.previous)} nelle ${roleTrend.previousCount} precedenti: ${roleTrend.delta >= 0 ? '+' : ''}${roleTrend.delta.toFixed(2)} punti EA. Il confronto usa lo stesso reparto.`}
                    </p>
                    {roleTrend.points.length > 1 && (
                      <small>
                        {new Date(
                          roleTrend.points[0].date * 1e3,
                        ).toLocaleDateString('it-IT', {
                          timeZone: 'Europe/Rome',
                        })}
                        {' — '}
                        {new Date(
                          roleTrend.points.at(-1).date * 1e3,
                        ).toLocaleDateString('it-IT', {
                          timeZone: 'Europe/Rome',
                        })}
                        {' · '}
                        {roleTrend.points.length}
                        {' voti archiviati · dal più vecchio al più recente'}
                      </small>
                    )}
                  </div>
                )}
                <div className="paper-chapters">
                  {seasonProfile.sections.map((section, index) => (
                    <details key={section.label}>
                      <summary>
                        <span>
                          {'CAPITOLO '}
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <strong>{section.label}</strong>
                      </summary>
                      <p>{section.text}</p>
                    </details>
                  ))}
                </div>
              </article>
            </div>
          </details>
        </section>
      )}
      <details className="paper-method">
        <summary>Il taccuino della redazione</summary>
        <p>
          Ogni edizione usa le partite conservate della serata selezionata; le
          sessioni dopo mezzanotte e prima delle 06:00 italiane appartengono
          alla sera precedente. Elogi e battute sono commenti originali del
          club. Il premio segue la media EA più alta con almeno metà delle gare
          e voti in tutte le proprie presenze; senza candidati, considera chi ha
          più presenze e voti completi. Le medie identiche condividono il
          premio. I voti non sono corretti per ruolo o minuti. Il romanzo usa i
          totali stagionali EA; il grafico recente confronta soltanto lo stesso
          reparto, sull’archivio disponibile. I tiri senza gol non identificano
          da soli errori di mira o occasioni mancate. Le svolte descrivono
          risultati finali e sequenze di gare, senza inventare azioni o
          rimontare punteggi durante una partita.
        </p>
      </details>
    </section>
  );
}
const SECTIONS = [
  {
    id: 'giorno-dopo',
    label: 'Il giorno dopo',
  },
  {
    id: 'processo',
    label: 'Pagelle',
  },
  {
    id: 'romanzo',
    label: 'Storie',
  },
  {
    id: 'panoramica',
    label: 'Stagione',
  },
  {
    id: 'voti',
    label: 'Voti',
  },
  {
    id: 'rosa',
    label: 'La rosa',
  },
  {
    id: 'spogliatoio',
    label: 'Partite',
  },
];
function SectionNav() {
  let [activeId, setActiveId] = useState('giorno-dopo'),
    navRef = useRef(null);
  useEffect(() => {
    let frame = 0,
      update = () => {
        frame = 0;
        let offset =
            (navRef.current?.closest('header')?.getBoundingClientRect()
              .bottom || 100) + 85,
          currentId = SECTIONS[0].id;
        for (let section of SECTIONS) {
          let element = document.getElementById(section.id);
          element &&
            element.getBoundingClientRect().top <= offset &&
            (currentId = section.id);
        }
        setActiveId(currentId);
      },
      onScroll = () => {
        frame ||= requestAnimationFrame(update);
      },
      goToHash = (hash) => {
        let target = document.getElementById(hash.slice(1));
        if (target) {
          for (let node = target.parentElement; node; node = node.parentElement)
            node instanceof HTMLDetailsElement && (node.open = true);
          target.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
              .matches
              ? 'auto'
              : 'smooth',
            block: 'start',
          });
        }
      },
      onClick = (event) => {
        if (
          event.defaultPrevented ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        )
          return;
        let href = event.target.closest('a[href^="#"]')?.getAttribute('href');
        !href ||
          !document.getElementById(href.slice(1)) ||
          (event.preventDefault(),
          history.pushState(null, '', href),
          goToHash(href));
      },
      onHashChange = () => goToHash(location.hash);
    document.addEventListener('click', onClick);
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('scroll', onScroll, {
      passive: true,
    });
    window.addEventListener('resize', onScroll);
    update();
    location.hash && goToHash(location.hash);
    let animatedSections = document.querySelectorAll(
        'main > section:not(.day-after), .paper-cover, .paper-results, .paper-turning, .paper-trials, .paper-season',
      ),
      observer = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? null
        : new IntersectionObserver(
            (entries) => {
              for (let entry of entries)
                entry.target.classList.toggle('in-view', entry.isIntersecting);
            },
            {
              threshold: 0,
            },
          );
    observer &&
      animatedSections.forEach((section) => {
        section.classList.add('scroll-fade');
        section.getBoundingClientRect().top < innerHeight &&
          section.classList.add('in-view');
        observer.observe(section);
      });
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      animatedSections.forEach((section) =>
        section.classList.remove('scroll-fade', 'in-view'),
      );
      document.removeEventListener('click', onClick);
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  useEffect(() => {
    let nav = navRef.current,
      link = nav?.querySelector(`a[href="#${activeId}"]`);
    if (!nav || !link) return;
    let linkLeft =
      link.getBoundingClientRect().left -
      nav.getBoundingClientRect().left +
      nav.scrollLeft;
    (linkLeft < nav.scrollLeft ||
      linkLeft + link.offsetWidth > nav.scrollLeft + nav.clientWidth) &&
      nav.scrollTo({
        left: Math.max(0, linkLeft - (nav.clientWidth - link.offsetWidth) / 2),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
      });
  }, [activeId]);
  return (
    <nav
      ref={navRef}
      className="section-navigation"
      aria-label="Sezioni del club"
    >
      {SECTIONS.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={activeId === section.id ? 'is-active' : ''}
          aria-current={activeId === section.id ? 'location' : undefined}
        >
          <span className="nav-dot" aria-hidden="true" />
          {section.label}
        </a>
      ))}
    </nav>
  );
}
const ratio = (numerator, denominator) =>
  toNumber(denominator)
    ? (toNumber(numerator) / toNumber(denominator)).toFixed(2)
    : '—';
const EA_CLUBS_URL = 'https://www.ea.com/it-it/games/ea-sports-fc/clubs';
function CountUp({ value }) {
  let [display, setDisplay] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value);
      return;
    }
    let frame = 0,
      start = performance.now(),
      tick = (now) => {
        let progress = Math.min(1, (now - start) / 950);
        setDisplay(Math.round(value * (1 - (1 - progress) ** 3)));
        progress < 1 && (frame = requestAnimationFrame(tick));
      };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <>{display}</>;
}
function Reveal({ children, className = '' }) {
  let ref = useRef(null);
  useEffect(() => {
    let element = ref.current;
    if (!element) return;
    let observer = new IntersectionObserver(
      ([entry]) => {
        entry.isIntersecting &&
          (element.classList.add('visible'), observer.unobserve(element));
      },
      {
        threshold: 0.08,
      },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
const formatProOverall = (member) =>
  toNumber(member.proOverall) > 0 ? String(member.proOverall) : '—';
function computeCardProfile(member, matches) {
  let appearances = [...matches]
      .sort((a, b) => toNumber(b.timestamp) - toNumber(a.timestamp))
      .flatMap((match) =>
        Object.values(match.players?.['70375'] || {}).filter(
          (appearance) =>
            appearance.playername.toLowerCase() === member.name.toLowerCase(),
        ),
      ),
    role = appearances[0]?.pos || member.favoritePosition || '',
    roleAppearances = appearances.filter(
      (appearance) => appearance.pos === role,
    ),
    games = roleAppearances.length,
    goals = roleAppearances.reduce(
      (total, appearance) => total + toNumber(appearance.goals),
      0,
    ),
    assists = roleAppearances.reduce(
      (total, appearance) => total + toNumber(appearance.assists),
      0,
    ),
    shots = roleAppearances.reduce(
      (total, appearance) => total + toNumber(appearance.shots),
      0,
    ),
    passes = roleAppearances.reduce(
      (total, appearance) => total + toNumber(appearance.passesmade),
      0,
    ),
    passAttempts = roleAppearances.reduce(
      (total, appearance) => total + toNumber(appearance.passattempts),
      0,
    ),
    tackles = roleAppearances.reduce(
      (total, appearance) => total + toNumber(appearance.tacklesmade),
      0,
    ),
    saves = roleAppearances.reduce(
      (total, appearance) => total + toNumber(appearance.saves),
      0,
    ),
    rating = games
      ? roleAppearances.reduce(
          (total, appearance) => total + toNumber(appearance.rating),
          0,
        ) / games
      : 0,
    passPct = passAttempts ? Math.round((passes / passAttempts) * 100) : 0,
    roleScore =
      role === 'forward'
        ? ((goals + 0.7 * assists) / Math.max(1, games)) * 9
        : role === 'midfielder'
          ? ((assists + 0.8 * goals) / Math.max(1, games)) * 8
          : role === 'defender'
            ? (tackles / Math.max(1, games)) * 2.5 +
              (assists / Math.max(1, games)) * 4
            : (saves / Math.max(1, games)) * 2.5,
    formScore = games
      ? Math.round(
          Math.max(
            40,
            Math.min(
              99,
              50 +
                (rating - 6) * 10 +
                Math.min(16, roleScore) +
                passPct * 0.08 -
                Math.max(0, 5 - games) * 3,
            ),
          ),
        )
      : 0,
    seasonGames = toNumber(member.gamesPlayed),
    basis = games ? 'recent' : seasonGames ? 'season' : 'none',
    seasonBase =
      ((toNumber(member.goals) + 0.7 * toNumber(member.assists)) /
        Math.max(1, seasonGames)) *
      8,
    seasonRaw =
      50 +
      (toNumber(member.ratingAve) - 6) * 10 +
      Math.min(16, seasonBase) +
      toNumber(member.passSuccessRate) * 0.08 -
      Math.max(0, 5 - seasonGames) * 3,
    score =
      basis === 'season'
        ? Math.round(Math.max(40, Math.min(99, seasonRaw)))
        : formScore,
    tier =
      basis === 'none'
        ? 'unranked'
        : score >= 92
          ? 'iridescent'
          : score >= 87
            ? 'platinum'
            : score >= 78
              ? 'gold'
              : score >= 70
                ? 'silver'
                : 'bronze',
    recentAppearances = roleAppearances.slice(0, 3),
    recentRating = recentAppearances.length
      ? recentAppearances.reduce(
          (total, appearance) => total + toNumber(appearance.rating),
          0,
        ) / recentAppearances.length
      : 0,
    recentContrib = recentAppearances.reduce(
      (total, appearance) =>
        total + toNumber(appearance.goals) + toNumber(appearance.assists),
      0,
    ),
    hot =
      recentAppearances.length === 3 &&
      recentRating >= 7.8 &&
      recentContrib >= 4;
  return {
    role,
    label: POSITION_ABBREVIATIONS[role] || '—',
    games,
    goals,
    assists,
    shots,
    passes,
    passAttempts,
    tackles,
    saves,
    rating,
    passPct,
    tier,
    score,
    basis,
    hot,
    recentRating,
    recentContrib,
  };
}
function CollectorCard({ member, profile, onClick }) {
  let stats = [
    [member.goals, 'GOL'],
    [member.assists, 'AST'],
    [member.gamesPlayed, 'PRE'],
    [`${member.passSuccessRate}%`, 'PAS'],
    [member.tacklesMade, 'CTR'],
    [member.ratingAve, 'MED'],
  ];
  return (
    <button
      className={`collector-card ${profile.tier} ${profile.hot ? 'on-fire' : ''}`}
      onClick={onClick}
      aria-label={`${member.name}, overall EA ${formatProOverall(member)}, ${profile.label}, ${member.goals} gol e ${member.assists} assist stagionali${profile.hot ? ', in forma eccezionale' : ''}. Apri la pagella`}
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
    </button>
  );
}
function App() {
  let [data, setData] = useState(fallbackData),
    [connection, setConnection] = useState('loading'),
    [freshKeys, setFreshKeys] = useState([]),
    [lastSync, setLastSync] = useState(),
    [refreshing, setRefreshing] = useState(false),
    [selectedName, setSelectedName] = useState(null),
    refresh = useCallback(async () => {
      setRefreshing(true);
      try {
        let response = await fetch('/api/data', {
          cache: 'no-store',
        });
        if (!response.ok) throw Error();
        let payload = await response.json();
        if (!payload.club?.[0] || !payload.members?.members) throw Error();
        setData(payload);
        setFreshKeys(payload.fresh || []);
        setConnection(
          ['club', 'members', 'matches'].every((key) =>
            payload.fresh?.includes(key),
          )
            ? 'yes'
            : payload.fresh?.length
              ? 'partial'
              : 'no',
        );
        setLastSync(new Date().toISOString());
      } catch {
        setConnection('no');
      } finally {
        setRefreshing(false);
      }
    }, []);
  useEffect(() => {
    refresh();
    let interval = setInterval(refresh, 6e4),
      onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh]);
  let club = data.club[0],
    recentMatches = data.matches || [],
    sortedMembers = useMemo(
      () =>
        [...data.members.members].sort(
          (a, b) =>
            toNumber(b.goals) +
              toNumber(b.assists) -
              (toNumber(a.goals) + toNumber(a.assists)) ||
            toNumber(b.goals) - toNumber(a.goals) ||
            toNumber(b.gamesPlayed) - toNumber(a.gamesPlayed) ||
            a.name.localeCompare(b.name),
        ),
      [data],
    ),
    cards = sortedMembers.map((sortedMember) => ({
      member: sortedMember,
      profile: computeCardProfile(sortedMember, recentMatches),
    })),
    selectedCard = cards.find((card) => card.member.name === selectedName);
  useEffect(() => {
    if (!selectedName) return;
    let onKeyDown = (event) => {
      event.key === 'Escape' && setSelectedName(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedName]);
  data.members.members.filter((member) => toNumber(member.gamesPlayed) > 0)
    .length;
  let wins = toNumber(club.wins),
    ties = toNumber(club.ties),
    losses = toNumber(club.losses),
    gamesPlayed = toNumber(club.gamesPlayed),
    form = recentMatches.map((match) => {
      let own = match.clubs[70375];
      return toNumber(own.goals) > toNumber(own.goalsAgainst)
        ? 'V'
        : toNumber(own.goals) < toNumber(own.goalsAgainst)
          ? 'S'
          : 'P';
    }),
    activeMembers = [...sortedMembers]
      .filter((sortedMember) => toNumber(sortedMember.gamesPlayed) > 0)
      .sort(
        (a, b) =>
          toNumber(b.goals) +
          toNumber(b.assists) -
          toNumber(a.goals) -
          toNumber(a.assists),
      ),
    topScorer = [...activeMembers].sort(
      (a, b) => toNumber(b.goals) - toNumber(a.goals),
    )[0],
    topAssister = [...activeMembers].sort(
      (a, b) => toNumber(b.assists) - toNumber(a.assists),
    )[0],
    topPasser = [...activeMembers]
      .filter((activeMember) => toNumber(activeMember.gamesPlayed) >= 10)
      .sort(
        (a, b) => toNumber(b.passSuccessRate) - toNumber(a.passSuccessRate),
      )[0],
    recentGames = recentMatches
      .slice()
      .reverse()
      .map((match) => {
        let own = match.clubs[70375];
        return {
          id: match.matchId,
          for: toNumber(own.goals),
          against: toNumber(own.goalsAgainst),
          name:
            Object.entries(match.clubs).find(
              ([clubId]) => clubId !== '70375',
            )?.[1]?.details?.name || 'Avversario',
        };
      }),
    goalsFor = recentGames.reduce(
      (total, recentGame) => total + recentGame.for,
      0,
    ),
    goalsAgainst = recentGames.reduce(
      (total, recentGame) => total + recentGame.against,
      0,
    ),
    maxGoals = Math.max(
      5,
      ...recentGames.flatMap((recentGame) => [
        recentGame.for,
        recentGame.against,
      ]),
    );
  return (
    <div className="site">
      <header className="nav">
        <a className="brand" href="#top">
          <img
            className="site-logo"
            src="/logo-billocchi.svg"
            alt="Stemma BILLOCCHI CLUB"
          />
          <span>
            {'BILLOCCHI '}
            <b>CLUB</b>
            <small>FC 27 / CLUB INTELLIGENCE</small>
          </span>
        </a>
        <SectionNav />
        <div className="status">
          <i className={connection === 'yes' ? 'active' : ''} />
          {connection === 'yes'
            ? 'EA collegata'
            : connection === 'partial'
              ? 'EA parziale'
              : connection === 'no'
                ? 'Ultimi dati salvati'
                : 'Connessione a EA'}
        </div>
      </header>
      <main id="top">
        <DayAfter
          members={data.members.members}
          matches={data.matchHistory || recentMatches}
        />
        <section className="content" id="panoramica">
          <div className="section-head">
            <div>
              <span className="overline">01 / PANORAMICA</span>
              <h2>Il tabellone.</h2>
            </div>
            <button className="refresh" onClick={refresh} disabled={refreshing}>
              <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
              {' Aggiorna dati'}
            </button>
          </div>
          <div className="overview">
            <div className="record panel">
              <span className="label">RECORD TOTALE</span>
              <div className="record-numbers">
                <strong>
                  <CountUp value={wins} />
                </strong>
                <i>—</i>
                <strong>
                  <CountUp value={ties} />
                </strong>
                <i>—</i>
                <strong>
                  <CountUp value={losses} />
                </strong>
              </div>
              <div className="record-labels">
                <span>VITTORIE</span>
                <span>PAREGGI</span>
                <span>SCONFITTE</span>
              </div>
              <div className="split">
                <i
                  style={{
                    width: `${(wins / gamesPlayed) * 100}%`,
                  }}
                />
                <i
                  style={{
                    width: `${(ties / gamesPlayed) * 100}%`,
                  }}
                />
                <i
                  style={{
                    width: `${(losses / gamesPlayed) * 100}%`,
                  }}
                />
              </div>
              <p>
                {Math.round((wins / gamesPlayed) * 100)}
                {'% di vittorie su '}
                {gamesPlayed}
                {' partite. '}
                {wins > losses
                  ? 'Il bilancio è positivo; la difesa, però, lascia spazio al dramma.'
                  : 'La squadra ha ancora margine per cambiare il bilancio.'}
              </p>
            </div>
            <div className="metrics panel">
              <div>
                <span>GOL FATTI</span>
                <strong>
                  <CountUp value={toNumber(club.goals)} />
                </strong>
                <small>
                  {ratio(club.goals, gamesPlayed)}
                  {' / gara'}
                </small>
              </div>
              <div>
                <span>GOL SUBITI</span>
                <strong>
                  <CountUp value={toNumber(club.goalsAgainst)} />
                </strong>
                <small>
                  {ratio(club.goalsAgainst, gamesPlayed)}
                  {' / gara'}
                </small>
              </div>
              <div>
                <span>DIFFERENZA RETI</span>
                <strong className="lime">
                  {toNumber(club.goals) - toNumber(club.goalsAgainst) > 0
                    ? '+'
                    : ''}
                  <CountUp
                    value={toNumber(club.goals) - toNumber(club.goalsAgainst)}
                  />
                </strong>
                <small>Gol fatti meno subiti</small>
              </div>
              <div>
                <span>PROMOZIONI</span>
                <strong>
                  <CountUp value={toNumber(club.promotions)} />
                </strong>
                <small>
                  {club.relegations}
                  {' retrocessioni'}
                </small>
              </div>
            </div>
            <div className="form panel">
              <span className="label">
                {'ULTIME '}
                {recentMatches.length}
                {' · CAMPIONATO'}
              </span>
              <div className="form-row">
                {form.map((result, index) => (
                  <span key={index} className={result}>
                    {result}
                  </span>
                ))}
              </div>
              <h3>
                {form.filter((result) => result === 'V').length}
                {' vittorie nelle ultime '}
                {recentMatches.length}
              </h3>
              <p>
                {
                  'EA espone le ultime cinque gare per modalità. Il record generale comprende '
                }
                {gamesPlayed}
                {' partite.'}
              </p>
              <a href="#partite">
                {'Apri le partite '}
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
          <div className="insight">
            <div className="insight-symbol">◎</div>
            <div>
              <span>LETTURA RAPIDA</span>
              <strong>
                {ratio(club.goals, gamesPlayed)}
                {' gol fatti e '}
                {ratio(club.goalsAgainst, gamesPlayed)}
                {' subiti a gara.'}
              </strong>
              <p>
                {toNumber(club.goalsAgainst) / gamesPlayed > 2
                  ? "L'attacco produce, ma la difesa concede spesso: c'è quasi sempre bisogno di segnare tanto."
                  : "Bilancio offensivo e difensivo letto sull'intera stagione."}
              </p>
            </div>
            <b>
              {Math.round(
                (toNumber(club.goalsAgainst) /
                  Math.max(1, toNumber(club.goals))) *
                  100,
              )}
              %
            </b>
          </div>
          <details className="compact-appendix">
            <summary>La lente sui numeri · andamento e leader</summary>
            <section className="analysis" id="analisi">
              <Reveal>
                <div className="section-head">
                  <div>
                    <span className="overline">02 / LA SALA ANALISI</span>
                    <h2>Dentro i numeri.</h2>
                    <p className="sub">
                      {
                        'Dati aggiornati da EA. Gli insight sulle gare recenti si riferiscono soltanto alle ultime '
                      }
                      {recentGames.length}
                      {' partite disponibili.'}
                    </p>
                  </div>
                  <span className="analysis-stamp">
                    <ScanLine size={17} />
                    {' MATCH INTELLIGENCE'}
                  </span>
                </div>
              </Reveal>
              <div className="analysis-grid">
                <Reveal className="analysis-card pulse-card">
                  <div className="analysis-card-head">
                    <span>
                      {'IL PULSE DELLE ULTIME '}
                      {recentGames.length}
                    </span>
                    <TrendingUp size={18} />
                  </div>
                  <div className="pulse-totals">
                    <strong>
                      {goalsFor}
                      <small>{' FATTI'}</small>
                    </strong>
                    <span>:</span>
                    <strong>
                      {goalsAgainst}
                      <small>{' SUBITI'}</small>
                    </strong>
                  </div>
                  <div
                    className="pulse-chart"
                    aria-label="Gol fatti e subiti nelle ultime partite, in ordine cronologico"
                  >
                    {recentGames.map((game, index) => (
                      <div key={game.id} className="pulse-game">
                        <div className="pulse-bars">
                          <i
                            className="bar-for"
                            style={{
                              height: `${Math.max(7, (game.for / maxGoals) * 100)}%`,
                              animationDelay: `${index * 90}ms`,
                            }}
                            title={`${game.for} gol fatti`}
                          />
                          <i
                            className="bar-against"
                            style={{
                              height: `${Math.max(7, (game.against / maxGoals) * 100)}%`,
                              animationDelay: `${index * 90 + 80}ms`,
                            }}
                            title={`${game.against} gol subiti`}
                          />
                        </div>
                        <b>
                          {game.for}–{game.against}
                        </b>
                        <span title={game.name}>{game.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="chart-legend">
                    <span>
                      <i />
                      {' Gol fatti'}
                    </span>
                    <span>
                      <i />
                      {' Gol subiti'}
                    </span>
                    <small>DAL PIÙ VECCHIO AL PIÙ RECENTE →</small>
                  </div>
                </Reveal>
              </div>
              <Reveal>
                <div className="signal-grid">
                  <div className="signal">
                    <span className="signal-icon">
                      <Crosshair size={22} />
                    </span>
                    <div>
                      <span>FINALIZZATORE</span>
                      <strong>{topScorer?.name || '—'}</strong>
                      <p>
                        {topScorer?.goals || 0}
                        {' gol · '}
                        {Math.round(
                          (toNumber(topScorer?.goals) /
                            Math.max(1, toNumber(club.goals))) *
                            100,
                        )}
                        % dei gol del club. Quando segna lui, la contabilità
                        cambia.
                      </p>
                    </div>
                  </div>
                  <div className="signal">
                    <span className="signal-icon">
                      <Target size={22} />
                    </span>
                    <div>
                      <span>UOMO ASSIST</span>
                      <strong>{topAssister?.name || '—'}</strong>
                      <p>
                        {topAssister?.assists || 0}
                        {' assist in '}
                        {topAssister?.gamesPlayed || 0}
                        {' gare · '}
                        {ratio(topAssister?.assists, topAssister?.gamesPlayed)}
                        {' a partita.'}
                      </p>
                    </div>
                  </div>
                  <div className="signal">
                    <span className="signal-icon">
                      <Activity size={22} />
                    </span>
                    <div>
                      <span>PIÙ PRECISO NEI PASSAGGI</span>
                      <strong>{topPasser?.name || '—'}</strong>
                      <p>
                        {topPasser?.passSuccessRate || 0}% di passaggi riusciti
                        tra chi ha almeno 10 presenze. Campione minimo
                        dichiarato.
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </section>
          </details>
        </section>
        <PerformanceGrades
          members={data.members.members}
          matches={data.matchHistory || recentMatches}
        />
        <section className="content squad" id="rosa">
          <div className="section-head">
            <div>
              <span className="overline">03 / LA ROSA</span>
              <h2>La classifica dei Pro.</h2>
              <p className="sub">
                Tutti i profili EA in un colpo d’occhio. La graduatoria segue
                gol + assist stagionali; apri un giocatore per la figurina, la
                pagella e il ritratto della sua stagione, più ricco man mano che
                aumentano le presenze.
              </p>
            </div>
            <div className="count">
              {String(sortedMembers.length).padStart(2, '0')}{' '}
              <small>PROFILI EA</small>
            </div>
          </div>
          <div className="leaderboard-head">
            <span>LEADERBOARD · STAGIONE 2026/27</span>
            <span>GOL + ASSIST</span>
          </div>
          <div className="leader-list">
            {cards.map(({ member, profile }, index) => (
              <button
                key={member.name}
                className="leader-entry"
                onClick={() => setSelectedName(member.name)}
                aria-label={`Posizione ${index + 1}, ${member.name}, ${toNumber(member.goals) + toNumber(member.assists)} gol più assist. Apri la pagella`}
              >
                <span className="leader-entry-rank">
                  #{String(index + 1).padStart(2, '0')}
                </span>
                <span
                  className={`leader-mini-card ${profile.tier} ${profile.hot ? 'on-fire' : ''}`}
                  aria-hidden="true"
                >
                  <span>{formatProOverall(member)}</span>
                </span>
                <span className="leader-entry-name">
                  <strong>{member.name}</strong>
                  <small>
                    {profile.label}
                    {' · '}
                    {member.gamesPlayed}
                    {' PRESENZE'}
                    {profile.basis === 'season' ? ' · INDICE STAGIONALE' : ''}
                    {profile.hot ? ' · ON FIRE' : ''}
                  </small>
                </span>
                <span className="leader-entry-breakdown">
                  <b>
                    {member.goals}
                    {' G'}
                  </b>
                  <b>
                    {member.assists}
                    {' A'}
                  </b>
                </span>
                <span className="leader-entry-total">
                  <strong>
                    {toNumber(member.goals) + toNumber(member.assists)}
                  </strong>
                  <small>G + A</small>
                </span>
                <ArrowUpRight className="leader-arrow" size={17} />
              </button>
            ))}
          </div>
          <p className="role-note">
            Classifica sui gol + assist stagionali EA, considerando tutti i
            ruoli. Il numero grande della figurina è l'overall del Pro fornito
            da EA: misura l'avatar, non il rendimento del giocatore. Colore e
            indice di forma sono valutazioni del sito sulle gare recenti nel
            ruolo indicato. Se mancano gare recenti, il colore usa i totali
            stagionali di tutti i ruoli; chi non ha presenze resta non
            classificato.
          </p>
          {selectedCard && (
            <div
              className="card-dialog-backdrop"
              onMouseDown={(event) => {
                event.target === event.currentTarget && setSelectedName(null);
              }}
            >
              <div
                className="card-dialog"
                role="dialog"
                aria-modal="true"
                aria-label={`Pagella di ${selectedCard.member.name}`}
              >
                <button
                  className="dialog-close"
                  onClick={() => setSelectedName(null)}
                  aria-label="Chiudi la pagella"
                >
                  ×
                </button>
                <div className="dialog-card">
                  <CollectorCard
                    member={selectedCard.member}
                    profile={selectedCard.profile}
                    onClick={() => {}}
                  />
                </div>
                <div className="dialog-copy">
                  <span className="overline">
                    {'PAGELLA / '}
                    {selectedCard.profile.label}
                    {' / '}
                    {selectedCard.profile.tier.toUpperCase()}
                  </span>
                  <h3>{selectedCard.member.name}</h3>
                  <div className="form-grade">
                    <b>
                      {selectedCard.profile.basis === 'none'
                        ? '—'
                        : selectedCard.profile.score}
                    </b>
                    <span>
                      {selectedCard.profile.basis === 'season'
                        ? 'INDICE STAGIONALE'
                        : 'INDICE DI FORMA'}
                      {' · '}
                      {selectedCard.profile.tier.toUpperCase()}
                      {selectedCard.profile.hot ? ' · ON FIRE' : ''}
                      <small>
                        {selectedCard.profile.basis === 'season'
                          ? `${selectedCard.member.gamesPlayed} presenze stagionali in tutti i ruoli; assente dalle cinque gare recenti disponibili.`
                          : `${selectedCard.profile.games} presenze nel reparto; ultime tre: media ${selectedCard.profile.recentRating.toFixed(1)}, ${selectedCard.profile.recentContrib} gol + assist.`}
                      </small>
                    </span>
                  </div>
                  <SeasonProfile
                    member={selectedCard.member}
                    players={sortedMembers}
                    recent={selectedCard.profile}
                  />
                  <small>
                    {
                      "L'indice di forma e il colore sono valutazioni del sito. Il numero grande sulla figurina è invece l'overall del Pro fornito da EA: "
                    }
                    {formatProOverall(selectedCard.member)}.
                  </small>
                </div>
              </div>
            </div>
          )}
        </section>
        <MatchLab matches={recentMatches} />
        <details className="compact-appendix match-archive">
          <summary>Archivio rapido · tabellini di campionato</summary>
          <section className="content matches" id="partite">
            <div className="section-head">
              <div>
                <span className="overline">04 / MATCH CENTER</span>
                <h2>Ultime dal campo.</h2>
                <p className="sub">
                  Campionato, dalla più recente. Apri una gara per le
                  prestazioni dei Pro.
                </p>
              </div>
              <a
                className="source"
                href={
                  EA_CLUBS_URL +
                  '/match-history?clubId=70375&platform=common-gen5'
                }
                target="_blank"
                rel="noreferrer"
              >
                {'Fonte EA '}
                <ArrowUpRight size={16} />
              </a>
            </div>
            <div className="match-list">
              {recentMatches.map((match, matchIndex) => {
                let own = match.clubs[70375],
                  opponent = Object.entries(match.clubs).find(
                    ([clubId]) => clubId !== '70375',
                  )?.[1],
                  players = Object.values(match.players?.['70375'] || {}),
                  outcome =
                    toNumber(own.goals) > toNumber(own.goalsAgainst)
                      ? 'VITTORIA'
                      : toNumber(own.goals) < toNumber(own.goalsAgainst)
                        ? 'SCONFITTA'
                        : 'PAREGGIO';
                return (
                  <details key={match.matchId} className="match">
                    <summary>
                      <span className="match-index">0{matchIndex + 1}</span>
                      <span className={'outcome ' + outcome}>{outcome}</span>
                      <strong>
                        {'BILLOCCHI CLUB '}
                        <b>
                          {own.goals}
                          {' — '}
                          {opponent?.goals}
                        </b>{' '}
                        {opponent?.details?.name || 'Avversario'}
                      </strong>
                      <time>
                        {new Date(
                          toNumber(match.timestamp) * 1e3,
                        ).toLocaleDateString('it-IT', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </time>
                      <ChevronDown size={18} />
                    </summary>
                    <div className="match-detail">
                      <div className="match-mini">
                        <span>
                          <b>
                            {players.reduce(
                              (total, player) => total + toNumber(player.goals),
                              0,
                            )}
                          </b>
                          {' GOL DEI PRO'}
                        </span>
                        <span>
                          <b>
                            {players.reduce(
                              (total, player) =>
                                total + toNumber(player.assists),
                              0,
                            )}
                          </b>
                          {' ASSIST'}
                        </span>
                        <span>
                          <b>{players.length}</b>
                          {' PRO IN CAMPO'}
                        </span>
                      </div>
                      <div className="match-players">
                        {players.map((player, playerIndex) => (
                          <div key={playerIndex}>
                            <strong>{player.playername}</strong>
                            <span>{player.pos}</span>
                            <b>
                              {player.goals}
                              {' G · '}
                              {player.assists}
                              {' A'}
                            </b>
                            <em>{player.rating}</em>
                          </div>
                        ))}
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          </section>
        </details>
      </main>
      <footer>
        <img className="site-logo" src="/logo-billocchi.svg" alt="" />
        <strong>BILLOCCHI CLUB · FC 27</strong>
        <p>
          Dati EA SPORTS FC Clubs. Sincronizzazione salvata ogni settimana;
          verifica sul sito ogni 60 secondi durante la visita.
          <br />
          {connection === 'yes' && lastSync
            ? `Lettura EA completa: ${new Date(lastSync).toLocaleString('it-IT')}`
            : connection === 'partial' && lastSync
              ? `Lettura parziale: ${new Date(lastSync).toLocaleString('it-IT')}. Aggiornati: ${freshKeys
                  .map(
                    (key) =>
                      ({
                        club: 'club',
                        members: 'giocatori',
                        matches: 'partite',
                        membersCore: 'gol, assist e presenze dei giocatori',
                      })[key] || key,
                  )
                  .join(
                    ', ',
                  )}; gli altri dati restano alla rilevazione del ${new Date(data.capturedAt).toLocaleString('it-IT')}.`
              : `Ultima rilevazione EA: ${new Date(data.capturedAt).toLocaleString('it-IT')}. Il server EA limita la connessione diretta; i dati vengono sincronizzati periodicamente.`}
        </p>
        <a
          href={EA_CLUBS_URL + '/overview?clubId=70375&platform=common-gen5'}
          target="_blank"
          rel="noreferrer"
        >
          {'Profilo EA '}
          <ArrowUpRight size={14} />
        </a>
      </footer>
    </div>
  );
}
export { App as default };
