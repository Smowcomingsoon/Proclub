import { formatLongDate } from '../../lib/format.js';

export function EditionBar({
  nights,
  selectedNight,
  setCopyState,
  setNightChoice,
}) {
  return (
    <div className="paper-edition-bar">
      <span>LA VOCE DELLO SPOGLIATOIO</span>
      {selectedNight ? (
        <label>
          Serata
          <select
            value={selectedNight.day}
            onChange={(event) => {
              setNightChoice(event.target.value);
              setCopyState('');
            }}
            aria-label="Scegli la serata del giornale"
          >
            {nights.map((night) => (
              <option key={night.day} value={night.day}>
                {formatLongDate(night.day)}
                {' · '}
                {night.games.length}
                {' gare'}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <span>IN ATTESA DELLA PRIMA GARA</span>
      )}
    </div>
  );
}
