import test from 'node:test';
import assert from 'node:assert';
import {readFileSync} from 'node:fs';
import {buildAll} from '../shared/metrics.mjs';
import {commentFor} from '../shared/commentary.mjs';
const data = JSON.parse(readFileSync(new URL('../data/data.json', import.meta.url)));
const all = buildAll(data);

test('metriche calcolate per tutti i Pro', () => {
  assert.strictEqual(all.length, data.members.members.length);
  const g = all.find(x => x.name === 'garrus92');
  assert.ok(g.gaPerGame > 1 && g.passFailedPerGame > 0 && g.ratingStd != null);
});
test('nessun elogio sotto 8 di media', () => {
  for (const m of all) if (m.rating < 8) assert.strictEqual(commentFor(m).praise, null, m.name);
});
test('elogio con media sopra 8', () => {
  for (const m of all) if (m.rating >= 8 && m.games >= 3) assert.ok(commentFor(m).praise, m.name);
});
test('media sotto 6.5 bocciata', () => {
  const c = commentFor({name: 'x', games: 6, rating: 6.1, passPct: 67, passFailedPerGame: 9, position: 'midfielder', sample: 0});
  assert.strictEqual(c.tier, 'bocciato');
  assert.match(c.charge, /insufficiente|Passaggi/);
  assert.strictEqual(c.praise, null);
});
