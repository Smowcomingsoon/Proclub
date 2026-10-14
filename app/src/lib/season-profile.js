import { perGame, toNumber } from './stats.js';

export function buildSeasonProfile(member, members, recent) {
  const games = toNumber(member.gamesPlayed);
  const goals = toNumber(member.goals);
  const assists = toNumber(member.assists);
  const contributions = goals + assists;
  const rating = toNumber(member.ratingAve);
  const passes = toNumber(member.passesMade);
  const tackles = toNumber(member.tacklesMade);
  const mvps = toNumber(member.manOfTheMatch);
  const reds = toNumber(member.redCards);
  const stage =
    games >= 30
      ? 'Ritratto esteso'
      : games >= 15
        ? 'Profilo in profondità'
        : games >= 5
          ? 'La stagione prende forma'
          : 'Prime impressioni';
  if (!games)
    return {
      stage: 'Profilo in attesa',
      title: 'La sua stagione deve ancora raccontarsi.',
      intro:
        'EA non registra presenze stagionali per questo Pro. Non attribuiamo punti forti o difetti senza prestazioni.',
      sections: [],
      note: 'La descrizione si aggiorna insieme ai dati EA dopo le prime presenze.',
    };
  const title =
    contributions === 0
      ? 'Il lavoro oltre il tabellino.'
      : goals > assists * 2
        ? 'La stagione passa dai suoi gol.'
        : assists > goals
          ? 'Più assist che gol, finora.'
          : 'Gol e assist nello stesso repertorio.';
  const intro = `${member.name} ha disputato ${games} gare: ${goals} gol e ${assists} assist, ${perGame(contributions, games)} contributi offensivi per presenza. Il voto medio EA è ${member.ratingAve}. ${games < 5 ? 'Sono i primi indizi: poche gare possono cambiare molto questa fotografia.' : games < 15 ? 'Il profilo comincia a delinearsi, ma il campione resta breve.' : games < 30 ? 'Il volume di presenze permette una lettura più articolata dei totali.' : 'Una stagione ormai ricca di presenze, da leggere anche oltre gol e assist.'}`;
  const sections = [
    {
      label: 'IL TABELLINO',
      text: `${perGame(goals, games)} gol e ${perGame(assists, games)} assist a partita. ${contributions ? `${Math.round((goals / contributions) * 100)}% dei suoi gol + assist sono reti segnate direttamente.` : 'Non ci sono ancora gol o assist registrati: questo, da solo, non giudica il lavoro difensivo.'} ${goals >= assists && goals > 0 ? 'La voce più pesante della sua produzione è la finalizzazione.' : assists > 0 ? 'Gli assist pesano più dei gol nella sua produzione offensiva.' : 'Il primo contributo offensivo resta un traguardo da seguire.'}`,
    },
  ];
  if (
    (games >= 5 &&
      sections.push({
        label: 'IL PALLONE TRA I PIEDI',
        text: `${passes} passaggi riusciti (${perGame(passes, games)} per presenza), con ${member.passSuccessRate}% di successo secondo EA. ${passes ? (toNumber(member.passSuccessRate) >= 85 ? 'È la parte più ordinata della sua fotografia: conserva un’alta percentuale di passaggi riusciti.' : toNumber(member.passSuccessRate) < 75 ? 'La precisione dei passaggi è una voce concreta da migliorare: il dato resta sotto il 75%.' : 'La percentuale offre un riferimento da provare a superare nelle prossime gare.') : 'Non ci sono passaggi riusciti da interpretare.'} ${games >= 15 ? `${tackles} contrasti riusciti (${perGame(tackles, games)} per gara). Il loro volume dipende anche dai ruoli giocati; non equivale da solo a qualità difensiva.` : ''}`,
      }),
    games >= 15)
  ) {
    const peerRatings = members
      .filter(
        (peer) => peer.name !== member.name && toNumber(peer.gamesPlayed) >= 10,
      )
      .map((peer) => toNumber(peer.ratingAve))
      .sort((a, b) => a - b);
    const middle = Math.floor(peerRatings.length / 2);
    const median = peerRatings.length
      ? peerRatings.length % 2
        ? peerRatings[middle]
        : (peerRatings[middle - 1] + peerRatings[middle]) / 2
      : null;
    sections.push({
      label: 'RENDIMENTO E RICONOSCIMENTI',
      text: `Media EA ${member.ratingAve}; ${mvps} premi uomo partita in ${games} presenze. ${median !== null && peerRatings.length >= 3 ? `Il voto medio è ${rating - median >= 0 ? '+' : ''}${(rating - median).toFixed(1)} rispetto alla mediana degli altri ${peerRatings.length} Pro del club con almeno 10 gare. È un confronto fra tutti i ruoli, non una classifica per posizione.` : 'Il numero di premi e la media descrivono il rendimento complessivo; non provano che ogni gara sia stata costante.'} ${reds ? `${reds} espulsioni registrate: anche la disciplina entra nel bilancio.` : 'Nessuna espulsione registrata.'}`,
    });
  }
  games >= 30 &&
    sections.push({
      label: 'LA PROSSIMA PAGINA',
      text:
        passes && toNumber(member.passSuccessRate) < 75
          ? `Il bersaglio più leggibile è migliorare il ${member.passSuccessRate}% nei passaggi mantenendo il proprio volume di gioco. Gol e assist sono già ${contributions}: il prossimo aggiornamento mostrerà come cambiano i totali e le medie.`
          : contributions
            ? `Il riferimento offensivo è ${perGame(contributions, games)} gol + assist a presenza. Mantenerlo mentre crescono le gare è un obiettivo misurabile. ${mvps ? `I ${mvps} premi EA sono un secondo traguardo da incrementare.` : 'Il primo premio uomo partita EA resta da conquistare.'}`
            : `Il prossimo contributo offensivo darà una nuova pagina al profilo. Per ora i ${tackles} contrasti e i ${passes} passaggi riusciti sono il lavoro registrato oltre al tabellino.`,
    });
  recent.games &&
    sections.push({
      label: `ZOOM RECENTE / ${recent.label}`,
      text: `Nelle ${recent.games} presenze recenti in questo reparto: media EA ${recent.rating.toFixed(1)}, ${recent.goals} gol e ${recent.assists} assist${recent.passAttempts ? `, ${recent.passPct}% nei passaggi` : ''}. Questa finestra è separata dai totali stagionali e può includere al massimo le cinque gare esposte da EA.`,
    });
  return {
    stage,
    title,
    intro,
    sections,
    note: 'Tutti i totali stagionali includono i ruoli giocati. Il profilo si ricalcola ad ogni lettura EA riuscita; la profondità aumenta a 5, 15 e 30 presenze. Non disponiamo dello storico completo delle singole gare: continuità, progressi mese per mese e statistiche stagionali per posizione non sono deducibili.',
  };
}
