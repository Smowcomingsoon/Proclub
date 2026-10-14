import { useEffect, useLayoutEffect, useMemo } from 'react';
import { DayAfter } from './components/DayAfter.jsx';
import { MatchArchive } from './components/MatchArchive.jsx';
import { MatchLab } from './components/MatchLab.jsx';
import { Overview } from './components/Overview.jsx';
import { PerformanceGrades } from './components/PerformanceGrades.jsx';
import { PlayerPage } from './components/PlayerPage.jsx';
import { SiteFooter } from './components/SiteFooter.jsx';
import { SiteHeader } from './components/SiteHeader.jsx';
import { Squad } from './components/Squad.jsx';
import { StatsPage } from './components/StatsPage.jsx';
import { useRoute } from './lib/route.js';
import { toNumber } from './lib/stats.js';
import { useClubData } from './lib/useClubData.js';

/** Rosa ordinata per gol + assist, poi gol, presenze e nome. */
const sortMembers = (members) =>
  [...members].sort(
    (a, b) =>
      toNumber(b.goals) +
        toNumber(b.assists) -
        (toNumber(a.goals) + toNumber(a.assists)) ||
      toNumber(b.goals) - toNumber(a.goals) ||
      toNumber(b.gamesPlayed) - toNumber(a.gamesPlayed) ||
      a.name.localeCompare(b.name),
  );

function App() {
  const { data, connection, freshKeys, lastSync, refreshing, refresh } =
    useClubData();
  const route = useRoute();
  const club = data.club[0];
  const playerKnown =
    route.view !== 'player' ||
    data.members.members.some(
      (member) => member.name.toLowerCase() === route.name.toLowerCase(),
    );
  const view = route.view === 'player' && !playerKnown ? 'home' : route.view;
  // Nome non valido: torna alla rosa (solo a dati live, il fallback può essere indietro).
  useEffect(() => {
    if (route.view === 'player' && !playerKnown && connection !== 'loading')
      location.replace('#rosa');
  }, [route, playerKnown, connection]);
  // Cambio vista: le pagine interne partono dall'alto; la home gestisce il proprio hash.
  useLayoutEffect(() => {
    if (view !== 'home' || !location.hash) window.scrollTo(0, 0);
  }, [view, route.name]);
  useEffect(() => {
    document.title =
      view === 'stats'
        ? 'Statistiche — BILLOCCHI CLUB'
        : view === 'player'
          ? `${data.members.members.find((m) => m.name.toLowerCase() === route.name.toLowerCase())?.name} — BILLOCCHI CLUB`
          : 'BILLOCCHI CLUB — Club Intelligence';
  }, [view, route.name, data]);
  const recentMatches = data.matches || [];
  const sortedMembers = useMemo(
    () => sortMembers(data.members.members),
    [data],
  );
  return (
    <div className="site">
      <SiteHeader connection={connection} view={view} />
      {view === 'stats' ? (
        <main className="pg-main">
          <StatsPage data={data} />
        </main>
      ) : view === 'player' ? (
        <main className="pg-main">
          <PlayerPage data={data} name={route.name} />
        </main>
      ) : (
      <main id="top">
        <DayAfter
          data={data}
          members={data.members.members}
          matches={data.matchHistory || recentMatches}
        />
        <Overview
          data={data}
          club={club}
          members={sortedMembers}
          matches={recentMatches}
          refresh={refresh}
          refreshing={refreshing}
        />
        <PerformanceGrades
          members={data.members.members}
          matches={data.matchHistory || recentMatches}
        />
        <Squad data={data} members={sortedMembers} matches={recentMatches} />
        <MatchLab data={data} matches={recentMatches} />
        <MatchArchive matches={recentMatches} />
      </main>
      )}
      <SiteFooter
        connection={connection}
        data={data}
        freshKeys={freshKeys}
        lastSync={lastSync}
      />
    </div>
  );
}

export { App as default };
