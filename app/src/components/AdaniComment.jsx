import { AdaniMini } from './AdaniMini.jsx';
import { classifyProfile } from '../lib/adani-quotes.js';

/** Commento "della redazione" con la citazione abbinata e il riepilogo del Pro. */
export function AdaniComment({ player, quote }) {
  const summary = player.games
    ? `${player.name}: ${player.goals} gol e ${player.assists} assist in ${player.games} presenze${player.rating === null ? '' : `, media EA ${player.rating.toFixed(2)}`}. ` +
      (classifyProfile(player) === 'assist'
        ? 'La redazione gli dedica l’Adani degli assist: le cifre raccontano il servizio ai compagni.'
        : classifyProfile(player) === 'goal'
          ? 'La produzione offensiva dà il tono a questa citazione. La porta avversaria avrà un’opinione diversa.'
          : classifyProfile(player) === 'duel'
            ? 'Lavoro e duelli entrano nel fascicolo: non tutto il contributo finisce nella colonna dei gol.'
            : classifyProfile(player) === 'roast'
              ? 'Le cifre chiedono una risposta: la battuta punge, il prossimo tabellino può ribattere.'
              : 'Il rendimento ha materiale per il taccuino. Il prossimo capitolo si scrive in campo.')
    : 'Aspetta le prime presenze: il taccuino è aperto, la pagella deve ancora nascere.';
  return (
    <aside
      className="adani-comment"
      aria-label={`Archivio Adani per ${player.name}`}
    >
      <AdaniMini />
      <div>
        <span className="adani-kicker">LA VOCE DI ADANI · ARCHIVIO</span>
        <blockquote>«{quote.text}»</blockquote>
        <p>{summary}</p>
        <details>
          <summary>Citazione e fonte</summary>
          <p>
            {quote.context}{' '}
            <a href={quote.url} target="_blank" rel="noreferrer">
              {quote.source}
            </a>
          </p>
          <small>
            Citazione di Lele Adani. L’abbinamento e il commento sul giocatore
            sono della redazione BILLOCCHI.
          </small>
        </details>
      </div>
    </aside>
  );
}
