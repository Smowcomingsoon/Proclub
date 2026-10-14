import { groupByNight, summarizeNight } from './matches.js';
import { toNumber } from './stats.js';

export function buildGradeComments(stats, variant = 0) {
  const pick = (options) => options[variant % options.length];
  const praise = [];
  const criticism = [];
  const goalsPerGame = stats.goals / Math.max(1, stats.games);
  const assistsPerGame = stats.assists / Math.max(1, stats.games);
  stats.assists > stats.goals &&
    stats.assists > 0 &&
    praise.push(
      pick([
        `La rifinitura è il suo territorio: ${stats.assists} assist in ${stats.games} gare. Il suo ultimo passaggio ha prodotto gol, non soltanto possesso.`,
        `Fa segnare gli altri: ${stats.assists} assist. La sua qualità pesa soprattutto nella preparazione della conclusione; il contributo è quello di un rifinitore decisivo.`,
        `${stats.assists} assist: mette sostanza nel servizio ai compagni. La prestazione vive nel passaggio che precede il gol.`,
        `L’impronta è nella rifinitura, con ${assistsPerGame.toFixed(2)} assist per gara. La giocata non finisce nei suoi piedi: diventa il gol di un compagno.`,
      ]),
    );
  stats.goals &&
    praise.push(
      pick([
        `${stats.goals} gol: presenza concreta in finalizzazione${goalsPerGame >= 1 ? ', con almeno una rete per presenza di media' : ''}. Ha portato peso al tabellino.`,
        `Davanti lascia il segno: ${stats.goals} reti in ${stats.games} presenze. La produzione offensiva ha un risultato concreto.`,
        `Il contributo sotto porta è di ${stats.goals} gol. Non soltanto partecipazione: conclusioni trasformate in reti.`,
        `${goalsPerGame.toFixed(2)} gol per gara: la sua parte di attacco si misura nell’efficacia realizzativa.`,
      ]),
    );
  stats.assists &&
    stats.assists <= stats.goals &&
    praise.push(
      `Ai gol affianca ${stats.assists} assist: sa contribuire anche alla conclusione degli altri.`,
    );
  stats.passPct !== null &&
    stats.passPct >= 85 &&
    stats.passAttempts >= 10 &&
    praise.push(
      pick([
        `Pulizia nella distribuzione: ${stats.passPct}% nei passaggi (${stats.passes}/${stats.passAttempts}). La trasmissione del pallone è una base affidabile.`,
        `Precisione tecnica all’${stats.passPct}% su ${stats.passAttempts} passaggi: il dato premia l’esecuzione nella circolazione.`,
        `${stats.passes} passaggi riusciti e ${stats.passPct}% di precisione: una prova ordinata con il pallone.`,
        `Nel fraseggio mantiene un’alta precisione: ${stats.passPct}% di passaggi riusciti. La qualità è nella continuità dell’esecuzione.`,
      ]),
    );
  stats.tackles &&
    praise.length < 2 &&
    praise.push(
      `${stats.tackles} contrasti riusciti su ${stats.tackleAttempts}: aggiunge sostanza nei duelli e nel recupero del pallone.`,
    );
  stats.saves &&
    praise.unshift(
      `${stats.saves} parate: la sua prestazione trova peso negli interventi a protezione della porta.`,
    );
  praise.length ||
    praise.push(
      `${stats.games} presenze, ${stats.passes} passaggi riusciti e ${stats.tackles} contrasti. Il lavoro registrato è soprattutto nella partecipazione alla manovra e nei duelli; manca un contributo diretto al gol.`,
    );
  const missedPasses = Math.max(0, stats.passAttempts - stats.passes);
  const missedTackles = Math.max(0, stats.tackleAttempts - stats.tackles);
  stats.reds &&
    criticism.push(
      `${stats.reds} espulsioni: la disciplina rovina la prestazione. Il protagonismo va cercato col pallone, non con un appuntamento anticipato negli spogliatoi.`,
    );
  stats.shots >= 3 &&
    stats.goals / stats.shots < 0.3 &&
    criticism.push(
      pick([
        `${stats.goals} gol su ${stats.shots} tiri: manca efficacia in finalizzazione. L’attacco non vive di intenzioni: qui il portiere avversario ringrazia.`,
        `La conversione è ${Math.round((stats.goals / stats.shots) * 100)}%: ${stats.shots - stats.goals} tiri senza rete. Tanto lavoro al tiro, poca ferocia sul tabellino.`,
        `${stats.shots} conclusioni per ${stats.goals} gol: la produzione al tiro deve diventare più concreta. Le reti non si assegnano per partecipazione.`,
        `Sotto porta lascia margine: ${stats.goals}/${stats.shots}. Il volume c’è, ma il colpo decisivo non arriva abbastanza spesso. Il pallone va in rete, non in terapia.`,
      ]),
    );
  missedPasses &&
    stats.passPct !== null &&
    stats.passPct < 85 &&
    criticism.push(
      pick([
        `La trasmissione va ripulita: ${missedPasses} passaggi non riusciti, precisione ${stats.passPct}%. Una squadra non può costruire soltanto sulle buone intenzioni: meno fretta, più qualità.`,
        `${stats.passPct}% nei passaggi: ${missedPasses} errori su ${stats.passAttempts} tentativi. Il fraseggio chiede un’esecuzione migliore; il compagno non può ricevere una promessa.`,
        `Con ${missedPasses} passaggi non riusciti, la pulizia tecnica è il punto da correggere. Qui il pallone scotta troppo: trattalo da alleato, non da patata bollente.`,
        `Distribuzione al ${stats.passPct}%: resta troppo margine nei passaggi. L’idea di gioco ha bisogno di piedi che la accompagnino, non che la sabotino.`,
        `${missedPasses}/${stats.passAttempts} passaggi non arrivano: serve precisione nell’esecuzione. Il possesso non è un regalo da distribuire all’avversario.`,
        `Il ${stats.passPct}% nei passaggi frena la qualità del fraseggio. ${missedPasses} tentativi non riusciti: prima di cercare il capolavoro, facciamo arrivare il pallone.`,
      ]),
    );
  missedTackles >= 3 &&
    stats.tackleAttempts &&
    stats.tackles / stats.tackleAttempts < 0.5 &&
    criticism.push(
      pick([
        `Nei contrasti riesce in ${stats.tackles} tentativi su ${stats.tackleAttempts}: va alzata l’efficacia del duello. L’aggressività senza recupero fa rumore, non difesa.`,
        `${missedTackles} contrasti non riusciti: il dato chiede più efficacia nell’intervento. Entrare nel duello è facile; uscirne col pallone sarebbe la parte interessante.`,
        `Il bilancio dei duelli è ${stats.tackles}/${stats.tackleAttempts}. C’è da migliorare la riuscita del contrasto: la garra da sola non porta il pallone a casa.`,
        `Troppi tentativi di contrasto senza recupero (${missedTackles}). La voglia di intervenire non basta: bisogna far pesare l’intervento.`,
      ]),
    );
  criticism.length ||
    criticism.push(
      pick([
        'Non emerge un difetto netto nelle cifre della serata. Ora deve confermare questa pulizia: una bella pagella non è un abbonamento al posto da titolare.',
        'I numeri non isolano una criticità evidente. Il prossimo esame è ripetere la prova: lo spogliatoio applaude, ma non firma assegni in bianco.',
        'Nessuna sbavatura significativa da inchiodare al tabellino. Stavolta niente processo: la continuità, però, si dimostra nella prossima partita.',
        'La prova non offre un bersaglio statistico concreto. Si prende il merito, senza cominciare già a progettare la propria statua.',
      ]),
    );
  return {
    positive: praise.slice(0, 2).join(' '),
    negative: criticism.slice(0, 2).join(' '),
  };
}

