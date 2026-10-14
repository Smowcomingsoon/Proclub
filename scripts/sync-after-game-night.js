// Automatic game-night sync: poll EA, publish only after 30 quiet minutes.
// Uses the EA FC endpoint already configured in server.js. No fabricated match data.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const BASE = process.env.EA_BASE_URL || 'https://proclubs.ea.com/api/fc';
const PLATFORM = process.env.EA_PLATFORM || 'common-gen5';
const CLUB_ID = process.env.EA_CLUB_ID || '294157';
const QUIET_MINUTES = Number(process.env.QUIET_MINUTES || 30);
const STATE = path.join(__dirname, '..', 'data', 'sync-state.json');
const DEST = path.join(__dirname, '..', 'data');
const routes = {
  overall: ['clubs/overallStats', {platform:PLATFORM,clubIds:CLUB_ID}],
  members: ['members/stats', {platform:PLATFORM,clubId:CLUB_ID}],
  career: ['members/career/stats', {platform:PLATFORM,clubId:CLUB_ID}],
};
const now = new Date();
const readJson = (p, fallback) => { try { return JSON.parse(fs.readFileSync(p,'utf8')); } catch { return fallback; } };
const writeJson = (p, v) => fs.writeFileSync(p, JSON.stringify(v,null,2)+'\n');
const hash = x => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const state = readJson(STATE, {pending:null,lastPublishedAt:null,lastError:null});
const headers = {'Accept':'application/json','User-Agent':'BillocchiClubSync/1.0'};
async function readEA([endpoint, params]) {
  const url = new URL(BASE.replace(/\/$/,'')+'/'+endpoint);
  for (const [key,value] of Object.entries(params)) url.searchParams.set(key,value);
  const response = await fetch(url, {headers,signal:AbortSignal.timeout(20000)});
  if (!response.ok) throw new Error('EA '+endpoint+' HTTP '+response.status);
  return response.json();
}
function validate(payload) {
  const overall = Array.isArray(payload.overall) ? payload.overall[0] : null;
  if (!overall || String(overall.clubId)!==CLUB_ID || !Number.isFinite(Number(overall.gamesPlayed))) throw new Error('Invalid club stats or unexpected club ID');
  if (!payload.members || !Array.isArray(payload.members.members) || !payload.members.members.length) throw new Error('Invalid/empty member statistics');
  if (!payload.career || !Array.isArray(payload.career.members)) throw new Error('Invalid career statistics');
  return Number(overall.gamesPlayed);
}
async function main(){
 try {
   const entries = await Promise.all(Object.entries(routes).map(async ([k,request]) => [k,await readEA(request)]));
   const payload = Object.fromEntries(entries);
   const count = validate(payload);
   const published = Object.fromEntries(Object.keys(routes).map(k=>[k,readJson(path.join(DEST,k+'.json'),null)]));
   const currentHash = hash(payload);
   if (hash(published) === currentHash) {
     state.pending = null;
     state.lastError = null;
     writeJson(STATE,state);
     console.log('EA data unchanged: no update.');
     return;
   }
   const pending = state.pending;
   if (!pending || pending.hash!==currentHash) {
     // First detection, or another change: reset quiet period.
     state.pending = {hash:currentHash,firstSeenAt:now.toISOString(),gamesPlayed:count};
     state.lastError = null;
     writeJson(STATE,state);
     console.log('Change detected. Awaiting '+QUIET_MINUTES+' quiet minutes.');
     return;
   }
   if (now.getTime()-new Date(pending.firstSeenAt).getTime() < QUIET_MINUTES*60000) {
     console.log('Waiting for quiet period.');return;
   }
   // Only publish stable, validated data; no partial snapshots.
   for (const key of Object.keys(routes)) writeJson(path.join(DEST,key+'.json'),payload[key]);
   state.pending = null;
   state.lastPublishedAt = now.toISOString();
   state.publishedGamesPlayed = count;
   state.lastError = null;
   writeJson(STATE,state);
   console.log('Published stable club snapshot, games played: '+count);
 } catch(err) {
   state.lastError = {at:now.toISOString(),message:String(err.message)};
   writeJson(STATE,state);
   console.error('Sync failed; published stats unchanged:',err.message);
   process.exitCode=1;
 }
}
main();
