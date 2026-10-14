# BILLOCCHI CLUB — front-end sorgente (Vite + React 19)

Ricostruzione modificabile del sito compilato in `site/` (bundle vinext/Next).
Il codice è stato ricavato dal chunk reale `site/_next/static/chunks/page-*.js`
e poi reso leggibile; l'aspetto e il comportamento sono identici al sito live.

## Comandi

```bash
cd app
npm install
npm run dev       # dev server con /api/data servito da ../data/data.json
npm run build     # build di produzione in app/dist
npm run preview   # serve dist (anche /api/data, vedi vite.config.js)
```

`/api/data` in produzione è la funzione Vercel `api/data.js` (radice del repo,
legge `data/data.json`). In dev/preview lo stesso JSON è servito da un piccolo
plugin in `vite.config.js`. `vercel.json` non è stato toccato: il deploy
continua a pubblicare `site/` finché non si decide di puntare a `app/dist`
(`outputDirectory` + build command).

## Struttura

```
index.html            head identico a site/index.html (title, og, favicon, lang=it)
public/               asset statici copiati da site/ (cards/, models/, logo, data.json,
                      archive.json, statistiche.html, extras.js, robots.txt, 404.html)
src/main.jsx          createRoot + stili
src/styles.css        CSS originale (site/_next/static/css/index.*.css)
src/App.jsx           composizione delle sezioni
src/vendor/adani-scene.js   chunk three.js della scena 3D (importato in lazy da AdaniMini)
src/lib/              dati e calcoli puri
  useClubData.js        fetch /api/data (all'avvio, ogni 60 s, al focus) + fallback
  fallback-data.json    snapshot embedded usato prima della prima risposta
  data.js constants.js stats.js format.js positions.js matches.js
  newsroom.js           copertina, svolte, processo, trend del "Giorno dopo"
  grades.js             voti e commenti per Pro
  season-profile.js     ritratto stagionale
  adani-quotes.js       archivio citazioni e abbinamento ai Pro
  card-profile.js       indice di forma / colore delle figurine
  icons.js              icona Swords a linee (come nel sito originale)
src/components/       sezioni UI
  DayAfter + day-after/ "Il giorno dopo" (gazzetta)
  Overview, AnalysisRoom, PerformanceGrades, Squad (+CollectorCard, SeasonProfile),
  MatchLab + match-lab/ ("Lo spogliatoio": studio / curva / testa a testa),
  MatchArchive, SiteHeader, SiteFooter, SectionNav, CountUp, Reveal, AdaniMini, AdaniComment
```

## Verifica di parità (Playwright)

Confronto fatto contro https://billocchi-club-omega.vercel.app/ con gli stessi dati
(`/api/data` = `data/data.json`):

- screenshot full page a 1280 e 390 px: 0 pixel di differenza (animazioni congelate);
- console senza errori su entrambe le versioni;
- interazioni (select serata, protagonista, dettagli aperti, commenti voti, dialog
  figurina con Esc/click esterno, tab Match studio / La mia curva / Testa a testa
  con tutte le select e l'ordinamento, tastiera sulle tab, copia riepilogo,
  refresh dati): stesso testo della pagina dopo ogni passo, 37 snapshot × 2 viewport.

Il DOM differisce solo per l'ordine degli attributi e `selected=""` sulle `<option>`
(artefatti del rendering SSR del sito originale); la pagina qui è un SPA client-side,
quindi non c'è HTML pre-renderizzato.

## Note

- La scena 3D (`AdaniMini`) carica `/models/adani-mini.glb` quando entra in viewport.
- Le dipendenze del bundle originale non sono state aggiornate: il chunk three.js è
  vendorizzato così com'è (minificato) in `src/vendor/adani-scene.js`.
- Possibili passi successivi: sostituire il chunk three.js con `three` da npm
  (ricostruendo la scena dai sorgenti), test sui calcoli in `src/lib/` (`test/app-lib.test.mjs`, eseguiti da `npm test` alla radice),
  prerendering statico per SEO/anteprime.
