import { CLUB_ID } from './constants.js';
import { formatMatchTime, formatRating, formatScore } from './format.js';
import { buildGradeComments } from './grades.js';
import { getOpponentName, getResultLetter } from './matches.js';
import { POSITION_ABBREVIATIONS } from './positions.js';
import { mean, toFiniteNumber } from './stats.js';

const charCodeSum = (text) =>
  [...text].reduce((total, char) => total + char.charCodeAt(0), 0);

export function buildCover(players, winners, clubGoals, day = '') {
  const leader =
    winners[0] ||
    [...players].sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1))[0];
  if (!leader)
    return {
      name: 'BILLOCCHI CLUB',
      title: 'La prossima storia aspetta il fischio d’inizio.',
      deck: 'Le prime gare registrate apriranno la prima pagina del club.',
    };
  const dayNumber = day
    ? Math.floor(Date.parse(day + 'T12:00:00Z') / 864e5)
    : 0;
  const pick = (options, offset = 0) =>
    options[
      ((Number.isFinite(dayNumber) ? dayNumber : 0) +
        charCodeSum(leader.name) +
        offset) %
        options.length
    ];
  const name = leader.name;
  const statLine = `${leader.goals} gol, ${leader.assists} assist e media EA ${formatRating(leader.rating)} in ${leader.games} presenze.`;
  const headlines = {
    assist: [
      `${name} firma l’ultimo passaggio.`,
      `${name}, la regia dei gol.`,
      `${name} distribuisce occasioni, non alibi.`,
      `${name}, il tabellino ringrazia.`,
      `${name} mette gli assist in prima pagina.`,
      `${name}, copyright sulla rifinitura.`,
      `${name} fa segnare anche il titolo.`,
      `${name}, il conto lo saldano gli assist.`,
      `${name} manda i compagni in copertina.`,
      `${name}, la firma dietro al gol.`,
      `${name} prepara, il club incassa.`,
      `${name}, gli assist fanno notizia.`,
    ],
    goal: [
      `${name} riscrive il tabellino.`,
      `${name}, la porta è un appuntamento fisso.`,
      `${name} lascia il segno, più volte.`,
      `${name}, la rete ha il suo nome.`,
      `${name} fa parlare i gol.`,
      `${name}, prima pagina a suon di reti.`,
      `${name} presenta il conto in area.`,
      `${name}, la contabilità della rete.`,
      `${name} colleziona firme sul risultato.`,
      `${name}, gol da mettere agli atti.`,
      `${name} cambia i numeri del club.`,
      `${name}, la copertina passa dalla porta.`,
    ],
    save: [
      `${name} difende la copertina.`,
      `${name}, le parate fanno notizia.`,
      `${name} risponde tra i pali.`,
      `${name}, il presidio della porta.`,
      `${name} mette le mani sul titolo.`,
      `${name}, la rete trova un custode.`,
      `${name} porta le parate in prima pagina.`,
      `${name}, gli interventi lasciano traccia.`,
      `${name} fa valere i guanti.`,
      `${name}, una firma tra i pali.`,
      `${name} chiama in causa il tabellino.`,
      `${name}, la porta ha voce in redazione.`,
    ],
    pass: [
      `${name} tiene insieme il racconto.`,
      `${name}, precisione da prima pagina.`,
      `${name} dà ordine ai numeri.`,
      `${name}, i passaggi trovano destinatario.`,
      `${name} firma il fraseggio.`,
      `${name}, la precisione lascia il segno.`,
      `${name} tiene il filo della serata.`,
      `${name}, il pallone arriva a destinazione.`,
      `${name} convince col possesso.`,
      `${name}, qualità nella distribuzione.`,
      `${name} fa circolare la copertina.`,
      `${name}, la manovra ha la sua firma.`,
    ],
    overall: [
      `${name} si prende il titolo.`,
      `${name}, una serata da raccontare.`,
      `${name} lascia la firma sulla notte.`,
      `${name}, i voti lo portano in copertina.`,
      `${name} sale sul tavolo della redazione.`,
      `${name}, la prova che vale la prima pagina.`,
      `${name} chiude la serata in evidenza.`,
      `${name}, il tabellino sostiene l’applauso.`,
      `${name} conquista la cronaca del club.`,
      `${name}, una firma sopra la media.`,
      `${name} guida questa edizione.`,
      `${name}, il rendimento diventa notizia.`,
    ],
    shared: [
      'La prima pagina si divide.',
      'Più firme sulla stessa copertina.',
      'La redazione allarga il podio.',
      'Il titolo ha più protagonisti.',
      'Una copertina, più autori.',
      'La notte trova firme alla pari.',
      'Il voto non scioglie il pari merito.',
      'Gli applausi si dividono equamente.',
      'La prima pagina fa spazio a tutti.',
      'Il riconoscimento ha più nomi.',
      'La copertina è un lavoro a più mani.',
      'Il verdetto lascia il titolo condiviso.',
    ],
  };
  if (winners.length > 1)
    return {
      name: winners.map((winner) => winner.name).join(' + '),
      title: pick(headlines.shared),
      deck:
        `${winners.map((winner) => winner.name).join(' e ')} condividono il riconoscimento: media EA ${formatRating(leader.rating)}. ` +
        pick(
          [
            'Il pari merito è nei numeri.',
            'La redazione assegna una copertina condivisa.',
            'Stesso voto, stesso applauso.',
            'Nessun nome viene escluso dal titolo.',
          ],
          3,
        ),
    };
  const category =
    leader.assists >= 3 && leader.assists > leader.goals
      ? 'assist'
      : leader.goals >= 3
        ? 'goal'
        : leader.saves >= 3
          ? 'save'
          : leader.passPct !== null && leader.passPct >= 85
            ? 'pass'
            : 'overall';
  const extra =
    category === 'save'
      ? ` ${leader.saves} parate registrate.`
      : category === 'pass'
        ? ` ${leader.passPct}% di passaggi riusciti.`
        : '';
  return {
    name,
    title: pick(headlines[category]),
    deck:
      statLine +
      extra +
      ' ' +
      pick(
        [
          'Le cifre sostengono la copertina di questa edizione.',
          'La redazione parte dai numeri, poi si prende la libertà dell’applauso.',
          'Il riconoscimento arriva dalle gare registrate della serata.',
          'È la firma che emerge dal voto EA di questa edizione.',
          'Il verdetto del club ha questi numeri agli atti.',
          'La cronaca delle partite raccolte comincia da qui.',
        ],
        5,
      ),
  };
}

