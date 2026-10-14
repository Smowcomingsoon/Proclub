/* ---------------------------------------------------------------------------
 * Testi editoriali critici (copertina, svolte, romanzo, annotazioni, panoramica,
 * match studio). Solo dati EA reali; stesse regole di commentary.mjs:
 *  - elogi solo per media EA stagionale > 8, sempre accompagnati da un limite;
 *  - sotto 6.5 bocciatura netta; una media intorno a 6 non si elogia;
 *  - passaggi: soglie per ruolo da ROLE_INFO (non duplicate).
 * Niente xG, passaggi chiave o altri dati che EA non fornisce.
 * ------------------------------------------------------------------------- */
import {ROLE_INFO, roleFor, CLUB_ID} from './metrics.mjs';
import {commentFor, GA_MIN} from './commentary.mjs';

const fin = v => v != null && Number.isFinite(v);
const f1 = v => (fin(v) ? v.toFixed(1) : '—');
const f2 = v => (fin(v) ? v.toFixed(2) : '—');
const r0 = v => (fin(v) ? Math.round(v) : '—');
const num = v => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const hash = s => [...String(s || '')].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const choose = (seed, list) => list[seed % list.length];
const sign = v => (v >= 0 ? '+' : '');
const lc = s => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
const sentence = s => { const t = String(s || '').trim(); return !t ? '' : /[.!?]$/.test(t) ? t : t + '.'; };
const join = (...parts) => parts.map(p => (p ? String(p).trim() : '')).filter(Boolean).join(' ');
const ilp = p => (/^(8|11|18)/.test(String(r0(p))) ? `l'${r0(p)}%` : `il ${r0(p)}%`);
const alp = p => (/^(8|11|18)/.test(String(r0(p))) ? `all'${r0(p)}%` : `al ${r0(p)}%`);
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/** Mappa nome minuscolo -> metriche, da `buildAll`. */
export function metricsIndex(all) {
  return new Map(all.map(m => [String(m.name).toLowerCase(), m]));
}
const metricOf = (idx, name) => (idx && name ? idx.get(String(name).toLowerCase()) : undefined);

/** Dati di una presenza EA grezza nella stessa forma dei totali di serata. */
export function normalizeRaw(p) {
  const passes = num(p.passesmade), passAttempts = num(p.passattempts);
  return {
    name: p.playername, games: 1, rating: num(p.rating) > 0 ? num(p.rating) : null, ratedGames: num(p.rating) > 0 ? 1 : 0,
    goals: num(p.goals), assists: num(p.assists), shots: num(p.shots), passes, passAttempts,
    tackles: num(p.tacklesmade), tackleAttempts: num(p.tackleattempts), saves: num(p.saves), reds: num(p.redcards),
    mvp: num(p.mom), roles: [p.pos], passPct: passAttempts ? Math.round(passes / passAttempts * 100) : null,
  };
}

function nightRole(p, m) {
  const pos = p.roles && p.roles.length === 1 ? p.roles[0] : null;
  const role = pos ? roleFor(pos, m ? m.proPos : null) : (m && m.role) || roleFor(p.roles && p.roles[0], null);
  return {role, ...ROLE_INFO[role]};
}

/** Passaggi sotto la soglia di ruolo (almeno 10 tentativi), altrimenti null. */
function passFlag(p, m) {
  if (!p.passAttempts || p.passAttempts < 10 || p.passPct == null) return null;
  const R = nightRole(p, m);
  if (p.passPct >= R.passMin) return null;
  return {pct: p.passPct, min: R.passMin, label: R.label, failed: p.passAttempts - p.passes};
}

function nightLimits(p, m) {
  const L = [];
  if (p.reds) L.push(`${p.reds} ${p.reds === 1 ? 'rosso' : 'rossi'}`);
  const pf = passFlag(p, m);
  if (pf) L.push(`${pf.pct}% di passaggi (${pf.failed} sbagliati su ${p.passAttempts}, soglia ${pf.min}% da ${pf.label})`);
  if (p.shots >= 3 && p.goals / p.shots < 0.3) L.push(`${p.goals} gol su ${p.shots} tiri`);
  if (p.tackleAttempts >= 4 && p.tackles / p.tackleAttempts < 0.5) L.push(`${plural(p.tackles, 'contrasto riuscito', 'contrasti riusciti')} su ${p.tackleAttempts}`);
  return L;
}

/** Limite tecnico di un Pro: prima i dati della serata, poi il difetto principale della stagione. */
function limitSentence(p, m) {
  const L = nightLimits(p, m);
  if (L.length) return `Limiti della serata: ${L.slice(0, 2).join('; ')}.`;
  if (!m || m.games < 3 || !m.rating) return '';
  const c = commentFor(m);
  if (m.rating > 8) return sentence(c.charge);
  return c.negatives[0] ? sentence(c.negatives[0].text) : '';
}

const tierOf = r => (r > 8 ? 'elite' : r >= 7.5 ? 'buono' : r >= 7 ? 'medio' : r >= 6.5 ? 'rimandato' : 'bocciato');

/* ============================== COPERTINA =============================== */

function teamPasses(players) {
  const passes = players.reduce((s, p) => s + p.passes, 0), att = players.reduce((s, p) => s + p.passAttempts, 0);
  return {passes, att, pct: att ? Math.round(passes / att * 100) : null, failed: att - passes};
}

