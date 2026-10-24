# Publish Quizz on GitHub Pages

Serves the **app shell** (HTML/JS/CSS). **Progress stays on the device** (`localStorage`), with optional GitHub sync via a fine-grained token.  
After one online visit, the **service worker** caches the shell so a Home Screen icon can open **offline**.

## One-time setup

1. On GitHub: **New repository** → name **`quizz`** → **Public** → create (empty, no README needed).

2. Push this project:

```bash
cd /path/to/Quizz
git init
git add -A
git commit -m "Quizz: countries quizzes app."
git branch -M main
git remote add origin https://github.com/TomNslg/quizz.git
git push -u origin main
```

3. Open the repo on GitHub → **Settings** → **Pages**.

4. Under **Build and deployment** → **Source**:

   - **Deploy from a branch** → Branch **main** / folder **/ (root)** → Save  
   - **or** **GitHub Actions** — allow the included workflow if asked.

5. Wait ~1 minute. Site URL:

`https://TomNslg.github.io/quizz/`

6. Phone browser → open that URL (online once) → Share → **Add to Home Screen**.

## Updating

```bash
git add -A
git commit -m "Update Quizz."
git push
```

Bump `CACHE` in `sw.js` when you change JS/CSS so phones refresh the offline shell.

## Notes

- Project site lives under `/Quizz/` — keep asset URLs **relative**.
- Do **not** commit secrets; this folder is public if the repo is public.