export function buildGradeRows(members, matches) {
  const uniqueMatches = [
    ...new Map(matches.map((match) => [match.matchId, match])).values(),
  ].sort((a, b) => b.timestamp - a.timestamp);
  const recentMatches = uniqueMatches.slice(0, 15);
  const latestNight = groupByNight(uniqueMatches)[0];
  const recentPlayers = summarizeNight(recentMatches).players;
  const nightPlayers = summarizeNight(latestNight?.games || []).players;
  const names = [
    ...new Set([
      ...members.map((member) => member.name),
      ...recentPlayers.map((player) => player.name),
    ]),
  ];
  return {
    windowSize: recentMatches.length,
    nightGames: latestNight?.games.length || 0,
    nightDate: latestNight?.day,
    rows: names
      .map((name) => {
        const seasonRow = members.find(
          (member) => member.name.toLowerCase() === name.toLowerCase(),
        );
        const recentRow = recentPlayers.find(
          (player) => player.name.toLowerCase() === name.toLowerCase(),
        );
        const eveningRow = nightPlayers.find(
          (player) => player.name.toLowerCase() === name.toLowerCase(),
        );
        return {
          name,
          season:
            toNumber(seasonRow?.gamesPlayed) > 0 &&
            toNumber(seasonRow?.ratingAve) > 0
              ? toNumber(seasonRow?.ratingAve)
              : null,
          seasonGames: toNumber(seasonRow?.gamesPlayed),
          recent: recentRow?.rating ?? null,
          recentGames: recentRow?.ratedGames || 0,
          evening: eveningRow?.rating ?? null,
          eveningGames: eveningRow?.ratedGames || 0,
          session: eveningRow,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}