function leaderLine(p, m, seed) {
  const nr = p.rating, name = p.name;
  if (!m || m.games < 3 || !m.rating) {
    return `${name} ha la media più alta (${f2(nr)}), ma con ${m ? m.games : 0} presenze stagionali il campione è troppo corto per un giudizio.`;
  }
  const sr = m.rating, g = m.games, lim = limitSentence(p, m);
  if (sr > 8) {
    return nr >= 8
      ? join(choose(seed, [
        `${name} chiude la serata a ${f2(nr)} e porta in dote ${f2(sr)} di media EA in ${g} presenze: sopra l'8 di media stagionale il riconoscimento è dovuto, ma con riserva.`,
        `Miglior voto a ${name} (${f2(nr)} in serata, ${f2(sr)} di stagione su ${g} gare): sopra l'8 il riconoscimento è dovuto, senza dimenticare i difetti.`,
        `${name}, ${f2(nr)} in serata e ${f2(sr)} di stagione: a questo livello si può riconoscere il rendimento, a patto di nominare il limite.`]), lim)
      : join(`${name} guida la serata con ${f2(nr)}, sotto la sua stessa media stagionale (${f2(sr)} in ${g} presenze): una buona base non copre una gara ordinaria.`, lim);
  }
  if (sr < 6.5) {
    return join(`${name} ha il miglior voto della serata (${f2(nr)}), ma resta bocciato dalla stagione: ${f2(sr)} di media EA in ${g} presenze. Una serata non cancella il resto.`, lim);
  }
  if (nr >= 8) {
    return join(`${name} chiude a ${f2(nr)}, ma la media stagionale è ${f2(sr)} in ${g} presenze: un picco isolato, non ancora un livello.`, lim);
  }
  return join(choose(seed, [
    `${name} è il migliore di una serata modesta: ${f2(nr)} di media EA, ${f2(sr)} in stagione (${g} presenze). Sotto l'8 nessun elogio.`,
    `Il miglior voto è di ${name} (${f2(nr)}), ma in una serata senza picchi; la media stagionale è ${f2(sr)}. Nessun applauso.`,
    `${name} primeggia con ${f2(nr)} solo perché gli altri fanno peggio: media di stagione ${f2(sr)} su ${g} gare, rendimento da sufficienza larga.`]), lim);
}

function closingLine(rec, club, seed) {
  const n = rec.games, diff = rec.goals - rec.against;
  const cross = [];
  if (club) {
    if (club.season && fin(club.season.gaPerGame)) cross.push(`In stagione EA il club subisce ${f2(club.season.gaPerGame)} gol a gara.`);
    if (club.record && club.record.n && club.record.conceded3plus) cross.push(`Nelle ultime ${club.record.n} gare disponibili sono ${club.record.conceded3plus} quelle con 3 o più gol incassati.`);
    if (club.dependence && fin(club.dependence.share) && club.dependence.share >= 30) cross.push(`${club.dependence.name} firma ${ilp(club.dependence.share)} dei gol stagionali: l'attacco dipende da lui.`);
    if (club.weakestPlayer) cross.push(`L'anello debole tra i titolari resta ${club.weakestPlayer.name} (media ${f2(club.weakestPlayer.rating)}).`);
    if (club.missingFamilies && club.missingFamilies.length) cross.push(`Nelle gare disponibili nessun Pro gioca da ${club.missingFamilies.map(f => (f === 'dif' ? 'difensore' : 'portiere')).join(' né da ')}: la difesa è tutta di centrocampisti e punte.`);
  }
  const extra = cross.length ? choose(seed, cross) : '';
  const base = rec.wins > rec.losses
    ? (rec.against >= n
      ? `Il bilancio è positivo (${rec.wins}V su ${n}), ma ${rec.against} gol subiti in ${plural(n, 'gara', 'gare')} non autorizzano a rilassarsi.`
      : `Il bilancio è positivo (${rec.wins}V su ${n}) e dietro si incassa poco (${rec.against} gol in ${plural(n, 'gara', 'gare')}): resta da dimostrare che non sia una serata.`)
    : rec.losses > rec.wins
      ? `Il bilancio è negativo: ${rec.losses}S su ${n}, ${rec.goals} gol fatti e ${rec.against} subiti.`
      : `Il bilancio è in parità (${rec.wins}V ${rec.draws}P ${rec.losses}S, differenza reti ${sign(diff)}${diff}): nessuno ha preso la serata in mano.`;
  return join(base, extra);
}

export function awardLabel(rating, multiple) {
  return rating != null && rating >= 8
    ? (multiple ? 'I MIGLIORI DELLA SERATA' : 'IL MIGLIORE DELLA SERATA')
    : (multiple ? 'I MIGLIORI DI UNA SERATA MODESTA' : 'IL MIGLIORE DI UNA SERATA MODESTA');
}

/**
 * Copertina critica. `record` = {wins, draws, losses, goals, against, games};
 * `players` = totali di serata (summarizeNight); `metricsByName` = metricsIndex(buildAll);
 * `club` = analyzeClub (facoltativo).
 */
