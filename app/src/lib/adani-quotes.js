const RAI_NEWS_URL =
  'https://www.rainews.it/articoli/2022/12/il-dio-del-calcio-si-chiama-messi-non-solo-per-gli-argentini-4adbf32b-7698-49a9-97f8-d51671071449.html';

const FANPAGE_URL =
  'https://www.fanpage.it/sport/calcio/adani-posseduto-in-telecronaca-messi-e-dentro-di-lui-e-gli-appare-maradona-cosa-abbiamo-visto/';

const UNSHOW_URL = 'https://www.unshow.it/lele-adani-tormentoni';

const REPUBBLICA_URL =
  'https://www.repubblica.it/sport/calcio/2022/11/26/news/adani_esultanza_messi_argentina-376333822/';

const ADANI_QUOTES = [
  {
    id: 'facciamo',
    text: 'Facciamo calcio',
    url: 'https://www.goal.com/it/liste/adani-canzone-testo-significato-citazioni/blt60072252ea0bbab2',
    source: 'GOAL',
    context: 'Il tormentone diventato anche un brano nel 2024.',
    categories: ['quality', 'welcome'],
  },
  {
    id: 'garra',
    text: 'La garra charrúa!',
    url: 'https://www.ilgiorno.it/cultura/adani-lascia-sky-a5d4ccda',
    source: 'Il Giorno',
    context: 'Inter–Tottenham, 18 settembre 2018: il gol di Vecino.',
    categories: ['duel', 'quality'],
  },
  {
    id: 'questo',
    text: 'Questo è il calcio!',
    url: 'https://www.ilgiorno.it/cultura/adani-lascia-sky-a5d4ccda',
    source: 'Il Giorno',
    context:
      'Uno dei suoi tormentoni in telecronaca, ricordato l’8 luglio 2021.',
    categories: ['goal', 'quality'],
  },
  {
    id: 'cammelli',
    text: 'Dribbla tutti, anche i cammelli del deserto',
    url: RAI_NEWS_URL,
    source: 'Rai News',
    context:
      'Messi in Argentina–Croazia, 13 dicembre 2022. Qui è una citazione, non una descrizione dei dribbling EA.',
    categories: ['goal', 'quality'],
  },
  {
    id: 'impensato',
    text: 'La dinamica dell’impensato è il football',
    url: RAI_NEWS_URL,
    source: 'Rai News',
    context:
      'Argentina–Croazia, 13 dicembre 2022: l’azione di Messi per il terzo gol.',
    categories: ['assist', 'quality'],
  },
  {
    id: 'alzatevi',
    text: 'Alzatevi in piedi',
    url: RAI_NEWS_URL,
    source: 'Rai News',
    context:
      'Argentina–Croazia, 13 dicembre 2022: l’esaltazione della giocata di Messi.',
    categories: ['goal', 'quality'],
  },
  {
    id: 'palla',
    text: 'Ma che palla ha dato Messi?',
    url: FANPAGE_URL,
    source: 'Fanpage',
    context: 'Argentina–Paesi Bassi, 9 dicembre 2022: l’assist per Molina.',
    categories: ['assist'],
  },
  {
    id: 'piugol',
    text: 'Questo vale più di un gol',
    url: FANPAGE_URL,
    source: 'Fanpage',
    context:
      'Argentina–Paesi Bassi, 9 dicembre 2022: il commento all’assist di Messi.',
    categories: ['assist', 'duel'],
  },
  {
    id: 'viva',
    text: 'Viva el Fútbol',
    url: FANPAGE_URL,
    source: 'Fanpage',
    context:
      'Argentina–Paesi Bassi, 9 dicembre 2022: l’invito a celebrare il calcio.',
    categories: ['assist', 'quality', 'welcome'],
  },
  {
    id: 'allena',
    text: 'Allena di più e parla di meno',
    url: 'https://www.tuttosport.com/news/calcio/2020/02/01-66274654/adani_ancora_contro_allegri_e_bravo_quando_allena_ma_non_quando_parla_',
    source: 'Tuttosport',
    context: 'La frecciata ad Allegri, riportata il 1º febbraio 2020.',
    categories: ['roast', 'welcome'],
  },
  {
    id: 'zitto',
    text: 'Stai zitto lo dici a tuo fratello',
    url: 'https://www.gazzetta.it/Calcio/Serie-A/Juventus/storie/17-02-2023/sfuriate-allegri-bordo-campo-tv-adani-giacca-buttata-460272755247/duello-filosofico-lele-adani.shtml',
    source: 'Gazzetta',
    context:
      'Il confronto televisivo con Allegri: una battuta d’archivio, non un giudizio sul Pro.',
    categories: ['roast', 'duel'],
  },
  {
    id: 'pranzo',
    text: 'In area di rigore c’è il pranzo al sacco!',
    url: UNSHOW_URL,
    source: 'UnShow',
    context:
      'Israele–Italia, settembre 2025: il finale pieno di gol e disattenzioni difensive.',
    categories: ['roast'],
  },
  {
    id: 'analizza',
    text: 'Nessuno analizza il calcio più di me',
    url: UNSHOW_URL,
    source: 'UnShow',
    context:
      'La rivendicazione sulla Bobo TV, ricordata nella raccolta dei tormentoni.',
    categories: ['quality', 'welcome'],
  },
  {
    id: 'effe',
    text: 'Il calcio con la Effe',
    url: UNSHOW_URL,
    source: 'UnShow',
    context: 'Uno dei tormentoni della Bobo TV.',
    categories: ['quality', 'welcome'],
  },
  {
    id: 'complesso',
    text: 'Il calcio non è semplice',
    url: 'https://www.pianetamilan.it/news-milan/interviste/milan-feyenoord-adani-il-calcio-non-e-semplice-se-lo-fosse-stato-i-rossoneri-19-02-2025/',
    source: 'Pianeta Milan',
    context: 'Il commento su Milan–Feyenoord, 19 febbraio 2025.',
    categories: ['roast', 'welcome', 'duel'],
  },
  {
    id: 'spirito',
    text: 'Non c’è posto per i deboli di spirito',
    url: 'https://it.wikiquote.org/wiki/Daniele_Adani',
    source: 'Wikiquote',
    context: 'Brasile–Corea del Sud, 5 dicembre 2022.',
    categories: ['duel', 'welcome'],
  },
  {
    id: 'sinistro',
    text: 'Il sinistro migliore del Mondo!',
    url: REPUBBLICA_URL,
    source: 'Repubblica',
    context:
      'Messi in Argentina–Messico, 26 novembre 2022. Il piede dei Pro non è deducibile dai dati.',
    categories: ['goal'],
  },
  {
    id: 'rispetto',
    text: 'Rispetto per il numero uno',
    url: REPUBBLICA_URL,
    source: 'Repubblica',
    context: 'Argentina–Messico, 26 novembre 2022: l’omaggio a Messi.',
    categories: ['quality', 'goal'],
  },
];

