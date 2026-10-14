import {ROLE_INFO, roleFor, reliabilityFor} from './metrics.mjs';

const f1 = v => (v == null || !Number.isFinite(v) ? '—' : v.toFixed(1));
const f2 = v => (v == null || !Number.isFinite(v) ? '—' : v.toFixed(2));
const r0 = v => (v == null || !Number.isFinite(v) ? '—' : Math.round(v));
const hash = s => [...String(s || '')].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const pick = (m, variants) => variants[hash(m.name) % variants.length];

/* Ruolo e soglie: se il Pro e` stato costruito a mano (test) si ricava dal campo `position`. */
function roleOf(m) {
  const role = m.role || roleFor(m.playedPos || m.position, m.proPos);
  return {role, ...ROLE_INFO[role]};
}

/* Soglie di lavoro sul contributo offensivo (gol+assist a partita, stagionale), per ruolo. */
export const GA_MIN = {ATT: 0.8, TRQ: 0.5, MEZ_OFF: 0.5, ESTERNO: 0.4, CC: 0.3};

function negatives(m) {
  const n = [];
  const add = (sev, area, text, proof, coach) => n.push({sev, area, text, proof, coach: coach || ''});
  const R = roleOf(m);
  const g = m.games || 0;
  const stable = (m.sample || 0) >= 6 && (m.ratedGames || 0) >= 6; // dettaglio per gara sufficiente
  const solid = g >= 10;
  if (g < 3) return n;
  const rl = R.label;
  const cons = R.group === 'cons';
  const off = R.group === 'off' && R.role !== 'ESTERNO' ? true : R.group === 'off';

  // --- Voto
  if (m.rating) {
    if (m.rating < 6.5) add(10, 'rating', pick(m, [
      `Media EA ${f2(m.rating)} in ${g} presenze: insufficiente. Per un ${rl} titolare è un rendimento sotto il minimo accettabile.`,
      `${f2(m.rating)} di media EA: bocciatura netta. Un ${rl} che resta sotto il 6.5 non sta sostenendo la squadra.`]), `Media EA ${f2(m.rating)} in ${g} presenze`);
    else if (m.rating < 7) add(7, 'rating', `Media EA ${f2(m.rating)}: appena oltre la sufficienza. Da ${rl} significa tenere il posto senza mai spostare l'inerzia della gara.`, `Media EA ${f2(m.rating)}`);
    else if (m.rating < 7.5) add(4, 'rating', m.peers && m.peers.ratingRank
      ? `Media EA ${f2(m.rating)}: ${m.peers.ratingRank}° su ${m.peers.n} del reparto (mediana ${f2(m.peers.medianRating)}). Rendimento ordinario per un ${rl}, utile ma non determinante.`
      : `Media EA ${f2(m.rating)} in ${g} presenze da ${rl}: rendimento ordinario, lontano dalla fascia alta${m.ratingVsClubMedian != null ? ` (${m.ratingVsClubMedian >= 0 ? '+' : ''}${f2(m.ratingVsClubMedian)} sulla mediana del club)` : ''}.`,
      m.peers && m.peers.ratingRank ? `${m.peers.ratingRank}° su ${m.peers.n} pari reparto per media (${f2(m.rating)})` : `Media EA ${f2(m.rating)}`);
  }
  if (m.peers && m.peers.ratingRank === m.peers.n && g >= 8) add(7, 'peers', `Ultimo dei ${m.peers.n} del reparto per media EA (${f2(m.rating)} contro mediana ${f2(m.peers.medianRating)}): a pari ruolo il club ha alternative migliori.`, `Ultimo su ${m.peers.n} pari reparto per media (${f2(m.rating)}, mediana ${f2(m.peers.medianRating)})`);
  else if (m.ratingVsClubMedian != null && m.ratingVsClubMedian <= -0.4 && g >= 8) add(7, 'peers', `${f1(Math.abs(m.ratingVsClubMedian))} punti sotto la mediana dei titolari del club: qualcuno, a parità di impiego, rende di più.`, `${f2(m.ratingVsClubMedian)} dalla mediana del club`);

  // --- Passaggi: soglia dipendente dal ruolo
  const pp = m.passPct;
  if (pp != null) {
    const failed = m.passFailedPerGame, att = m.passAttPerGame;
    const vol = att != null ? ` su circa ${r0(att)} tentati a gara` : '';
    const proofP = `${r0(pp)}% passaggi${failed != null ? `, ~${f1(failed)} sbagliati a gara` : ''} (soglia ${R.passMin}% per ${rl})`;
    if (cons && pp < R.passMin) {
      const coachByRole = {
        DIF: `Costruzione dal basso: appoggio sul compagno più vicino e nessun lancio forzato finché non risali oltre l'80% (oggi ${r0(pp)}%, ~${f1(failed)} possessi persi a gara).`,
        MED: `Da mediano il primo passaggio dopo il recupero deve essere sicuro: gioca corto verso il centrocampista libero, obiettivo 80%+ (oggi ${r0(pp)}%).`,
        POR: `Rimessa e rinvio sul compagno libero, niente lanci a caso: ${r0(pp)}% non basta al portiere.`,
        CC: `Da centrale uscita dal pressing con passaggi semplici e a un tocco, senza verticali forzate: ${r0(pp)}% oggi, ~${f1(failed)} palloni regalati a gara.`,
      };
      add(pp < 70 ? 10 : 9, 'pass', pick(m, [
        `Passaggi al ${r0(pp)}%${vol}: per un ${rl} è sotto la soglia del 75%, perché i suoi sono i passaggi più semplici del campo. Non è un alibi di ruolo, è un limite tecnico.`,
        `${r0(pp)}% di passaggi riusciti da ${rl}: sotto il 75% che il ruolo impone, perché i suoi passaggi sono di norma meno rischiosi di quelli di chi gioca tra le linee. Regala possesso${failed != null ? ` (~${f1(failed)} errori a gara)` : ''}.`]), proofP, coachByRole[R.role] || coachByRole.CC);
    } else if (!cons && pp < R.passMin) {
      const coachOff = R.role === 'ATT'
        ? `Quando ricevi spalle alla porta scarica di prima su chi inserisce, non forzare il filtrante: ${r0(pp)}% è troppo basso anche per una punta.`
        : `Nell'ultimo terzo scegli il passaggio che mantiene il possesso: ${r0(pp)}% è troppo basso persino per chi gioca tra le linee.`;
      add(R.role === 'ATT' ? 7 : 8, 'pass', `Passaggi al ${r0(pp)}%${vol}: anche con la tolleranza dovuta a un ${rl} (passaggi in area e tra linee strette) siamo sotto il minimo del ${R.passMin}%.`, proofP, coachOff);
    } else if (cons && pp < 80 && att != null && att >= 25) {
      add(4, 'pass', `${r0(pp)}% di passaggi su ~${r0(att)} a gara: il volume c'è, la pulizia è solo sufficiente per un ${rl}.`, `${r0(pp)}% su ~${r0(att)} passaggi a gara`,
        `Con ~${r0(att)} passaggi a gara il margine è nella scelta: ~${f1(Math.max(0.1, failed - att * 0.2))} errori in meno a partita portano il ${r0(pp)}% all'80%.`);
    }
    if (m.recentPassPct != null && pp - m.recentPassPct >= 5 && (m.sample || 0) >= 6 && !(cons && pp < R.passMin)) add(5, 'pass2', `Precisione in calo: ${r0(m.recentPassPct)}% nelle ultime ${m.sample} gare contro ${r0(pp)}% di stagione.`, `Ultime ${m.sample} gare ${r0(m.recentPassPct)}% contro stagione ${r0(pp)}%`, `Ritrovare la pulizia di inizio stagione: ${r0(m.recentPassPct)}% nelle ultime ${m.sample} contro ${r0(pp)}%.`);
    if (m.worstPassPct != null && m.worstPassPct < (cons ? 60 : 50) && (m.sample || 0) >= 6) add(4, 'pass2', `Una serata nera al passaggio: ${r0(m.worstPassPct)}% nella peggiore gara, il segno di quando perde il filo.`, `Peggior gara ${r0(m.worstPassPct)}% passaggi`);
  }
  if (cons && (R.role === 'CC' || R.role === 'MED') && g >= 8 && m.passAttPerGame != null && m.passAttPerGame < 20) add(4, 'involve', `Solo ~${r0(m.passAttPerGame)} passaggi a gara per un ${rl}: partecipa poco alla manovra.`, `~${r0(m.passAttPerGame)} passaggi tentati a gara`, `Offriti di più al portatore: ~${r0(m.passAttPerGame)} passaggi a gara sono pochi per chi deve collegare i reparti.`);

  // --- Contrasti / filtro (solo ruoli di filtro, confrontati col club: il tasso EA e` basso per tutti)
  if ((R.role === 'CC' || R.role === 'MED' || R.role === 'DIF') && g >= 8 && m.tackPct != null && m.clubMedianTackPct != null && m.tackAttPerGame >= 4 && m.tackPct <= m.clubMedianTackPct - 8) {
    add(5, 'tackle', `Contrasti riusciti: ${r0(m.tackPct)}% contro una mediana di club del ${r0(m.clubMedianTackPct)}%, con ${f1(m.tackAttPerGame)} tentativi a gara: entra spesso e spesso male.`, `${r0(m.tackPct)}% contrasti (mediana club ${r0(m.clubMedianTackPct)}%), ${f1(m.tackFailedPerGame)} falliti a gara`,
      `Meno scivolate e più posizione: chiudi la linea di passaggio prima di entrare. ${f1(m.tackFailedPerGame)} contrasti falliti a gara sono avversari che saltano il primo filtro.`);
  }
  if ((R.role === 'MED' || R.role === 'DIF') && g >= 8 && m.tackAttPerGame != null && m.tackAttPerGame < 2.5) add(5, 'tackle', `Solo ${f1(m.tackAttPerGame)} contrasti tentati a gara per un ${rl}: il filtro davanti alla difesa non c'è.`, `${f1(m.tackAttPerGame)} contrasti tentati a gara`);

  // --- Fase offensiva
  const sampleGoals = m.goalsSample;
  if (m.shotsTotal >= 8 && m.conversionPct != null && m.conversionPct < 20) {
    const t = sampleGoals ? `${m.shotsTotal} tiri nelle ultime ${m.sample} gare, ${sampleGoals} gol: conversione ${r0(m.conversionPct)}%, ${f1(m.shotsPerGoal)} conclusioni per una rete.` : `${m.shotsTotal} tiri nelle ultime ${m.sample} gare senza segnare.`;
    add(R.role === 'ATT' ? 7 : 6, 'finish', t, `${r0(m.conversionPct)}% conversione su ${m.shotsTotal} tiri`,
      `Scegli meglio la conclusione: ${m.shotsTotal} tiri per ${sampleGoals} gol dicono che il tiro dalla distanza o in pressione va tolto dal repertorio.`);
  }
  if (R.role === 'ATT' && (m.sample || 0) >= 6 && m.shotsPerGame != null && m.shotsPerGame < 2.5) add(5, 'finish', `${f1(m.shotsPerGame)} tiri a gara per un attaccante: non si prende la conclusione.`, `${f1(m.shotsPerGame)} tiri a gara`, `Attacca l'area con più continuità: ${f1(m.shotsPerGame)} tiri a gara sono pochi per la punta.`);
  const gaMin = GA_MIN[R.role];
  if (gaMin && g >= 8 && m.gaPerGame != null && m.gaPerGame < gaMin) add(6, 'output', pick(m, [
    `Gol più assist: ${f2(m.gaPerGame)} a gara. Per un ${rl} la soglia di lavoro è ${gaMin}: l'incidenza offensiva è insufficiente.`,
    `${m.goals} gol e ${m.assists} assist in ${g} gare (${f2(m.gaPerGame)} a gara): troppo poco per il peso offensivo che il ruolo richiede.`]), `${f2(m.gaPerGame)} G+A a gara (soglia ${gaMin} per ${rl})`,
    `Più presenza tra le linee e inserimenti senza palla: ${m.goals} gol e ${m.assists} assist in ${g} gare non bastano per un ${rl}.`);
  if (R.group === 'off' && m.dryStreak >= 3) add(6, 'streak', `${m.dryStreak} gare consecutive senza incidere nel tabellino.`, `${m.dryStreak} gare a secco`);
  if (R.group === 'off' && m.blankShare != null && m.blankShare >= 60 && (m.sample || 0) >= 6) add(5, 'streak', `Nel ${r0(m.blankShare)}% delle ultime ${m.sample} gare non fa né gol né assist.`, `${r0(m.blankShare)}% gare senza G/A`);
  if (R.role === 'ATT' && g >= 15 && m.assistsPerGame != null && m.assistsPerGame < 0.15) add(3, 'balance', `${m.assists} assist in ${g} gare: finalizza ma non fa giocare i compagni.`, `${m.assists} assist in ${g} gare`, `Quando la difesa si chiude sul tuo tiro serve l'ultimo passaggio: ${m.assists} assist in ${g} gare è un solo canale di gioco.`);

  // --- Costanza e forma
  if (stable && m.ratingStd != null && m.ratingStd >= 0.8) add(5, 'consistency', `Rendimento altalenante: deviazione ${f2(m.ratingStd)} sul voto, tra ${f1(m.ratingMin)} e ${f1(m.ratingMax)} nelle gare con almeno 45'.`, `Voto tra ${f1(m.ratingMin)} e ${f1(m.ratingMax)}, dev. ${f2(m.ratingStd)}`);
  if (stable && m.below65Share != null && m.below65Share >= 25) add(7, 'consistency', `${m.below65} partite su ${m.ratedGames} sotto il 6.5: non è un incidente isolato.`, `${m.below65}/${m.ratedGames} gare sotto 6.5`);
  if (stable && m.ratedGames >= 8 && m.form5 != null && m.formBefore != null && m.form5 <= m.formBefore - 0.4) add(6, 'form', `Forma in discesa: ${f2(m.form5)} nelle ultime 5 contro ${f2(m.formBefore)} prima.`, `Ultime 5: ${f2(m.form5)} contro ${f2(m.formBefore)}`);
  else if (stable && m.formVsSeason != null && m.formVsSeason <= -0.5) add(5, 'form', `Sotto il proprio livello: ${f2(m.form5)} nelle ultime 5 contro ${f2(m.rating)} di media stagionale.`, `Ultime 5: ${f2(m.form5)} contro stagione ${f2(m.rating)}`);
  else if (stable && m.ratedGames >= 8 && m.trend != null && m.trend < -0.1) add(4, 'form', `La curva dei voti scende di ${f2(Math.abs(m.trend))} a partita nelle ultime ${m.ratedGames} gare.`, `Pendenza voti ${f2(m.trend)}`);

  // --- Contesto partita
  if (stable && m.nWins >= 3 && m.nNotWin >= 3 && m.ratingNotWin != null && m.ratingInWins != null && m.ratingNotWin <= m.ratingInWins - 0.7) add(5, 'context', `Cala quando non si vince: ${f2(m.ratingNotWin)} in ${m.nNotWin} gare senza vittoria contro ${f2(m.ratingInWins)} in ${m.nWins} vittorie. Segue la squadra invece di trascinarla.`, `Voto ${f2(m.ratingNotWin)} senza vittoria (${m.nNotWin}), ${f2(m.ratingInWins)} con vittoria (${m.nWins})`,
    `Nelle gare bloccate prenditi responsabilità: ${f2(m.ratingNotWin)} di voto senza vittoria contro ${f2(m.ratingInWins)} quando si vince.`);
  else if (stable && m.nBigWin >= 2 && m.nClose >= 3 && m.ratingBigWin != null && m.ratingClose != null && m.ratingBigWin - m.ratingClose >= 0.8) add(5, 'context', `Rende quando la partita è già decisa: ${f2(m.ratingBigWin)} nelle vittorie larghe (${m.nBigWin}) contro ${f2(m.ratingClose)} nelle gare in bilico (${m.nClose}).`, `Voto ${f2(m.ratingBigWin)} in vittorie larghe, ${f2(m.ratingClose)} nelle gare in bilico`,
    `Pretendi lo stesso livello quando il risultato è in bilico: ${f2(m.ratingClose)} nelle ${m.nClose} gare decise da un gol, contro ${f2(m.ratingBigWin)} nelle vittorie larghe.`);
  if (stable && cons && m.nLeaky >= 3 && m.ratingLeaky != null && m.ratingMean != null && m.ratingLeaky <= m.ratingMean - 0.5) add(5, 'context2', `Quando l'avversario segna 3 o più gol (${m.nLeaky} gare) il suo voto scende a ${f2(m.ratingLeaky)} contro ${f2(m.ratingMean)} di media: va in difficoltà quando la gara si apre.`, `Voto ${f2(m.ratingLeaky)} nelle ${m.nLeaky} gare con 3+ gol subiti`);

  // --- Rendimento di squadra col Pro in campo (correlazione, non causa)
  if (m.nOff >= 3 && m.nOn >= 6 && m.concededPerGameOn != null && m.concededPerGameOff != null && m.concededPerGameOn >= m.concededPerGameOff + 0.7)
    add(cons ? 7 : 3, 'defense', `Con lui in campo il club subisce ${f2(m.concededPerGameOn)} gol a gara contro ${f2(m.concededPerGameOff)} nelle ${m.nOff} gare senza di lui${cons ? ': per un ' + rl + ' è un dato che pesa' : ''}.`, `Gol subiti ${f2(m.concededPerGameOn)} a gara con lui, ${f2(m.concededPerGameOff)} senza (${m.nOff} gare)`,
      cons ? `Copri di più lo spazio davanti alla linea: ${f2(m.concededPerGameOn)} gol subiti a gara con te in campo contro ${f2(m.concededPerGameOff)} senza.` : '');
  if (m.nOff >= 3 && m.nOn >= 6 && m.pointsPerGame != null && m.pointsPerGameOff != null && m.pointsPerGame <= m.pointsPerGameOff - 0.7) add(5, 'onoff', `Il club fa ${f2(m.pointsPerGame)} punti a gara con lui e ${f2(m.pointsPerGameOff)} senza (${m.nOff} gare): il risultato non gli dà ragione.`, `Punti a gara ${f2(m.pointsPerGame)} con, ${f2(m.pointsPerGameOff)} senza`);

  // --- Avatar vs rendimento, disciplina, portieri
  if (m.ratingVsOverall != null && m.ratingVsOverall <= -1.2 && g >= 8) add(7, 'overall', `Overall ${m.overall}, rendimento ${f2(m.rating)}: l'avatar vale più di quanto il giocatore produca.`, `Overall ${m.overall} contro media ${f2(m.rating)}`);
  if (m.redCards >= 1) add(m.redCards >= 2 ? 9 : 8, 'discipline', `${m.redCards} ${m.redCards === 1 ? 'espulsione' : 'espulsioni'} in ${g} presenze: lascia la squadra in inferiorità.`, `${m.redCards} ${m.redCards === 1 ? 'rosso' : 'rossi'} in ${g} gare`, `Disciplina: ${m.redCards} ${m.redCards === 1 ? 'rosso' : 'rossi'} in ${g} gare, gli interventi in ritardo vanno eliminati.`);
  if (R.role === 'POR' && m.savePct != null && m.savesTotal > 0 && m.savePct < 65) add(7, 'gk', `Parate sul ${r0(m.savePct)}% dei tiri nello specchio: da portiere deve dare di più.`, `${r0(m.savePct)}% parate (${m.savesTotal})`, `Posizione sul primo palo e uscite più decise: ${r0(m.savePct)}% di parate.`);
  return n.sort((a, b) => b.sev - a.sev);
}

