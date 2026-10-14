import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import fallbackJson from './lib/fallback-data.json';
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  Copy,
  Crosshair,
  Flame,
  Newspaper,
  Quote,
  RefreshCw,
  ScanLine,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { Swords } from './lib/icons.js';
import './styles.css';
const re = fallbackJson;
const j = (e) => Number(e || 0);
const M = {
  forward: 'Attacco',
  midfielder: 'Centrocampo',
  defender: 'Difesa',
  goalkeeper: 'Porta',
};
const ie = (e) => Object.values(e.players?.['70375'] || {}).filter((e) => !!e);
const N = (e) =>
  Object.entries(e.clubs).find(([e]) => e !== '70375')?.[1]?.details?.name ||
  'Avversario';
const ae = (e) =>
  e.length ? e.reduce((e, t) => e + j(t.rating), 0) / e.length : null;
const P = (e, t) => e.reduce((e, n) => e + j(n[t]), 0);
const oe = (e, t) => (t ? Math.round((e / t) * 100) : null);
const se = (e, t = 0) => (e === null ? '—' : e.toFixed(t));
function ce(e) {
  return {
    games: e.length,
    rating: ae(e),
    goals: P(e, 'goals'),
    assists: P(e, 'assists'),
    shots: P(e, 'shots'),
    passes: P(e, 'passesmade'),
    attempts: P(e, 'passattempts'),
    tackles: P(e, 'tacklesmade'),
    saves: P(e, 'saves'),
    pass: oe(P(e, 'passesmade'), P(e, 'passattempts')),
  };
}
function le(e, t, n = 1) {
  return [...e]
    .filter((e) => j(e[t]) >= n)
    .sort((e, n) => j(n[t]) - j(e[t]) || j(n.rating) - j(e.rating))[0];
}
function Tag_ue({ label: e, player: t, detail: n, icon: r }) {
  return (
    <article className="lab-award">
      {r}
      <span>{e}</span>
      <strong>{t?.playername || 'Non assegnato'}</strong>
      <p>
        {t ? n : 'Nessuna prestazione soddisfa il criterio in questa gara.'}
      </p>
    </article>
  );
}
function Tag_de({ matches: e }) {
  let t = [...e].sort((e, t) => j(t.timestamp) - j(e.timestamp)),
    [n, r] = useState('studio'),
    [i, a] = useState(''),
    [o, s] = useState('rating'),
    [c, l] = useState(''),
    [d, f] = useState(''),
    [p, m] = useState(''),
    [h, g] = useState(''),
    [_, y] = useState('midfielder'),
    [C, w] = useState('');
  if (!t.length)
    return (
      <section className="content match-lab" id="spogliatoio">
        <h2>Lo spogliatoio.</h2>
        <p>Le pagelle si accendono quando EA rende disponibili le partite.</p>
      </section>
    );
  let T = t.find((e) => e.matchId === i) || t[0],
    E = ie(T),
    O = T.clubs[70375],
    ne = t.flatMap(ie),
    re = [...new Set(ne.map((e) => e.playername))].sort((e, t) =>
      e.localeCompare(t),
    ),
    P = re.includes(c) ? c : re[0],
    de = [...new Set(ne.filter((e) => e.playername === P).map((e) => e.pos))],
    fe = de.includes(d) ? d : de[0],
    pe = [...t].reverse().map((e) => ({
      m: e,
      p: ie(e).find((e) => e.playername === P && e.pos === fe),
    })),
    me = pe.flatMap((e) => (e.p ? [e.p] : [])),
    F = ce(me),
    he = me.at(-1),
    ge = me.slice(0, -1),
    _e = ae(ge),
    I = he && _e !== null ? j(he.rating) - _e : null,
    L = [...E].sort(
      (e, t) =>
        j(t.rating) - j(e.rating) ||
        j(t.goals) + j(t.assists) - j(e.goals) - j(e.assists),
    )[0],
    R = E.find((e) => j(e.mom) > 0),
    ve = le(E, 'goals'),
    z = le(E, 'assists'),
    B = le(E, 'tacklesmade'),
    V = [...E]
      .filter((e) => j(e.passattempts) >= 10)
      .sort(
        (e, t) =>
          j(t.passesmade) / j(t.passattempts) -
            j(e.passesmade) / j(e.passattempts) || j(t.rating) - j(e.rating),
      )[0],
    H = ce(E),
    U =
      j(O.goals) > j(O.goalsAgainst)
        ? 'VITTORIA'
        : j(O.goals) < j(O.goalsAgainst)
          ? 'SCONFITTA'
          : 'PAREGGIO',
    ye = [...E].sort((e, t) =>
      o === 'passes'
        ? (j(t.passattempts) ? j(t.passesmade) / j(t.passattempts) : -1) -
          (j(e.passattempts) ? j(e.passesmade) / j(e.passattempts) : -1)
        : j(t[o]) - j(e[o]),
    ),
    W = re.filter((e) => ne.some((t) => t.playername === e && t.pos === _)),
    G = W.includes(p) ? p : W[0],
    K = W.includes(h) && h !== G ? h : W.find((e) => e !== G),
    q = ce(ne.filter((e) => e.playername === G && e.pos === _)),
    J = ce(ne.filter((e) => e.playername === K && e.pos === _)),
    Y = new Date(j(T.timestamp) * 1e3).toLocaleString('it-IT', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  async function be() {
    let e = `BILLOCCHI CLUB ${O.goals}–${O.goalsAgainst} ${N(T)} · ${Y}\n${U}\nMiglior voto Pro: ${L?.playername || '—'} (${L?.rating || '—'})${R ? `\nMVP EA: ${R.playername}` : ''}\n${ve ? `Bomber: ${ve.playername}, ${ve.goals} gol\n` : ''}${z ? `Regista: ${z.playername}, ${z.assists} assist\n` : ''}Passaggi dei Pro: ${H.passes}/${H.attempts}.\nhttps://billocchi-club.kr3n.chatgpt.site/#spogliatoio`;
    try {
      await navigator.clipboard.writeText(e);
      w('Copiato: pronto per la chat del club.');
    } catch {
      w('Copia manualmente il riepilogo qui sotto.');
    }
  }
  return (
    <section className="content match-lab" id="spogliatoio">
      <div className="section-head">
        <div>
          <span className="overline">EXTRA TIME / LO SPOGLIATOIO</span>
          <h2>La partita dopo la partita.</h2>
          <p className="sub">
            Chi ha acceso la serata? Chi sta crescendo? Qui i numeri diventano
            argomenti da chat.
          </p>
        </div>
        <span className="lab-live">
          <Sparkles size={17} /> {t.length}
          {' GARE DA ESPLORARE'}
        </span>
      </div>
      <div
        className="lab-tabs"
        role="tablist"
        aria-label="Analisi delle performance"
      >
        {[
          ['studio', 'Match studio', Trophy],
          ['forma', 'La mia curva', ChartNoAxesCombined],
          ['duello', 'Testa a testa', Swords],
        ].map(([e, t, i]) => {
          let Tag_a = i;
          return (
            <button
              key={String(e)}
              id={`tab-${e}`}
              role="tab"
              aria-selected={n === e}
              aria-controls={`panel-${e}`}
              tabIndex={n === e ? 0 : -1}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                  e.preventDefault();
                  let t = ['studio', 'forma', 'duello'],
                    i =
                      t[(t.indexOf(n) + (e.key === 'ArrowRight' ? 1 : 2)) % 3];
                  r(i);
                  document.getElementById(`tab-${i}`)?.focus();
                }
              }}
              onClick={() => r(String(e))}
            >
              <Tag_a size={19} />
              {String(t)}
            </button>
          );
        })}
      </div>
      {n === 'studio' && (
        <div
          className="lab-panel"
          id="panel-studio"
          role="tabpanel"
          aria-labelledby="tab-studio"
        >
          <div className="lab-toolbar">
            <label>
              Seleziona la gara
              <select
                value={T.matchId}
                onChange={(e) => {
                  a(e.target.value);
                  w('');
                }}
              >
                {t.map((e) => (
                  <option key={e.matchId} value={e.matchId}>
                    {new Date(j(e.timestamp) * 1e3).toLocaleDateString(
                      'it-IT',
                      {
                        day: 'numeric',
                        month: 'short',
                      },
                    )}
                    {' · '}
                    {e.clubs[70375].goals}–{e.clubs[70375].goalsAgainst}
                    {' vs '}
                    {N(e)}
                  </option>
                ))}
              </select>
            </label>
            <button className="lab-copy" onClick={be}>
              {C.startsWith('Copiato') ? (
                <Check size={17} />
              ) : (
                <Copy size={17} />
              )}
              {' Copia per la chat'}
            </button>
          </div>
          <p className="lab-copy-status" role="status">
            {C}
          </p>
          {C.startsWith('Copia manualmente') && (
            <textarea
              aria-label="Riepilogo da copiare"
              readOnly
              value={`BILLOCCHI CLUB ${O.goals}–${O.goalsAgainst} ${N(T)} · ${Y}\nMiglior voto: ${L?.playername} (${L?.rating})\nhttps://billocchi-club.kr3n.chatgpt.site/#spogliatoio`}
            />
          )}
          <div className="lab-scoreboard">
            <div>
              <span className={`lab-outcome ${U}`}>{U}</span>
              <p>
                {Y}
                {j(O.winnerByDnf) > 0
                  ? ' · Vittoria per abbandono avversario'
                  : ''}
              </p>
              <h3>
                {'BILLOCCHI CLUB '}
                <span>
                  {'vs '}
                  {N(T)}
                </span>
              </h3>
            </div>
            <strong>
              {O.goals}
              <i>:</i>
              {O.goalsAgainst}
            </strong>
          </div>
          <div className="lab-story">
            <span>IL VERDETTO DELLO SPOGLIATOIO</span>
            <h3>
              {j(O.goalsAgainst) === 0
                ? 'Porta chiusa. Chat aperta.'
                : j(O.goals) > j(O.goalsAgainst)
                  ? 'Tre punti, qualche brivido.'
                  : j(O.goals) < j(O.goalsAgainst)
                    ? 'La rivincita parte da qui.'
                    : 'Equilibrio sul campo. Dibattito in chat.'}
            </h3>
            <p>
              {L
                ? `${L.playername} firma il miglior voto tra i Pro (${L.rating}). `
                : ''}
              {z ? `${z.playername} serve ${z.assists} assist. ` : ''}
              {H.shots
                ? `${H.goals} gol su ${H.shots} tiri dei Pro: conversione ${oe(H.goals, H.shots)}%.`
                : 'Nessun tiro dei Pro registrato.'}{' '}
              {H.attempts
                ? `${H.attempts - H.passes} passaggi tentati non riusciti: un punto concreto da rivedere insieme.`
                : ''}
            </p>
          </div>
          <div className="lab-awards">
            <Tag_ue
              label={R ? 'MVP UFFICIALE EA' : 'MIGLIOR VOTO PRO'}
              player={R || L}
              detail={`Voto ${(R || L)?.rating} · ${M[(R || L)?.pos || ''] || 'Ruolo EA'}. La copertina è sua.`}
              icon={<Trophy />}
            />
            <Tag_ue
              label="IL CAMERIERE"
              player={z}
              detail={`${z?.assists} assist. Ha apparecchiato, gli altri hanno mangiato.`}
              icon={<Sparkles />}
            />
            <Tag_ue
              label="IL BUTTAFUORI"
              player={B}
              detail={`${B?.tacklesmade} contrasti riusciti su ${B?.tackleattempts}. Il pallone non passa gratis.`}
              icon={<Crosshair />}
            />
            <Tag_ue
              label="PIEDI EDUCATI"
              player={V}
              detail={`${V?.passesmade}/${V?.passattempts} passaggi (${oe(j(V?.passesmade), j(V?.passattempts))}%). Almeno 10 tentativi per il premio.`}
              icon={<Flame />}
            />
          </div>
          <div className="lab-table-head">
            <h3>La pagella completa.</h3>
            <label>
              Ordina per
              <select value={o} onChange={(e) => s(e.target.value)}>
                <option value="rating">Voto EA</option>
                <option value="goals">Gol</option>
                <option value="assists">Assist</option>
                <option value="passes">Passaggi %</option>
                <option value="tacklesmade">Contrasti</option>
              </select>
            </label>
          </div>
          <div className="lab-table-scroll">
            <table className="lab-table">
              <caption>
                {'Prestazioni dei Pro contro '}
                {N(T)}. PAS indica riusciti/tentati; CTR contrasti
                riusciti/tentati.
              </caption>
              <thead>
                <tr>
                  <th>PRO / REPARTO</th>
                  <th>VOTO EA</th>
                  <th>GOL</th>
                  <th>AST</th>
                  <th>TIRI</th>
                  <th>PAS</th>
                  <th>CTR</th>
                  <th>PARATE</th>
                </tr>
              </thead>
              <tbody>
                {ye.map((e) => (
                  <tr key={e.playername}>
                    <th scope="row">
                      {e.playername}
                      <small>{M[e.pos] || e.pos}</small>
                    </th>
                    <td className="lab-rating">{e.rating}</td>
                    <td>{e.goals}</td>
                    <td>{e.assists}</td>
                    <td>{e.shots}</td>
                    <td>
                      {e.passesmade}/{e.passattempts}
                      <small>
                        {se(oe(j(e.passesmade), j(e.passattempts)))}
                        {j(e.passattempts) ? '%' : ''}
                      </small>
                    </td>
                    <td>
                      {e.tacklesmade}/{e.tackleattempts}
                    </td>
                    <td>{e.saves}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="lab-note">
            I premi sono assegnati automaticamente dai dati della gara; in
            parità decide il voto EA. I passaggi e i tiri riguardano solo i Pro
            registrati, non l’intera squadra. Conversione = gol/tiri, non
            precisione nello specchio. Nessuna cronaca minuto per minuto è
            disponibile.
          </p>
        </div>
      )}
      {n === 'forma' && (
        <div
          className="lab-panel"
          id="panel-forma"
          role="tabpanel"
          aria-labelledby="tab-forma"
        >
          <div className="lab-toolbar">
            <label>
              Il tuo Pro
              <select
                value={P || ''}
                onChange={(e) => {
                  l(e.target.value);
                  f('');
                }}
              >
                {re.map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>
            </label>
            <label>
              Reparto osservato
              <select value={fe || ''} onChange={(e) => f(e.target.value)}>
                {de.map((e) => (
                  <option key={e} value={e}>
                    {M[e] || e}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="lab-curve-head">
            <div>
              <span className="overline">
                {M[fe] || 'REPARTO'}
                {' / '}
                {F.games}
                {' PRESENZE'}
              </span>
              <h3>{P || 'Nessun Pro disponibile'}</h3>
              <p>
                {I === null
                  ? 'Servono due presenze nello stesso reparto per confrontare l’ultimo voto.'
                  : `${I >= 0 ? '+' : ''}${I.toFixed(1)} nell’ultima gara rispetto alla media delle ${ge.length} precedenti in questo reparto.`}
              </p>
            </div>
            <strong>
              {se(F.rating, 1)}
              <small>VOTO MEDIO EA</small>
            </strong>
          </div>
          <div
            className="lab-curve"
            aria-label={`Voti di ${P} nel reparto ${M[fe]}, dal più vecchio al più recente`}
          >
            {pe.map(({ m: e, p: t }, n) => (
              <div
                key={e.matchId}
                className={`lab-curve-game ${t ? '' : 'absent'}`}
              >
                <span>{t ? t.rating : '—'}</span>
                <div className="lab-curve-track">
                  {t && (
                    <i
                      style={{
                        height: `${Math.max(0, Math.min(100, j(t.rating) * 10))}%`,
                      }}
                    />
                  )}
                </div>
                <b>
                  {'GARA '}
                  {n + 1}
                </b>
                <small>{N(e)}</small>
                <em>
                  {t
                    ? `${t.goals}G · ${t.assists}A`
                    : ie(e).some((e) => e.playername === P)
                      ? 'Altro reparto'
                      : 'Non presente'}
                </em>
              </div>
            ))}
          </div>
          <div className="lab-stat-grid">
            <div>
              <strong>{F.goals}</strong>
              <span>GOL</span>
            </div>
            <div>
              <strong>{F.assists}</strong>
              <span>ASSIST</span>
            </div>
            <div>
              <strong>
                {se(F.pass)}
                {F.pass === null ? '' : '%'}
              </strong>
              <span>
                {'PASSAGGI · '}
                {F.passes}/{F.attempts}
              </span>
            </div>
            <div>
              <strong>{F.tackles}</strong>
              <span>CONTRASTI RIUSCITI</span>
            </div>
          </div>
          <div className="lab-story">
            <span>IL PROSSIMO OBIETTIVO</span>
            <h3>
              {F.games
                ? F.attempts >= 10 && j(F.pass) < 75
                  ? 'Far arrivare un pallone in più.'
                  : F.shots >= 5 && F.goals === 0
                    ? 'Trasformare il volume in gol.'
                    : I !== null && I < 0
                      ? 'Riprendere il proprio ritmo.'
                      : 'Alzare il proprio riferimento.'
                : 'Aspettiamo il campo.'}
            </h3>
            <p>
              {F.games
                ? F.attempts >= 10 && j(F.pass) < 75
                  ? `${F.attempts - F.passes} passaggi non riusciti su ${F.attempts}. Prova a scegliere una soluzione semplice in più: il dato da seguire è la percentuale nel medesimo reparto.`
                  : F.shots >= 5 && F.goals === 0
                    ? `${F.shots} tiri senza gol nelle gare osservate. Il prossimo traguardo è il primo gol; dai dati non possiamo dedurre la qualità delle occasioni.`
                    : `Il riferimento attuale è ${se(F.rating, 1)} di media EA in ${F.games} presenze. Prova a superarlo nella prossima gara nello stesso reparto, senza confonderlo con l’overall dell’avatar.`
                : 'Nessuna presenza consultabile.'}
            </p>
          </div>
          <p className="lab-note">
            {'Solo le ultime '}
            {t.length}
            {
              ' gare di campionato disponibili da EA. I reparti non vengono mescolati; EA distingue ATT, CEN, DIF e POR, non le singole posizioni come COC e CDC. Una gara in un altro reparto o un’assenza resta vuota, non vale zero. Il campione è breve: descrive queste gare, non tutta la stagione.'
            }
          </p>
        </div>
      )}
      {n === 'duello' && (
        <div
          className="lab-panel"
          id="panel-duello"
          role="tabpanel"
          aria-labelledby="tab-duello"
        >
          <div className="lab-toolbar">
            <label>
              Stesso reparto
              <select value={_} onChange={(e) => y(e.target.value)}>
                {Object.entries(M).map(([e, t]) => (
                  <option key={e} value={e}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Pro A
              <select value={G || ''} onChange={(e) => m(e.target.value)}>
                {W.map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>
            </label>
            <label>
              Pro B
              <select value={K || ''} onChange={(e) => g(e.target.value)}>
                {W.filter((e) => e !== G).map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>
            </label>
          </div>
          {W.length < 2 ? (
            <div className="lab-empty">
              <Swords size={32} />
              <h3>Il duello aspetta un avversario.</h3>
              <p>
                Servono almeno due Pro con una presenza in questo reparto nelle
                gare disponibili. Prova un altro reparto.
              </p>
            </div>
          ) : (
            <>
              <div className="lab-duel-names">
                <div>
                  <strong>{G}</strong>
                  <small>
                    {q.games}
                    {' presenze · '}
                    {M[_]}
                  </small>
                </div>
                <span>VS</span>
                <div>
                  <strong>{K}</strong>
                  <small>
                    {J.games}
                    {' presenze · '}
                    {M[_]}
                  </small>
                </div>
              </div>
              <div className="lab-duel-metrics">
                {[
                  ['Voto medio EA', q.rating, J.rating, 1],
                  ['Gol / presenza', q.goals / q.games, J.goals / J.games, 2],
                  [
                    'Assist / presenza',
                    q.assists / q.games,
                    J.assists / J.games,
                    2,
                  ],
                  ['Passaggi riusciti %', q.pass, J.pass, 0],
                  [
                    'Contrasti / presenza',
                    q.tackles / q.games,
                    J.tackles / J.games,
                    2,
                  ],
                  ...(_ === 'goalkeeper'
                    ? [
                        [
                          'Parate / presenza',
                          q.saves / q.games,
                          J.saves / J.games,
                          2,
                        ],
                      ]
                    : []),
                ].map(([e, t, n, r]) => {
                  let i = t,
                    a = n,
                    o = Math.max(0.01, j(i) + j(a));
                  return (
                    <div key={String(e)} className="lab-duel-row">
                      <b
                        className={
                          i !== null && a !== null && i > a ? 'ahead' : ''
                        }
                      >
                        {se(i, Number(r))}
                      </b>
                      <div>
                        <span>{String(e)}</span>
                        <div className="lab-duel-bar">
                          <i
                            style={{
                              width: `${i === null || a === null ? 50 : (j(i) / o) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <b
                        className={
                          i !== null && a !== null && a > i ? 'ahead' : ''
                        }
                      >
                        {se(a, Number(r))}
                      </b>
                    </div>
                  );
                })}
              </div>
              <div className="lab-story">
                <span>IL VERDETTO? DIPENDE DAL COMPITO.</span>
                <h3>Nessun vincitore per decreto.</h3>
                <p>
                  Il voto racconta il giudizio EA; gol e assist raccontano
                  produzione; passaggi e contrasti raccontano altre parti del
                  lavoro. I valori per presenza rendono leggibili campioni
                  diversi. Il confronto non corregge avversari, minuti o
                  difficoltà delle gare.
                </p>
              </div>
            </>
          )}
          <p className="lab-note">
            {'Confronto sulle ultime '}
            {t.length}
            {
              ' gare disponibili, solo nel reparto scelto. Le presenze possono appartenere a partite diverse. Percentuale passaggi calcolata sui tentativi totali; — significa nessun tentativo. Colore = valore più alto, non miglior giocatore in assoluto.'
            }
          </p>
        </div>
      )}
    </section>
  );
}
function Tag_fe() {
  let e = useRef(null),
    [t, n] = useState('loading'),
    [i, a] = useState(false),
    o = useRef(false);
  useEffect(() => {
    o.current = i;
  }, [i]);
  useEffect(() => {
    let t = e.current;
    if (!t) return;
    let i = false,
      a = false,
      s = false,
      c,
      l = new IntersectionObserver(async ([e]) => {
        if (((s = e.isIntersecting), !(!s || a))) {
          a = true;
          try {
            let { createAdaniScene: e } =
              await import('./vendor/adani-scene.js');
            if (i) return;
            if (
              ((c = await e(
                t,
                () => s && !o.current && !document.hidden,
                () => i,
              )),
              i)
            ) {
              c();
              return;
            }
            n('ready');
          } catch {
            i || n('unavailable');
          }
        }
      });
    l.observe(t);
    return () => {
      i = true;
      l.disconnect();
      c?.();
    };
  }, []);
  return (
    <div className="adani-mini">
      <div
        ref={e}
        className="adani-canvas"
        role="img"
        aria-label="Il modello 3D allegato, animato mentre scrive una pagella sul taccuino"
      />
      {t === 'loading' && (
        <span className="adani-loading">Apre il taccuino…</span>
      )}
      {t === 'unavailable' && (
        <span className="adani-loading">La pagella resta qui sotto.</span>
      )}
      {t === 'ready' && (
        <button
          className="adani-motion"
          onClick={() => a(!i)}
          aria-pressed={i}
          aria-label={i ? 'Riprendi la scrittura 3D' : 'Ferma la scrittura 3D'}
        >
          {i ? 'Riprendi' : 'In redazione · pausa'}
        </button>
      )}
    </div>
  );
}
const pe =
  'https://www.rainews.it/articoli/2022/12/il-dio-del-calcio-si-chiama-messi-non-solo-per-gli-argentini-4adbf32b-7698-49a9-97f8-d51671071449.html';
const me =
  'https://www.fanpage.it/sport/calcio/adani-posseduto-in-telecronaca-messi-e-dentro-di-lui-e-gli-appare-maradona-cosa-abbiamo-visto/';
const F = 'https://www.unshow.it/lele-adani-tormentoni';
const he =
  'https://www.repubblica.it/sport/calcio/2022/11/26/news/adani_esultanza_messi_argentina-376333822/';
const ge = [
  {
    id: 'facciamo',
    text: 'Facciamo calcio',
    url: 'https://www.goal.com/it/liste/adani-canzone-testo-significato-citazioni/blt60072252ea0bbab2',
    source: 'GOAL',
    context: 'Il tormentone diventato anche un brano nel 2024.',
    categories: ['quality', 'welcome'],
  },
  {
    id: 'garra',
    text: 'La garra charrúa!',
    url: 'https://www.ilgiorno.it/cultura/adani-lascia-sky-a5d4ccda',
    source: 'Il Giorno',
    context: 'Inter–Tottenham, 18 settembre 2018: il gol di Vecino.',
    categories: ['duel', 'quality'],
  },
  {
    id: 'questo',
    text: 'Questo è il calcio!',
    url: 'https://www.ilgiorno.it/cultura/adani-lascia-sky-a5d4ccda',
    source: 'Il Giorno',
    context:
      'Uno dei suoi tormentoni in telecronaca, ricordato l’8 luglio 2021.',
    categories: ['goal', 'quality'],
  },
  {
    id: 'cammelli',
    text: 'Dribbla tutti, anche i cammelli del deserto',
    url: pe,
    source: 'Rai News',
    context:
      'Messi in Argentina–Croazia, 13 dicembre 2022. Qui è una citazione, non una descrizione dei dribbling EA.',
    categories: ['goal', 'quality'],
  },
  {
    id: 'impensato',
    text: 'La dinamica dell’impensato è il football',
    url: pe,
    source: 'Rai News',
    context:
      'Argentina–Croazia, 13 dicembre 2022: l’azione di Messi per il terzo gol.',
    categories: ['assist', 'quality'],
  },
  {
    id: 'alzatevi',
    text: 'Alzatevi in piedi',
    url: pe,
    source: 'Rai News',
    context:
      'Argentina–Croazia, 13 dicembre 2022: l’esaltazione della giocata di Messi.',
    categories: ['goal', 'quality'],
  },
  {
    id: 'palla',
    text: 'Ma che palla ha dato Messi?',
    url: me,
    source: 'Fanpage',
    context: 'Argentina–Paesi Bassi, 9 dicembre 2022: l’assist per Molina.',
    categories: ['assist'],
  },
  {
    id: 'piugol',
    text: 'Questo vale più di un gol',
    url: me,
    source: 'Fanpage',
    context:
      'Argentina–Paesi Bassi, 9 dicembre 2022: il commento all’assist di Messi.',
    categories: ['assist', 'duel'],
  },
  {
    id: 'viva',
    text: 'Viva el Fútbol',
    url: me,
    source: 'Fanpage',
    context:
      'Argentina–Paesi Bassi, 9 dicembre 2022: l’invito a celebrare il calcio.',
    categories: ['assist', 'quality', 'welcome'],
  },
  {
    id: 'allena',
    text: 'Allena di più e parla di meno',
    url: 'https://www.tuttosport.com/news/calcio/2020/02/01-66274654/adani_ancora_contro_allegri_e_bravo_quando_allena_ma_non_quando_parla_',
    source: 'Tuttosport',
    context: 'La frecciata ad Allegri, riportata il 1º febbraio 2020.',
    categories: ['roast', 'welcome'],
  },
  {
    id: 'zitto',
    text: 'Stai zitto lo dici a tuo fratello',
    url: 'https://www.gazzetta.it/Calcio/Serie-A/Juventus/storie/17-02-2023/sfuriate-allegri-bordo-campo-tv-adani-giacca-buttata-460272755247/duello-filosofico-lele-adani.shtml',
    source: 'Gazzetta',
    context:
      'Il confronto televisivo con Allegri: una battuta d’archivio, non un giudizio sul Pro.',
    categories: ['roast', 'duel'],
  },
  {
    id: 'pranzo',
    text: 'In area di rigore c’è il pranzo al sacco!',
    url: F,
    source: 'UnShow',
    context:
      'Israele–Italia, settembre 2025: il finale pieno di gol e disattenzioni difensive.',
    categories: ['roast'],
  },
  {
    id: 'analizza',
    text: 'Nessuno analizza il calcio più di me',
    url: F,
    source: 'UnShow',
    context:
      'La rivendicazione sulla Bobo TV, ricordata nella raccolta dei tormentoni.',
    categories: ['quality', 'welcome'],
  },
  {
    id: 'effe',
    text: 'Il calcio con la Effe',
    url: F,
    source: 'UnShow',
    context: 'Uno dei tormentoni della Bobo TV.',
    categories: ['quality', 'welcome'],
  },
  {
    id: 'complesso',
    text: 'Il calcio non è semplice',
    url: 'https://www.pianetamilan.it/news-milan/interviste/milan-feyenoord-adani-il-calcio-non-e-semplice-se-lo-fosse-stato-i-rossoneri-19-02-2025/',
    source: 'Pianeta Milan',
    context: 'Il commento su Milan–Feyenoord, 19 febbraio 2025.',
    categories: ['roast', 'welcome', 'duel'],
  },
  {
    id: 'spirito',
    text: 'Non c’è posto per i deboli di spirito',
    url: 'https://it.wikiquote.org/wiki/Daniele_Adani',
    source: 'Wikiquote',
    context: 'Brasile–Corea del Sud, 5 dicembre 2022.',
    categories: ['duel', 'welcome'],
  },
  {
    id: 'sinistro',
    text: 'Il sinistro migliore del Mondo!',
    url: he,
    source: 'Repubblica',
    context:
      'Messi in Argentina–Messico, 26 novembre 2022. Il piede dei Pro non è deducibile dai dati.',
    categories: ['goal'],
  },
  {
    id: 'rispetto',
    text: 'Rispetto per il numero uno',
    url: he,
    source: 'Repubblica',
    context: 'Argentina–Messico, 26 novembre 2022: l’omaggio a Messi.',
    categories: ['quality', 'goal'],
  },
];
const _e = (e) => [...e].reduce((e, t) => (e * 31 + t.charCodeAt(0)) >>> 0, 7);
function I(e) {
  return e.games
    ? (e.rating !== null && e.rating < 6.5) ||
      (e.passPct !== null && e.passPct !== undefined && e.passPct < 70)
      ? 'roast'
      : e.assists > e.goals && e.assists
        ? 'assist'
        : e.goals >= e.games * 0.7
          ? 'goal'
          : (e.tackles || 0) > e.goals + e.assists || (e.saves || 0) > 0
            ? 'duel'
            : 'quality'
    : 'welcome';
}
function L(e, t) {
  let n = new Set();
  return new Map(
    e.map((e) => {
      let r = I(e),
        i = [...ge].sort(
          (n, i) =>
            Number(i.categories.includes(r)) -
              Number(n.categories.includes(r)) ||
            _e(e.name + t + n.id) - _e(e.name + t + i.id),
        ),
        a = i.find((e) => !n.has(e.id)) || i[0];
      n.add(a.id);
      return [e.name, a];
    }),
  );
}
function R(e) {
  let t = (e) => Number(e) || 0;
  return {
    name: e.name,
    games: t(e.gamesPlayed),
    goals: t(e.goals),
    assists: t(e.assists),
    rating: t(e.gamesPlayed) ? t(e.ratingAve) : null,
    passPct: t(e.passSuccessRate),
    tackles: t(e.tacklesMade),
  };
}
function Tag_ve({ player: e, quote: t }) {
  let n = e.games
    ? `${e.name}: ${e.goals} gol e ${e.assists} assist in ${e.games} presenze${e.rating === null ? '' : `, media EA ${e.rating.toFixed(2)}`}. ` +
      (I(e) === 'assist'
        ? 'La redazione gli dedica l’Adani degli assist: le cifre raccontano il servizio ai compagni.'
        : I(e) === 'goal'
          ? 'La produzione offensiva dà il tono a questa citazione. La porta avversaria avrà un’opinione diversa.'
          : I(e) === 'duel'
            ? 'Lavoro e duelli entrano nel fascicolo: non tutto il contributo finisce nella colonna dei gol.'
            : I(e) === 'roast'
              ? 'Le cifre chiedono una risposta: la battuta punge, il prossimo tabellino può ribattere.'
              : 'Il rendimento ha materiale per il taccuino. Il prossimo capitolo si scrive in campo.')
    : 'Aspetta le prime presenze: il taccuino è aperto, la pagella deve ancora nascere.';
  return (
    <aside
      className="adani-comment"
      aria-label={`Archivio Adani per ${e.name}`}
    >
      <Tag_fe />
      <div>
        <span className="adani-kicker">LA VOCE DI ADANI · ARCHIVIO</span>
        <blockquote>«{t.text}»</blockquote>
        <p>{n}</p>
        <details>
          <summary>Citazione e fonte</summary>
          <p>
            {t.context}{' '}
            <a href={t.url} target="_blank" rel="noreferrer">
              {t.source}
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
const z = (e) => Number(e || 0);
const B = (e, t) => (z(e) / Math.max(1, t)).toFixed(2);
function V(e, t, n) {
  let r = z(e.gamesPlayed),
    i = z(e.goals),
    a = z(e.assists),
    o = i + a,
    s = z(e.ratingAve),
    c = z(e.passesMade),
    l = z(e.tacklesMade),
    u = z(e.manOfTheMatch),
    d = z(e.redCards),
    f =
      r >= 30
        ? 'Ritratto esteso'
        : r >= 15
          ? 'Profilo in profondità'
          : r >= 5
            ? 'La stagione prende forma'
            : 'Prime impressioni';
  if (!r)
    return {
      stage: 'Profilo in attesa',
      title: 'La sua stagione deve ancora raccontarsi.',
      intro:
        'EA non registra presenze stagionali per questo Pro. Non attribuiamo punti forti o difetti senza prestazioni.',
      sections: [],
      note: 'La descrizione si aggiorna insieme ai dati EA dopo le prime presenze.',
    };
  let p =
      o === 0
        ? 'Il lavoro oltre il tabellino.'
        : i > a * 2
          ? 'La stagione passa dai suoi gol.'
          : a > i
            ? 'Più assist che gol, finora.'
            : 'Gol e assist nello stesso repertorio.',
    m = `${e.name} ha disputato ${r} gare: ${i} gol e ${a} assist, ${B(o, r)} contributi offensivi per presenza. Il voto medio EA è ${e.ratingAve}. ${r < 5 ? 'Sono i primi indizi: poche gare possono cambiare molto questa fotografia.' : r < 15 ? 'Il profilo comincia a delinearsi, ma il campione resta breve.' : r < 30 ? 'Il volume di presenze permette una lettura più articolata dei totali.' : 'Una stagione ormai ricca di presenze, da leggere anche oltre gol e assist.'}`,
    h = [
      {
        label: 'IL TABELLINO',
        text: `${B(i, r)} gol e ${B(a, r)} assist a partita. ${o ? `${Math.round((i / o) * 100)}% dei suoi gol + assist sono reti segnate direttamente.` : 'Non ci sono ancora gol o assist registrati: questo, da solo, non giudica il lavoro difensivo.'} ${i >= a && i > 0 ? 'La voce più pesante della sua produzione è la finalizzazione.' : a > 0 ? 'Gli assist pesano più dei gol nella sua produzione offensiva.' : 'Il primo contributo offensivo resta un traguardo da seguire.'}`,
      },
    ];
  if (
    (r >= 5 &&
      h.push({
        label: 'IL PALLONE TRA I PIEDI',
        text: `${c} passaggi riusciti (${B(c, r)} per presenza), con ${e.passSuccessRate}% di successo secondo EA. ${c ? (z(e.passSuccessRate) >= 85 ? 'È la parte più ordinata della sua fotografia: conserva un’alta percentuale di passaggi riusciti.' : z(e.passSuccessRate) < 75 ? 'La precisione dei passaggi è una voce concreta da migliorare: il dato resta sotto il 75%.' : 'La percentuale offre un riferimento da provare a superare nelle prossime gare.') : 'Non ci sono passaggi riusciti da interpretare.'} ${r >= 15 ? `${l} contrasti riusciti (${B(l, r)} per gara). Il loro volume dipende anche dai ruoli giocati; non equivale da solo a qualità difensiva.` : ''}`,
      }),
    r >= 15)
  ) {
    let n = t
        .filter((t) => t.name !== e.name && z(t.gamesPlayed) >= 10)
        .map((e) => z(e.ratingAve))
        .sort((e, t) => e - t),
      i = Math.floor(n.length / 2),
      a = n.length ? (n.length % 2 ? n[i] : (n[i - 1] + n[i]) / 2) : null;
    h.push({
      label: 'RENDIMENTO E RICONOSCIMENTI',
      text: `Media EA ${e.ratingAve}; ${u} premi uomo partita in ${r} presenze. ${a !== null && n.length >= 3 ? `Il voto medio è ${s - a >= 0 ? '+' : ''}${(s - a).toFixed(1)} rispetto alla mediana degli altri ${n.length} Pro del club con almeno 10 gare. È un confronto fra tutti i ruoli, non una classifica per posizione.` : 'Il numero di premi e la media descrivono il rendimento complessivo; non provano che ogni gara sia stata costante.'} ${d ? `${d} espulsioni registrate: anche la disciplina entra nel bilancio.` : 'Nessuna espulsione registrata.'}`,
    });
  }
  r >= 30 &&
    h.push({
      label: 'LA PROSSIMA PAGINA',
      text:
        c && z(e.passSuccessRate) < 75
          ? `Il bersaglio più leggibile è migliorare il ${e.passSuccessRate}% nei passaggi mantenendo il proprio volume di gioco. Gol e assist sono già ${o}: il prossimo aggiornamento mostrerà come cambiano i totali e le medie.`
          : o
            ? `Il riferimento offensivo è ${B(o, r)} gol + assist a presenza. Mantenerlo mentre crescono le gare è un obiettivo misurabile. ${u ? `I ${u} premi EA sono un secondo traguardo da incrementare.` : 'Il primo premio uomo partita EA resta da conquistare.'}`
            : `Il prossimo contributo offensivo darà una nuova pagina al profilo. Per ora i ${l} contrasti e i ${c} passaggi riusciti sono il lavoro registrato oltre al tabellino.`,
    });
  n.games &&
    h.push({
      label: `ZOOM RECENTE / ${n.label}`,
      text: `Nelle ${n.games} presenze recenti in questo reparto: media EA ${n.rating.toFixed(1)}, ${n.goals} gol e ${n.assists} assist${n.passAttempts ? `, ${n.passPct}% nei passaggi` : ''}. Questa finestra è separata dai totali stagionali e può includere al massimo le cinque gare esposte da EA.`,
    });
  return {
    stage: f,
    title: p,
    intro: m,
    sections: h,
    note: 'Tutti i totali stagionali includono i ruoli giocati. Il profilo si ricalcola ad ogni lettura EA riuscita; la profondità aumenta a 5, 15 e 30 presenze. Non disponiamo dello storico completo delle singole gare: continuità, progressi mese per mese e statistiche stagionali per posizione non sono deducibili.',
  };
}
function H({ p: e, players: t, recent: n }) {
  let r = V(e, t, n),
    i = L(t.map(R), 'stagione').get(e.name);
  return (
    <section
      className="season-profile"
      aria-label={`Ritratto stagionale di ${e.name}`}
    >
      <div className="season-profile-heading">
        <span>IL ROMANZO DELLA STAGIONE</span>
        <b>
          {r.stage}
          {' · '}
          {e.gamesPlayed}
          {' presenze'}
        </b>
      </div>
      <h4>{r.title}</h4>
      <p>{r.intro}</p>
      <Tag_ve player={R(e)} quote={i} />
      {r.sections.map((e) => (
        <div key={e.label} className="season-chapter">
          <strong>{e.label}</strong>
          <p>{e.text}</p>
        </div>
      ))}
      <p className="season-profile-note">{r.note}</p>
    </section>
  );
}
const U = (e) => Number(e || 0);
function ye(e) {
  let t = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Rome',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(U(e) * 1e3));
  return ['year', 'month', 'day']
    .map((e) => t.find((t) => t.type === e)?.value)
    .join('-');
}
function W(e) {
  let t = new Date(U(e) * 1e3),
    n = Number(
      new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome',
        hour: '2-digit',
        hourCycle: 'h23',
      }).format(t),
    ),
    r = ye(e);
  if (n >= 6) return r;
  let i = new Date(r + 'T12:00:00Z');
  i.setUTCDate(i.getUTCDate() - 1);
  return i.toISOString().slice(0, 10);
}
function G(e) {
  let t = new Map(
      e
        .filter((e) => e.clubs?.['70375'] && e.matchId)
        .map((e) => [String(e.matchId), e]),
    ),
    n = new Map();
  for (let e of t.values()) {
    let t = W(e.timestamp);
    n.set(t, [...(n.get(t) || []), e]);
  }
  return [...n.entries()]
    .sort(([e], [t]) => t.localeCompare(e))
    .map(([e, t]) => ({
      day: e,
      games: t.sort((e, t) => U(e.timestamp) - U(t.timestamp)),
    }));
}
function K(e) {
  let t = new Map();
  for (let n of e)
    for (let [e, r] of Object.entries(n.players?.['70375'] || {})) {
      if (!r) continue;
      let n = t.get(e) || {
        id: e,
        name: r.playername,
        appearances: [],
      };
      n.name = r.playername;
      n.appearances.push(r);
      t.set(e, n);
    }
  let n = [...t.values()]
      .map((e) => {
        let t = (t) => e.appearances.reduce((e, n) => e + U(n[t]), 0),
          n = e.appearances.filter(
            (e) => Number.isFinite(Number(e.rating)) && U(e.rating) > 0,
          ),
          r = t('goals'),
          i = t('assists'),
          a = t('shots'),
          o = t('passesmade'),
          s = t('passattempts'),
          c = t('tacklesmade'),
          l = t('tackleattempts'),
          u = t('saves'),
          d = t('redcards'),
          f = t('mom');
        return {
          ...e,
          games: e.appearances.length,
          rating: n.length
            ? n.reduce((e, t) => e + U(t.rating), 0) / n.length
            : null,
          ratedGames: n.length,
          goals: r,
          assists: i,
          shots: a,
          passes: o,
          passAttempts: s,
          tackles: c,
          tackleAttempts: l,
          saves: u,
          reds: d,
          mvp: f,
          roles: [...new Set(e.appearances.map((e) => e.pos))],
          passPct: s ? Math.round((o / s) * 100) : null,
        };
      })
      .sort((e, t) => e.name.localeCompare(t.name)),
    r = Math.ceil(e.length / 2),
    i = n.filter((e) => e.games >= r && e.ratedGames === e.games),
    a = false;
  if (!i.length) {
    a = true;
    let e = n.filter((e) => e.ratedGames === e.games && e.rating !== null),
      t = Math.max(0, ...e.map((e) => e.games));
    i = e.filter((e) => e.games === t);
  }
  let o = Math.max(-1, ...i.map((e) => e.rating ?? -1)),
    s = i.filter((e) => Math.abs((e.rating ?? -1) - o) < 1e-6),
    c = e.map((e) => ({
      m: e,
      own: e.clubs[70375],
    }));
  return {
    players: n,
    winners: s,
    required: r,
    fallback: a,
    wins: c.filter((e) => U(e.own.goals) > U(e.own.goalsAgainst)).length,
    draws: c.filter((e) => U(e.own.goals) === U(e.own.goalsAgainst)).length,
    losses: c.filter((e) => U(e.own.goals) < U(e.own.goalsAgainst)).length,
    goals: c.reduce((e, t) => e + U(t.own.goals), 0),
    against: c.reduce((e, t) => e + U(t.own.goalsAgainst), 0),
  };
}
function q(e, t = 0) {
  let n = (e) => e[t % e.length],
    r = [],
    i = [],
    a = e.goals / Math.max(1, e.games),
    o = e.assists / Math.max(1, e.games);
  e.assists > e.goals &&
    e.assists > 0 &&
    r.push(
      n([
        `La rifinitura è il suo territorio: ${e.assists} assist in ${e.games} gare. Il suo ultimo passaggio ha prodotto gol, non soltanto possesso.`,
        `Fa segnare gli altri: ${e.assists} assist. La sua qualità pesa soprattutto nella preparazione della conclusione; il contributo è quello di un rifinitore decisivo.`,
        `${e.assists} assist: mette sostanza nel servizio ai compagni. La prestazione vive nel passaggio che precede il gol.`,
        `L’impronta è nella rifinitura, con ${o.toFixed(2)} assist per gara. La giocata non finisce nei suoi piedi: diventa il gol di un compagno.`,
      ]),
    );
  e.goals &&
    r.push(
      n([
        `${e.goals} gol: presenza concreta in finalizzazione${a >= 1 ? ', con almeno una rete per presenza di media' : ''}. Ha portato peso al tabellino.`,
        `Davanti lascia il segno: ${e.goals} reti in ${e.games} presenze. La produzione offensiva ha un risultato concreto.`,
        `Il contributo sotto porta è di ${e.goals} gol. Non soltanto partecipazione: conclusioni trasformate in reti.`,
        `${a.toFixed(2)} gol per gara: la sua parte di attacco si misura nell’efficacia realizzativa.`,
      ]),
    );
  e.assists &&
    e.assists <= e.goals &&
    r.push(
      `Ai gol affianca ${e.assists} assist: sa contribuire anche alla conclusione degli altri.`,
    );
  e.passPct !== null &&
    e.passPct >= 85 &&
    e.passAttempts >= 10 &&
    r.push(
      n([
        `Pulizia nella distribuzione: ${e.passPct}% nei passaggi (${e.passes}/${e.passAttempts}). La trasmissione del pallone è una base affidabile.`,
        `Precisione tecnica all’${e.passPct}% su ${e.passAttempts} passaggi: il dato premia l’esecuzione nella circolazione.`,
        `${e.passes} passaggi riusciti e ${e.passPct}% di precisione: una prova ordinata con il pallone.`,
        `Nel fraseggio mantiene un’alta precisione: ${e.passPct}% di passaggi riusciti. La qualità è nella continuità dell’esecuzione.`,
      ]),
    );
  e.tackles &&
    r.length < 2 &&
    r.push(
      `${e.tackles} contrasti riusciti su ${e.tackleAttempts}: aggiunge sostanza nei duelli e nel recupero del pallone.`,
    );
  e.saves &&
    r.unshift(
      `${e.saves} parate: la sua prestazione trova peso negli interventi a protezione della porta.`,
    );
  r.length ||
    r.push(
      `${e.games} presenze, ${e.passes} passaggi riusciti e ${e.tackles} contrasti. Il lavoro registrato è soprattutto nella partecipazione alla manovra e nei duelli; manca un contributo diretto al gol.`,
    );
  let s = Math.max(0, e.passAttempts - e.passes),
    c = Math.max(0, e.tackleAttempts - e.tackles);
  e.reds &&
    i.push(
      `${e.reds} espulsioni: la disciplina rovina la prestazione. Il protagonismo va cercato col pallone, non con un appuntamento anticipato negli spogliatoi.`,
    );
  e.shots >= 3 &&
    e.goals / e.shots < 0.3 &&
    i.push(
      n([
        `${e.goals} gol su ${e.shots} tiri: manca efficacia in finalizzazione. L’attacco non vive di intenzioni: qui il portiere avversario ringrazia.`,
        `La conversione è ${Math.round((e.goals / e.shots) * 100)}%: ${e.shots - e.goals} tiri senza rete. Tanto lavoro al tiro, poca ferocia sul tabellino.`,
        `${e.shots} conclusioni per ${e.goals} gol: la produzione al tiro deve diventare più concreta. Le reti non si assegnano per partecipazione.`,
        `Sotto porta lascia margine: ${e.goals}/${e.shots}. Il volume c’è, ma il colpo decisivo non arriva abbastanza spesso. Il pallone va in rete, non in terapia.`,
      ]),
    );
  s &&
    e.passPct !== null &&
    e.passPct < 85 &&
    i.push(
      n([
        `La trasmissione va ripulita: ${s} passaggi non riusciti, precisione ${e.passPct}%. Una squadra non può costruire soltanto sulle buone intenzioni: meno fretta, più qualità.`,
        `${e.passPct}% nei passaggi: ${s} errori su ${e.passAttempts} tentativi. Il fraseggio chiede un’esecuzione migliore; il compagno non può ricevere una promessa.`,
        `Con ${s} passaggi non riusciti, la pulizia tecnica è il punto da correggere. Qui il pallone scotta troppo: trattalo da alleato, non da patata bollente.`,
        `Distribuzione al ${e.passPct}%: resta troppo margine nei passaggi. L’idea di gioco ha bisogno di piedi che la accompagnino, non che la sabotino.`,
        `${s}/${e.passAttempts} passaggi non arrivano: serve precisione nell’esecuzione. Il possesso non è un regalo da distribuire all’avversario.`,
        `Il ${e.passPct}% nei passaggi frena la qualità del fraseggio. ${s} tentativi non riusciti: prima di cercare il capolavoro, facciamo arrivare il pallone.`,
      ]),
    );
  c >= 3 &&
    e.tackleAttempts &&
    e.tackles / e.tackleAttempts < 0.5 &&
    i.push(
      n([
        `Nei contrasti riesce in ${e.tackles} tentativi su ${e.tackleAttempts}: va alzata l’efficacia del duello. L’aggressività senza recupero fa rumore, non difesa.`,
        `${c} contrasti non riusciti: il dato chiede più efficacia nell’intervento. Entrare nel duello è facile; uscirne col pallone sarebbe la parte interessante.`,
        `Il bilancio dei duelli è ${e.tackles}/${e.tackleAttempts}. C’è da migliorare la riuscita del contrasto: la garra da sola non porta il pallone a casa.`,
        `Troppi tentativi di contrasto senza recupero (${c}). La voglia di intervenire non basta: bisogna far pesare l’intervento.`,
      ]),
    );
  i.length ||
    i.push(
      n([
        'Non emerge un difetto netto nelle cifre della serata. Ora deve confermare questa pulizia: una bella pagella non è un abbonamento al posto da titolare.',
        'I numeri non isolano una criticità evidente. Il prossimo esame è ripetere la prova: lo spogliatoio applaude, ma non firma assegni in bianco.',
        'Nessuna sbavatura significativa da inchiodare al tabellino. Stavolta niente processo: la continuità, però, si dimostra nella prossima partita.',
        'La prova non offre un bersaglio statistico concreto. Si prende il merito, senza cominciare già a progettare la propria statua.',
      ]),
    );
  return {
    positive: r.slice(0, 2).join(' '),
    negative: i.slice(0, 2).join(' '),
  };
}
const J = (e) => Number(e || 0);
const Y = (e) => (e === null ? '—' : e.toFixed(2));
function be(e, t) {
  let n = [...new Map(t.map((e) => [e.matchId, e])).values()].sort(
      (e, t) => t.timestamp - e.timestamp,
    ),
    r = n.slice(0, 15),
    i = G(n)[0],
    a = K(r).players,
    o = K(i?.games || []).players,
    s = [...new Set([...e.map((e) => e.name), ...a.map((e) => e.name)])];
  return {
    windowSize: r.length,
    nightGames: i?.games.length || 0,
    nightDate: i?.day,
    rows: s
      .map((t) => {
        let n = e.find((e) => e.name.toLowerCase() === t.toLowerCase()),
          r = a.find((e) => e.name.toLowerCase() === t.toLowerCase()),
          i = o.find((e) => e.name.toLowerCase() === t.toLowerCase());
        return {
          name: t,
          season:
            J(n?.gamesPlayed) > 0 && J(n?.ratingAve) > 0
              ? J(n?.ratingAve)
              : null,
          seasonGames: J(n?.gamesPlayed),
          recent: r?.rating ?? null,
          recentGames: r?.ratedGames || 0,
          evening: i?.rating ?? null,
          eveningGames: i?.ratedGames || 0,
          session: i,
        };
      })
      .sort((e, t) => e.name.localeCompare(t.name)),
  };
}
function Tag_xe({ members: e, matches: t }) {
  let [n, r] = useState('name'),
    [i, a] = useState(null),
    o = be(e, t),
    s = [...o.rows].sort((e, t) =>
      n === 'name' ? e.name.localeCompare(t.name) : (t[n] ?? -1) - (e[n] ?? -1),
    ),
    c = o.rows.find((e) => e.name === i),
    l = o.rows.findIndex((e) => e.name === i);
  return (
    <section className="content performance-grades" id="voti">
      <div className="section-head">
        <div>
          <span className="overline">IL RENDIMENTO / VOTI SU 10</span>
          <h2>Tre voti. Un colpo d’occhio.</h2>
          <p className="sub">
            Stagione, ultima serata e forma recente. Le medie EA sono separate
            dall’overall dell’avatar.
          </p>
        </div>
        <label>
          Ordina per
          <select value={n} onChange={(e) => r(e.target.value)}>
            <option value="name">Nome</option>
            <option value="season">Stagione</option>
            <option value="evening">Ultima serata</option>
            <option value="recent">Ultime 15 gare</option>
          </select>
        </label>
      </div>
      <div className="grades-scroll">
        <table className="grades-table">
          <thead>
            <tr>
              <th>PRO</th>
              <th>
                STAGIONE<small>Dall’inizio · tutti i ruoli</small>
              </th>
              <th>
                ULTIMA SERATA
                <small>
                  {o.nightDate
                    ? new Date(o.nightDate + 'T12:00:00Z').toLocaleDateString(
                        'it-IT',
                        {
                          day: 'numeric',
                          month: 'short',
                        },
                      )
                    : '—'}
                  {' · '}
                  {o.nightGames}
                  {' gare analizzate'}
                </small>
              </th>
              <th>
                ULTIME 15 GARE<small>{o.windowSize}/15 gare in archivio</small>
              </th>
              <th>LETTURA</th>
            </tr>
          </thead>
          <tbody>
            {s.map((e) => (
              <tr key={e.name}>
                <th scope="row">{e.name}</th>
                <td>
                  <b>{Y(e.season)}</b>
                  <small>
                    {e.seasonGames}
                    {' presenze stagionali'}
                  </small>
                </td>
                <td>
                  <b>{Y(e.evening)}</b>
                  <small>
                    {e.eveningGames}
                    {' presenze con voto'}
                  </small>
                </td>
                <td>
                  <b>{Y(e.recent)}</b>
                  <small>
                    {e.recentGames}
                    {' presenze con voto'}
                  </small>
                </td>
                <td>
                  <button
                    onClick={() => a(i === e.name ? null : e.name)}
                    aria-expanded={i === e.name}
                    aria-controls="grade-comment"
                  >
                    {i === e.name ? 'Chiudi' : 'Commento'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {c && (
        <div id="grade-comment" className="grade-selected">
          <span className="overline">
            {c.name}
            {' / LETTURA DEL RENDIMENTO'}
          </span>
          <h3>
            {c.evening !== null && c.season !== null
              ? c.evening >= c.season + 0.3
                ? 'Una serata sopra il suo riferimento.'
                : c.evening <= c.season - 0.3
                  ? 'Una prova sotto la sua media stagionale.'
                  : 'La serata segue il suo livello stagionale.'
              : 'Il rendimento prende forma.'}
          </h3>
          <p>
            {c.season === null
              ? ''
              : `La stagione vale ${Y(c.season)} di media EA in ${c.seasonGames} presenze. `}
            {c.evening === null
              ? 'Assente dalle gare dell’ultima serata in archivio. '
              : `Nell’ultima serata la media è ${Y(c.evening)} in ${c.eveningGames} presenze. `}
            {c.recent === null
              ? ''
              : `La finestra recente vale ${Y(c.recent)} in ${c.recentGames} presenze sulle ultime ${o.windowSize} gare del club.`}
          </p>
          {c.session && (
            <>
              <strong>IL CALCIO CHE HA PORTATO</strong>
              <p>{q(c.session, l).positive}</p>
              <strong>DOVE SERVE QUALITÀ IN PIÙ</strong>
              <p>{q(c.session, l).negative}</p>
            </>
          )}
        </div>
      )}
      <details className="grade-method">
        <summary>Come leggere i voti</summary>
        <p>
          Stagione: media cumulativa fornita da EA. Serata: media delle presenze
          nella sessione più recente, unita oltre mezzanotte fino alle 06:00
          italiane. Ultime 15: media delle presenze nelle 15 gare più recenti
          conservate; se sono meno, il numero è dichiarato. Assenze e voti
          mancanti non valgono zero. Tutti i reparti sono inclusi e nessuna
          media è corretta per ruolo o minuti. Questi sono voti EA, non indici
          di forma del sito.
        </p>
      </details>
    </section>
  );
}
const X = (e) => {
  let t = Number(e);
  return Number.isFinite(t) ? t : 0;
};
const Se = {
  forward: 'ATT',
  midfielder: 'CEN',
  defender: 'DIF',
  goalkeeper: 'POR',
};
const Ce = (e) => (e.length ? e.reduce((e, t) => e + t, 0) / e.length : null);
const Z = (e) => (e === null ? '—' : e.toFixed(2));
const we = (e) =>
  new Date(e + 'T12:00:00Z').toLocaleDateString('it-IT', {
    timeZone: 'Europe/Rome',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
const Te = (e) =>
  new Date(e.timestamp * 1e3).toLocaleTimeString('it-IT', {
    timeZone: 'Europe/Rome',
    hour: '2-digit',
    minute: '2-digit',
  });
const Ee = (e) =>
  Object.entries(e.clubs).find(([e]) => e !== '70375')?.[1]?.details?.name ||
  'Avversario';
const Q = (e) => {
  let t = e.clubs[70375];
  return X(t.goals) > X(t.goalsAgainst)
    ? 'V'
    : X(t.goals) < X(t.goalsAgainst)
      ? 'S'
      : 'P';
};
const De = (e) => `${e.clubs[70375]?.goals}–${e.clubs[70375]?.goalsAgainst}`;
const Oe = (e) => [...e].reduce((e, t) => e + t.charCodeAt(0), 0);
function ke(e, t, n, r = '') {
  let i = t[0] || [...e].sort((e, t) => (t.rating ?? -1) - (e.rating ?? -1))[0];
  if (!i)
    return {
      name: 'BILLOCCHI CLUB',
      title: 'La prossima storia aspetta il fischio d’inizio.',
      deck: 'Le prime gare registrate apriranno la prima pagina del club.',
    };
  let a = r ? Math.floor(Date.parse(r + 'T12:00:00Z') / 864e5) : 0,
    o = (e, t = 0) =>
      e[((Number.isFinite(a) ? a : 0) + Oe(i.name) + t) % e.length],
    s = i.name,
    c = `${i.goals} gol, ${i.assists} assist e media EA ${Z(i.rating)} in ${i.games} presenze.`,
    l = {
      assist: [
        `${s} firma l’ultimo passaggio.`,
        `${s}, la regia dei gol.`,
        `${s} distribuisce occasioni, non alibi.`,
        `${s}, il tabellino ringrazia.`,
        `${s} mette gli assist in prima pagina.`,
        `${s}, copyright sulla rifinitura.`,
        `${s} fa segnare anche il titolo.`,
        `${s}, il conto lo saldano gli assist.`,
        `${s} manda i compagni in copertina.`,
        `${s}, la firma dietro al gol.`,
        `${s} prepara, il club incassa.`,
        `${s}, gli assist fanno notizia.`,
      ],
      goal: [
        `${s} riscrive il tabellino.`,
        `${s}, la porta è un appuntamento fisso.`,
        `${s} lascia il segno, più volte.`,
        `${s}, la rete ha il suo nome.`,
        `${s} fa parlare i gol.`,
        `${s}, prima pagina a suon di reti.`,
        `${s} presenta il conto in area.`,
        `${s}, la contabilità della rete.`,
        `${s} colleziona firme sul risultato.`,
        `${s}, gol da mettere agli atti.`,
        `${s} cambia i numeri del club.`,
        `${s}, la copertina passa dalla porta.`,
      ],
      save: [
        `${s} difende la copertina.`,
        `${s}, le parate fanno notizia.`,
        `${s} risponde tra i pali.`,
        `${s}, il presidio della porta.`,
        `${s} mette le mani sul titolo.`,
        `${s}, la rete trova un custode.`,
        `${s} porta le parate in prima pagina.`,
        `${s}, gli interventi lasciano traccia.`,
        `${s} fa valere i guanti.`,
        `${s}, una firma tra i pali.`,
        `${s} chiama in causa il tabellino.`,
        `${s}, la porta ha voce in redazione.`,
      ],
      pass: [
        `${s} tiene insieme il racconto.`,
        `${s}, precisione da prima pagina.`,
        `${s} dà ordine ai numeri.`,
        `${s}, i passaggi trovano destinatario.`,
        `${s} firma il fraseggio.`,
        `${s}, la precisione lascia il segno.`,
        `${s} tiene il filo della serata.`,
        `${s}, il pallone arriva a destinazione.`,
        `${s} convince col possesso.`,
        `${s}, qualità nella distribuzione.`,
        `${s} fa circolare la copertina.`,
        `${s}, la manovra ha la sua firma.`,
      ],
      overall: [
        `${s} si prende il titolo.`,
        `${s}, una serata da raccontare.`,
        `${s} lascia la firma sulla notte.`,
        `${s}, i voti lo portano in copertina.`,
        `${s} sale sul tavolo della redazione.`,
        `${s}, la prova che vale la prima pagina.`,
        `${s} chiude la serata in evidenza.`,
        `${s}, il tabellino sostiene l’applauso.`,
        `${s} conquista la cronaca del club.`,
        `${s}, una firma sopra la media.`,
        `${s} guida questa edizione.`,
        `${s}, il rendimento diventa notizia.`,
      ],
      shared: [
        'La prima pagina si divide.',
        'Più firme sulla stessa copertina.',
        'La redazione allarga il podio.',
        'Il titolo ha più protagonisti.',
        'Una copertina, più autori.',
        'La notte trova firme alla pari.',
        'Il voto non scioglie il pari merito.',
        'Gli applausi si dividono equamente.',
        'La prima pagina fa spazio a tutti.',
        'Il riconoscimento ha più nomi.',
        'La copertina è un lavoro a più mani.',
        'Il verdetto lascia il titolo condiviso.',
      ],
    };
  if (t.length > 1)
    return {
      name: t.map((e) => e.name).join(' + '),
      title: o(l.shared),
      deck:
        `${t.map((e) => e.name).join(' e ')} condividono il riconoscimento: media EA ${Z(i.rating)}. ` +
        o(
          [
            'Il pari merito è nei numeri.',
            'La redazione assegna una copertina condivisa.',
            'Stesso voto, stesso applauso.',
            'Nessun nome viene escluso dal titolo.',
          ],
          3,
        ),
    };
  let u =
      i.assists >= 3 && i.assists > i.goals
        ? 'assist'
        : i.goals >= 3
          ? 'goal'
          : i.saves >= 3
            ? 'save'
            : i.passPct !== null && i.passPct >= 85
              ? 'pass'
              : 'overall',
    d =
      u === 'save'
        ? ` ${i.saves} parate registrate.`
        : u === 'pass'
          ? ` ${i.passPct}% di passaggi riusciti.`
          : '';
  return {
    name: s,
    title: o(l[u]),
    deck:
      c +
      d +
      ' ' +
      o(
        [
          'Le cifre sostengono la copertina di questa edizione.',
          'La redazione parte dai numeri, poi si prende la libertà dell’applauso.',
          'Il riconoscimento arriva dalle gare registrate della serata.',
          'È la firma che emerge dal voto EA di questa edizione.',
          'Il verdetto del club ha questi numeri agli atti.',
          'La cronaca delle partite raccolte comincia da qui.',
        ],
        5,
      ),
  };
}
function Ae(e) {
  let t = [...e].sort((e, t) => e.timestamp - t.timestamp),
    n = [],
    r = t
      .filter((e) => Q(e) === 'V')
      .sort((e, t) => {
        let n = e.clubs[70375],
          r = t.clubs[70375];
        return (
          X(r.goals) - X(r.goalsAgainst) - (X(n.goals) - X(n.goalsAgainst))
        );
      });
  r[0] &&
    n.push({
      tag: 'LA VITTORIA PIÙ LARGA',
      title: `${De(r[0])}. Il tabellino parla forte.`,
      text: `Contro ${Ee(r[0])}, alle ${Te(r[0])}: il margine più ampio tra le vittorie di questa edizione.`,
      games: [r[0]],
    });
  let i = t.find((e, n) => n > 0 && Q(e) === 'V' && Q(t[n - 1]) === 'S');
  if (i) {
    let e = t.indexOf(i);
    n.push({
      tag: 'LA RISPOSTA',
      title: 'Una sconfitta, poi la replica.',
      text: `Dopo il ${De(t[e - 1])} contro ${Ee(t[e - 1])}, arriva il ${De(i)} contro ${Ee(i)}. La partita successiva rimette una vittoria nel bilancio.`,
      games: [t[e - 1], i],
    });
  }
  let a = [],
    o = [];
  for (let e of t)
    Q(e) === 'S' ? (a = []) : (a.push(e), a.length > o.length && (o = [...a]));
  o.length >= 3 &&
    n.push({
      tag: 'LA SERIE POSITIVA',
      title: `${o.length} gare senza cedere.`,
      text: `${o.filter((e) => Q(e) === 'V').length} vittorie e ${o.filter((e) => Q(e) === 'P').length} pareggi consecutivi nelle partite registrate della serata.`,
      games: o,
    });
  let s = t
    .filter(
      (e) =>
        Math.abs(X(e.clubs[70375]?.goals) - X(e.clubs[70375]?.goalsAgainst)) <=
        1,
    )
    .sort(
      (e, t) =>
        X(t.clubs[70375]?.goals) +
        X(t.clubs[70375]?.goalsAgainst) -
        X(e.clubs[70375]?.goals) -
        X(e.clubs[70375]?.goalsAgainst),
    )[0];
  s &&
    n.push({
      tag: 'IL RISULTATO IN BILICO',
      title: `${De(s)}. Margine minimo.`,
      text: `${Ee(s)}, alle ${Te(s)}: ${Q(s) === 'P' ? 'un pareggio' : 'una gara chiusa con un solo gol di scarto'}. Il risultato finale racconta quanto fossero vicine le squadre.`,
      games: [s],
    });
  !n.length &&
    t[0] &&
    n.push({
      tag: 'IL BILANCIO',
      title: 'Una notte da cui ripartire.',
      text: `${t.length} gare registrate. Apri i tabellini per vedere dove è finito il contributo di ciascun Pro.`,
      games: t,
    });
  return n.slice(0, 3);
}
function je(e, t, n = Oe(e.name + t)) {
  let r = q(e, n),
    i = e.goals / Math.max(1, e.games),
    a = Math.max(0, e.passAttempts - e.passes),
    o = Math.max(0, e.tackleAttempts - e.tackles),
    s,
    c,
    l,
    u = (e) => e[n % e.length];
  e.reds
    ? ((s = `${e.reds} rossi. Ha prenotato la doccia prima degli altri.`),
      (c = `${e.reds} espulsioni in ${e.games} presenze.`),
      (l =
        'La qualità va lasciata in campo. Il prossimo colpo di genio può risparmiarsi il cartellino.'))
    : e.shots >= 3 && e.goals / e.shots < 0.3
      ? ((s = u([
          'Il portiere avversario sta valutando di mandargli un biglietto di ringraziamento.',
          'Tanta produzione al tiro. Il tabellino, però, non accetta preventivi.',
          'La porta è un obiettivo, non un suggerimento geografico.',
          'Il pallone vuole la rete. Lui, ogni tanto, gli concede un anno sabbatico.',
          'Le conclusioni ci sono. Il killer instinct ha chiesto un permesso retribuito.',
          'Il tabellino non assegna gol per entusiasmo: serve il colpo che chiude il discorso.',
        ])),
        (c = `${e.goals} gol su ${e.shots} tiri: conversione ${Math.round((e.goals / e.shots) * 100)}%. Non distingue tiri fuori, parati o bloccati.`),
        (l =
          e.assists >= 2
            ? `La rifinitura lo difende (${e.assists} assist). La finalizzazione resta il prossimo esame.`
            : 'Il volume è agli atti. Ora servono più reti per ogni tentativo.'))
      : e.passAttempts >= 10 && e.passPct !== null && e.passPct < 85
        ? ((s = u([
            'Il compagno chiede un pallone, non una promessa elettorale.',
            'Il possesso non è una raccolta fondi per gli avversari.',
            'La visione di gioco c’è. Ogni tanto i piedi leggono un altro copione.',
            'Prima del passaggio della vita, facciamo riuscire quello della serata.',
            'Nel fraseggio serve meno improvvisazione: il compagno non è un investigatore privato.',
            'Il pallone non scotta. Si può tenere abbastanza a lungo da passarlo bene.',
          ])),
          (c = `${a} passaggi non riusciti su ${e.passAttempts}; precisione ${e.passPct}%.`),
          (l =
            e.goals + e.assists
              ? `I ${e.goals + e.assists} gol + assist gli danno argomenti. La precisione deve raggiungere l’ambizione.`
              : 'La partecipazione alla manovra è registrata. L’esecuzione va ripulita.'))
        : e.tackleAttempts >= 4 && e.tackles / e.tackleAttempts < 0.5
          ? ((s = u([
              'La garra si sente. Il recupero del pallone, un po’ meno.',
              'Ha presentato domanda per ogni duello. Troppi colloqui senza assunzione.',
              'L’aggressività fa rumore; il pallone si riprende con un intervento riuscito.',
              'Entrare nel contrasto è il primo capitolo. Uscirne col pallone sarebbe il finale preferito.',
            ])),
            (c = `${e.tackles} contrasti riusciti su ${e.tackleAttempts}; ${o} tentativi non riusciti.`),
            (l =
              'La voglia di intervenire è agli atti. Il duello deve diventare più efficace, oltre che più rumoroso.'))
          : ((s = u([
              'L’accusa non trova un difetto netto. Non è il momento di farsi costruire una statua.',
              'Le cifre lo difendono. Il contratto da fenomeno resta da rinnovare alla prossima gara.',
              'Per questa volta il tribunale resta senza munizioni. Il parcheggio dello stadio conserva il vecchio nome.',
              'Nessuna criticità evidente da inchiodare ai numeri. La prossima partita riapre comunque il fascicolo.',
              'Il tabellino non offre un bersaglio serio. Si prenda l’applauso, senza ordinare il busto in marmo.',
              'Oggi niente condanna statistica. Il posto nell’Olimpo si conferma col prossimo pallone.',
            ])),
            (c = `Media EA ${Z(e.rating)}, ${e.games} presenze, ${e.goals} gol e ${e.assists} assist.`),
            (l =
              'Assolto sulle cifre di questa serata. La continuità si dimostra nelle prossime presenze.'));
  return {
    title: e.saves
      ? 'Il custode del risultato.'
      : e.assists > e.goals && e.assists
        ? 'Il servizio ai compagni.'
        : i >= 1
          ? 'Il tabellino lo conosce.'
          : e.goals
            ? 'La firma davanti.'
            : e.tackles
              ? 'Il lavoro nei duelli.'
              : 'La manovra passa anche qui.',
    praise: r.positive,
    charge: s,
    proof: c,
    verdict: l,
  };
}
function Me(e, t) {
  let n = new Set();
  return e.map((e) => {
    let r = je(e, t),
      i = 0;
    for (; n.has(r.charge) && i < 12; ) {
      i++;
      r = je(e, t, Oe(e.name + t) + i);
    }
    n.has(r.charge) &&
      (r = {
        ...r,
        charge: `Il fascicolo di ${e.name}: ${r.proof} La prossima partita può migliorare la risposta; per ora la statua resta in magazzino.`,
      });
    n.add(r.charge);
    return {
      player: e,
      trial: r,
    };
  });
}
function Ne(e, t) {
  let n = [
      ...new Map(
        t.filter((e) => e.clubs?.['70375']).map((e) => [String(e.matchId), e]),
      ).values(),
    ]
      .sort((e, t) => e.timestamp - t.timestamp)
      .flatMap((t) =>
        Object.values(t.players?.['70375'] || {})
          .filter((t) => t && t.playername.toLowerCase() === e.toLowerCase())
          .map((e) => ({
            p: e,
            m: t,
          })),
      ),
    r = n.at(-1)?.p.pos,
    i = n
      .filter((e) => e.p.pos === r)
      .slice(-12)
      .filter((e) => X(e.p.rating) > 0)
      .map((e) => ({
        rating: X(e.p.rating),
        date: e.m.timestamp,
        matchId: e.m.matchId,
      }));
  if (i.length < 4)
    return {
      role: Se[r || ''] || '—',
      points: i,
      previous: null,
      recent: null,
      previousCount: 0,
      recentCount: i.length,
      delta: null,
    };
  let a = Math.floor(i.length / 2),
    o = Ce(i.slice(0, a).map((e) => e.rating)),
    s = Ce(i.slice(a).map((e) => e.rating));
  return {
    role: Se[r || ''] || r || '—',
    points: i,
    previous: o,
    recent: s,
    previousCount: a,
    recentCount: i.length - a,
    delta: s - o,
  };
}
function Pe({ matches: e }) {
  return (
    <div className="paper-proof-matches">
      {e.map((e) => (
        <div key={e.matchId}>
          <time>{Te(e)}</time>
          <span>{Ee(e)}</span>
          <b>{De(e)}</b>
          <i className={Q(e)}>{Q(e)}</i>
        </div>
      ))}
    </div>
  );
}
function Fe({ members: e, matches: t }) {
  let n = useMemo(() => G(t), [t]),
    [r, i] = useState(''),
    [a, o] = useState(''),
    [s, c] = useState(''),
    l = n.find((e) => e.day === r) || n[0],
    d = useMemo(() => K(l?.games || []), [l]),
    f = Me(d.players, l?.day || ''),
    p = ke(d.players, d.winners, d.goals, l?.day),
    m = Ae(l?.games || []),
    h = d.winners[0] || d.players.find((e) => e.name === p.name),
    g = L(d.players, l?.day || ''),
    v = L(e.map(R), 'stagione'),
    y =
      e.find((e) => e.name === a) ||
      e.find((e) => e.name.toLowerCase() === h?.name.toLowerCase()) ||
      e[0],
    x = y ? Ne(y.name, t) : null,
    S = y
      ? V(y, e, {
          games: 0,
          label: '',
          rating: 0,
          goals: 0,
          assists: 0,
          passPct: 0,
          passAttempts: 0,
          tackles: 0,
        })
      : null,
    T = l
      ? `BILLOCCHI · IL GIORNO DOPO\nSerata del ${we(l.day)}\n${p.title}\n${p.deck}\n${l.games.length} gare: ${d.wins}V ${d.draws}P ${d.losses}S · ${d.goals} gol fatti, ${d.against} subiti.\n${d.winners.length ? `Migliore delle gare registrate: ${d.winners.map((e) => e.name).join(' + ')} · media EA ${Z(d.winners[0].rating)}.\n` : ''}${f
          .map(
            ({ player: e, trial: t }) =>
              `\n${e.name} · ${Z(e.rating)} EA\nElogio: ${t.praise}\nAccusa: ${t.charge}\nProva: ${t.proof}\nVerdetto: ${t.verdict}`,
          )
          .join('\n')}\nhttps://billocchi-club.kr3n.chatgpt.site/`
      : '';
  async function E() {
    try {
      await navigator.clipboard.writeText(T);
      c('ok');
    } catch {
      c('manual');
    }
  }
  let D = [...d.players].sort((e, t) => t.goals - e.goals)[0],
    te = [...d.players].sort((e, t) => t.assists - e.assists)[0];
  return (
    <section className="day-after" id="giorno-dopo">
      <div className="paper-edition-bar">
        <span>LA VOCE DELLO SPOGLIATOIO</span>
        {l ? (
          <label>
            Serata
            <select
              value={l.day}
              onChange={(e) => {
                i(e.target.value);
                c('');
              }}
              aria-label="Scegli la serata del giornale"
            >
              {n.map((e) => (
                <option key={e.day} value={e.day}>
                  {we(e.day)}
                  {' · '}
                  {e.games.length}
                  {' gare'}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <span>IN ATTESA DELLA PRIMA GARA</span>
        )}
      </div>
      <header className="paper-masthead">
        <img src="/logo-billocchi.svg" alt="Stemma BILLOCCHI CLUB" />
        <div>
          <h1>BILLOCCHI</h1>
          <p>IL GIORNO DOPO</p>
        </div>
        <span>
          LA GAZZETTA DEL CLUB
          <br />
          CRONACA · PAGELLE · STORIE
          <br />
          <b>REDAZIONE BILLOCCHI</b>
        </span>
      </header>
      <div className="paper-nav">
        <a href="#processo">Il processo del pallone</a>
        <a href="#svolte">Le svolte della notte</a>
        <a href="#romanzo">Il romanzo dei Pro</a>
        <a href="#voti">I voti</a>
      </div>
      {l ? (
        <>
          <div className="paper-cover">
            <article className="paper-lead">
              <span className="paper-eyebrow">
                {'LA COPERTINA / '}
                {l.games.length}
                {' PARTITE DELL’EDIZIONE'}
              </span>
              <h2>{p.title}</h2>
              <p className="paper-deck">{p.deck}</p>
              <details className="paper-lead-details">
                <summary>Apri la storia e le cifre</summary>
                <p>
                  {d.wins}
                  {' vittorie, '}
                  {d.draws}
                  {' pareggi e '}
                  {d.losses}
                  {' sconfitte. '}
                  {d.goals}
                  {' reti segnate e '}
                  {d.against}
                  {' subite: '}
                  {d.goals > d.against
                    ? 'l’attacco sostiene un saldo positivo'
                    : d.goals < d.against
                      ? 'il saldo chiede più efficacia e più tenuta del risultato'
                      : 'la serata chiude in equilibrio anche nelle reti'}
                  .
                </p>
                {h && <p>{je(h, l.day).praise}</p>}
                <Pe matches={l.games} />
              </details>
            </article>
            <aside className="paper-cover-side">
              <div className="paper-cover-award">
                <Trophy size={20} />
                <span>
                  {d.winners.length > 1
                    ? 'I MIGLIORI DELLE GARE REGISTRATE'
                    : 'IL MIGLIORE DELLE GARE REGISTRATE'}
                </span>
                <strong>
                  {d.winners.length
                    ? d.winners.map((e) => e.name).join(' + ')
                    : 'Premio non assegnato'}
                </strong>
                {d.winners.length > 0 && (
                  <div>
                    <b>{Z(d.winners[0].rating)}</b>
                    <small>
                      MEDIA EA / 10
                      <br />
                      {d.winners[0].games}/{l.games.length}
                      {' PRESENZE'}
                    </small>
                  </div>
                )}
              </div>
              <div className="paper-cover-number">
                <b>{d.goals}</b>
                <span>
                  GOL DEL CLUB
                  <br />
                  NELLA SERATA
                </span>
              </div>
              <p>
                {d.wins > d.losses
                  ? 'Il bilancio sorride. Il tribunale, però, apre lo stesso.'
                  : d.losses > d.wins
                    ? 'Il bilancio punge. Le cifre decidono chi merita l’applauso.'
                    : 'Il bilancio resta in equilibrio. Gli spunti per parlarne, molto meno.'}
              </p>
            </aside>
          </div>
          <div className="paper-results">
            <div className="paper-record">
              <span>IL BILANCIO</span>
              <strong>
                {d.wins}
                <small>V</small> {d.draws}
                <small>P</small> {d.losses}
                <small>S</small>
              </strong>
              <p>
                {d.goals}
                {' fatti · '}
                {d.against}
                {' subiti'}
              </p>
            </div>
            <div
              className="paper-score-strip"
              aria-label="Partite della serata, dalla prima all’ultima"
            >
              {l.games.map((e, t) => (
                <details key={e.matchId} className={`paper-score ${Q(e)}`}>
                  <summary>
                    <span>
                      {'GARA '}
                      {t + 1}
                      {' · '}
                      {Te(e)}
                    </span>
                    <b>{De(e)}</b>
                    <small>{Ee(e)}</small>
                  </summary>
                  <div className="paper-match-pros">
                    {K([e]).players.map((e) => (
                      <div key={e.id}>
                        <strong>{e.name}</strong>
                        <span>
                          {e.goals}
                          {' G · '}
                          {e.assists}
                          {' A'}
                        </span>
                        <b>{Z(e.rating)}</b>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
          <section className="paper-turning" id="svolte">
            <div className="paper-section-heading">
              <span>01 / LE SVOLTE DELLA NOTTE</span>
              <h3>Le partite lasciano il segno.</h3>
            </div>
            <div className="paper-turning-grid">
              {m.map((e, t) => (
                <article key={e.tag}>
                  <span className="paper-story-no">0{t + 1}</span>
                  <span className="paper-eyebrow">{e.tag}</span>
                  <h4>{e.title}</h4>
                  <p>{e.text}</p>
                  <details>
                    <summary>Le partite che lo raccontano</summary>
                    <Pe matches={e.games} />
                  </details>
                </article>
              ))}
            </div>
          </section>
          <section className="paper-trials" id="processo">
            <div className="paper-section-heading">
              <div>
                <span>02 / IL PROCESSO DEL PALLONE</span>
                <h3>
                  Tutti alla sbarra.
                  <br />
                  <em>Nessuno alla gogna.</em>
                </h3>
              </div>
              <p>
                Elogio, accusa e verdetto per tutti quelli scesi in campo. Le
                battute sono nostre. Le cifre sono di EA.
              </p>
            </div>
            <div className="paper-trial-grid">
              {f.map(({ player: e, trial: t }, n) => {
                let r = d.winners.some((t) => t.id === e.id);
                return (
                  <details
                    key={e.id}
                    className={`paper-trial ${r ? 'is-cover-pro' : ''}`}
                  >
                    <summary>
                      <div className="paper-trial-top">
                        <span>
                          {'FASCICOLO '}
                          {String(n + 1).padStart(2, '0')}
                        </span>
                        {r && (
                          <Trophy
                            size={17}
                            aria-label="Migliore delle gare registrate"
                          />
                        )}
                        <b>
                          {Z(e.rating)}
                          <small>EA / 10</small>
                        </b>
                      </div>
                      <h4>{e.name}</h4>
                      <p className="paper-trial-title">{t.title}</p>
                      <div className="paper-trial-stats">
                        <span>
                          {e.games}
                          {' PRES.'}
                        </span>
                        <span>
                          {e.goals}
                          {' GOL'}
                        </span>
                        <span>
                          {e.assists}
                          {' ASSIST'}
                        </span>
                      </div>
                      <span className="paper-open-case">
                        Leggi elogio e accusa
                      </span>
                    </summary>
                    <div className="paper-case-body">
                      <div className="paper-praise">
                        <span>L’ELOGIO</span>
                        <p>{t.praise}</p>
                      </div>
                      <blockquote>
                        <span>L’ACCUSA DELLO SPOGLIATOIO</span>
                        <Quote size={18} aria-hidden="true" />
                        <p>{t.charge}</p>
                      </blockquote>
                      <Tag_ve player={e} quote={g.get(e.name)} />
                      <details className="paper-verdict">
                        <summary>Le prove e il verdetto</summary>
                        <div>
                          <span>AGLI ATTI</span>
                          <p>{t.proof}</p>
                          <div className="paper-trial-evidence">
                            <span>
                              {e.passPct === null ? '—' : `${e.passPct}%`}
                              {' passaggi'}
                            </span>
                            <span>
                              {e.tackles}/{e.tackleAttempts}
                              {' contrasti'}
                            </span>
                            <span>
                              {e.saves}
                              {' parate'}
                            </span>
                            <span>
                              {e.reds}
                              {' rossi'}
                            </span>
                          </div>
                          <span>IL VERDETTO</span>
                          <p>{t.verdict}</p>
                          <small>
                            {'Reparti giocati: '}
                            {e.roles.map((e) => Se[e] || e).join(' / ')}
                            {'. Totali sulle '}
                            {e.games}
                            {' presenze registrate.'}
                          </small>
                        </div>
                      </details>
                    </div>
                  </details>
                );
              })}
            </div>
          </section>
          <div className="paper-notebook">
            <Newspaper size={25} />
            <div>
              <span>ANNOTAZIONI A MARGINE</span>
              <p>
                {D?.goals ? `${D.name}: ${D.goals} gol. ` : ''}
                {te?.assists ? `${te.name}: ${te.assists} assist. ` : ''}
                {d.players.length}
                {' Pro hanno lasciato una riga in questa edizione.'}
              </p>
            </div>
            <button onClick={E}>
              {s === 'ok' ? <Check size={17} /> : <Copy size={17} />}{' '}
              {s === 'ok' ? 'Edizione copiata' : 'Copia per lo spogliatoio'}
            </button>
          </div>
          {s === 'manual' && (
            <label className="paper-manual-copy">
              Seleziona e copia il testo
              <textarea
                readOnly
                value={T}
                onFocus={(e) => e.currentTarget.select()}
              />
            </label>
          )}
        </>
      ) : (
        <div className="paper-empty">
          <h2>La prossima storia aspetta il fischio d’inizio.</h2>
          <p>
            Le prime gare registrate apriranno copertina, pagelle e tabellini. I
            profili stagionali sono già qui sotto.
          </p>
        </div>
      )}
      {y && S && (
        <section className="paper-season" id="romanzo">
          <div className="paper-section-heading">
            <div>
              <span>03 / IL ROMANZO DEI PRO</span>
              <h3>La stagione ha memoria.</h3>
            </div>
            <label>
              Scegli il protagonista
              <select
                aria-label="Protagonista del romanzo"
                value={y.name}
                onChange={(e) => o(e.target.value)}
              >
                {e.map((e) => (
                  <option key={e.name} value={e.name}>
                    {e.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <details className="paper-longread">
            <summary>
              {'Leggi il ritratto e l’andamento di '}
              {y.name}
            </summary>
            <div className="paper-season-layout">
              <aside className="paper-season-index">
                <BookOpen size={23} />
                <span>{S.stage}</span>
                <h4>{y.name}</h4>
                <div>
                  <b>{y.gamesPlayed}</b>
                  <span>PRESENZE STAGIONALI</span>
                </div>
                <div className="paper-season-totals">
                  <span>
                    <b>{y.goals}</b>
                    {' GOL'}
                  </span>
                  <span>
                    <b>{y.assists}</b>
                    {' ASSIST'}
                  </span>
                </div>
                <p>
                  {'Media EA '}
                  <strong>{X(y.gamesPlayed) ? y.ratingAve : '—'}</strong>
                  <br />
                  Totali stagionali · tutti i ruoli
                </p>
                <a href="#rosa">Apri le figurine del club</a>
              </aside>
              <article className="paper-season-story">
                <h4>{S.title}</h4>
                <p>{S.intro}</p>
                <Tag_ve player={R(y)} quote={v.get(y.name)} />
                {x && (
                  <div className="paper-trend">
                    <div>
                      <span>
                        {'L’ARCO RECENTE / '}
                        {x.role}
                      </span>
                      <strong>
                        {x.delta === null
                          ? 'La storia sta raccogliendo le prime prove.'
                          : x.delta >= 0.3
                            ? 'Il capitolo recente alza il livello.'
                            : x.delta <= -0.3
                              ? 'Il capitolo recente chiede una risposta.'
                              : 'Il capitolo recente segue il suo riferimento.'}
                      </strong>
                    </div>
                    {x.points.length > 0 && (
                      <svg
                        viewBox="0 0 320 90"
                        role="img"
                        aria-label={`Voti EA cronologici nelle ${x.points.length} presenze archiviate da ${x.role}: ${x.points.map((e) => e.rating).join(', ')}`}
                      >
                        <line x1="10" y1="74" x2="310" y2="74" />
                        <line x1="10" y1="39" x2="310" y2="39" />
                        {x.points.length > 1 && (
                          <polyline
                            points={x.points
                              .map(
                                (e, t) =>
                                  `${10 + (t * 300) / (x.points.length - 1)},${81 - e.rating * 7}`,
                              )
                              .join(' ')}
                          />
                        )}
                        {x.points.map((e, t) => (
                          <circle
                            key={e.matchId}
                            cx={
                              x.points.length === 1
                                ? 160
                                : 10 + (t * 300) / (x.points.length - 1)
                            }
                            cy={81 - e.rating * 7}
                            r="3.5"
                          />
                        ))}
                      </svg>
                    )}
                    <p>
                      {x.delta === null
                        ? `${x.points.length} presenze con voto archiviate nell’ultimo reparto giocato (${x.role}). Il confronto tra due blocchi parte da quattro presenze con voto nello stesso reparto.`
                        : `Le ultime ${x.recentCount} presenze archiviate da ${x.role} valgono ${Z(x.recent)}, contro ${Z(x.previous)} nelle ${x.previousCount} precedenti: ${x.delta >= 0 ? '+' : ''}${x.delta.toFixed(2)} punti EA. Il confronto usa lo stesso reparto.`}
                    </p>
                    {x.points.length > 1 && (
                      <small>
                        {new Date(x.points[0].date * 1e3).toLocaleDateString(
                          'it-IT',
                          {
                            timeZone: 'Europe/Rome',
                          },
                        )}
                        {' — '}
                        {new Date(
                          x.points.at(-1).date * 1e3,
                        ).toLocaleDateString('it-IT', {
                          timeZone: 'Europe/Rome',
                        })}
                        {' · '}
                        {x.points.length}
                        {' voti archiviati · dal più vecchio al più recente'}
                      </small>
                    )}
                  </div>
                )}
                <div className="paper-chapters">
                  {S.sections.map((e, t) => (
                    <details key={e.label}>
                      <summary>
                        <span>
                          {'CAPITOLO '}
                          {String(t + 1).padStart(2, '0')}
                        </span>
                        <strong>{e.label}</strong>
                      </summary>
                      <p>{e.text}</p>
                    </details>
                  ))}
                </div>
              </article>
            </div>
          </details>
        </section>
      )}
      <details className="paper-method">
        <summary>Il taccuino della redazione</summary>
        <p>
          Ogni edizione usa le partite conservate della serata selezionata; le
          sessioni dopo mezzanotte e prima delle 06:00 italiane appartengono
          alla sera precedente. Elogi e battute sono commenti originali del
          club. Il premio segue la media EA più alta con almeno metà delle gare
          e voti in tutte le proprie presenze; senza candidati, considera chi ha
          più presenze e voti completi. Le medie identiche condividono il
          premio. I voti non sono corretti per ruolo o minuti. Il romanzo usa i
          totali stagionali EA; il grafico recente confronta soltanto lo stesso
          reparto, sull’archivio disponibile. I tiri senza gol non identificano
          da soli errori di mira o occasioni mancate. Le svolte descrivono
          risultati finali e sequenze di gare, senza inventare azioni o
          rimontare punteggi durante una partita.
        </p>
      </details>
    </section>
  );
}
const Ie = [
  {
    id: 'giorno-dopo',
    label: 'Il giorno dopo',
  },
  {
    id: 'processo',
    label: 'Pagelle',
  },
  {
    id: 'romanzo',
    label: 'Storie',
  },
  {
    id: 'panoramica',
    label: 'Stagione',
  },
  {
    id: 'voti',
    label: 'Voti',
  },
  {
    id: 'rosa',
    label: 'La rosa',
  },
  {
    id: 'spogliatoio',
    label: 'Partite',
  },
];
function Le() {
  let [e, t] = useState('giorno-dopo'),
    n = useRef(null);
  useEffect(() => {
    let e = 0,
      r = () => {
        e = 0;
        let r =
            (n.current?.closest('header')?.getBoundingClientRect().bottom ||
              100) + 85,
          i = Ie[0].id;
        for (let e of Ie) {
          let t = document.getElementById(e.id);
          t && t.getBoundingClientRect().top <= r && (i = e.id);
        }
        t(i);
      },
      i = () => {
        e ||= requestAnimationFrame(r);
      },
      a = (e) => {
        let t = document.getElementById(e.slice(1));
        if (t) {
          for (let e = t.parentElement; e; e = e.parentElement)
            e instanceof HTMLDetailsElement && (e.open = true);
          t.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
              .matches
              ? 'auto'
              : 'smooth',
            block: 'start',
          });
        }
      },
      o = (e) => {
        if (
          e.defaultPrevented ||
          e.ctrlKey ||
          e.metaKey ||
          e.shiftKey ||
          e.altKey ||
          e.button !== 0
        )
          return;
        let t = e.target.closest('a[href^="#"]')?.getAttribute('href');
        !t ||
          !document.getElementById(t.slice(1)) ||
          (e.preventDefault(), history.pushState(null, '', t), a(t));
      },
      s = () => a(location.hash);
    document.addEventListener('click', o);
    window.addEventListener('hashchange', s);
    window.addEventListener('scroll', i, {
      passive: true,
    });
    window.addEventListener('resize', i);
    r();
    location.hash && a(location.hash);
    let c = document.querySelectorAll(
        'main > section:not(.day-after), .paper-cover, .paper-results, .paper-turning, .paper-trials, .paper-season',
      ),
      l = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? null
        : new IntersectionObserver(
            (e) => {
              for (let t of e)
                t.target.classList.toggle('in-view', t.isIntersecting);
            },
            {
              threshold: 0,
            },
          );
    l &&
      c.forEach((e) => {
        e.classList.add('scroll-fade');
        e.getBoundingClientRect().top < innerHeight &&
          e.classList.add('in-view');
        l.observe(e);
      });
    return () => {
      cancelAnimationFrame(e);
      l?.disconnect();
      c.forEach((e) => e.classList.remove('scroll-fade', 'in-view'));
      document.removeEventListener('click', o);
      window.removeEventListener('hashchange', s);
      window.removeEventListener('scroll', i);
      window.removeEventListener('resize', i);
    };
  }, []);
  useEffect(() => {
    let t = n.current,
      r = t?.querySelector(`a[href="#${e}"]`);
    if (!t || !r) return;
    let i =
      r.getBoundingClientRect().left -
      t.getBoundingClientRect().left +
      t.scrollLeft;
    (i < t.scrollLeft || i + r.offsetWidth > t.scrollLeft + t.clientWidth) &&
      t.scrollTo({
        left: Math.max(0, i - (t.clientWidth - r.offsetWidth) / 2),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
      });
  }, [e]);
  return (
    <nav ref={n} className="section-navigation" aria-label="Sezioni del club">
      {Ie.map((t) => (
        <a
          key={t.id}
          href={`#${t.id}`}
          className={e === t.id ? 'is-active' : ''}
          aria-current={e === t.id ? 'location' : undefined}
        >
          <span className="nav-dot" aria-hidden="true" />
          {t.label}
        </a>
      ))}
    </nav>
  );
}
const $ = (e) => Number(e || 0);
const Re = (e, t) => ($(t) ? ($(e) / $(t)).toFixed(2) : '—');
const ze = 'https://www.ea.com/it-it/games/ea-sports-fc/clubs';
function Be({ value: e }) {
  let [t, n] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      n(e);
      return;
    }
    let t = 0,
      r = performance.now(),
      i = (a) => {
        let o = Math.min(1, (a - r) / 950);
        n(Math.round(e * (1 - (1 - o) ** 3)));
        o < 1 && (t = requestAnimationFrame(i));
      };
    t = requestAnimationFrame(i);
    return () => cancelAnimationFrame(t);
  }, [e]);
  return <>{t}</>;
}
function Ve({ children: e, className: t = '' }) {
  let n = useRef(null);
  useEffect(() => {
    let e = n.current;
    if (!e) return;
    let t = new IntersectionObserver(
      ([n]) => {
        n.isIntersecting && (e.classList.add('visible'), t.unobserve(e));
      },
      {
        threshold: 0.08,
      },
    );
    t.observe(e);
    return () => t.disconnect();
  }, []);
  return (
    <div ref={n} className={`reveal ${t}`}>
      {e}
    </div>
  );
}
const He = {
  forward: 'ATT',
  midfielder: 'CEN',
  defender: 'DIF',
  goalkeeper: 'POR',
};
const Ue = (e) => ($(e.proOverall) > 0 ? String(e.proOverall) : '—');
function We(e, t) {
  let n = [...t]
      .sort((e, t) => $(t.timestamp) - $(e.timestamp))
      .flatMap((t) =>
        Object.values(t.players?.['70375'] || {}).filter(
          (t) => t.playername.toLowerCase() === e.name.toLowerCase(),
        ),
      ),
    r = n[0]?.pos || e.favoritePosition || '',
    i = n.filter((e) => e.pos === r),
    a = i.length,
    o = i.reduce((e, t) => e + $(t.goals), 0),
    s = i.reduce((e, t) => e + $(t.assists), 0),
    c = i.reduce((e, t) => e + $(t.shots), 0),
    l = i.reduce((e, t) => e + $(t.passesmade), 0),
    u = i.reduce((e, t) => e + $(t.passattempts), 0),
    d = i.reduce((e, t) => e + $(t.tacklesmade), 0),
    f = i.reduce((e, t) => e + $(t.saves), 0),
    p = a ? i.reduce((e, t) => e + $(t.rating), 0) / a : 0,
    m = u ? Math.round((l / u) * 100) : 0,
    h =
      r === 'forward'
        ? ((o + 0.7 * s) / Math.max(1, a)) * 9
        : r === 'midfielder'
          ? ((s + 0.8 * o) / Math.max(1, a)) * 8
          : r === 'defender'
            ? (d / Math.max(1, a)) * 2.5 + (s / Math.max(1, a)) * 4
            : (f / Math.max(1, a)) * 2.5,
    g = a
      ? Math.round(
          Math.max(
            40,
            Math.min(
              99,
              50 +
                (p - 6) * 10 +
                Math.min(16, h) +
                m * 0.08 -
                Math.max(0, 5 - a) * 3,
            ),
          ),
        )
      : 0,
    _ = $(e.gamesPlayed),
    v = a ? 'recent' : _ ? 'season' : 'none',
    ee = (($(e.goals) + 0.7 * $(e.assists)) / Math.max(1, _)) * 8,
    y =
      50 +
      ($(e.ratingAve) - 6) * 10 +
      Math.min(16, ee) +
      $(e.passSuccessRate) * 0.08 -
      Math.max(0, 5 - _) * 3,
    b = v === 'season' ? Math.round(Math.max(40, Math.min(99, y))) : g,
    x =
      v === 'none'
        ? 'unranked'
        : b >= 92
          ? 'iridescent'
          : b >= 87
            ? 'platinum'
            : b >= 78
              ? 'gold'
              : b >= 70
                ? 'silver'
                : 'bronze',
    S = i.slice(0, 3),
    C = S.length ? S.reduce((e, t) => e + $(t.rating), 0) / S.length : 0,
    w = S.reduce((e, t) => e + $(t.goals) + $(t.assists), 0),
    T = S.length === 3 && C >= 7.8 && w >= 4;
  return {
    role: r,
    label: He[r] || '—',
    games: a,
    goals: o,
    assists: s,
    shots: c,
    passes: l,
    passAttempts: u,
    tackles: d,
    saves: f,
    rating: p,
    passPct: m,
    tier: x,
    score: b,
    basis: v,
    hot: T,
    recentRating: C,
    recentContrib: w,
  };
}
function Ge({ p: e, s: t, onClick: n }) {
  let r = [
    [e.goals, 'GOL'],
    [e.assists, 'AST'],
    [e.gamesPlayed, 'PRE'],
    [`${e.passSuccessRate}%`, 'PAS'],
    [e.tacklesMade, 'CTR'],
    [e.ratingAve, 'MED'],
  ];
  return (
    <button
      className={`collector-card ${t.tier} ${t.hot ? 'on-fire' : ''}`}
      onClick={n}
      aria-label={`${e.name}, overall EA ${Ue(e)}, ${t.label}, ${e.goals} gol e ${e.assists} assist stagionali${t.hot ? ', in forma eccezionale' : ''}. Apri la pagella`}
    >
      <span className="collector-rating">
        {Ue(e)}
        <small>{t.label}</small>
      </span>
      <img className="collector-crest" src="/logo-billocchi.svg" alt="" />
      <span className="collector-tier">
        {t.basis === 'season'
          ? `INDICE STAG. ${t.score}`
          : t.basis === 'recent'
            ? `FORMA ${t.score}`
            : 'EA OVERALL'}
      </span>
      {t.hot && <span className="collector-fire-label">ON FIRE</span>}
      {e.name.toLowerCase() === 'we_belen' ? (
        <img
          className="collector-player-image"
          src="/cards/we-belen-portrait.webp"
          alt=""
        />
      ) : (
        <span className="collector-portrait" aria-hidden="true">
          {e.name.slice(0, 1).toUpperCase()}
        </span>
      )}
      <span className="collector-name">{e.name}</span>
      <span className="collector-stats">
        {r.map(([e, t]) => (
          <span key={t}>
            <b>{e}</b>
            <small>{t}</small>
          </span>
        ))}
      </span>
    </button>
  );
}
function Ke() {
  let [e, t] = useState(re),
    [n, r] = useState('loading'),
    [i, a] = useState([]),
    [o, s] = useState(),
    [c, l] = useState(false),
    [d, f] = useState(null),
    p = useCallback(async () => {
      l(true);
      try {
        let e = await fetch('/api/data', {
          cache: 'no-store',
        });
        if (!e.ok) throw Error();
        let n = await e.json();
        if (!n.club?.[0] || !n.members?.members) throw Error();
        t(n);
        a(n.fresh || []);
        r(
          ['club', 'members', 'matches'].every((e) => n.fresh?.includes(e))
            ? 'yes'
            : n.fresh?.length
              ? 'partial'
              : 'no',
        );
        s(new Date().toISOString());
      } catch {
        r('no');
      } finally {
        l(false);
      }
    }, []);
  useEffect(() => {
    p();
    let e = setInterval(p, 6e4),
      t = () => p();
    window.addEventListener('focus', t);
    return () => {
      clearInterval(e);
      window.removeEventListener('focus', t);
    };
  }, [p]);
  let m = e.club[0],
    _ = e.matches || [],
    v = useMemo(
      () =>
        [...e.members.members].sort(
          (e, t) =>
            $(t.goals) + $(t.assists) - ($(e.goals) + $(e.assists)) ||
            $(t.goals) - $(e.goals) ||
            $(t.gamesPlayed) - $(e.gamesPlayed) ||
            e.name.localeCompare(t.name),
        ),
      [e],
    ),
    ee = v.map((e) => ({
      p: e,
      s: We(e, _),
    })),
    b = ee.find((e) => e.p.name === d);
  useEffect(() => {
    if (!d) return;
    let e = (e) => {
      e.key === 'Escape' && f(null);
    };
    window.addEventListener('keydown', e);
    return () => window.removeEventListener('keydown', e);
  }, [d]);
  e.members.members.filter((e) => $(e.gamesPlayed) > 0).length;
  let S = $(m.wins),
    C = $(m.ties),
    w = $(m.losses),
    D = $(m.gamesPlayed),
    te = _.map((e) => {
      let t = e.clubs[70375];
      return $(t.goals) > $(t.goalsAgainst)
        ? 'V'
        : $(t.goals) < $(t.goalsAgainst)
          ? 'S'
          : 'P';
    }),
    k = [...v]
      .filter((e) => $(e.gamesPlayed) > 0)
      .sort((e, t) => $(t.goals) + $(t.assists) - $(e.goals) - $(e.assists)),
    j = [...k].sort((e, t) => $(t.goals) - $(e.goals))[0],
    M = [...k].sort((e, t) => $(t.assists) - $(e.assists))[0],
    ie = [...k]
      .filter((e) => $(e.gamesPlayed) >= 10)
      .sort((e, t) => $(t.passSuccessRate) - $(e.passSuccessRate))[0],
    N = _.slice()
      .reverse()
      .map((e) => {
        let t = e.clubs[70375];
        return {
          id: e.matchId,
          for: $(t.goals),
          against: $(t.goalsAgainst),
          name:
            Object.entries(e.clubs).find(([e]) => e !== '70375')?.[1]?.details
              ?.name || 'Avversario',
        };
      }),
    ae = N.reduce((e, t) => e + t.for, 0),
    P = N.reduce((e, t) => e + t.against, 0),
    oe = Math.max(5, ...N.flatMap((e) => [e.for, e.against]));
  return (
    <div className="site">
      <header className="nav">
        <a className="brand" href="#top">
          <img
            className="site-logo"
            src="/logo-billocchi.svg"
            alt="Stemma BILLOCCHI CLUB"
          />
          <span>
            {'BILLOCCHI '}
            <b>CLUB</b>
            <small>FC 27 / CLUB INTELLIGENCE</small>
          </span>
        </a>
        <Le />
        <div className="status">
          <i className={n === 'yes' ? 'active' : ''} />
          {n === 'yes'
            ? 'EA collegata'
            : n === 'partial'
              ? 'EA parziale'
              : n === 'no'
                ? 'Ultimi dati salvati'
                : 'Connessione a EA'}
        </div>
      </header>
      <main id="top">
        <Fe members={e.members.members} matches={e.matchHistory || _} />
        <section className="content" id="panoramica">
          <div className="section-head">
            <div>
              <span className="overline">01 / PANORAMICA</span>
              <h2>Il tabellone.</h2>
            </div>
            <button className="refresh" onClick={p} disabled={c}>
              <RefreshCw size={16} className={c ? 'spin' : ''} />
              {' Aggiorna dati'}
            </button>
          </div>
          <div className="overview">
            <div className="record panel">
              <span className="label">RECORD TOTALE</span>
              <div className="record-numbers">
                <strong>
                  <Be value={S} />
                </strong>
                <i>—</i>
                <strong>
                  <Be value={C} />
                </strong>
                <i>—</i>
                <strong>
                  <Be value={w} />
                </strong>
              </div>
              <div className="record-labels">
                <span>VITTORIE</span>
                <span>PAREGGI</span>
                <span>SCONFITTE</span>
              </div>
              <div className="split">
                <i
                  style={{
                    width: `${(S / D) * 100}%`,
                  }}
                />
                <i
                  style={{
                    width: `${(C / D) * 100}%`,
                  }}
                />
                <i
                  style={{
                    width: `${(w / D) * 100}%`,
                  }}
                />
              </div>
              <p>
                {Math.round((S / D) * 100)}
                {'% di vittorie su '}
                {D}
                {' partite. '}
                {S > w
                  ? 'Il bilancio è positivo; la difesa, però, lascia spazio al dramma.'
                  : 'La squadra ha ancora margine per cambiare il bilancio.'}
              </p>
            </div>
            <div className="metrics panel">
              <div>
                <span>GOL FATTI</span>
                <strong>
                  <Be value={$(m.goals)} />
                </strong>
                <small>
                  {Re(m.goals, D)}
                  {' / gara'}
                </small>
              </div>
              <div>
                <span>GOL SUBITI</span>
                <strong>
                  <Be value={$(m.goalsAgainst)} />
                </strong>
                <small>
                  {Re(m.goalsAgainst, D)}
                  {' / gara'}
                </small>
              </div>
              <div>
                <span>DIFFERENZA RETI</span>
                <strong className="lime">
                  {$(m.goals) - $(m.goalsAgainst) > 0 ? '+' : ''}
                  <Be value={$(m.goals) - $(m.goalsAgainst)} />
                </strong>
                <small>Gol fatti meno subiti</small>
              </div>
              <div>
                <span>PROMOZIONI</span>
                <strong>
                  <Be value={$(m.promotions)} />
                </strong>
                <small>
                  {m.relegations}
                  {' retrocessioni'}
                </small>
              </div>
            </div>
            <div className="form panel">
              <span className="label">
                {'ULTIME '}
                {_.length}
                {' · CAMPIONATO'}
              </span>
              <div className="form-row">
                {te.map((e, t) => (
                  <span key={t} className={e}>
                    {e}
                  </span>
                ))}
              </div>
              <h3>
                {te.filter((e) => e === 'V').length}
                {' vittorie nelle ultime '}
                {_.length}
              </h3>
              <p>
                {
                  'EA espone le ultime cinque gare per modalità. Il record generale comprende '
                }
                {D}
                {' partite.'}
              </p>
              <a href="#partite">
                {'Apri le partite '}
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
          <div className="insight">
            <div className="insight-symbol">◎</div>
            <div>
              <span>LETTURA RAPIDA</span>
              <strong>
                {Re(m.goals, D)}
                {' gol fatti e '}
                {Re(m.goalsAgainst, D)}
                {' subiti a gara.'}
              </strong>
              <p>
                {$(m.goalsAgainst) / D > 2
                  ? "L'attacco produce, ma la difesa concede spesso: c'è quasi sempre bisogno di segnare tanto."
                  : "Bilancio offensivo e difensivo letto sull'intera stagione."}
              </p>
            </div>
            <b>
              {Math.round(($(m.goalsAgainst) / Math.max(1, $(m.goals))) * 100)}%
            </b>
          </div>
          <details className="compact-appendix">
            <summary>La lente sui numeri · andamento e leader</summary>
            <section className="analysis" id="analisi">
              <Ve>
                <div className="section-head">
                  <div>
                    <span className="overline">02 / LA SALA ANALISI</span>
                    <h2>Dentro i numeri.</h2>
                    <p className="sub">
                      {
                        'Dati aggiornati da EA. Gli insight sulle gare recenti si riferiscono soltanto alle ultime '
                      }
                      {N.length}
                      {' partite disponibili.'}
                    </p>
                  </div>
                  <span className="analysis-stamp">
                    <ScanLine size={17} />
                    {' MATCH INTELLIGENCE'}
                  </span>
                </div>
              </Ve>
              <div className="analysis-grid">
                <Ve className="analysis-card pulse-card">
                  <div className="analysis-card-head">
                    <span>
                      {'IL PULSE DELLE ULTIME '}
                      {N.length}
                    </span>
                    <TrendingUp size={18} />
                  </div>
                  <div className="pulse-totals">
                    <strong>
                      {ae}
                      <small>{' FATTI'}</small>
                    </strong>
                    <span>:</span>
                    <strong>
                      {P}
                      <small>{' SUBITI'}</small>
                    </strong>
                  </div>
                  <div
                    className="pulse-chart"
                    aria-label="Gol fatti e subiti nelle ultime partite, in ordine cronologico"
                  >
                    {N.map((e, t) => (
                      <div key={e.id} className="pulse-game">
                        <div className="pulse-bars">
                          <i
                            className="bar-for"
                            style={{
                              height: `${Math.max(7, (e.for / oe) * 100)}%`,
                              animationDelay: `${t * 90}ms`,
                            }}
                            title={`${e.for} gol fatti`}
                          />
                          <i
                            className="bar-against"
                            style={{
                              height: `${Math.max(7, (e.against / oe) * 100)}%`,
                              animationDelay: `${t * 90 + 80}ms`,
                            }}
                            title={`${e.against} gol subiti`}
                          />
                        </div>
                        <b>
                          {e.for}–{e.against}
                        </b>
                        <span title={e.name}>{e.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="chart-legend">
                    <span>
                      <i />
                      {' Gol fatti'}
                    </span>
                    <span>
                      <i />
                      {' Gol subiti'}
                    </span>
                    <small>DAL PIÙ VECCHIO AL PIÙ RECENTE →</small>
                  </div>
                </Ve>
              </div>
              <Ve>
                <div className="signal-grid">
                  <div className="signal">
                    <span className="signal-icon">
                      <Crosshair size={22} />
                    </span>
                    <div>
                      <span>FINALIZZATORE</span>
                      <strong>{j?.name || '—'}</strong>
                      <p>
                        {j?.goals || 0}
                        {' gol · '}
                        {Math.round(
                          ($(j?.goals) / Math.max(1, $(m.goals))) * 100,
                        )}
                        % dei gol del club. Quando segna lui, la contabilità
                        cambia.
                      </p>
                    </div>
                  </div>
                  <div className="signal">
                    <span className="signal-icon">
                      <Target size={22} />
                    </span>
                    <div>
                      <span>UOMO ASSIST</span>
                      <strong>{M?.name || '—'}</strong>
                      <p>
                        {M?.assists || 0}
                        {' assist in '}
                        {M?.gamesPlayed || 0}
                        {' gare · '}
                        {Re(M?.assists, M?.gamesPlayed)}
                        {' a partita.'}
                      </p>
                    </div>
                  </div>
                  <div className="signal">
                    <span className="signal-icon">
                      <Activity size={22} />
                    </span>
                    <div>
                      <span>PIÙ PRECISO NEI PASSAGGI</span>
                      <strong>{ie?.name || '—'}</strong>
                      <p>
                        {ie?.passSuccessRate || 0}% di passaggi riusciti tra chi
                        ha almeno 10 presenze. Campione minimo dichiarato.
                      </p>
                    </div>
                  </div>
                </div>
              </Ve>
            </section>
          </details>
        </section>
        <Tag_xe members={e.members.members} matches={e.matchHistory || _} />
        <section className="content squad" id="rosa">
          <div className="section-head">
            <div>
              <span className="overline">03 / LA ROSA</span>
              <h2>La classifica dei Pro.</h2>
              <p className="sub">
                Tutti i profili EA in un colpo d’occhio. La graduatoria segue
                gol + assist stagionali; apri un giocatore per la figurina, la
                pagella e il ritratto della sua stagione, più ricco man mano che
                aumentano le presenze.
              </p>
            </div>
            <div className="count">
              {String(v.length).padStart(2, '0')} <small>PROFILI EA</small>
            </div>
          </div>
          <div className="leaderboard-head">
            <span>LEADERBOARD · STAGIONE 2026/27</span>
            <span>GOL + ASSIST</span>
          </div>
          <div className="leader-list">
            {ee.map(({ p: e, s: t }, n) => (
              <button
                key={e.name}
                className="leader-entry"
                onClick={() => f(e.name)}
                aria-label={`Posizione ${n + 1}, ${e.name}, ${$(e.goals) + $(e.assists)} gol più assist. Apri la pagella`}
              >
                <span className="leader-entry-rank">
                  #{String(n + 1).padStart(2, '0')}
                </span>
                <span
                  className={`leader-mini-card ${t.tier} ${t.hot ? 'on-fire' : ''}`}
                  aria-hidden="true"
                >
                  <span>{Ue(e)}</span>
                </span>
                <span className="leader-entry-name">
                  <strong>{e.name}</strong>
                  <small>
                    {t.label}
                    {' · '}
                    {e.gamesPlayed}
                    {' PRESENZE'}
                    {t.basis === 'season' ? ' · INDICE STAGIONALE' : ''}
                    {t.hot ? ' · ON FIRE' : ''}
                  </small>
                </span>
                <span className="leader-entry-breakdown">
                  <b>
                    {e.goals}
                    {' G'}
                  </b>
                  <b>
                    {e.assists}
                    {' A'}
                  </b>
                </span>
                <span className="leader-entry-total">
                  <strong>{$(e.goals) + $(e.assists)}</strong>
                  <small>G + A</small>
                </span>
                <ArrowUpRight className="leader-arrow" size={17} />
              </button>
            ))}
          </div>
          <p className="role-note">
            Classifica sui gol + assist stagionali EA, considerando tutti i
            ruoli. Il numero grande della figurina è l'overall del Pro fornito
            da EA: misura l'avatar, non il rendimento del giocatore. Colore e
            indice di forma sono valutazioni del sito sulle gare recenti nel
            ruolo indicato. Se mancano gare recenti, il colore usa i totali
            stagionali di tutti i ruoli; chi non ha presenze resta non
            classificato.
          </p>
          {b && (
            <div
              className="card-dialog-backdrop"
              onMouseDown={(e) => {
                e.target === e.currentTarget && f(null);
              }}
            >
              <div
                className="card-dialog"
                role="dialog"
                aria-modal="true"
                aria-label={`Pagella di ${b.p.name}`}
              >
                <button
                  className="dialog-close"
                  onClick={() => f(null)}
                  aria-label="Chiudi la pagella"
                >
                  ×
                </button>
                <div className="dialog-card">
                  <Ge p={b.p} s={b.s} onClick={() => {}} />
                </div>
                <div className="dialog-copy">
                  <span className="overline">
                    {'PAGELLA / '}
                    {b.s.label}
                    {' / '}
                    {b.s.tier.toUpperCase()}
                  </span>
                  <h3>{b.p.name}</h3>
                  <div className="form-grade">
                    <b>{b.s.basis === 'none' ? '—' : b.s.score}</b>
                    <span>
                      {b.s.basis === 'season'
                        ? 'INDICE STAGIONALE'
                        : 'INDICE DI FORMA'}
                      {' · '}
                      {b.s.tier.toUpperCase()}
                      {b.s.hot ? ' · ON FIRE' : ''}
                      <small>
                        {b.s.basis === 'season'
                          ? `${b.p.gamesPlayed} presenze stagionali in tutti i ruoli; assente dalle cinque gare recenti disponibili.`
                          : `${b.s.games} presenze nel reparto; ultime tre: media ${b.s.recentRating.toFixed(1)}, ${b.s.recentContrib} gol + assist.`}
                      </small>
                    </span>
                  </div>
                  <H p={b.p} players={v} recent={b.s} />
                  <small>
                    {
                      "L'indice di forma e il colore sono valutazioni del sito. Il numero grande sulla figurina è invece l'overall del Pro fornito da EA: "
                    }
                    {Ue(b.p)}.
                  </small>
                </div>
              </div>
            </div>
          )}
        </section>
        <Tag_de matches={_} />
        <details className="compact-appendix match-archive">
          <summary>Archivio rapido · tabellini di campionato</summary>
          <section className="content matches" id="partite">
            <div className="section-head">
              <div>
                <span className="overline">04 / MATCH CENTER</span>
                <h2>Ultime dal campo.</h2>
                <p className="sub">
                  Campionato, dalla più recente. Apri una gara per le
                  prestazioni dei Pro.
                </p>
              </div>
              <a
                className="source"
                href={ze + '/match-history?clubId=70375&platform=common-gen5'}
                target="_blank"
                rel="noreferrer"
              >
                {'Fonte EA '}
                <ArrowUpRight size={16} />
              </a>
            </div>
            <div className="match-list">
              {_.map((e, t) => {
                let n = e.clubs[70375],
                  r = Object.entries(e.clubs).find(([e]) => e !== '70375')?.[1],
                  i = Object.values(e.players?.['70375'] || {}),
                  a =
                    $(n.goals) > $(n.goalsAgainst)
                      ? 'VITTORIA'
                      : $(n.goals) < $(n.goalsAgainst)
                        ? 'SCONFITTA'
                        : 'PAREGGIO';
                return (
                  <details key={e.matchId} className="match">
                    <summary>
                      <span className="match-index">0{t + 1}</span>
                      <span className={'outcome ' + a}>{a}</span>
                      <strong>
                        {'BILLOCCHI CLUB '}
                        <b>
                          {n.goals}
                          {' — '}
                          {r?.goals}
                        </b>{' '}
                        {r?.details?.name || 'Avversario'}
                      </strong>
                      <time>
                        {new Date($(e.timestamp) * 1e3).toLocaleDateString(
                          'it-IT',
                          {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          },
                        )}
                      </time>
                      <ChevronDown size={18} />
                    </summary>
                    <div className="match-detail">
                      <div className="match-mini">
                        <span>
                          <b>{i.reduce((e, t) => e + $(t.goals), 0)}</b>
                          {' GOL DEI PRO'}
                        </span>
                        <span>
                          <b>{i.reduce((e, t) => e + $(t.assists), 0)}</b>
                          {' ASSIST'}
                        </span>
                        <span>
                          <b>{i.length}</b>
                          {' PRO IN CAMPO'}
                        </span>
                      </div>
                      <div className="match-players">
                        {i.map((e, t) => (
                          <div key={t}>
                            <strong>{e.playername}</strong>
                            <span>{e.pos}</span>
                            <b>
                              {e.goals}
                              {' G · '}
                              {e.assists}
                              {' A'}
                            </b>
                            <em>{e.rating}</em>
                          </div>
                        ))}
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          </section>
        </details>
      </main>
      <footer>
        <img className="site-logo" src="/logo-billocchi.svg" alt="" />
        <strong>BILLOCCHI CLUB · FC 27</strong>
        <p>
          Dati EA SPORTS FC Clubs. Sincronizzazione salvata ogni settimana;
          verifica sul sito ogni 60 secondi durante la visita.
          <br />
          {n === 'yes' && o
            ? `Lettura EA completa: ${new Date(o).toLocaleString('it-IT')}`
            : n === 'partial' && o
              ? `Lettura parziale: ${new Date(o).toLocaleString('it-IT')}. Aggiornati: ${i
                  .map(
                    (e) =>
                      ({
                        club: 'club',
                        members: 'giocatori',
                        matches: 'partite',
                        membersCore: 'gol, assist e presenze dei giocatori',
                      })[e] || e,
                  )
                  .join(
                    ', ',
                  )}; gli altri dati restano alla rilevazione del ${new Date(e.capturedAt).toLocaleString('it-IT')}.`
              : `Ultima rilevazione EA: ${new Date(e.capturedAt).toLocaleString('it-IT')}. Il server EA limita la connessione diretta; i dati vengono sincronizzati periodicamente.`}
        </p>
        <a
          href={ze + '/overview?clubId=70375&platform=common-gen5'}
          target="_blank"
          rel="noreferrer"
        >
          {'Profilo EA '}
          <ArrowUpRight size={14} />
        </a>
      </footer>
    </div>
  );
}
export { Ke as default };
