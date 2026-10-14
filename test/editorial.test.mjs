import test from 'node:test';
import assert from 'node:assert';
import {readFileSync} from 'node:fs';
import {buildAll, analyzeClub} from '../shared/metrics.mjs';
import {commentFor} from '../shared/commentary.mjs';
import {
  metricsIndex, coverEditorial, notebookEditorial, turningPointsEditorial, novelEditorial,
  clubReading, signalsEditorial, verdictFor, matchStudioEditorial, awardEditorial, awardLabel,
} from '../shared/editorial.mjs';
import {groupByNight, summarizeNight} from '../app/src/lib/matches.js';

const data = JSON.parse(readFileSync(new URL('../data/data.json', import.meta.url)));
const all = buildAll(data);
const idx = metricsIndex(all);
const club = analyzeClub(data, undefined, all);
const nights = groupByNight(data.matchHistory);
const BANNED = /ottim|eccellent|straordinar|fenomen|magnific|brillant|sorride|gioiell|spettacol|fantastic|imprendibil/i;
const nightCover = night => {
  const ns = summarizeNight(night.games);
  const record = {wins: ns.wins, draws: ns.draws, losses: ns.losses, goals: ns.goals, against: ns.against, games: night.games.length};
  return {ns, record, cover: coverEditorial({day: night.day, record, winners: ns.winners, players: ns.players, metricsByName: idx, club})};
};

test('copertina: dati reali, nessun tono celebrativo, dati citati', () => {
  assert.ok(nights.length >= 2);
  for (const night of nights) {
    const {ns, record, cover} = nightCover(night);
    const text = [cover.title, cover.deck, cover.closing, cover.balance, cover.note].join(' ');
    assert.doesNotMatch(text, BANNED, night.day);
    assert.match(cover.deck, new RegExp(`${record.goals} gol fatti e ${record.against} subiti`));
    assert.match(cover.closing, /\d/);
    const lead = ns.winners[0];
    assert.ok(cover.deck.includes(lead.name));
    assert.ok(cover.deck.includes(lead.rating.toFixed(2)));
    const sr = idx.get(lead.name.toLowerCase()).rating;
    if (sr <= 8) assert.doesNotMatch(cover.deck, /riconoscimento è dovuto|elogiare/, night.day);
    assert.match(cover.awardLabel, lead.rating >= 8 ? /MIGLIORE DELLA SERATA/ : /MODESTA/);
  }
});

test('copertina: vittoria con numeri deboli viene segnalata', () => {
  const weak = coverEditorial({
    day: '2026-01-01', record: {wins: 3, draws: 0, losses: 0, goals: 9, against: 6, games: 3}, winners: [], players: [], metricsByName: idx, club,
  });
  assert.match(weak.title, /subiti|concede|tenuta|difesa|buchi/i);
  assert.match(weak.closing, /6 gol subiti/);
});

test('copertina: migliore di una serata modesta, bocciato e picco isolato', () => {
  const player = (name, rating) => ({name, rating, games: 3, goals: 1, assists: 0, shots: 2, passes: 30, passAttempts: 40, passPct: 75, tackles: 1, tackleAttempts: 3, reds: 0, roles: ['midfielder'], saves: 0, mvp: 0});
  const rec = {wins: 2, draws: 0, losses: 1, goals: 5, against: 3, games: 3};
  const mk = (name, rating, season) => {
    const m = {...all.find(x => x.name === 'Nyveex'), name, rating: season};
    const index = new Map([[name.toLowerCase(), m]]);
    const p = player(name, rating);
    return coverEditorial({day: '2026-02-02', record: rec, winners: [p], players: [p], metricsByName: index, club}).deck;
  };
  const modest = mk('Tizio', 7.6, 7.4);
  assert.match(modest, /7\.60/);
  assert.match(modest, /modest|senza picchi|gli altri fanno peggio/);
  assert.doesNotMatch(modest, BANNED);
  const poor = mk('Caio', 7.9, 6.2);
  assert.match(poor, /bocciat/);
  assert.match(poor, /6\.20/);
  const spike = mk('Sempronio', 8.6, 7.4);
  assert.match(spike, /picco isolato/);
});

test('copertina: oltre 8 di media l\'elogio c\'è ma con un limite', () => {
  const garrus = all.find(m => m.name === 'garrus92');
  assert.ok(garrus.rating > 8);
  const p = {name: 'garrus92', rating: 8.1, games: 3, goals: 0, assists: 1, shots: 0, passes: 40, passAttempts: 50, passPct: 80, tackles: 0, tackleAttempts: 0, reds: 0, roles: ['midfielder'], saves: 0, mvp: 0};
  const c = coverEditorial({day: '2026-03-03', record: {wins: 1, draws: 0, losses: 0, goals: 2, against: 0, games: 1}, winners: [p], players: [p], metricsByName: idx, club});
  assert.match(c.deck, /8\.30/);
  assert.match(c.deck, /riserva|dovuto|riconoscere|autorizza|difetti|limite/i);
  assert.match(c.note, /Limite|limite/);
});

test('etichetta premio: sotto 8 e` una serata modesta', () => {
  assert.match(awardLabel(7.99, false), /MODESTA/);
  assert.strictEqual(awardLabel(8, false), 'IL MIGLIORE DELLA SERATA');
  assert.match(awardLabel(7, true), /I MIGLIORI/);
});