function positives(m) {
  const p = [];
  const add = (sev, area, text, proof) => p.push({sev, area, text, proof});
  const R = roleOf(m);
  const g = m.games || 0;
  const stable = (m.sample || 0) >= 6;
  if (m.rating > 8) add(9, 'rating', `Media EA ${f2(m.rating)} su ${g} presenze da ${R.label}: rendimento da riferimento tecnico del club, non un exploit.`, `Media EA ${f2(m.rating)} in ${g} presenze`);
  if (m.peers && m.peers.ratingRank === 1) add(6, 'peers', `Primo dei ${m.peers.n} del reparto per media EA (mediana ${f2(m.peers.medianRating)}).`, `1° su ${m.peers.n} pari reparto per media`);
  if (m.gaPerGame != null && m.gaPerGame >= 1.2) add(8, 'output', `${f2(m.gaPerGame)} tra gol e assist a gara (${m.goals} reti, ${m.assists} assist): incide su più di una rete a partita.`, `${f2(m.gaPerGame)} G+A a gara`);
  if (m.shareOfClubGA != null && m.shareOfClubGA >= 30) add(7, 'share', `Pesa il ${r0(m.shareOfClubGA)}% dei gol del club tra reti e assist.`, `${r0(m.shareOfClubGA)}% G+A del club`);
  if (m.passPct != null) {
    if (R.group === 'cons' && m.passPct >= 85 && m.passAttPerGame >= 25) add(8, 'pass', `${r0(m.passPct)}% di passaggi con ~${r0(m.passAttPerGame)} tentativi a gara: per un ${R.label} volume e pulizia insieme sono rari.`, `${r0(m.passPct)}% su ~${r0(m.passAttPerGame)} a gara`);
    else if (R.group === 'off' && m.passPct >= 82 && m.passAttPerGame >= 18) add(7, 'pass', `${r0(m.passPct)}% di passaggi da ${R.label}, un ruolo che rischia più degli altri: buona qualità in zone strette.`, `${r0(m.passPct)}% passaggi da ${R.label}`);
  }
  if (m.motmRate >= 20) add(6, 'mom', `${m.motm} premi uomo partita in ${g} gare (${r0(m.motmRate)}%).`, `${m.motm} MVP in ${g} gare`);
  if (stable && m.ratingStd != null && m.ratingStd <= 0.6 && (m.ratedGames || 0) >= 6) add(5, 'consistency', `Costanza: deviazione ${f2(m.ratingStd)} sul voto, peggior gara a ${f1(m.ratingMin)}.`, `Deviazione voti ${f2(m.ratingStd)}, minimo ${f1(m.ratingMin)}`);
  if (m.above8 != null && (m.ratedGames || 0) >= 6 && m.above8 / m.ratedGames >= 0.5) add(5, 'consistency', `${m.above8} gare su ${m.ratedGames} a 8 o più.`, `${m.above8}/${m.ratedGames} gare da 8+`);
  if (stable && m.nClose >= 4 && m.ratingClose != null && m.ratingClose >= 7.5) add(5, 'context', `Regge nelle gare in bilico: ${f2(m.ratingClose)} di media in ${m.nClose} gare decise da un gol o pari.`, `Voto ${f2(m.ratingClose)} in ${m.nClose} gare in bilico`);
  if (m.nOff >= 3 && m.nOn >= 6 && m.concededPerGameOn != null && m.concededPerGameOff != null && m.concededPerGameOn <= m.concededPerGameOff - 0.4) add(5, 'defense', `Con lui in campo il club subisce ${f2(m.concededPerGameOn)} gol a gara, ${f2(m.concededPerGameOff)} senza (${m.nOff} gare).`, `Gol subiti ${f2(m.concededPerGameOn)} con, ${f2(m.concededPerGameOff)} senza`);
  if (stable && m.formVsSeason != null && m.formVsSeason >= 0.4) add(5, 'form', `In crescita: ${f2(m.form5)} nelle ultime 5 contro ${f2(m.rating)} di media stagionale.`, `Ultime 5: ${f2(m.form5)}`);
  if (m.conversionPct >= 35 && m.shotsTotal >= 8) add(6, 'finish', `Conversione al ${r0(m.conversionPct)}% su ${m.shotsTotal} tiri: cinico sotto porta.`, `${r0(m.conversionPct)}% conversione su ${m.shotsTotal} tiri`);
  return p.sort((a, b) => b.sev - a.sev);
}