export function coverEditorial({day = '', record, winners = [], players = [], metricsByName, club}) {
  const n = record.games, seed = hash(day + (winners[0] ? winners[0].name : ''));
  const tp = teamPasses(players);
  const conceded = record.against / Math.max(1, n) >= 1.5;
  const sloppy = tp.att >= 30 && tp.pct != null && tp.pct < 80;
  const leader = winners[0] || [...players].filter(p => p.rating != null).sort((a, b) => b.rating - a.rating)[0];
  let title;
  if (record.wins > record.losses && (conceded || sloppy)) {
    title = conceded
      ? choose(seed, [`${record.against} gol subiti in ${n} gare: la vittoria nasconde i buchi.`, 'Il bilancio è in attivo, la tenuta no.', 'Si vince, ma si concede troppo.', 'Risultato buono, difesa da rivedere.'])
      : choose(seed, ['Si vince sbagliando troppi passaggi.', `Vittorie con ${ilp(tp.pct)} di passaggi: poco per fidarsi.`, 'Il risultato c’è, la precisione no.', `${tp.failed} passaggi sbagliati: il risultato fa da paracadute.`]);
  } else if (record.wins > record.losses) {
    title = choose(seed, ['Serata in ordine: risultato e numeri vanno nella stessa direzione.', 'Vittorie senza grossi buchi nei dati: ora serve continuità.', 'Bilancio pulito, che non fa ancora una squadra.', 'Si vince e si incassa poco: da ripetere, non da celebrare.']);
  } else if (record.losses > record.wins) {
    title = choose(seed, [`${record.losses} sconfitte su ${n}: il tabellino non ammette scuse.`, `Serata storta: ${record.goals} gol fatti, ${record.against} subiti.`, 'Il bilancio punisce e i numeri non offrono alibi.', 'Troppo poco per tenere il passo.']);
  } else {
    title = choose(seed, ['Pareggio tecnico: né da applaudire né da buttare.', 'Bilancio in equilibrio, nessuno prende la gara per mano.', 'Equilibrio, ma nessuno dei titolari alza il livello.', 'Una serata senza vincitori netti, nemmeno nelle pagelle.']);
  }
  const s1 = `${record.wins}V ${record.draws}P ${record.losses}S in ${plural(n, 'gara', 'gare')}, ${record.goals} gol fatti e ${record.against} subiti${tp.att >= 20 ? `; i Pro chiudono con ${ilp(tp.pct)} di passaggi riusciti (${tp.failed} sbagliati su ${tp.att})` : ''}.`;
  let s2 = '';
  if (winners.length > 1) {
    const names = winners.map(w => w.name).join(' e ');
    const best = winners[0].rating;
    s2 = best >= 8
      ? `${names} condividono la media più alta (${f2(best)}): pari merito nei numeri, ma i limiti di ciascuno restano agli atti.`
      : `${names} condividono la media più alta (${f2(best)}) in una serata modesta: sotto l'8 il pari merito non vale un elogio.`;
  } else if (leader) {
    s2 = leaderLine(leader, metricOf(metricsByName, leader.name), seed);
  }
  const closing = closingLine(record, club, seed);
  const diff = record.goals - record.against;
  const balance = join(
    `${plural(record.wins, 'vittoria', 'vittorie')}, ${plural(record.draws, 'pareggio', 'pareggi')} e ${plural(record.losses, 'sconfitta', 'sconfitte')}; ${record.goals} reti segnate e ${record.against} subite, saldo ${sign(diff)}${diff}.`,
    diff > 0 && conceded ? `Il saldo copre un difetto: ${f2(record.against / n)} gol subiti a gara.` : diff < 0 ? 'Attacco e tenuta vanno riviste insieme.' : diff === 0 ? 'Né l’attacco né la difesa prevalgono.' : '');
  let note = '';
  if (leader) {
    const lm = metricOf(metricsByName, leader.name);
    if (lm && lm.games >= 3 && lm.rating) {
      const c = commentFor(lm);
      note = join(c.verdict, c.praise, c.praise ? `Limite: ${lc(sentence(c.charge))}` : sentence(c.charge));
    }
  }
  return {
    name: winners.length ? winners.map(w => w.name).join(' + ') : leader ? leader.name : 'BILLOCCHI CLUB',
    title, deck: join(s1, s2), closing, balance, note,
    awardLabel: awardLabel(leader ? leader.rating : null, winners.length > 1),
  };
}

/* ======================= ANNOTAZIONI A MARGINE ========================== */

export function notebookEditorial({players, metricsByName, record}) {
  const rated = players.filter(p => p.rating != null);
  if (!players.length) return 'Nessun Pro in campo in questa edizione.';
  const out = [];
  if (rated.length >= 2) {
    const sorted = [...rated].sort((a, b) => b.rating - a.rating);
    const top = sorted[0], low = sorted[sorted.length - 1];
    out.push(`Media EA più alta ${top.name} (${f2(top.rating)}), più bassa ${low.name} (${f2(low.rating)}): ${f2(top.rating - low.rating)} punti di distanza dentro la stessa squadra.`);
    if (low.rating < 6.5) out.push(`${low.name} sta sotto il 6.5: bocciatura netta per la serata.`);
  }
  const flagged = players.map(p => ({p, f: passFlag(p, metricOf(metricsByName, p.name))})).filter(x => x.f);
  if (flagged.length) out.push(`Sotto la soglia di ruolo nei passaggi: ${flagged.map(x => `${x.p.name} ${x.f.pct}% (soglia ${x.f.min}%)`).join(', ')}.`);
  else out.push('Nessun Pro con almeno 10 passaggi tentati scende sotto la soglia del proprio ruolo: assenza di un difetto, non un merito.');
  const shooter = players.filter(p => p.shots >= 3).sort((a, b) => b.shots - a.shots)[0];
  if (shooter) out.push(`${shooter.name}: ${shooter.goals} gol su ${shooter.shots} tiri${shooter.goals / shooter.shots < 0.3 ? ', conversione da migliorare' : ''}.`);
  const reds = players.filter(p => p.reds);
  if (reds.length) out.push(`Cartellini rossi: ${reds.map(p => `${p.name} (${p.reds})`).join(', ')}.`);
  if (record && record.against / Math.max(1, record.games) >= 1.5) out.push(`${record.against} gol subiti in ${plural(record.games, 'gara', 'gare')}: il lavoro è dietro.`);
  return out.slice(0, 4).join(' ');
}

/* ============================ SVOLTE DELLA NOTTE ======================== */