const hashString = (text) =>
  [...text].reduce((total, char) => (total * 31 + char.charCodeAt(0)) >>> 0, 7);

export function classifyProfile(profile) {
  return profile.games
    ? (profile.rating !== null && profile.rating < 6.5) ||
      (profile.passPct !== null &&
        profile.passPct !== undefined &&
        profile.passPct < 70)
      ? 'roast'
      : profile.assists > profile.goals && profile.assists
        ? 'assist'
        : profile.goals >= profile.games * 0.7
          ? 'goal'
          : (profile.tackles || 0) > profile.goals + profile.assists ||
              (profile.saves || 0) > 0
            ? 'duel'
            : 'quality'
    : 'welcome';
}

export function assignQuotes(players, salt) {
  const usedIds = new Set();
  return new Map(
    players.map((player) => {
      const category = classifyProfile(player);
      const ranked = [...ADANI_QUOTES].sort(
        (a, b) =>
          Number(b.categories.includes(category)) -
            Number(a.categories.includes(category)) ||
          hashString(player.name + salt + a.id) -
            hashString(player.name + salt + b.id),
      );
      const quote =
        ranked.find((candidate) => !usedIds.has(candidate.id)) || ranked[0];
      usedIds.add(quote.id);
      return [player.name, quote];
    }),
  );
}

export function toQuotePlayer(member) {
  const count = (value) => Number(value) || 0;
  return {
    name: member.name,
    games: count(member.gamesPlayed),
    goals: count(member.goals),
    assists: count(member.assists),
    rating: count(member.gamesPlayed) ? count(member.ratingAve) : null,
    passPct: count(member.passSuccessRate),
    tackles: count(member.tacklesMade),
  };
}