/* Un limite tecnico reale quando l'elenco dei difetti e` vuoto (anche i migliori ne hanno uno). */
function weakestSpot(m) {
  const R = roleOf(m);
  const c = [];
  if (m.ratingMin != null && m.ratedGames >= 4) c.push({text: `Il limite resta la continuità: nella peggiore gara il voto è sceso a ${f1(m.ratingMin)}.`, proof: `Peggior gara ${f1(m.ratingMin)}`, coach: `Evitare i cali: la peggiore gara recente è a ${f1(m.ratingMin)}, contro una media di ${f2(m.rating)}.`});
  if (m.passFailedPerGame != null) c.push({text: R.group === 'off'
      ? `Nessuna lacuna conclamata nei numeri; il margine di lavoro è nel palleggio: ${r0(m.passPct)}% (~${f1(m.passFailedPerGame)} errori a gara), accettabile per un ${R.label} ma migliorabile.`
      : `Il limite tecnico sono ancora ~${f1(m.passFailedPerGame)} passaggi sbagliati a gara (${r0(m.passPct)}% di precisione).`, proof: `~${f1(m.passFailedPerGame)} passaggi sbagliati a gara`,
    coach: R.group === 'off' ? `Meno palloni persi in zona avanzata: ${r0(m.passPct)}% al passaggio, ~${f1(m.passFailedPerGame)} errori a gara.` : `Ridurre i ~${f1(m.passFailedPerGame)} passaggi persi a gara: a questo livello il margine di crescita è nella pulizia.`});
  if (m.tackPct != null) c.push({text: `Il fondamentale meno solido è il contrasto: riuscito al ${r0(m.tackPct)}%.`, proof: `${r0(m.tackPct)}% contrasti`, coach: `Lavorare sul tempo di intervento: contrasti riusciti al ${r0(m.tackPct)}%.`});
  c.push({text: `Il margine di crescita resta nella fase che non emerge dai numeri EA, perché passaggi progressivi e posizione media non sono disponibili.`, proof: `Dati EA assenti: passaggi progressivi, posizione`, coach: `Verificare a video il lavoro senza palla del ${R.label}: i dati EA non lo misurano.`});
  return c[0];
}

