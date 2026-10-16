const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const lib = require('../scripts/lib');
const data = require('../data/data.json');
const source = fs.readFileSync(path.join(__dirname, '../scripts/update-data.js'), 'utf8');

async function collect({failPlayoffs = false} = {}) {
  const files = new Map([['/repo/data/data.json', JSON.stringify(data)]]);
  const incoming = {...data.matches[0], matchId: 'collector-new-match'};
  let exitCode = 0;
  const fakeFs = {
    readFileSync: file => files.get(file),
    writeFileSync: (file, content) => files.set(file, content),
  };
  await vm.runInNewContext(source, {
    require: name => name === 'node:fs' ? fakeFs : name === 'node:path' ? path : {
      ...lib, archiveMatches: () => {}, notify: async () => {},
    },
    __dirname: '/repo/scripts',
    process: {env: {}, exit: code => {exitCode = code;}},
    console: {log() {}, warn() {}, error() {}},
    URL, AbortSignal,
    setTimeout: fn => {fn();},
    fetch: async raw => {
      const url = new URL(raw);
      if (url.pathname.endsWith('/overallStats')) return {ok: true, json: async () => data.club};
      if (url.pathname.endsWith('/stats')) return {ok: true, json: async () => data.members};
      const mode = url.searchParams.get('matchType');
      if (mode === 'playoffMatch' && failPlayoffs) throw Error('EA unavailable');
      return {ok: true, json: async () => mode === 'leagueMatch' ? [incoming] : []};
    },
  });
  return {next: JSON.parse(files.get('/repo/data/data.json')), status: JSON.parse(files.get('/repo/data/sync-status.json')), exitCode};
}

test('raccolta conserva tutti i tabellini e aggiunge il nuovo una sola volta', async () => {
  const {next, status, exitCode} = await collect();
  const ids = new Set(next.matchHistory.map(m => String(m.matchId)));
  assert.equal(exitCode, 0);
  assert.equal(status.complete, true);
  for (const m of data.matchHistory) assert.ok(ids.has(String(m.matchId)));
  assert.equal(next.matchHistory.filter(m => m.matchId === 'collector-new-match').length, 1);
});

test('errore playoff conserva lo storico e i nuovi match ma segnala raccolta incompleta', async () => {
  const {next, status, exitCode} = await collect({failPlayoffs: true});
  assert.equal(exitCode, 1);
  assert.equal(status.complete, false);
  assert.match(status.failures.playoffMatch, /EA unavailable/);
  assert.ok(next.matchHistory.some(m => m.matchId === 'collector-new-match'));
  for (const m of data.matchHistory) assert.ok(next.matchHistory.some(n => n.matchId === m.matchId));
});
