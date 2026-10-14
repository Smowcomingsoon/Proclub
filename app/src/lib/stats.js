export const toNumber = (value) => Number(value || 0);

export const averageRating = (players) =>
  players.length
    ? players.reduce((total, player) => total + toNumber(player.rating), 0) /
      players.length
    : null;

const sumBy = (items, key) =>
  items.reduce((total, item) => total + toNumber(item[key]), 0);

export const percentage = (part, whole) =>
  whole ? Math.round((part / whole) * 100) : null;

export function summarizePlayers(players) {
  return {
    games: players.length,
    rating: averageRating(players),
    goals: sumBy(players, 'goals'),
    assists: sumBy(players, 'assists'),
    shots: sumBy(players, 'shots'),
    passes: sumBy(players, 'passesmade'),
    attempts: sumBy(players, 'passattempts'),
    tackles: sumBy(players, 'tacklesmade'),
    saves: sumBy(players, 'saves'),
    pass: percentage(
      sumBy(players, 'passesmade'),
      sumBy(players, 'passattempts'),
    ),
  };
}

export function topPerformer(players, key, minimum = 1) {
  return [...players]
    .filter((player) => toNumber(player[key]) >= minimum)
    .sort(
      (a, b) =>
        toNumber(b[key]) - toNumber(a[key]) ||
        toNumber(b.rating) - toNumber(a.rating),
    )[0];
}

export const perGame = (value, games) =>
  (toNumber(value) / Math.max(1, games)).toFixed(2);

export const toFiniteNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const mean = (values) =>
  values.length
    ? values.reduce((total, value) => total + value, 0) / values.length
    : null;

export const ratio = (numerator, denominator) =>
  toNumber(denominator)
    ? (toNumber(numerator) / toNumber(denominator)).toFixed(2)
    : '—';