function caveatsFor(m) {
  const c = [];
  const g = m.games || 0;
  if (g < 3) c.push(g === 0 ? 'Nessuna presenza: nessun giudizio tecnico.' : `Solo ${g} ${g === 1 ? 'presenza' : 'presenze'}: nessun giudizio tecnico.`);
  else if (g < 10) c.push(`Campione ridotto (${g} presenze): lettura provvisoria.`);
  if (g >= 3 && (m.sample || 0) < 6) c.push((m.sample || 0) === 0 ? 'Nessuna gara nello storico dettagliato: costanza, forma e contesto-gara non valutati.' : `Dettaglio per gara su ${m.sample} sole partite: costanza, forma e contesto-gara non valutati.`);
  if (m.cameos > 0) c.push(`${m.cameos} ${m.cameos === 1 ? 'presenza' : 'presenze'} sotto i 45' escluse dalle metriche di costanza e contesto.`);
  if (m.roleInferred && g >= 1) c.push('Ruolo dedotto dal codice avatar (nessuna gara nello storico dettagliato).');
  if (m.roleMismatch) c.push(`Schierato da ${m.playedPos} ma avatar ${m.position}${m.proPosLabel ? ` (${m.proPosLabel})` : ''}: valutato come ${m.roleLabel || roleOf(m).label}.`);
  if (m.rating && m.rating < 7 && m.nOff >= 3 && m.nOn >= 6 && m.pointsPerGame != null && m.pointsPerGameOff != null && m.pointsPerGame >= m.pointsPerGameOff + 0.5)
    c.push(`Attenuante di contesto: il club fa ${f2(m.pointsPerGame)} punti a gara con lui e ${f2(m.pointsPerGameOff)} senza (${m.nOff} gare); correlazione su campione piccolo, non cancella il dato tecnico.`);
  return c;
}

