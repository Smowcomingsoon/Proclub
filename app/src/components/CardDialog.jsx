import { formatProOverall } from '../lib/format.js';
import { playerHref } from '../lib/route.js';
import { CollectorCard } from './CollectorCard.jsx';
import { SeasonProfile } from './SeasonProfile.jsx';

export function CardDialog({ data, selectedCard, members, setSelectedName }) {
  return (
    <div
      className="card-dialog-backdrop"
      onMouseDown={(event) => {
        event.target === event.currentTarget && setSelectedName(null);
      }}
    >
      <div
        className="card-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`Pagella di ${selectedCard.member.name}`}
      >
        <button
          className="dialog-close"
          onClick={() => setSelectedName(null)}
          aria-label="Chiudi la pagella"
        >
          ×
        </button>
        <div className="dialog-card">
          <CollectorCard
            member={selectedCard.member}
            profile={selectedCard.profile}
            onClick={() => {}}
          />
        </div>
        <div className="dialog-copy">
          <span className="overline">
            {'PAGELLA / '}
            {selectedCard.profile.label}
            {' / '}
            {selectedCard.profile.tier.toUpperCase()}
          </span>
          <h3>{selectedCard.member.name}</h3>
          <div className="form-grade">
            <b>
              {selectedCard.profile.basis === 'none'
                ? '—'
                : selectedCard.profile.score}
            </b>
            <span>
              {selectedCard.profile.basis === 'season'
                ? 'INDICE STAGIONALE'
                : 'INDICE DI FORMA'}
              {' · '}
              {selectedCard.profile.tier.toUpperCase()}
              {selectedCard.profile.hot ? ' · ON FIRE' : ''}
              <small>
                {selectedCard.profile.basis === 'season'
                  ? `${selectedCard.member.gamesPlayed} presenze stagionali in tutti i ruoli; assente dalle cinque gare recenti disponibili.`
                  : `${selectedCard.profile.games} presenze nel reparto; ultime tre: media ${selectedCard.profile.recentRating.toFixed(1)}, ${selectedCard.profile.recentContrib} gol + assist.`}
              </small>
            </span>
          </div>
          <SeasonProfile
            member={selectedCard.member}
            players={members}
            recent={selectedCard.profile}
            data={data}
          />
          <a
            className="pg-link pg-link-dialog"
            href={playerHref(selectedCard.member.name)}
          >
            Apri la pagina del giocatore
          </a>
          <small>
            {
              "L'indice di forma e il colore sono valutazioni del sito. Il numero grande sulla figurina è invece l'overall del Pro fornito da EA: "
            }
            {formatProOverall(selectedCard.member)}.
          </small>
        </div>
      </div>
    </div>
  );
}
