const fs = require('node:fs');
const path = require('node:path');
const BASE = 'https://proclubs.ea.com/api/fc';
const PLATFORM = process.env.EA_PLATFORM || 'common-gen5';
const CLUB_ID = process.env.EA_CLUB_ID || '70375';
const MAX_HISTORY = 300;
const headers = {Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36', Referer: 'https://www.ea.com/'};

async function ea(endpoint, params) {
  const url = new URL(`${BASE}/${endpoint}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, {headers, signal: AbortSignal.timeout(8000)});
  if (!res.ok) throw new Error(`EA ${endpoint} HTTP ${res.status}`);
  return res.json();
}

module.exports = async (req, res) => {
  const stored = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'data.json'), 'utf8'));
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    const [club, members, matches] = await Promise.all([
      ea('clubs/overallStats', {platform: PLATFORM, clubIds: CLUB_ID}),
      ea('members/stats', {platform: PLATFORM, clubId: CLUB_ID}),
      ea('clubs/matches', {platform: PLATFORM, clubIds: CLUB_ID, matchType: 'leagueMatch', maxResultCount: 5}),
    ]);
    if (!Array.isArray(club) || String(club[0]?.clubId) !== CLUB_ID || !Array.isArray(members?.members) || !members.members.length || !Array.isArray(matches)) throw new Error('Risposta EA non valida');
    const seen = new Set(stored.matchHistory.map(m => String(m.matchId)));
    const fresh = matches.filter(m => !seen.has(String(m.matchId)));
    const matchHistory = [...fresh, ...stored.matchHistory].sort((a, b) => b.timestamp - a.timestamp).slice(0, MAX_HISTORY);
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).send(JSON.stringify({club, members, matches, matchHistory, capturedAt: new Date().toISOString(), fresh: []}));
  } catch (err) {
    res.setHeader('Cache-Control', 's-maxage=30');
    res.status(200).send(JSON.stringify(stored));
  }
};
