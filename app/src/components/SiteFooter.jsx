import { ArrowUpRight } from 'lucide-react';
import { CLUB_ID, EA_CLUBS_URL } from '../lib/constants.js';

const FRESH_LABELS = {
  club: 'club',
  members: 'giocatori',
  matches: 'partite',
  membersCore: 'gol, assist e presenze dei giocatori',
};

const formatDateTime = (isoDate) => new Date(isoDate).toLocaleString('it-IT');

/** Frase di stato sulla sincronizzazione con EA, in base all'ultima lettura. */
function describeSync({ connection, freshKeys, lastSync, capturedAt }) {
  if (connection === 'yes' && lastSync) {
    return `Lettura EA completa: ${formatDateTime(lastSync)}`;
  }
  if (connection === 'partial' && lastSync) {
    const updated = freshKeys.map((key) => FRESH_LABELS[key] || key).join(', ');
    return `Lettura parziale: ${formatDateTime(lastSync)}. Aggiornati: ${updated}; gli altri dati restano alla rilevazione del ${formatDateTime(capturedAt)}.`;
  }
  return `Ultima rilevazione EA: ${formatDateTime(capturedAt)}. Il server EA limita la connessione diretta; i dati vengono sincronizzati periodicamente.`;
}

export function SiteFooter({ connection, data, freshKeys, lastSync }) {
  return (
    <footer>
      <img className="site-logo" src="/logo-billocchi.svg" alt="" />
      <strong>BILLOCCHI CLUB · FC 27</strong>
      <p>
        Dati EA SPORTS FC Clubs. Sincronizzazione salvata ogni settimana;
        verifica sul sito ogni 60 secondi durante la visita.
        <br />
        {describeSync({
          connection,
          freshKeys,
          lastSync,
          capturedAt: data.capturedAt,
        })}
      </p>
      <a
        href={`${EA_CLUBS_URL}/overview?clubId=${CLUB_ID}&platform=common-gen5`}
        target="_blank"
        rel="noreferrer"
      >
        {'Profilo EA '}
        <ArrowUpRight size={14} />
      </a>
    </footer>
  );
}
