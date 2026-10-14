const f1 = v => (v == null ? '—' : v.toFixed(1));
const f2 = v => (v == null ? '—' : v.toFixed(2));
const r0 = v => (v == null ? '—' : Math.round(v));
const isFwd = m => (m.playedPos || m.position) === 'forward';

function negatives(m) {
  const n = [];
  const add = (sev, text, proof) => n.push({sev, text, proof});
  if (m.games >= 3 && m.rating) {
    if (m.rating < 6.5) add(10, `Media EA ${f2(m.rating)}: insufficiente. Un titolare non può vivere di sufficienza risicata.`, `Media EA ${f2(m.rating)} in ${m.games} presenze`);
    else if (m.rating < 7) add(8, `Media ${f2(m.rating)}: è il livello di chi tiene il posto per mancanza di alternative, non per merito.`, `Media EA ${f2(m.rating)}`);
    else if (m.rating < 7.5) add(5, `Media ${f2(m.rating)}: ordinaria amministrazione, niente che sposti una partita.`, `Media EA ${f2(m.rating)}`);
  }
  if (m.ratingVsClubMedian != null && m.ratingVsClubMedian <= -0.4 && m.games >= 8) add(7, `${f1(Math.abs(m.ratingVsClubMedian))} punti sotto la mediana del club: a pari ruolo di squadra, qualcuno rende di più.`, `${f2(m.ratingVsClubMedian)} contro la mediana del club`);
  if (m.passPct != null && m.games >= 3) {
    if (m.passPct < 75) add(10, `Passaggi al ${r0(m.passPct)}%: regala il possesso. A questo livello è un problema tecnico, non di sfortuna.`, `${r0(m.passPct)}% passaggi, ${f1(m.passFailedPerGame)} sbagliati a gara`);
    else if (m.passPct < 80) add(8, `${r0(m.passPct)}% di passaggi riusciti: troppo basso per chi dovrebbe impostare. Circa ${f1(m.passFailedPerGame)} palloni buttati a gara.`, `${r0(m.passPct)}% passaggi, ${f1(m.passFailedPerGame)} sbagliati a gara`);
    else if (m.passPct < 85) add(6, `${r0(m.passPct)}% al passaggio: accettabile per un difensore di categoria inferiore, non per un centrocampista che vuole comandare.`, `${r0(m.passPct)}% passaggi`);
  }
  if (m.recentPassPct != null && m.passPct != null && m.recentPassPct < m.passPct - 4 && m.sample >= 4) add(6, `Precisione in calo: ${r0(m.recentPassPct)}% nelle ultime gare contro ${r0(m.passPct)}% di stagione. Sta peggiorando, non crescendo.`, `Ultime gare ${r0(m.recentPassPct)}% contro stagione ${r0(m.passPct)}%`);
  if (m.worstPassPct != null && m.worstPassPct < 65 && m.sample >= 3) add(5, `Serata nera al passaggio: ${r0(m.worstPassPct)}% nella peggiore. Quando sbaglia, sbaglia in blocco.`, `Peggior gara ${r0(m.worstPassPct)}% passaggi`);
  if (m.passAttPerGame != null && m.passAttPerGame < 22 && m.games >= 5 && !isFwd(m)) add(4, `Solo ${r0(m.passAttPerGame)} passaggi a gara per un centrocampista: partecipa poco alla manovra, il gioco gli passa accanto.`, `${r0(m.passAttPerGame)} passaggi tentati a gara`);
  if (m.tackPct != null && m.tackAttPerGame >= 4 && m.tackPct < 40) add(6, `Contrasti riusciti al ${r0(m.tackPct)}%: entra sempre in ritardo o sul corpo sbagliato.`, `${r0(m.tackPct)}% contrasti, ${f1(m.tackFailedPerGame)} falliti a gara`);
  else if (m.tackFailedPerGame != null && m.tackFailedPerGame >= 9) add(4, `${f1(m.tackFailedPerGame)} contrasti falliti a gara: aggressività senza lettura del tempo di intervento.`, `${f1(m.tackFailedPerGame)} contrasti falliti a gara`);
  if (m.conversionPct != null && m.shotsTotal >= 6 && m.conversionPct < 25) add(6, `${m.shotsTotal} tiri recenti, conversione ${r0(m.conversionPct)}%: servono ${f1(m.shotsPerGoal)} tentativi per un gol. Sotto porta spreca.`, `${r0(m.conversionPct)}% conversione su ${m.shotsTotal} tiri`);
  if (isFwd(m) && m.games >= 5 && m.goalsPerGame != null && m.goalsPerGame < 0.6) add(8, `Da attaccante segna ${f2(m.goalsPerGame)} gol a partita. Il numero davanti dice una cosa, il tabellino un'altra.`, `${f2(m.goalsPerGame)} gol a gara`);
  if (m.gaPerGame != null && m.games >= 5 && m.gaPerGame < 0.3 && !(m.cleanSheets > 0)) add(5, `Gol più assist: ${f2(m.gaPerGame)} a gara. Impatto offensivo quasi nullo.`, `${f2(m.gaPerGame)} gol+assist a gara`);
  if (m.dryStreak >= 3) add(6, `${m.dryStreak} partite di fila senza incidere nel tabellino: l'ultima volta che ha fatto la differenza è un ricordo.`, `${m.dryStreak} gare a secco`);
  if (m.blankShare != null && m.blankShare >= 60 && m.sample >= 5) add(5, `Nel ${r0(m.blankShare)}% delle ultime gare non fa né gol né assist.`, `${r0(m.blankShare)}% gare senza G/A`);
  if (m.ratingStd != null && m.ratingStd >= 0.8) add(5, `Rendimento ballerino: deviazione ${f2(m.ratingStd)} sul voto, tra ${f1(m.ratingMin)} e ${f1(m.ratingMax)}. Non è affidabile.`, `Voto tra ${f1(m.ratingMin)} e ${f1(m.ratingMax)}`);
  if (m.below65Share != null && m.below65Share >= 25 && m.sample >= 4) add(7, `${m.below65} partite su ${m.sample} sotto il 6.5: troppe per essere un incidente.`, `${m.below65}/${m.sample} gare sotto 6.5`);
  if (m.form5 != null && m.formBefore != null && m.form5 <= m.formBefore - 0.4) add(6, `Forma in discesa: ${f2(m.form5)} nelle ultime 5 contro ${f2(m.formBefore)} prima.`, `Ultime 5: ${f2(m.form5)} contro ${f2(m.formBefore)}`);
  if (m.trend != null && m.trend < -0.1) add(4, `La curva dei voti scende di ${f2(Math.abs(m.trend))} a partita.`, `Pendenza voti ${f2(m.trend)}`);
  if (m.ratingInWins != null && m.ratingNotWin != null && m.ratingNotWin <= m.ratingInWins - 0.7) add(5, `Sparisce quando non si vince: ${f2(m.ratingNotWin)} fuori dalle vittorie contro ${f2(m.ratingInWins)} nelle vittorie. Segue la squadra invece di trascinarla.`, `Voto ${f2(m.ratingNotWin)} senza vittoria, ${f2(m.ratingInWins)} con la vittoria`);
  if (m.ratingVsOverall != null && m.ratingVsOverall <= -1.2 && m.games >= 8) add(7, `Overall ${m.overall}, rendimento ${f2(m.rating)}: il personaggio è più forte del giocatore.`, `Overall ${m.overall} contro media ${f2(m.rating)}`);
  if (m.redCards >= 1) add(8, `${m.redCards} espulsioni in ${m.games} presenze: lascia i compagni in inferiorità.`, `${m.redCards} rossi`);
  if (m.savePct != null && m.savesTotal + 0 > 0 && m.savePct < 65) add(7, `Parate sul ${r0(m.savePct)}% dei tiri: da portiere deve dare di più.`, `${r0(m.savePct)}% parate`);
  return n.sort((a, b) => b.sev - a.sev);
}