export function buildTurningPoints(games) {
  const sorted = [...games].sort((a, b) => a.timestamp - b.timestamp);
  const points = [];
  const wins = sorted
    .filter((game) => getResultLetter(game) === 'V')
    .sort((first, second) => {
      const firstOwn = first.clubs[CLUB_ID];
      const secondOwn = second.clubs[CLUB_ID];
      return (
        toFiniteNumber(secondOwn.goals) -
        toFiniteNumber(secondOwn.goalsAgainst) -
        (toFiniteNumber(firstOwn.goals) - toFiniteNumber(firstOwn.goalsAgainst))
      );
    });
  wins[0] &&
    points.push({
      tag: 'LA VITTORIA PIÙ LARGA',
      title: `${formatScore(wins[0])}. Il tabellino parla forte.`,
      text: `Contro ${getOpponentName(wins[0])}, alle ${formatMatchTime(wins[0])}: il margine più ampio tra le vittorie di questa edizione.`,
      games: [wins[0]],
    });
  const reaction = sorted.find(
    (game, index) =>
      index > 0 &&
      getResultLetter(game) === 'V' &&
      getResultLetter(sorted[index - 1]) === 'S',
  );
  if (reaction) {
    const index = sorted.indexOf(reaction);
    points.push({
      tag: 'LA RISPOSTA',
      title: 'Una sconfitta, poi la replica.',
      text: `Dopo il ${formatScore(sorted[index - 1])} contro ${getOpponentName(sorted[index - 1])}, arriva il ${formatScore(reaction)} contro ${getOpponentName(reaction)}. La partita successiva rimette una vittoria nel bilancio.`,
      games: [sorted[index - 1], reaction],
    });
  }
  let currentRun = [];
  let bestRun = [];
  for (const game of sorted)
    getResultLetter(game) === 'S'
      ? (currentRun = [])
      : (currentRun.push(game),
        currentRun.length > bestRun.length && (bestRun = [...currentRun]));
  bestRun.length >= 3 &&
    points.push({
      tag: 'LA SERIE POSITIVA',
      title: `${bestRun.length} gare senza cedere.`,
      text: `${bestRun.filter((game) => getResultLetter(game) === 'V').length} vittorie e ${bestRun.filter((game) => getResultLetter(game) === 'P').length} pareggi consecutivi nelle partite registrate della serata.`,
      games: bestRun,
    });
  const closest = sorted
    .filter(
      (game) =>
        Math.abs(
          toFiniteNumber(game.clubs[CLUB_ID]?.goals) -
            toFiniteNumber(game.clubs[CLUB_ID]?.goalsAgainst),
        ) <= 1,
    )
    .sort(
      (a, b) =>
        toFiniteNumber(b.clubs[CLUB_ID]?.goals) +
        toFiniteNumber(b.clubs[CLUB_ID]?.goalsAgainst) -
        toFiniteNumber(a.clubs[CLUB_ID]?.goals) -
        toFiniteNumber(a.clubs[CLUB_ID]?.goalsAgainst),
    )[0];
  closest &&
    points.push({
      tag: 'IL RISULTATO IN BILICO',
      title: `${formatScore(closest)}. Margine minimo.`,
      text: `${getOpponentName(closest)}, alle ${formatMatchTime(closest)}: ${getResultLetter(closest) === 'P' ? 'un pareggio' : 'una gara chiusa con un solo gol di scarto'}. Il risultato finale racconta quanto fossero vicine le squadre.`,
      games: [closest],
    });
  !points.length &&
    sorted[0] &&
    points.push({
      tag: 'IL BILANCIO',
      title: 'Una notte da cui ripartire.',
      text: `${sorted.length} gare registrate. Apri i tabellini per vedere dove è finito il contributo di ciascun Pro.`,
      games: sorted,
    });
  return points.slice(0, 3);
}

