import { ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { computeCardProfile } from '../lib/card-profile.js';
import { formatProOverall } from '../lib/format.js';
import { playerHref } from '../lib/route.js';
import { toNumber } from '../lib/stats.js';
import { CollectorCard } from './CollectorCard.jsx';
import { SeasonProfile } from './SeasonProfile.jsx';

function LeaderList({ cards, setSelectedName }) {
  return (
    <div className="leader-list">
      {cards.map(({ member, profile }, index) => (
        <button
          key={member.name}
          className="leader-entry"
          onClick={() => setSelectedName(member.name)}
          aria-label={`Posizione ${index + 1}, ${member.name}, ${toNumber(member.goals) + toNumber(member.assists)} gol più assist. Apri la pagella`}
        >
          <span className="leader-entry-rank">
            #{String(index + 1).padStart(2, '0')}
          </span>
          <span
            className={`leader-mini-card ${profile.tier} ${profile.hot ? 'on-fire' : ''}`}
            aria-hidden="true"
          >
            <span>{formatProOverall(member)}</span>
          </span>
          <span className="leader-entry-name">
            <strong>{member.name}</strong>
            <small>
              {profile.label}
              {' · '}
              {member.gamesPlayed}
              {' PRESENZE'}
              {profile.basis === 'season' ? ' · INDICE STAGIONALE' : ''}
              {profile.hot ? ' · ON FIRE' : ''}
            </small>
          </span>
          <span className="leader-entry-breakdown">
            <b>
              {member.goals}
              {' G'}
            </b>
            <b>
              {member.assists}
              {' A'}
            </b>
          </span>
          <span className="leader-entry-total">
            <strong>{toNumber(member.goals) + toNumber(member.assists)}</strong>
            <small>G + A</small>
          </span>
          <ArrowUpRight className="leader-arrow" size={17} />
        </button>
      ))}
    </div>
  );
}

function CardDialog({ data, selectedCard, members, setSelectedName }) {
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

/**
 * "La rosa": classifica dei Pro per gol + assist e finestra con la pagella.
 * `members` è la rosa già ordinata, `matches` le ultime gare EA.
 */
export function Squad({ members, matches, data }) {
  const [selectedName, setSelectedName] = useState(null);
  const cards = members.map((member) => ({
    member,
    profile: computeCardProfile(member, matches),
  }));
  const selectedCard = cards.find((card) => card.member.name === selectedName);
  useEffect(() => {
    if (!selectedName) return;
    const onKeyDown = (event) => {
      event.key === 'Escape' && setSelectedName(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedName]);
  return (
    <section className="content squad" id="rosa">
      <div className="section-head">
        <div>
          <span className="overline">03 / LA ROSA</span>
          <h2>La classifica dei Pro.</h2>
          <p className="sub">
            Tutti i profili EA in un colpo d’occhio. La graduatoria segue gol +
            assist stagionali; apri un giocatore per la figurina, la pagella e
            il ritratto della sua stagione, più ricco man mano che aumentano le
            presenze.
          </p>
        </div>
        <div className="count">
          {String(members.length).padStart(2, '0')} <small>PROFILI EA</small>
        </div>
      </div>
      <div className="leaderboard-head">
        <span>LEADERBOARD · STAGIONE 2026/27</span>
        <span>GOL + ASSIST</span>
      </div>
      <LeaderList cards={cards} setSelectedName={setSelectedName} />
      <p className="role-note">
        Classifica sui gol + assist stagionali EA, considerando tutti i ruoli.
        Il numero grande della figurina è l'overall del Pro fornito da EA:
        misura l'avatar, non il rendimento del giocatore. Colore e indice di
        forma sono valutazioni del sito sulle gare recenti nel ruolo indicato.
        Se mancano gare recenti, il colore usa i totali stagionali di tutti i
        ruoli; chi non ha presenze resta non classificato.
      </p>
      {selectedCard && (
        <CardDialog
          data={data}
          selectedCard={selectedCard}
          members={members}
          setSelectedName={setSelectedName}
        />
      )}
    </section>
  );
}
