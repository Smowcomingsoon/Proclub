# BILLOCCHI CLUB

Sito statistiche FC 27 Pro Clubs.

- `site/`: sito statico (copia compilata)
- `data/data.json`: ultimo snapshot EA; `data/archive/index.json`: archivio partite
- `scripts/update-data.js`: scarica EA, valida, aggiorna dati e archivio
- `.github/workflows/update-data.yml`: sync giornaliero (04:17 UTC) e manuale
- `api/data.js`: serve lo snapshot a `/api/data`
- Secret opzionali per notifiche: `DISCORD_WEBHOOK`, `TELEGRAM_TOKEN`, `TELEGRAM_CHAT`
- Test: `npm test`
