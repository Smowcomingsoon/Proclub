const fs = require('node:fs');
const path = require('node:path');
const BASE = 'https://proclubs.ea.com/api/fc';
const PLATFORM = process.env.EA_PLATFORM || 'common-gen5';
const CLUB_ID = process.env.EA_CLUB_ID || '70375';
const FILE = path.join(__dirname, '..', 'data', 'data.json');
const MAX_HISTORY = 300;
const headers = {Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36', Referer: 'https://www.ea.com/'};
async function ea(endpoint, params) {
  const url = new URL(`${BASE}/${endpoint}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, {headers, signal: AbortSignal.timeout(20000)});
  if (!res.ok) throw new Error(`EA ${endpoint} HTTP ${res.status}`);
  return res.json();
}
(async () => {
  const old = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const [club, members, matches] = await Promise.all([
    ea('clubs/overallStats', {platform: PLATFORM, clubIds: CLUB_ID}),
    ea('members/stats', {platform: PLATFORM, clubId: CLUB_ID}),
    ea('clubs/matches', {platform: PLATFORM, clubIds: CLUB_ID, matchType: 'leagueMatch', maxResultCount: 5}),
  ]);
  if (!Array.isArray(club) || String(club[0]?.clubId) !== CLUB_ID) throw new Error('Unexpected club stats');
  if (!Array.isArray(members?.members) || !members.members.length) throw new Error('Empty members');
  if (!Array.isArray(matches)) throw new Error('Unexpected matches');
  const seen = new Set(old.matchHistory.map(m => String(m.matchId)));
  const fresh = matches.filter(m => !seen.has(String(m.matchId)));
  const matchHistory = [...fresh, ...old.matchHistory]
    .sort((a, b) => b.timestamp - a.timestamp).slice(0, MAX_HISTORY);
  const next = {club, members, matches, matchHistory, capturedAt: old.capturedAt, fresh: []};
  const changed = JSON.stringify({...next, capturedAt: 0}) !== JSON.stringify({...old, capturedAt: 0});
  if (!changed) return console.log('Nessuna novità.');
  next.capturedAt = new Date().toISOString();
  fs.writeFileSync(FILE, JSON.stringify(next));
  fs.copyFileSync(FILE, path.join(__dirname, '..', 'site', 'data.json'));
  console.log(`Aggiornato: ${fresh.length} nuove partite.`);
})().catch(e => { console.error(e.message); process.exit(1); });
