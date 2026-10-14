import { BookOpen, Check, Copy, Newspaper, Quote, Trophy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AdaniComment } from './AdaniComment.jsx';
import { assignQuotes, toQuotePlayer } from '../lib/adani-quotes.js';
import {
  formatLongDate,
  formatMatchTime,
  formatRating,
  formatScore,
} from '../lib/format.js';
import {
  getOpponentName,
  getResultLetter,
  groupByNight,
  summarizeNight,
} from '../lib/matches.js';
import {
  buildCover,
  buildRoleTrend,
  buildTrial,
  buildTrials,
  buildTurningPoints,
} from '../lib/newsroom.js';
import { POSITION_ABBREVIATIONS } from '../lib/positions.js';
import { buildSeasonProfile } from '../lib/season-profile.js';
import { toFiniteNumber } from '../lib/stats.js';

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

export function DayAfter({ members, matches }) {
  const nights = useMemo(() => groupByNight(matches), [matches]);
  const [nightChoice, setNightChoice] = useState('');
  const [protagonistChoice, setProtagonistChoice] = useState('');
  const [copyState, setCopyState] = useState('');
  const selectedNight =
    nights.find((night) => night.day === nightChoice) || nights[0];
  const nightStats = useMemo(
    () => summarizeNight(selectedNight?.games || []),
    [selectedNight],
  );
  const trials = buildTrials(nightStats.players, selectedNight?.day || '');
  const cover = buildCover(
    nightStats.players,
    nightStats.winners,
    nightStats.goals,
    selectedNight?.day,
  );
  const turningPoints = buildTurningPoints(selectedNight?.games || []);
  const coverPlayer =
    nightStats.winners[0] ||
    nightStats.players.find((player) => player.name === cover.name);
  const nightQuotes = assignQuotes(
    nightStats.players,
    selectedNight?.day || '',
  );
  const seasonQuotes = assignQuotes(members.map(toQuotePlayer), 'stagione');
  const protagonist =
    members.find((member) => member.name === protagonistChoice) ||
    members.find(
      (member) => member.name.toLowerCase() === coverPlayer?.name.toLowerCase(),
    ) ||
    members[0];
  const roleTrend = protagonist
    ? buildRoleTrend(protagonist.name, matches)
    : null;
  const seasonProfile = protagonist
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
    : null;
  const shareText = selectedNight
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
  const topScorer = [...nightStats.players].sort(
    (a, b) => b.goals - a.goals,
  )[0];
  const topAssister = [...nightStats.players].sort(
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
                const isCoverPro = nightStats.winners.some(
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
