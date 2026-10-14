import { Check, Copy, Newspaper } from 'lucide-react';

export function Notebook({
  copyEdition,
  copyState,
  nightStats,
  topAssister,
  topScorer,
}) {
  return (
    <div className="paper-notebook">
      <Newspaper size={25} />
      <div>
        <span>ANNOTAZIONI A MARGINE</span>
        <p>
          {topScorer?.goals
            ? `${topScorer.name}: ${topScorer.goals} gol. `
            : ''}
          {topAssister?.assists
            ? `${topAssister.name}: ${topAssister.assists} assist. `
            : ''}
          {nightStats.players.length}
          {' Pro hanno lasciato una riga in questa edizione.'}
        </p>
      </div>
      <button onClick={copyEdition}>
        {copyState === 'ok' ? <Check size={17} /> : <Copy size={17} />}{' '}
        {copyState === 'ok' ? 'Edizione copiata' : 'Copia per lo spogliatoio'}
      </button>
    </div>
  );
}
