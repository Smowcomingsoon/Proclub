import { novelEditorial } from '../../../shared/editorial.mjs';
import { toNumber } from './stats.js';

/**
 * Ritratto critico della stagione di un Pro; si arricchisce a 5, 15 e 30 presenze.
 * `ctx` = { metrics, club }: metriche del Pro (`buildAll`) e analisi di squadra (`analyzeClub`).
 */
export function buildSeasonProfile(member, members, recent, ctx = {}) {
  const games = toNumber(member.gamesPlayed);
  const stage =
    games >= 30
      ? 'Ritratto esteso'
      : games >= 15
        ? 'Profilo in profondità'
        : games >= 5
          ? 'La stagione prende forma'
          : 'Prime impressioni';
  if (!games || !ctx.metrics)
    return {
      stage: 'Profilo in attesa',
      title: 'La sua stagione deve ancora raccontarsi.',
      intro:
        'EA non registra presenze stagionali per questo Pro. Non attribuiamo punti forti o difetti senza prestazioni.',
      sections: [],
      note: 'La descrizione si aggiorna insieme ai dati EA dopo le prime presenze.',
    };
  const novel = novelEditorial(member, ctx.metrics, ctx.club);
  const sections = [...novel.sections];
  recent?.games &&
    sections.push({
      label: `ZOOM RECENTE / ${recent.label}`,
      text: `Nelle ${recent.games} presenze recenti in questo reparto: media EA ${recent.rating.toFixed(1)}, ${recent.goals} gol e ${recent.assists} assist${recent.passAttempts ? `, ${recent.passPct}% nei passaggi` : ''}. Questa finestra è separata dai totali stagionali.`,
    });
  return {
    stage,
    title: novel.title,
    intro: novel.intro,
    sections,
    note: `Giudizio calcolato sui totali stagionali EA e sulle gare dettagliate disponibili; i passaggi sono letti in base al ruolo. Non sono disponibili xG, passaggi chiave né posizione media. ${novel.caveats?.length ? novel.caveats.join(' ') : ''}`.trim(),
  };
}
