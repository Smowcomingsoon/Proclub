export const CLUB_ID = '70375';
const num = v => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const sum = (a, f) => a.reduce((s, x) => s + f(x), 0);
const mean = a => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);
const median = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const std = a => { if (a.length < 2) return null; const m = mean(a); return Math.sqrt(mean(a.map(x => (x - m) ** 2))); };
const pct = (a, b) => (b > 0 ? (a / b) * 100 : null);
const per = (a, b, k = 1) => (b > 0 ? (a / b) * k : null);

export function slope(values) {
  const n = values.length;
  if (n < 3) return null;
  const mx = (n - 1) / 2, my = mean(values);
  let c = 0, v = 0;
  values.forEach((y, i) => { c += (i - mx) * (y - my); v += (i - mx) ** 2; });
  return c / v;
}

export function appearancesFor(history, name, clubId = CLUB_ID) {
  const out = [];
  for (const m of [...history].sort((a, b) => a.timestamp - b.timestamp)) {
    const players = Object.values(m.players?.[clubId] || {});
    const row = players.find(p => p.playername === name);
    if (!row) continue;
    const c = m.clubs?.[clubId] || {};
    const maxRt = Math.max(1, ...players.map(p => num(p.realtimegame)));
    const gf = num(c.goals), ga = num(c.goalsAgainst);
    out.push({
      matchId: String(m.matchId), timestamp: m.timestamp, pos: row.pos,
      rating: num(row.rating), goals: num(row.goals), assists: num(row.assists), shots: num(row.shots),
      passAtt: num(row.passattempts), passOk: num(row.passesmade),
      tackAtt: num(row.tackleattempts), tackOk: num(row.tacklesmade),
      saves: num(row.saves), conceded: num(row.goalsconceded), cleanSheet: num(row.cleansheetsany) > 0,
      mom: num(row.mom) > 0, red: num(row.redcards),
      minutes: Math.min(90, Math.round(90 * num(row.realtimegame) / maxRt)),
      gf, ga, result: gf > ga ? 'V' : gf < ga ? 'S' : 'P',
    });
  }
  return out;
}

