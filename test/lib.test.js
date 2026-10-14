const test = require('node:test');
const assert = require('node:assert');
const {validate, mergeHistory, seasonKey} = require('../scripts/lib');
const data = require('../data/data.json');

test('validate accetta i dati attuali', () => validate(data, '70375'));
test('validate rifiuta club sbagliato', () => assert.throws(() => validate(data, '1')));
test('validate rifiuta membri vuoti', () => assert.throws(() => validate({...data, members: {members: []}}, '70375')));
test('mergeHistory evita duplicati e ordina', () => {
  const {history, fresh} = mergeHistory(data.matchHistory, [...data.matches, {matchId: 'x', timestamp: 9999999999}]);
  assert.strictEqual(fresh.length, 1);
  assert.strictEqual(history[0].matchId, 'x');
  assert.strictEqual(history.length, data.matchHistory.length + 1);
});
test('seasonKey usa il mese con taglio alle 06:00', () => assert.strictEqual(seasonKey(Date.UTC(2026, 9, 1, 3) / 1000), '2026-09'));
