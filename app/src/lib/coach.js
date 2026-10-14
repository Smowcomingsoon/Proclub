import { buildAll } from '../../../shared/metrics.mjs';
import { commentFor } from '../../../shared/commentary.mjs';

/** Commenti da allenatore per nome Pro, calcolati su stagione e storico partite. */
export function buildCoachComments(data) {
  const out = new Map();
  for (const metrics of buildAll(data)) {
    if (metrics.games > 0) out.set(metrics.name.toLowerCase(), commentFor(metrics));
  }
  return out;
}
