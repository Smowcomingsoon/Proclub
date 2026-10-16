# BILLOCCHI CLUB

Sito statistiche FC 27 Pro Clubs.

- `app/`: front-end Vite + React (vedi `app/README.md`); `shared/`: metriche e commenti
- `data/data.json`: ultimo snapshot EA; `data/archive/index.json`: archivio partite
- `scripts/update-data.js`: scarica EA, valida, aggiorna dati e archivio
- `.github/workflows/update-data.yml`: raccolta ogni ora (al minuto 17), indipendente da ChatGPT, e manuale
- `api/data.js`: serve lo snapshot a `/api/data`
- Secret opzionali per notifiche: `DISCORD_WEBHOOK`, `TELEGRAM_TOKEN`, `TELEGRAM_CHAT`
- Test: `npm test`

## Raccolta autonoma

GitHub Actions esegue `scripts/update-data.js` ogni ora, al minuto 17, anche a sito chiuso. Non richiede ChatGPT, OpenAI API o un abbonamento GPT. Il `GITHUB_TOKEN` viene fornito automaticamente da GitHub e serve soltanto per salvare i dati nel repository. Il sito Vercel legge questi dati dopo la pubblicazione del commit.

Campionato, playoff e amichevoli vengono uniti nell'archivio permanente per ID partita; i tabellini precedenti restano in `data/data.json` e nella cronologia Git. `data/sync-status.json` registra l'ultimo controllo e le eventuali fonti mancanti. Se playoff o amichevoli non rispondono dopo i tentativi previsti, vengono salvati gli altri dati disponibili e il job risulta fallito, così la raccolta parziale non appare riuscita. Le notifiche dei fallimenti si gestiscono nelle impostazioni GitHub Actions del proprio account.

GitHub può ritardare le esecuzioni programmate. I commit del piccolo file di stato mantengono attivo il repository anche senza nuove partite. Le gare già uscite dagli ultimi dieci di EA prima dell'archiviazione non sono ricostruibili da questa raccolta.