function positives(m) {
  const p = [];
  const add = (sev, text, proof) => p.push({sev, text, proof});
  if (m.rating >= 8) add(9, `Media EA ${f2(m.rating)} su ${m.games} presenze: è un rendimento da leader tecnico, non un exploit.`, `Media EA ${f2(m.rating)}`);
  if (m.gaPerGame != null && m.gaPerGame >= 1.2) add(8, `${f2(m.gaPerGame)} tra gol e assist a gara: partecipa a più di una rete a partita.`, `${f2(m.gaPerGame)} G+A a gara`);
  if (m.shareOfClubGA != null && m.shareOfClubGA >= 30) add(7, `Pesa il ${r0(m.shareOfClubGA)}% dei gol del club tra reti e assist: un peso tecnico oggettivo.`, `${r0(m.shareOfClubGA)}% G+A del club`);
  if (m.passPct >= 88 && m.passAttPerGame >= 28) add(8, `${r0(m.passPct)}% di passaggi con ${r0(m.passAttPerGame)} tentativi a gara: volume e pulizia, la combinazione più rara.`, `${r0(m.passPct)}% su ${r0(m.passAttPerGame)} a gara`);
  else if (m.passPct >= 88) add(5, `${r0(m.passPct)}% di passaggi riusciti: pulizia tecnica fuori discussione.`, `${r0(m.passPct)}% passaggi`);
  if (m.motmRate >= 25) add(6, `${m.motm} premi uomo partita: il voto di EA conferma l'impatto.`, `${m.motm} MVP`);
  if (m.ratingStd != null && m.ratingStd <= 0.5 && m.sample >= 5) add(5, `Costanza vera: deviazione ${f2(m.ratingStd)} sul voto, sempre su livelli alti.`, `Deviazione voti ${f2(m.ratingStd)}`);
  if (m.above8 != null && m.sample >= 5 && m.above8 / m.sample >= 0.6) add(5, `${m.above8} partite su ${m.sample} a 8 o più.`, `${m.above8}/${m.sample} gare da 8+`);
  if (m.form5 != null && m.formBefore != null && m.form5 >= m.formBefore + 0.3) add(5, `In crescita: ${f2(m.form5)} nelle ultime 5 contro ${f2(m.formBefore)} prima.`, `Ultime 5: ${f2(m.form5)}`);
  if (m.tackPct >= 60 && m.tackAttPerGame >= 3) add(5, `Contrasti al ${r0(m.tackPct)}%: legge bene i tempi.`, `${r0(m.tackPct)}% contrasti`);
  if (m.conversionPct >= 40 && m.shotsTotal >= 6) add(6, `Conversione al ${r0(m.conversionPct)}%: cinico sotto porta.`, `${r0(m.conversionPct)}% conversione`);
  return p.sort((a, b) => b.sev - a.sev);
}

