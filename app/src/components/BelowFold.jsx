import { useEffect } from 'react';
import { MatchArchive } from './MatchArchive.jsx';
import { MatchLab } from './MatchLab.jsx';
import { Overview } from './Overview.jsx';
import { PerformanceGrades } from './PerformanceGrades.jsx';
import { Squad } from './Squad.jsx';

/**
 * Sezioni sotto la piega (dopo "Il giorno dopo"): caricate in un chunk a parte.
 * `onReady` avvisa la navigazione di sezione, che deve ricalcolare ancore e fade-in.
 */
export default function BelowFold({
  data,
  club,
  members,
  sortedMembers,
  matches,
  matchHistory,
  refresh,
  refreshing,
  onReady,
}) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return (
    <>
      <Overview
        data={data}
        club={club}
        members={sortedMembers}
        matches={matches}
        refresh={refresh}
        refreshing={refreshing}
      />
      <PerformanceGrades members={members} matches={matchHistory} />
      <Squad data={data} members={sortedMembers} matches={matches} />
      <MatchLab data={data} matches={matches} />
      <MatchArchive matches={matches} />
    </>
  );
}