export function buildTrial(
  player,
  salt,
  seed = charCodeSum(player.name + salt),
) {
  const comments = buildGradeComments(player, seed);
  const goalsPerGame = player.goals / Math.max(1, player.games);
  const missedPasses = Math.max(0, player.passAttempts - player.passes);
  const missedTackles = Math.max(0, player.tackleAttempts - player.tackles);
  let charge;
  let proof;
  let verdict;
  const pick = (options) => options[seed % options.length];
  player.reds
    ? ((charge = `${player.reds} rossi. Ha prenotato la doccia prima degli altri.`),
      (proof = `${player.reds} espulsioni in ${player.games} presenze.`),
      (verdict =
        'La qualità va lasciata in campo. Il prossimo colpo di genio può risparmiarsi il cartellino.'))
    : player.shots >= 3 && player.goals / player.shots < 0.3
      ? ((charge = pick([
          'Il portiere avversario sta valutando di mandargli un biglietto di ringraziamento.',
          'Tanta produzione al tiro. Il tabellino, però, non accetta preventivi.',
          'La porta è un obiettivo, non un suggerimento geografico.',
          'Il pallone vuole la rete. Lui, ogni tanto, gli concede un anno sabbatico.',
          'Le conclusioni ci sono. Il killer instinct ha chiesto un permesso retribuito.',
          'Il tabellino non assegna gol per entusiasmo: serve il colpo che chiude il discorso.',
        ])),
        (proof = `${player.goals} gol su ${player.shots} tiri: conversione ${Math.round((player.goals / player.shots) * 100)}%. Non distingue tiri fuori, parati o bloccati.`),
        (verdict =
          player.assists >= 2
            ? `La rifinitura lo difende (${player.assists} assist). La finalizzazione resta il prossimo esame.`
            : 'Il volume è agli atti. Ora servono più reti per ogni tentativo.'))
      : player.passAttempts >= 10 &&
          player.passPct !== null &&
          player.passPct < 85
        ? ((charge = pick([
            'Il compagno chiede un pallone, non una promessa elettorale.',
            'Il possesso non è una raccolta fondi per gli avversari.',
            'La visione di gioco c’è. Ogni tanto i piedi leggono un altro copione.',
            'Prima del passaggio della vita, facciamo riuscire quello della serata.',
            'Nel fraseggio serve meno improvvisazione: il compagno non è un investigatore privato.',
            'Il pallone non scotta. Si può tenere abbastanza a lungo da passarlo bene.',
          ])),
          (proof = `${missedPasses} passaggi non riusciti su ${player.passAttempts}; precisione ${player.passPct}%.`),
          (verdict =
            player.goals + player.assists
              ? `I ${player.goals + player.assists} gol + assist gli danno argomenti. La precisione deve raggiungere l’ambizione.`
              : 'La partecipazione alla manovra è registrata. L’esecuzione va ripulita.'))
        : player.tackleAttempts >= 4 &&
            player.tackles / player.tackleAttempts < 0.5
          ? ((charge = pick([
              'La garra si sente. Il recupero del pallone, un po’ meno.',
              'Ha presentato domanda per ogni duello. Troppi colloqui senza assunzione.',
              'L’aggressività fa rumore; il pallone si riprende con un intervento riuscito.',
              'Entrare nel contrasto è il primo capitolo. Uscirne col pallone sarebbe il finale preferito.',
            ])),
            (proof = `${player.tackles} contrasti riusciti su ${player.tackleAttempts}; ${missedTackles} tentativi non riusciti.`),
            (verdict =
              'La voglia di intervenire è agli atti. Il duello deve diventare più efficace, oltre che più rumoroso.'))
          : ((charge = pick([
              'L’accusa non trova un difetto netto. Non è il momento di farsi costruire una statua.',
              'Le cifre lo difendono. Il contratto da fenomeno resta da rinnovare alla prossima gara.',
              'Per questa volta il tribunale resta senza munizioni. Il parcheggio dello stadio conserva il vecchio nome.',
              'Nessuna criticità evidente da inchiodare ai numeri. La prossima partita riapre comunque il fascicolo.',
              'Il tabellino non offre un bersaglio serio. Si prenda l’applauso, senza ordinare il busto in marmo.',
              'Oggi niente condanna statistica. Il posto nell’Olimpo si conferma col prossimo pallone.',
            ])),
            (proof = `Media EA ${formatRating(player.rating)}, ${player.games} presenze, ${player.goals} gol e ${player.assists} assist.`),
            (verdict =
              'Assolto sulle cifre di questa serata. La continuità si dimostra nelle prossime presenze.'));
  return {
    title: player.saves
      ? 'Il custode del risultato.'
      : player.assists > player.goals && player.assists
        ? 'Il servizio ai compagni.'
        : goalsPerGame >= 1
          ? 'Il tabellino lo conosce.'
          : player.goals
            ? 'La firma davanti.'
            : player.tackles
              ? 'Il lavoro nei duelli.'
              : 'La manovra passa anche qui.',
    praise: comments.positive,
    charge,
    proof,
    verdict,
  };
}

