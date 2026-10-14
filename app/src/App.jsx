import {
  Activity,
  ArrowUpRight,
  ChevronDown,
  Crosshair,
  RefreshCw,
  ScanLine,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CollectorCard } from './components/CollectorCard.jsx';
import { CountUp } from './components/CountUp.jsx';
import { DayAfter } from './components/DayAfter.jsx';
import { MatchLab } from './components/MatchLab.jsx';
import { PerformanceGrades } from './components/PerformanceGrades.jsx';
import { Reveal } from './components/Reveal.jsx';
import { SeasonProfile } from './components/SeasonProfile.jsx';
import { SectionNav } from './components/SectionNav.jsx';
import { computeCardProfile } from './lib/card-profile.js';
import { CLUB_ID, EA_CLUBS_URL } from './lib/constants.js';
import { fallbackData } from './lib/data.js';
import { formatProOverall } from './lib/format.js';
import { ratio, toNumber } from './lib/stats.js';

function App() {
  const [data, setData] = useState(fallbackData);
  const [connection, setConnection] = useState('loading');
  const [freshKeys, setFreshKeys] = useState([]);
  const [lastSync, setLastSync] = useState();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedName, setSelectedName] = useState(null);
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/data', {
        cache: 'no-store',
      });
      if (!response.ok) throw Error();
      const payload = await response.json();
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
    const interval = setInterval(refresh, 6e4);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh]);
  const club = data.club[0];
  const recentMatches = data.matches || [];
  const sortedMembers = useMemo(
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
  );
  const cards = sortedMembers.map((sortedMember) => ({
    member: sortedMember,
    profile: computeCardProfile(sortedMember, recentMatches),
  }));
  const selectedCard = cards.find((card) => card.member.name === selectedName);
  useEffect(() => {
    if (!selectedName) return;
    const onKeyDown = (event) => {
      event.key === 'Escape' && setSelectedName(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedName]);
  data.members.members.filter((member) => toNumber(member.gamesPlayed) > 0)
    .length;
  const wins = toNumber(club.wins);
  const ties = toNumber(club.ties);
  const losses = toNumber(club.losses);
  const gamesPlayed = toNumber(club.gamesPlayed);
  const form = recentMatches.map((match) => {
    const own = match.clubs[CLUB_ID];
    return toNumber(own.goals) > toNumber(own.goalsAgainst)
      ? 'V'
      : toNumber(own.goals) < toNumber(own.goalsAgainst)
        ? 'S'
        : 'P';
  });
  const activeMembers = [...sortedMembers]
    .filter((sortedMember) => toNumber(sortedMember.gamesPlayed) > 0)
    .sort(
      (a, b) =>
        toNumber(b.goals) +
        toNumber(b.assists) -
        toNumber(a.goals) -
        toNumber(a.assists),
    );
  const topScorer = [...activeMembers].sort(
    (a, b) => toNumber(b.goals) - toNumber(a.goals),
  )[0];
  const topAssister = [...activeMembers].sort(
    (a, b) => toNumber(b.assists) - toNumber(a.assists),
  )[0];
  const topPasser = [...activeMembers]
    .filter((activeMember) => toNumber(activeMember.gamesPlayed) >= 10)
    .sort(
      (a, b) => toNumber(b.passSuccessRate) - toNumber(a.passSuccessRate),
    )[0];
  const recentGames = recentMatches
    .slice()
    .reverse()
    .map((match) => {
      const own = match.clubs[CLUB_ID];
      return {
        id: match.matchId,
        for: toNumber(own.goals),
        against: toNumber(own.goalsAgainst),
        name:
          Object.entries(match.clubs).find(
            ([clubId]) => clubId !== CLUB_ID,
          )?.[1]?.details?.name || 'Avversario',
      };
    });
  const goalsFor = recentGames.reduce(
    (total, recentGame) => total + recentGame.for,
    0,
  );
  const goalsAgainst = recentGames.reduce(
    (total, recentGame) => total + recentGame.against,
    0,
  );
  const maxGoals = Math.max(
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
                const own = match.clubs[CLUB_ID];
                const opponent = Object.entries(match.clubs).find(
                  ([clubId]) => clubId !== CLUB_ID,
                )?.[1];
                const players = Object.values(match.players?.[CLUB_ID] || {});
                const outcome =
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