export function commentFor(m) {
  const neg = negatives(m), pos = positives(m);
  const elite = m.rating >= 8;
  const praise = elite && pos.length ? pos.slice(0, 2).map(x => x.text).join(' ') : null;
  const limits = elite ? neg.filter(x => x.sev >= 5).slice(0, 1) : neg.slice(0, 3);
  const charge = limits.length ? limits.map(x => x.text).join(' ') : (elite ? 'Anche a questo livello il tribunale non trova buchi evidenti: il livello va solo mantenuto.' : 'Nessun difetto grave nei numeri, ma senza picchi non c\'è niente da celebrare.');
  const proofs = [...(elite ? pos.slice(0, 2) : []), ...neg.slice(0, 4)].map(x => x.proof);
  let verdict;
  if (m.rating < 6.5) verdict = 'Bocciato: oggi non è all\'altezza del livello richiesto dal club.';
  else if (m.rating < 7) verdict = 'Rimandato: la sufficienza non basta, servono precisione e incidenza.';
  else if (m.rating < 7.5) verdict = 'Nella media: utile, mai decisivo. Migliorare è l\'unica strada.';
  else if (m.rating < 8) verdict = 'Buono ma non ancora da elogio: sotto l\'8 di media non si parla di fuoriclasse.';
  else verdict = 'Promosso: livello alto, da confermare partita dopo partita.';
  return {tier: m.rating >= 8 ? 'elite' : m.rating >= 7.5 ? 'buono' : m.rating >= 7 ? 'medio' : m.rating >= 6.5 ? 'rimandato' : 'bocciato', praise, charge, proof: proofs, verdict, negatives: neg, positives: pos};
}
