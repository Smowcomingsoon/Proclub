import { useMemo } from 'react';
import { DayAfter } from './components/DayAfter.jsx';
import { MatchArchive } from './components/MatchArchive.jsx';
import { MatchLab } from './components/MatchLab.jsx';
import { Overview } from './components/Overview.jsx';
import { PerformanceGrades } from './components/PerformanceGrades.jsx';
import { SiteFooter } from './components/SiteFooter.jsx';
import { SiteHeader } from './components/SiteHeader.jsx';
import { Squad } from './components/Squad.jsx';
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
  const club = data.club[0];
  const recentMatches = data.matches || [];
  const sortedMembers = useMemo(
    () => sortMembers(data.members.members),
    [data],
  );
  return (
    <div className="site">
      <SiteHeader connection={connection} />
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
