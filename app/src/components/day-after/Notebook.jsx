import { Check, Copy, Newspaper } from 'lucide-react';

export function Notebook({ copyEdition, copyState, text }) {
  return (
    <div className="paper-notebook">
      <Newspaper size={25} />
      <div>
        <span>ANNOTAZIONI A MARGINE</span>
        <p>{text}</p>
      </div>
      <button onClick={copyEdition}>
        {copyState === 'ok' ? <Check size={17} /> : <Copy size={17} />}{' '}
        {copyState === 'ok' ? 'Edizione copiata' : 'Copia per lo spogliatoio'}
      </button>
    </div>
  );
}