function gameFacts(match, clubId, idx) {
  const own = (match.clubs || {})[clubId] || {};
  const oppEntry = Object.entries(match.clubs || {}).find(([id]) => id !== String(clubId));
  const gf = num(own.goals), ga = num(own.goalsAgainst);
  const players = Object.values((match.players || {})[clubId] || {}).filter(Boolean).map(normalizeRaw);
  const tp = teamPasses(players);
  const rated = players.filter(p => p.rating != null).sort((a, b) => b.rating - a.rating);
  return {match, gf, ga, opp: (oppEntry && oppEntry[1] && oppEntry[1].details && oppEntry[1].details.name) || 'Avversario', players, tp, best: rated[0], worst: rated.length > 1 ? rated[rated.length - 1] : null, idx};
}
const passText = f => (f.tp.att >= 20 ? `Passaggi dei Pro ${alp(f.tp.pct)} (${f.tp.failed} sbagliati su ${f.tp.att}).` : '');
function bestText(f) {
  const b = f.best;
  if (!b) return '';
  const m = metricOf(f.idx, b.name);
  if (b.rating < 8) return `Miglior voto ${b.name} (${f2(b.rating)}): sotto l'8, nessun elogio.`;
  return m && m.rating && m.rating <= 8
    ? `Miglior voto ${b.name} (${f2(b.rating)}), ma la sua media stagionale è ${f2(m.rating)}: una gara, non un livello.`
    : join(`Miglior voto ${b.name} (${f2(b.rating)}), sopra l'8 anche in stagione.`, limitSentence(b, m));
}
const worstText = f => (f.worst && f.worst.rating < 6.5 ? `Voto più basso ${f.worst.name} (${f2(f.worst.rating)}), bocciato.` : f.worst ? `Voto più basso ${f.worst.name} (${f2(f.worst.rating)}).` : '');