export function computeMetrics(member, appearances, ctx = {}) {
  const g = num(member.gamesPlayed), goals = num(member.goals), assists = num(member.assists);
  const rating = num(member.ratingAve);
  const passPct = num(member.passSuccessRate), passMade = num(member.passesMade);
  const passAtt = passPct ? Math.round(passMade / (passPct / 100)) : 0;
  const tackOk = num(member.tacklesMade), tackPct = num(member.tackleSuccessRate);
  const tackAtt = tackPct ? Math.round(tackOk / (tackPct / 100)) : 0;
  const m = {
    name: member.name, games: g, goals, assists, ga: goals + assists, rating, overall: num(member.proOverall),
    position: member.favoritePosition || '',
    goalsPerGame: per(goals, g), assistsPerGame: per(assists, g), gaPerGame: per(goals + assists, g),
    passPct: passPct || null, passAttPerGame: per(passAtt, g), passFailedPerGame: per(passAtt - passMade, g),
    passFailedTotal: Math.max(0, passAtt - passMade),
    tackPct: tackPct || null, tackAttPerGame: per(tackAtt, g), tackFailedPerGame: per(tackAtt - tackOk, g),
    shotSuccessPct: num(member.shotSuccessRate) || null,
    motmRate: pct(num(member.manOfTheMatch), g), motm: num(member.manOfTheMatch),
    redCards: num(member.redCards), redPerGame: per(num(member.redCards), g),
    winPct: num(member.winRate) || null,
    cleanSheets: num(member.cleanSheetsDef) + num(member.cleanSheetsGK),
    shareOfClubGoals: ctx.clubGoals ? pct(goals, ctx.clubGoals) : null,
    shareOfClubGA: ctx.clubGoals ? pct(goals + assists, ctx.clubGoals) : null,
    ratingVsClubMedian: ctx.medianRating != null && rating ? rating - ctx.medianRating : null,
    ratingVsOverall: member.proOverall && rating ? rating - num(member.proOverall) / 10 : null,
  };
  const prev = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => num(member[i ? `prevGoals${i}` : 'prevGoals']));
  m.recentGoalsLast5 = sum(prev.slice(0, 5), x => x);
  const a = appearances;
  m.sample = a.length;
  if (!a.length) return m;
  const posCount = {};
  a.forEach(x => { posCount[x.pos] = (posCount[x.pos] || 0) + 1; });
  m.playedPos = Object.entries(posCount).sort((x, y) => y[1] - x[1])[0][0];
  const ratings = a.map(x => x.rating).filter(Boolean);
  const mins = sum(a, x => x.minutes);
  const wins = a.filter(x => x.result === 'V'), nonWins = a.filter(x => x.result !== 'V'), losses = a.filter(x => x.result === 'S');
  Object.assign(m, {
    minutes: mins,
    goalsPer90: per(sum(a, x => x.goals), mins, 90), assistsPer90: per(sum(a, x => x.assists), mins, 90),
    shotsPerGame: mean(a.map(x => x.shots)), shotsTotal: sum(a, x => x.shots),
    conversionPct: pct(sum(a, x => x.goals), sum(a, x => x.shots)),
    shotsPerGoal: per(sum(a, x => x.shots), sum(a, x => x.goals)),
    recentPassPct: pct(sum(a, x => x.passOk), sum(a, x => x.passAtt)),
    recentPassFailedPerGame: mean(a.map(x => x.passAtt - x.passOk)),
    worstPassPct: Math.min(...a.filter(x => x.passAtt >= 10).map(x => pct(x.passOk, x.passAtt)), 100),
    recentTackPct: pct(sum(a, x => x.tackOk), sum(a, x => x.tackAtt)),
    ratingMean: mean(ratings), ratingMedian: median(ratings), ratingStd: std(ratings),
    ratingMin: ratings.length ? Math.min(...ratings) : null, ratingMax: ratings.length ? Math.max(...ratings) : null,
    below65: ratings.filter(r => r < 6.5).length, below7: ratings.filter(r => r < 7).length, above8: ratings.filter(r => r >= 8).length,
    below65Share: pct(ratings.filter(r => r < 6.5).length, ratings.length),
    trend: slope(ratings),
    form5: mean(ratings.slice(-5)), formBefore: ratings.length > 5 ? mean(ratings.slice(0, -5)) : null,
    ratingInWins: mean(wins.map(x => x.rating).filter(Boolean)),
    ratingNotWin: mean(nonWins.map(x => x.rating).filter(Boolean)),
    ratingInLosses: mean(losses.map(x => x.rating).filter(Boolean)),
    blankGames: a.filter(x => !x.goals && !x.assists).length,
    blankShare: pct(a.filter(x => !x.goals && !x.assists).length, a.length),
    concededPerGameOn: mean(a.map(x => x.ga)), cleanSheetGames: a.filter(x => x.ga === 0).length,
    pointsPerGame: per(sum(a, x => (x.result === 'V' ? 3 : x.result === 'P' ? 1 : 0)), a.length),
    clubWinPctWith: pct(wins.length, a.length),
    savesTotal: sum(a, x => x.saves),
    savePct: pct(sum(a, x => x.saves), sum(a, x => x.saves) + sum(a, x => x.conceded)),
    momRecent: a.filter(x => x.mom).length,
  });
  let streak = 0;
  for (let i = a.length - 1; i >= 0 && !a[i].goals && !a[i].assists; i--) streak++;
  m.dryStreak = streak;
  m.passFailedSeasonTotal = m.passFailedTotal;
  return m;
}

export function buildAll(data, clubId = CLUB_ID) {
  const members = data.members.members;
  const club = data.club[0];
  const medianRating = median(members.filter(x => num(x.gamesPlayed) >= 10).map(x => num(x.ratingAve)).filter(Boolean));
  const ctx = {clubGoals: num(club.goals), medianRating};
  return members.map(mem => computeMetrics(mem, appearancesFor(data.matchHistory, mem.name, clubId), ctx));
}
