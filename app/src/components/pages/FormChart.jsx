import { useEffect, useRef, useState } from 'react';

const HEIGHT = 250;
const PAD = { left: 34, right: 18, top: 22, bottom: 34 };

const shortDate = (timestamp) =>
  new Date(timestamp * 1000).toLocaleDateString('it-IT', {
    timeZone: 'Europe/Rome',
    day: '2-digit',
    month: '2-digit',
  });

function useWidth(ref) {
  const [width, setWidth] = useState(640);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => setWidth(Math.max(260, element.clientWidth));
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

/**
 * Voti EA gara per gara (linea) con la media stagionale come riferimento.
 * `games`: [{ timestamp, rating, opponent, mom }] in ordine cronologico.
 */
export function FormChart({ games, seasonAverage, name }) {
  const wrapRef = useRef(null);
  const width = useWidth(wrapRef);
  const ratings = games.map((game) => game.rating);
  const reference = seasonAverage > 0 ? seasonAverage : null;
  const values = reference ? [...ratings, reference] : ratings;
  let low = Math.max(0, Math.floor(Math.min(...values) - 0.5));
  let high = Math.min(10, Math.ceil(Math.max(...values) + 0.5));
  if (high - low < 3) {
    if (high < 10) high = Math.min(10, low + 3);
    else low = Math.max(0, high - 3);
  }
  const step = high - low > 6 ? 2 : 1;
  const innerW = width - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (index) =>
    PAD.left + (games.length === 1 ? innerW / 2 : (index * innerW) / (games.length - 1));
  const y = (value) => PAD.top + ((high - value) / (high - low)) * innerH;
  const path = games
    .map((game, index) => `${index ? 'L' : 'M'}${x(index).toFixed(1)} ${y(game.rating).toFixed(1)}`)
    .join(' ');
  const ticks = [];
  for (let value = low; value <= high; value += step) ticks.push(value);
  // Etichette data: una per serata (prima gara del giorno), diradate se non c'è spazio.
  const dayLabels = [];
  let lastX = -Infinity;
  games.forEach((game, index) => {
    const first = index === 0 || shortDate(game.timestamp) !== shortDate(games[index - 1].timestamp);
    if (first && x(index) - lastX >= 52) {
      dayLabels.push(index);
      lastX = x(index);
    }
  });
  const dateLabelled = new Set(dayLabels);
  const maxIndex = ratings.indexOf(Math.max(...ratings));
  const minIndex = ratings.indexOf(Math.min(...ratings));
  const labelled = new Set([games.length - 1, maxIndex, minIndex]);
  const summary = `Voti EA di ${name} in ${games.length} gare, dal ${shortDate(games[0].timestamp)} al ${shortDate(games[games.length - 1].timestamp)}: minimo ${Math.min(...ratings).toFixed(1)}, massimo ${Math.max(...ratings).toFixed(1)}${reference ? `, media stagionale ${reference.toFixed(1)}` : ''}.`;
  return (
    <div className="pg-chart" ref={wrapRef}>
      <svg
        width={width}
        height={HEIGHT}
        viewBox={`0 0 ${width} ${HEIGHT}`}
        role="img"
        aria-label={summary}
      >
        {ticks.map((value) => (
          <g key={value}>
            <line
              className="pg-grid"
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(value)}
              y2={y(value)}
            />
            <text className="pg-axis" x={PAD.left - 8} y={y(value) + 4} textAnchor="end">
              {value}
            </text>
          </g>
        ))}
        {reference && (
          <g>
            <line
              className="pg-ref"
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(reference)}
              y2={y(reference)}
            />
            <text
              className="pg-ref-label"
              x={width - PAD.right}
              y={y(reference) + (y(reference) < PAD.top + 16 ? 15 : -6)}
              textAnchor="end"
            >
              {`Media stagione ${reference.toFixed(1)}`}
            </text>
          </g>
        )}
        {games.length > 1 && <path className="pg-line" d={path} />}
        {games.map((game, index) => (
          <g key={game.timestamp}>
            <circle
              className={game.mom ? 'pg-dot pg-dot-mom' : 'pg-dot'}
              cx={x(index)}
              cy={y(game.rating)}
              r={game.mom ? 5.5 : 4}
            >
              <title>{`${shortDate(game.timestamp)}${game.opponent ? ` vs ${game.opponent}` : ''}: ${game.rating.toFixed(1)}${game.mom ? ' (MVP)' : ''}`}</title>
            </circle>
            {labelled.has(index) && (
              <text
                className="pg-point-label"
                x={x(index)}
                y={y(game.rating) + (index === minIndex && index !== maxIndex ? 18 : -10)}
                textAnchor={index === 0 ? 'start' : index === games.length - 1 ? 'end' : 'middle'}
              >
                {game.rating.toFixed(1)}
              </text>
            )}
            {dateLabelled.has(index) && (
              <text
                className="pg-axis"
                x={x(index)}
                y={HEIGHT - 12}
                textAnchor={index === 0 ? 'start' : index === games.length - 1 ? 'end' : 'middle'}
              >
                {shortDate(game.timestamp)}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