function uniqueByArea(list, k) {
  const seen = new Set(), out = [];
  for (const x of list) { if (seen.has(x.area)) continue; seen.add(x.area); out.push(x); if (out.length >= k) break; }
  return out;
}

export function commentFor(m) {
  const R = roleOf(m);
  const g = m.games || 0;
  const caveats = caveatsFor(m);
  const confidence = m.reliability || reliabilityFor(g);
  if (g < 3 || !m.rating) {
    return {
      tier: 'campione_insufficiente', praise: null,
      charge: g === 0 ? 'Nessuna presenza nelle statistiche EA: nulla da valutare.' : `Solo ${g} ${g === 1 ? 'presenza' : 'presenze'} nelle statistiche EA${m.rating ? ` (media ${f2(m.rating)})` : ''}: campione insufficiente per un giudizio tecnico.`,
      proof: [`${g} ${g === 1 ? 'presenza' : 'presenze'}, media EA ${m.rating ? f2(m.rating) : 'non disponibile'}`],
      verdict: 'Nessun verdetto: servono almeno 3 presenze, meglio 10, prima di valutarlo.',
      negatives: [], positives: [], coachNote: `Nessuna istruzione tattica: ${g === 0 ? 'zero presenze' : g + (g === 1 ? ' presenza' : ' presenze')} non bastano a distinguere un limite dal caso. Si rivaluta dopo altre gare da ${R.label}.`,
      confidence, role: R.role, caveats,
    };
  }
  const neg = negatives(m), pos = positives(m);
  const elite = m.rating > 8;
  const uniq = uniqueByArea(neg, 6);
  let limit = null;
  let charge, proofs;
  if (elite) {
    limit = uniq[0] || weakestSpot(m);
    charge = limit.text;
    proofs = [...pos.slice(0, 2).map(x => x.proof), ...uniq.slice(0, 2).map(x => x.proof)];
    if (!uniq.length) proofs.push(limit.proof);
  } else {
    const top = uniq.slice(0, 3);
    const extra = top.length < 2 ? weakestSpot(m) : null; // con pochi difetti si indica comunque il dato più debole
    charge = [...top.map(x => x.text), ...(extra ? [extra.text] : [])].join(' ');
    proofs = [...uniq.slice(0, 4).map(x => x.proof), ...(extra ? [extra.proof] : [])];
    if (extra && !uniq.some(x => x.coach)) limit = extra;
  }
  const praise = elite && pos.length ? uniqueByArea(pos, 2).map(x => x.text).join(' ') : null;

  // coachNote: istruzioni di lavoro concrete dai difetti con indicazione tattica (max 2, aree diverse)
  const coachable = uniq.filter(x => x.coach);
  let coachNote;
  if (coachable.length) coachNote = coachable.slice(0, 2).map(x => x.coach).join(' ');
  else if (limit && limit.coach) coachNote = limit.coach;
  else {
    const w = weakestSpot(m);
    coachNote = w.coach;
  }
  if (elite) coachNote = `Per restare a questo livello: ${coachNote.charAt(0).toLowerCase()}${coachNote.slice(1)}`;
  if (confidence === 'ridotta') coachNote += ` (Indicazione provvisoria su ${g} presenze.)`;

  let verdict;
  if (m.rating < 6.5) verdict = 'Bocciato: oggi non è all\'altezza del livello richiesto dal club.';
  else if (m.rating < 7) verdict = 'Rimandato: la sufficienza non basta, servono precisione e incidenza.';
  else if (m.rating < 7.5) verdict = 'Nella media: utile, mai decisivo. Migliorare è l\'unica strada.';
  else if (m.rating <= 8) verdict = 'Buono ma non da elogio: l\'elogio scatta solo oltre l\'8 di media EA.';
  else verdict = 'Promosso: livello alto, da confermare partita dopo partita.';
  if (confidence === 'ridotta') verdict += ` Lettura provvisoria: ${g} presenze.`;

  const tier = m.rating > 8 ? 'elite' : m.rating >= 7.5 ? 'buono' : m.rating >= 7 ? 'medio' : m.rating >= 6.5 ? 'rimandato' : 'bocciato';
  return {tier, praise, charge, proof: proofs, verdict, negatives: neg, positives: pos, coachNote, confidence, role: R.role, caveats};
}