const defaultTime = match => new Date(match.timestamp * 1e3).toLocaleTimeString('it-IT', {timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit'});

/**
 * Fino a tre svolte. `fmtTime(match)` formatta l'ora; `games` = partite grezze EA della serata.
 * Restituisce {tag, title, text, games}.
 */
export function turningPointsEditorial(games, {clubId = CLUB_ID, metricsByName, fmtTime = defaultTime} = {}) {
  const sorted = [...games].sort((a, b) => a.timestamp - b.timestamp);
  const facts = sorted.map(g => gameFacts(g, clubId, metricsByName));
  const res = f => (f.gf > f.ga ? 'V' : f.gf < f.ga ? 'S' : 'P');
  const score = f => `${f.gf}–${f.ga}`;
  const points = [];
  const win = facts.filter(f => res(f) === 'V').sort((a, b) => (b.gf - b.ga) - (a.gf - a.ga))[0];
  if (win) {
    points.push({
      tag: 'LA VITTORIA PIÙ LARGA',
      title: win.ga ? `${score(win)}: larga, non pulita.` : `${score(win)}: larga e a porta inviolata.`,
      text: join(`Contro ${win.opp}, alle ${fmtTime(win.match)}: margine di ${plural(win.gf - win.ga, 'gol', 'gol')}, il più ampio della serata.`,
        win.ga ? `Si incassano comunque ${plural(win.ga, 'gol', 'gol')}.` : 'Nessun gol subito.', passText(win), bestText(win)),
      games: [win.match],
    });
  }
  const ri = facts.findIndex((f, i) => i > 0 && res(f) === 'V' && res(facts[i - 1]) === 'S');
  if (ri > 0) {
    const a = facts[ri - 1], b = facts[ri];
    points.push({
      tag: 'LA RISPOSTA',
      title: `Dal ${score(a)} al ${score(b)}.`,
      text: join(`Dopo il ${score(a)} contro ${a.opp} (${a.ga} gol subiti${a.tp.att >= 20 ? `, passaggi ${alp(a.tp.pct)}` : ''}) arriva il ${score(b)} contro ${b.opp}.`,
        b.ga >= a.ga ? `La fase difensiva non migliora: ${b.ga} gol incassati anche nella gara di reazione.` : b.ga ? `Si incassa ancora ${plural(b.ga, 'gol', 'gol')}, meno della gara precedente.` : 'Stavolta porta inviolata.',
        b.tp.att >= 20 ? `Passaggi ${alp(b.tp.pct)}.` : '', 'Una vittoria non cancella gli errori della gara precedente: vanno verificati.'),
      games: [a.match, b.match],
    });
  }
  let cur = [], best = [];
  for (const f of facts) { if (res(f) === 'S') cur = []; else { cur.push(f); if (cur.length > best.length) best = [...cur]; } }
  if (best.length >= 3) {
    const ga = best.reduce((s, f) => s + f.ga, 0), v = best.filter(f => res(f) === 'V').length, d = best.length - v;
    const cs = best.filter(f => f.ga === 0).length, leaky = best.filter(f => f.ga >= 2).length;
    const tp = teamPasses(best.flatMap(f => f.players));
    points.push({
      tag: 'LA SERIE POSITIVA',
      title: `${best.length} gare senza ko, ${ga} gol subiti.`,
      text: join(`${plural(v, 'vittoria', 'vittorie')} e ${plural(d, 'pareggio', 'pareggi')} consecutivi: ${ga} gol incassati in ${best.length} gare (${f2(ga / best.length)} a gara), ${cs} a porta inviolata.`,
        leaky ? `In ${plural(leaky, 'gara', 'gare')} i gol subiti sono almeno 2: la serie c’è, la solidità meno.` : 'Mai più di un gol subito per gara: la serie regge anche dietro.',
        tp.att >= 20 ? `Passaggi dei Pro ${alp(tp.pct)} nel periodo.` : ''),
      games: best.map(f => f.match),
    });
  }
  const close = facts.filter(f => Math.abs(f.gf - f.ga) <= 1).sort((a, b) => (b.gf + b.ga) - (a.gf + a.ga))[0];
  if (close) {
    const r = res(close);
    points.push({
      tag: 'IL RISULTATO IN BILICO',
      title: `${score(close)}: si decide per un episodio.`,
      text: join(`${close.opp}, alle ${fmtTime(close.match)}: ${r === 'P' ? 'un pareggio' : r === 'V' ? 'una vittoria di misura' : 'una sconfitta di misura'} con ${close.gf + close.ga} gol complessivi.`,
        close.ga ? `Il club ne incassa ${close.ga}: in una gara così ogni errore dietro pesa.` : 'Porta inviolata, ma con un solo gol di margine.',
        passText(close), worstText(close)),
      games: [close.match],
    });
  }
  if (!points.length && facts.length) {
    const ga = facts.reduce((s, f) => s + f.ga, 0), gf = facts.reduce((s, f) => s + f.gf, 0);
    points.push({tag: 'IL BILANCIO', title: 'Una serata senza svolte nette.', text: `${plural(facts.length, 'gara registrata', 'gare registrate')}: ${gf} gol fatti, ${ga} subiti. Nei tabellini si vede chi ha inciso e chi no.`, games: sorted});
  }
  return points.slice(0, 3);
}

/* ============================ ROMANZO DEI PRO =========================== */

/** Verdetto sintetico variato per Pro (stessa soglia del motore: elogio solo oltre 8). */
export function verdictFor(m, cm = commentFor(m)) {
  const tier = tierOf(m.rating), seed = hash(m.name), label = m.roleLabel, g = m.games;
  const r = f2(m.rating), gap = f2(8 - m.rating);
  if (g < 3 || !m.rating) return cm.verdict;
  const verdicts = {
    elite: [cm.verdict],
    buono: m.rating >= 7.995 ? [`${r} di media: fermo sulla soglia, l’elogio scatta solo oltre l’8.`, `Esattamente all’8 (${r}): buono, ma senza un centesimo oltre non c’è elogio.`] : [`Buono, non da elogio: per arrivare all’8 mancano ${gap} punti di media.`, `${r} di media vale la fiducia del club, non l’applauso: l’8 è ${gap} punti più su.`, `Rendimento da titolare, senza i numeri per un elogio (soglia 8, distanza ${gap}).`],
    medio: [`Utile ma non decisivo: ${r} lo tiene a ${gap} punti dall’elogio.`, `Rendimento ordinario: ${r} basta per giocare, non per spostare le partite.`, `Né bocciato né promosso: ${r} è una media da comprimario.`],
    rimandato: [`Rimandato: ${r} sfiora appena la sufficienza e non basta a un ${label} titolare.`, `Sufficienza risicata (${r}): servono precisione e incidenza.`, `${r} di media: il posto da titolare va riguadagnato partita per partita.`],
    bocciato: [`Bocciato: ${r} è sotto il 6.5, il minimo accettabile per un ${label}.`, `Bocciatura netta: ${r} non sostiene il ruolo di ${label} titolare.`, `${r} in ${g} presenze: rendimento insufficiente.`],
  };
  return join(choose(seed, verdicts[tier]), g < 10 ? `Lettura provvisoria: ${g} presenze.` : '');
}

/**
 * Ritratto stagionale critico. `member` = riga EA grezza, `m` = metriche (buildAll),
 * `club` = analyzeClub. Restituisce {title, intro, sections:[{label,text}], caveats}.
 */
export function novelEditorial(member, m, club) {
  const g = m.games, name = m.name, label = m.roleLabel;
  const cm = commentFor(m);
  const seed = hash(name);
  const tier = tierOf(m.rating);
  if (g < 3 || !m.rating) {
    return {
      title: 'Campione troppo corto per giudicare.',
      intro: `${name}: ${plural(g, 'presenza', 'presenze')}, ${m.goals} gol e ${m.assists} assist${m.rating ? `, media EA ${f2(m.rating)}` : ''}. ${cm.verdict}`,
      sections: [{label: 'IL TABELLINO', text: `${m.goals} gol e ${m.assists} assist in ${plural(g, 'gara', 'gare')}. Con questo volume nessuna soglia di ruolo è applicabile: né elogi né bocciature.`}],
      caveats: cm.caveats,
    };
  }
  const r = f2(m.rating);
  const titles = {
    elite: [`${r}: sopra l’8, ma non senza limiti.`, `${r} da ${label}: riferimento tecnico con un difetto da correggere.`, `Livello alto da ${label} (${r}), margine ancora aperto.`],
    buono: [`${r}: buono, non da elogio.`, `Titolare solido da ${label} (${r}), ma sotto l’8 non c’è applauso.`, `Affidabile a ${r}, ancora lontano dall’eccellenza.`],
    medio: [`${r}: utile, mai decisivo.`, `Rendimento ordinario da ${label} (${r}).`, `Nella media del club (${r}), senza incidere sul risultato.`],
    rimandato: [`${r}: appena sufficiente.`, `Rimandato dai numeri (${r}).`, `Un ${label} a ${r} che tiene il posto, non la squadra.`],
    bocciato: [`${r}: bocciato dai numeri.`, `Sotto il minimo per un ${label} titolare (${r}).`, `${r} di media: il rendimento non regge il ruolo.`],
  };
  const title = choose(seed, titles[tier]);
  const verdictLine = verdictFor(m, cm);
  const R = ROLE_INFO[m.role];
  const intro = join(
    `${name}, ${label}${m.proPosLabel ? ` (avatar ${m.proPosLabel})` : ''}: ${plural(g, 'presenza', 'presenze')}, ${m.goals} gol e ${m.assists} assist, media EA ${f2(m.rating)}.`,
    verdictLine, cm.praise, cm.praise ? `Limite: ${lc(sentence(cm.charge))}` : cm.proof[0] ? `Dato più pesante: ${lc(cm.proof[0])}.` : '');
  const sections = [];

  // IL TABELLINO
  const gaMin = GA_MIN[m.role];
  const tab = [`${f2(m.goalsPerGame)} gol e ${f2(m.assistsPerGame)} assist a gara (${plural(m.goals, 'rete', 'reti')}, ${plural(m.assists, 'assist', 'assist')} in ${g} presenze).`];
  if (fin(m.shareOfClubGA)) tab.push(`Tra reti e assist pesa ${ilp(m.shareOfClubGA)} dei gol del club (${ilp(m.shareOfClubGoals)} contando solo le reti).`);
  if (gaMin) tab.push(m.gaPerGame >= gaMin
    ? `Con ${f2(m.gaPerGame)} G+A a gara supera la soglia di ${gaMin} per un ${label}: è il minimo richiesto${tier === 'elite' ? ', superato con margine' : ', non un merito'}.`
    : `Con ${f2(m.gaPerGame)} G+A a gara resta sotto la soglia di ${gaMin} per un ${label}: incidenza offensiva insufficiente.`);
  else tab.push(`Da ${label} il contributo offensivo non è il metro principale del giudizio.`);
  if (club && club.dependence && club.dependence.name === name && fin(club.dependence.share)) tab.push(`È il capocannoniere e il club ne dipende: ${ilp(club.dependence.share)} dei gol stagionali (${club.dependence.goals} su ${club.season.gf}).`);
  if (m.shotsTotal >= 8 && fin(m.conversionPct)) tab.push(`Nelle ultime ${m.sample} gare: ${m.goalsSample} gol su ${m.shotsTotal} tiri, conversione ${r0(m.conversionPct)}%.`);
  if (m.dryStreak >= 3) tab.push(`Attualmente ${m.dryStreak} gare consecutive senza gol né assist.`);
  sections.push({label: 'IL TABELLINO', text: tab.join(' ')});

  // IL PALLONE TRA I PIEDI
  if (m.passPct != null) {
    const pass = [`${r0(num(member.passesMade))} passaggi riusciti (${f1(num(member.passesMade) / g)} a gara), ${r0(m.passPct)}% secondo EA, circa ${f1(m.passFailedPerGame)} sbagliati a gara.`];
    pass.push(m.passPct < R.passMin
      ? `Per un ${label} la soglia è ${R.passMin}%: sotto, e il dato pesa.`
      : `Per un ${label} la soglia è ${R.passMin}%: in regola, che è il minimo, non un merito.`);
    if (fin(m.recentPassPct) && (m.sample || 0) >= 6) pass.push(`Nelle ultime ${m.sample} gare il dato è ${r0(m.recentPassPct)}%${m.worstPassPct < 100 ? `, con un minimo del ${r0(m.worstPassPct)}% nella gara peggiore` : ''}.`);
    if (m.tackPct != null && m.tackAttPerGame >= 1) pass.push(`Contrasti riusciti ${alp(m.tackPct)}${fin(m.clubMedianTackPct) ? ` (mediana del club ${r0(m.clubMedianTackPct)}%)` : ''}, ${f1(m.tackAttPerGame)} tentativi a gara.`);
    sections.push({label: 'IL PALLONE TRA I PIEDI', text: pass.join(' ')});
  }

  // RENDIMENTO E RICONOSCIMENTI
  if (g >= 5) {
    const rend = [`Media EA ${f2(m.rating)} in ${g} presenze; ${plural(m.motm, 'premio uomo partita', 'premi uomo partita')} (${r0(m.motmRate)}% delle gare).`];
    if (m.motm && m.rating < 7) rend.push('I premi non compensano una media così bassa.');
    if (m.peers && m.peers.ratingRank) rend.push(`Nel reparto: ${m.peers.ratingRank}° su ${m.peers.n} per media (mediana ${f2(m.peers.medianRating)}).`);
    else if (fin(m.ratingVsClubMedian)) rend.push(`${sign(m.ratingVsClubMedian)}${f2(m.ratingVsClubMedian)} rispetto alla mediana dei titolari del club.`);
    if (fin(m.ratingVsOverall) && m.overall) rend.push(m.ratingVsOverall <= -0.8
      ? `Overall ${m.overall}, rendimento ${f2(m.rating)}: l'avatar vale più di quanto il giocatore produca.`
      : m.ratingVsOverall >= 0.3 ? `Overall ${m.overall}, rendimento ${f2(m.rating)}: rende più di quanto dica l'avatar.` : `Overall ${m.overall} e rendimento ${f2(m.rating)} sono allineati.`);
    if ((m.ratedGames || 0) >= 6) rend.push(`Voti tra ${f1(m.ratingMin)} e ${f1(m.ratingMax)}${m.below65 ? `, ${plural(m.below65, 'gara', 'gare')} su ${m.ratedGames} sotto il 6.5` : ''}.`);
    rend.push(m.redCards ? `${plural(m.redCards, 'espulsione', 'espulsioni')} in ${g} presenze: la disciplina entra nel conto.` : 'Nessuna espulsione.');
    sections.push({label: 'RENDIMENTO E RICONOSCIMENTI', text: rend.join(' ')});
  }

  // CON E SENZA DI LUI
  const wo = [];
  if (m.nOff >= 3 && m.nOn >= 6 && fin(m.pointsPerGame) && fin(m.pointsPerGameOff)) {
    const d = m.pointsPerGame - m.pointsPerGameOff;
    wo.push(`Con lui in campo (${m.nOn} gare oltre i 45') il club fa ${f2(m.pointsPerGame)} punti a gara e subisce ${f2(m.concededPerGameOn)} gol; nelle ${m.nOff} gare senza di lui ${f2(m.pointsPerGameOff)} punti e ${f2(m.concededPerGameOff)} gol subiti.`);
    wo.push(d >= 0.4 ? 'Il club rende meglio con lui, ma è una correlazione su campione piccolo, non una causa.' : d <= -0.4 ? 'Il club rende meglio senza di lui: il dato va spiegato, non ignorato.' : 'La differenza è trascurabile.');
  }
  const mine = (club ? club.pairs : []).filter(p => (p.a === name || p.b === name) && p.delta != null);
  if (mine.length) {
    const bestP = [...mine].sort((x, y) => y.delta - x.delta)[0], worstP = [...mine].sort((x, y) => x.delta - y.delta)[0];
    const pt = p => `${p.a === name ? p.b : p.a}: ${p.n} gare insieme, ${f2(p.ppg)} punti a gara contro ${f2(p.ppgRest)} senza la coppia`;
    if (bestP.delta > 0) wo.push(`Coppia migliore con ${pt(bestP)}.`);
    if (worstP.delta < 0 && worstP !== bestP) wo.push(`Coppia che frena con ${pt(worstP)}.`);
  }
  if (wo.length) sections.push({label: 'CON E SENZA DI LUI', text: wo.join(' ')});

  // FORMA E CONTESTO
  const fc = [];
  if ((m.sample || 0) >= 6 && fin(m.form5)) fc.push(`Ultime 5 gare a ${f2(m.form5)} contro ${f2(m.rating)} di stagione${m.formVsSeason <= -0.4 ? ': forma sotto il proprio livello' : m.formVsSeason >= 0.4 ? ': forma sopra la propria media' : ': in linea'}.`);
  if ((m.sample || 0) >= 6 && m.nWins >= 3 && m.nNotWin >= 3 && fin(m.ratingNotWin)) fc.push(`Voto ${f2(m.ratingInWins)} nelle ${m.nWins} vittorie, ${f2(m.ratingNotWin)} nelle ${m.nNotWin} gare senza vittoria.`);
  if ((m.sample || 0) >= 6 && m.nBigWin >= 2 && m.nClose >= 3 && fin(m.ratingBigWin)) fc.push(`${f2(m.ratingBigWin)} nelle vittorie larghe, ${f2(m.ratingClose)} nelle ${m.nClose} gare in bilico.`);
  if (m.roleMismatch) fc.push(`Schierato da ${m.playedPos} con avatar ${m.position}${m.proPosLabel ? ` (${m.proPosLabel})` : ''}: giudicato come ${label}.`);
  if (fc.length) sections.push({label: 'FORMA E CONTESTO', text: fc.join(' ')});

  // LA PROSSIMA PAGINA
  if (g >= 10) {
    const targets = [];
    if (m.passPct != null && m.passPct < R.passMin) targets.push(`Obiettivo misurabile: portare i passaggi dal ${r0(m.passPct)}% al ${R.passMin}% richiesto da un ${label}.`);
    if (gaMin && m.gaPerGame < gaMin) targets.push(`Obiettivo: arrivare a ${gaMin} G+A a gara (oggi ${f2(m.gaPerGame)}).`);
    sections.push({label: 'LA PROSSIMA PAGINA', text: join(cm.coachNote, targets.join(' '))});
  }
  return {title, intro, sections, caveats: cm.caveats};
}

/* ======================= PANORAMICA E LENTE SUI NUMERI ================== */

export function clubReading(club) {
  const s = club.season, r = club.record;
  const record = join(`${s.games ? Math.round(s.w / s.games * 100) : 0}% di vittorie su ${s.games} partite.`,
    s.w > s.l
      ? `Il bilancio è positivo, ma ${f2(s.gaPerGame)} gol subiti a gara in stagione e ${r.conceded3plus} gare su ${r.n} con 3 o più gol incassati tra le ultime disponibili dicono che la tenuta è il problema.`
      : `Il bilancio non è positivo: servono meno gol subiti (${f2(s.gaPerGame)} a gara) per cambiare il segno.`);
  const quick = [];
  quick.push(s.gaPerGame > 2 ? `Con ${f2(s.gaPerGame)} gol subiti a gara la differenza la fa l'attacco: si vince solo segnando molto.` : `${f2(s.gaPerGame)} gol subiti a gara: accettabile, ma lontano da una difesa che chiude le partite.`);
  if (club.dependence && fin(club.dependence.share)) quick.push(`${club.dependence.name} firma ${ilp(club.dependence.share)} dei gol stagionali (${club.dependence.goals} su ${s.gf}): una dipendenza che il club paga quando manca.`);
  if (club.missingFamilies && club.missingFamilies.length) quick.push(`Nelle ultime ${r.n} gare nessun Pro gioca da ${club.missingFamilies.map(f => (f === 'dif' ? 'difensore' : 'portiere')).join(' né da ')}.`);
  else if (club.weakestPlayer) quick.push(`L'anello debole tra i titolari è ${club.weakestPlayer.name} (media ${f2(club.weakestPlayer.rating)}).`);
  return {record, quick: quick.join(' ')};
}

export function signalsEditorial(club, names) {
  const byName = metricsIndex(club.players);
  const sc = metricOf(byName, names.scorer), as = metricOf(byName, names.assister), ps = metricOf(byName, names.passer);
  const out = {};
  if (sc) {
    const share = club.season.gf ? sc.goals / club.season.gf * 100 : 0;
    out.scorer = join(`${sc.goals} gol · ${r0(share)}% dei gol del club: dipendenza ${share >= 40 ? 'pesante' : share >= 30 ? 'alta' : 'contenuta'}.`,
      sc.shotsTotal >= 8 ? `Conversione ${r0(sc.conversionPct)}% su ${sc.shotsTotal} tiri nelle ultime ${sc.sample} gare.` : `Media EA ${f2(sc.rating)}.`);
  }
  if (as) {
    const R = ROLE_INFO[as.role];
    out.assister = join(`${as.assists} assist in ${as.games} gare · ${f2(as.assistsPerGame)} a partita.`,
      `Media EA ${f2(as.rating)}${as.passPct != null ? `, passaggi ${alp(as.passPct)} (soglia ${R.passMin}% da ${as.roleLabel})` : ''}.`);
  }
  if (ps) {
    const R = ROLE_INFO[ps.role];
    out.passer = join(`${r0(ps.passPct)}% di passaggi riusciti, ~${r0(ps.passAttPerGame)} tentati a gara, tra chi ha almeno 10 presenze.`,
      `${ps.roleLabel.charAt(0).toUpperCase() + ps.roleLabel.slice(1)}: ${ps.passPct >= R.passMin ? 'sopra la soglia di ruolo, ma la precisione non misura il rischio preso' : 'persino il migliore è sotto la soglia di ruolo'}.`);
  }
  return out;
}

/* ============================== MATCH STUDIO ============================ */

const shortPos = {goalkeeper: 'Portiere', defender: 'Difensore', midfielder: 'Centrocampista', forward: 'Attaccante'};

export function matchStudioEditorial({own, players, metricsByName}) {
  const gf = num(own.goals), ga = num(own.goalsAgainst);
  const ps = players.map(normalizeRaw);
  const tp = teamPasses(ps);
  const rated = ps.filter(p => p.rating != null).sort((a, b) => b.rating - a.rating);
  const top = rated[0];
  const seed = hash(`${gf}-${ga}-${top ? top.name : ''}`);
  const sloppy = tp.att >= 30 && tp.pct != null && tp.pct < 80;
  let headline;
  if (gf > ga) {
    headline = ga === 0
      ? (sloppy ? choose(seed, ['Porta chiusa, passaggi da rivedere.', 'A rete inviolata, ma con troppi palloni persi.']) : choose(seed, ['Porta chiusa: la difesa regge, ora serve ripeterlo.', 'Rete inviolata: da confermare, non da celebrare.']))
      : (ga >= 2 || sloppy ? choose(seed, ['Vittoria con riserva.', `Si vince, ma con ${ga} gol subiti.`, 'Il risultato regge, i numeri meno.']) : choose(seed, ['Vittoria in ordine, con un gol incassato.', 'Risultato giusto, tenuta ancora da verificare.']));
  } else if (gf < ga) headline = choose(seed, [`Sconfitta: ${ga} gol subiti, ${gf} fatti.`, 'Serata negativa, i numeri non offrono alibi.', 'Si perde: da rivedere dietro e davanti.']);
  else headline = choose(seed, ['Pareggio: nessuno ha deciso la gara.', 'Equilibrio sul campo, ma poca incisività.']);
  const parts = [];
  if (top) {
    const m = metricOf(metricsByName, top.name);
    const lim = limitSentence(top, m);
    if (top.rating >= 8) parts.push(m && m.rating > 8
      ? join(`${top.name} ha il miglior voto tra i Pro (${f2(top.rating)}) e porta ${f2(m.rating)} di media stagionale.`, lim)
      : join(`${top.name} ha il miglior voto (${f2(top.rating)}), ma la media stagionale è ${m && m.rating ? f2(m.rating) : 'non disponibile'}: una gara, non un livello.`, lim));
    else parts.push(join(`${top.name} ha il miglior voto tra i Pro (${f2(top.rating)}): il migliore di una gara modesta, sotto l'8 nessun elogio.`, lim));
  }
  const shots = ps.reduce((s, p) => s + p.shots, 0), goals = ps.reduce((s, p) => s + p.goals, 0);
  if (shots) parts.push(`${goals} gol su ${shots} tiri dei Pro: conversione ${Math.round(goals / shots * 100)}%${goals / shots < 0.3 ? ', troppe occasioni sprecate' : ''}.`);
  if (tp.att) parts.push(`${tp.failed} passaggi non riusciti su ${tp.att} (${tp.pct}% di precisione dei Pro)${sloppy ? ": sotto l'80%, un problema di gara" : ''}.`);
  const flagged = ps.map(p => ({p, f: passFlag(p, metricOf(metricsByName, p.name))})).filter(x => x.f);
  if (flagged.length) parts.push(`Sotto la soglia di ruolo: ${flagged.map(x => `${x.p.name} ${x.f.pct}% (soglia ${x.f.min}%)`).join(', ')}.`);
  const reds = ps.filter(p => p.reds);
  if (reds.length) parts.push(`Espulsioni: ${reds.map(p => p.name).join(', ')}.`);
  return {headline, text: parts.join(' ')};
}

export function awardEditorial(kind, raw, metricsByName) {
  const p = normalizeRaw(raw), m = metricOf(metricsByName, p.name);
  const role = shortPos[raw.pos] || 'Ruolo EA';
  const pf = passFlag(p, m);
  if (kind === 'rated') {
    if (p.rating >= 8) {
      return m && m.rating > 8
        ? join(`Voto ${f2(p.rating)} · ${role}.`, `Sopra l'8 anche in stagione (${f2(m.rating)}). ${limitSentence(p, m) || 'Limite: continuità da dimostrare.'}`)
        : join(`Voto ${f2(p.rating)} · ${role}.`, `Ma la media stagionale è ${m && m.rating ? f2(m.rating) : 'non disponibile'}: gara isolata.`);
    }
    return join(`Voto ${f2(p.rating)} · ${role}. Il migliore, non un elogio: sotto l'8.`, pf ? `Passaggi ${alp(pf.pct)}, sotto la soglia di ${pf.min}%.` : '');
  }
  if (kind === 'assist') return join(`${p.assists} assist · voto ${f2(p.rating)}.`, pf ? `Ma passaggi ${alp(pf.pct)} (soglia ${pf.min}%): ${pf.failed} errori.` : p.rating < 7 ? 'Il voto resta sotto il 7: l’assist non basta a fare la gara.' : '');
  if (kind === 'tackle') {
    const pct = p.tackleAttempts ? Math.round(p.tackles / p.tackleAttempts * 100) : 0;
    return `${p.tackles} contrasti riusciti su ${p.tackleAttempts} (${pct}%)${pct < 50 ? ': tanti tentativi, resa bassa' : ''}. Il dato EA non distingue il contrasto utile da quello di routine.`;
  }
  if (kind === 'pass') return join(`${p.passes}/${p.passAttempts} passaggi (${p.passPct}%). Almeno 10 tentativi per il premio.`,
    pf ? `È il migliore dei tentativi, ma sotto la soglia di ${pf.min}% da ${pf.label}.` : 'La precisione non misura il rischio preso.');
  return '';
}