test('svolte: massimo tre, testi con dati reali delle gare', () => {
  for (const night of nights) {
    const pts = turningPointsEditorial(night.games, {metricsByName: idx});
    assert.ok(pts.length >= 1 && pts.length <= 3);
    for (const p of pts) {
      assert.match(p.text, /\d/);
      assert.doesNotMatch(p.title + p.text, BANNED);
      assert.ok(p.games.length >= 1);
    }
    assert.strictEqual(new Set(pts.map(p => p.tag)).size, pts.length);
  }
});

test('annotazioni: citano media piu` alta e piu` bassa, soglie per ruolo', () => {
  const ns = summarizeNight(nights[0].games);
  const t = notebookEditorial({players: ns.players, metricsByName: idx, record: {games: nights[0].games.length, against: ns.against}});
  assert.match(t, /Media EA più alta/);
  assert.match(t, /soglia (65|70|75)%/);
  assert.doesNotMatch(t, BANNED);
});

test('romanzo: titolo e intro diversi per ogni Pro, nessun elogio sotto 8, soglie di ruolo', () => {
  const titles = [], intros = [];
  for (const mem of data.members.members) {
    const m = idx.get(mem.name.toLowerCase());
    if (m.games < 3) continue;
    const n = novelEditorial(mem, m, club);
    titles.push(n.title); intros.push(n.intro);
    const text = [n.title, n.intro, ...n.sections.map(s => s.text)].join(' ');
    assert.doesNotMatch(text, BANNED, m.name);
    if (m.rating <= 8) assert.strictEqual(commentFor(m).praise, null);
    if (m.rating < 6.5 || (m.rating < 7 && m.rating >= 6.5)) assert.match(text, /[Bb]occiat|[Rr]imandat|[Ss]ufficienz/, m.name);
    assert.ok(n.sections.some(s => s.label === 'IL TABELLINO'));
    if (m.passPct != null) assert.ok(n.sections.some(s => s.label === 'IL PALLONE TRA I PIEDI' && new RegExp(`soglia è ${m.role === 'ATT' ? 65 : m.role === 'MEZ_OFF' || m.role === 'TRQ' || m.role === 'ESTERNO' ? 70 : 75}%`).test(s.text)), m.name);
  }
  assert.strictEqual(new Set(titles).size, titles.length);
  assert.strictEqual(new Set(intros).size, intros.length);
});

test('romanzo: Draigon000 passaggi sotto soglia, We_Belen dipendenza dal capocannoniere', () => {
  const d = novelEditorial(data.members.members.find(x => x.name === 'Draigon000'), idx.get('draigon000'), club);
  assert.match(d.sections.find(s => s.label === 'IL PALLONE TRA I PIEDI').text, /57%.*soglia è 75%: sotto/);
  assert.match(d.sections.find(s => s.label === 'CON E SENZA DI LUI').text, /punti a gara/);
  const w = novelEditorial(data.members.members.find(x => x.name === 'We_Belen'), idx.get('we_belen'), club);
  assert.match(w.sections.find(s => s.label === 'IL TABELLINO').text, /capocannoniere.*45%/);
});

test('panoramica e segnali: dati di stagione e dipendenza', () => {
  const r = clubReading(club);
  assert.match(r.record, new RegExp(club.season.gaPerGame.toFixed(2)));
  assert.match(r.quick, /We_Belen/);
  assert.doesNotMatch(r.record + r.quick, BANNED);
  const s = signalsEditorial(club, {scorer: 'We_Belen', assister: 'garrus92', passer: 'Nyveex'});
  assert.match(s.scorer, /dipendenza pesante/);
  assert.match(s.assister, /soglia 75%/);
  assert.match(s.passer, /83%/);
});

test('match studio: verdetto, premi e note con soglie di ruolo', () => {
  for (const match of data.matches) {
    const players = Object.values(match.players['70375']);
    const own = match.clubs['70375'];
    const st = matchStudioEditorial({own, players, metricsByName: idx});
    assert.ok(st.headline.length > 10);
    assert.doesNotMatch(st.headline + st.text, BANNED);
    assert.match(st.text, /passaggi non riusciti su \d+/);
    const top = [...players].sort((a, b) => Number(b.rating) - Number(a.rating))[0];
    if (Number(top.rating) < 8) assert.match(st.text, /modesta|nessun elogio/);
    for (const kind of ['rated', 'assist', 'tackle', 'pass']) assert.doesNotMatch(awardEditorial(kind, top, idx), BANNED);
  }
  const bad = Object.values(data.matches[0].players['70375']).find(p => p.playername === 'Draigon000');
  assert.match(awardEditorial('pass', {...bad, passesmade: '16', passattempts: '24'}, idx), /sotto la soglia/);
});

test('verdetti variati per Pro, nessun elogio sotto 8, bocciatura sotto 6.5', () => {
  const regulars = all.filter(m => m.games >= 3 && m.rating);
  const verdicts = regulars.map(m => verdictFor(m));
  for (const [i, m] of regulars.entries()) {
    assert.doesNotMatch(verdicts[i], BANNED, m.name);
    if (m.rating < 6.5) assert.match(verdicts[i], /[Bb]occiat/, m.name);
    if (m.rating <= 8) assert.doesNotMatch(verdicts[i], /Promosso/, m.name);
    if (m.rating <= 8) assert.match(verdicts[i], /\d/, m.name);
  }
  assert.strictEqual(new Set(verdicts).size, verdicts.length);
});
