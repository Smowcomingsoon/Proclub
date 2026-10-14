import { useMemo, useState } from 'react';
import { assignQuotes, toQuotePlayer } from '../lib/adani-quotes.js';
import { groupByNight, summarizeNight } from '../lib/matches.js';
import {
  buildCover,
  buildRoleTrend,
  buildShareText,
  buildTrials,
  buildTurningPoints,
} from '../lib/newsroom.js';
import { buildSeasonProfile } from '../lib/season-profile.js';
import { CoverStory } from './day-after/CoverStory.jsx';
import { EditionBar } from './day-after/EditionBar.jsx';
import { Masthead } from './day-after/Masthead.jsx';
import { NightResults } from './day-after/NightResults.jsx';
import { Notebook } from './day-after/Notebook.jsx';
import { SeasonNovel } from './day-after/SeasonNovel.jsx';
import { Trials } from './day-after/Trials.jsx';
import { TurningPoints } from './day-after/TurningPoints.jsx';

/**
 * "Il giorno dopo": la gazzetta della serata scelta (copertina, svolte, processo
 * ai Pro, romanzo della stagione). `matches` è lo storico partite disponibile.
 */
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
  const shareText = buildShareText({
    night: selectedNight,
    nightStats,
    cover,
    trials,
  });
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
      <EditionBar
        nights={nights}
        selectedNight={selectedNight}
        setCopyState={setCopyState}
        setNightChoice={setNightChoice}
      />
      <Masthead />
      <div className="paper-nav">
        <a href="#processo">Il processo del pallone</a>
        <a href="#svolte">Le svolte della notte</a>
        <a href="#romanzo">Il romanzo dei Pro</a>
        <a href="#voti">I voti</a>
      </div>
      {selectedNight ? (
        <>
          <CoverStory
            cover={cover}
            coverPlayer={coverPlayer}
            nightStats={nightStats}
            selectedNight={selectedNight}
          />
          <NightResults nightStats={nightStats} selectedNight={selectedNight} />
          <TurningPoints turningPoints={turningPoints} />
          <Trials
            nightQuotes={nightQuotes}
            nightStats={nightStats}
            trials={trials}
          />
          <Notebook
            copyEdition={copyEdition}
            copyState={copyState}
            nightStats={nightStats}
            topAssister={topAssister}
            topScorer={topScorer}
          />
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
        <SeasonNovel
          members={members}
          protagonist={protagonist}
          roleTrend={roleTrend}
          seasonProfile={seasonProfile}
          seasonQuotes={seasonQuotes}
          setProtagonistChoice={setProtagonistChoice}
        />
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
