# Quizz

Quizzes on world countries: capitals, ISO codes, phone dialing codes, and currencies.

**Live (after Pages setup):** https://TomNslg.github.io/quizz/  
**Sync token (phones):** `TOKEN-SETUP.md` · Pages: `GITHUB-PAGES.md`

Data comes from a self-assembled table (`Pays.pdf`), kept in PDF order (by dialing code).

Dev server:

```bash
python3 -m http.server 8765 --bind 0.0.0.0
```

Push updates to `origin/main`; bump `CACHE` in `sw.js` when shipping shell changes.