export function buildTrials(players, salt) {
  const usedCharges = new Set();
  return players.map((player) => {
    let trial = buildTrial(player, salt);
    let attempt = 0;
    for (; usedCharges.has(trial.charge) && attempt < 12; ) {
      attempt++;
      trial = buildTrial(
        player,
        salt,
        charCodeSum(player.name + salt) + attempt,
      );
    }
    usedCharges.has(trial.charge) &&
      (trial = {
        ...trial,
        charge: `Il fascicolo di ${player.name}: ${trial.proof} La prossima partita può migliorare la risposta; per ora la statua resta in magazzino.`,
      });
    usedCharges.add(trial.charge);
    return {
      player,
      trial,
    };
  });
}

export function buildRoleTrend(playerName, matches) {
  const appearances = [
    ...new Map(
      matches
        .filter((match) => match.clubs?.[CLUB_ID])
        .map((match) => [String(match.matchId), match]),
    ).values(),
  ]
    .sort((a, b) => a.timestamp - b.timestamp)
    .flatMap((match) =>
      Object.values(match.players?.[CLUB_ID] || {})
        .filter(
          (player) =>
            player &&
            player.playername.toLowerCase() === playerName.toLowerCase(),
        )
        .map((appearance) => ({
          appearance,
          match,
        })),
    );
  const role = appearances.at(-1)?.appearance.pos;
  const points = appearances
    .filter((entry) => entry.appearance.pos === role)
    .slice(-12)
    .filter((entry) => toFiniteNumber(entry.appearance.rating) > 0)
    .map((entry) => ({
      rating: toFiniteNumber(entry.appearance.rating),
      date: entry.match.timestamp,
      matchId: entry.match.matchId,
    }));
  if (points.length < 4)
    return {
      role: POSITION_ABBREVIATIONS[role || ''] || '—',
      points,
      previous: null,
      recent: null,
      previousCount: 0,
      recentCount: points.length,
      delta: null,
    };
  const half = Math.floor(points.length / 2);
  const previous = mean(points.slice(0, half).map((point) => point.rating));
  const recent = mean(points.slice(half).map((point) => point.rating));
  return {
    role: POSITION_ABBREVIATIONS[role || ''] || role || '—',
    points,
    previous,
    recent,
    previousCount: half,
    recentCount: points.length - half,
    delta: recent - previous,
  };
}
