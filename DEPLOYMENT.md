# Deploying Pentacodes

This repo has two independent, separately-deployed halves:

```
frontend/   static site (HTML/CSS/JS) → Vercel
backend/    Laravel API + MySQL       → any PHP 8.2+ / MySQL host
```

They talk to each other over plain HTTPS (`frontend` calls `POST /api/leads` on `backend`),
so they can live on completely different hosts/domains. Not part of the deploy — left in the
repo for local reference only: `server/` (old Node prototype, superseded), `.tools/` (local-only
dev copies of PHP/Composer/MySQL, gitignored), `images-original-backup/` (pre-optimization image
backups, gitignored).

---

## 1. Push to GitHub

From the repo root (`p2claude/`):

```bash
git init
git add .
git status   # sanity check: .tools/, backend/vendor/, backend/.env, images-original-backup/,
             # server/ should NOT appear — they're in .gitignore
git commit -m "Initial commit"
```

Create a new empty repo on GitHub (no README/license, so it doesn't conflict), then:

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

Both Vercel and your backend host will connect to this one GitHub repo, each pointed at its
own subfolder (`frontend/` or `backend/`) as its "root directory" — no need for two repos.

---

## 2. Frontend → Vercel

1. Go to [vercel.com](https://vercel.com), sign in with GitHub, click **Add New → Project**.
2. Import the repo you just pushed.
3. In **Configure Project**:
   - **Root Directory** → click Edit, select `frontend`
   - **Framework Preset** → "Other" (it's plain static HTML, no build step needed)
   - Leave Build Command / Output Directory blank
4. Click **Deploy**. Vercel gives you a URL like `https://pentacodes.vercel.app`.
5. (Optional) **Settings → Domains** → add your real domain (e.g. `www.pentacodes.com`) and
   follow Vercel's DNS instructions (usually a CNAME record at your domain registrar).

Every future `git push` to `main` auto-redeploys the frontend.

---

## 3. Backend → a PHP + MySQL host

You need a host that runs **PHP 8.2+** with the `pdo_mysql`, `mbstring`, `openssl`, `curl`,
`fileinfo` extensions, plus a **MySQL 8.x database**. Two common paths:

### Option A — Railway (easiest, recommended if you don't already have hosting)

1. Go to [railway.app](https://railway.app), sign in with GitHub.
2. **New Project → Deploy from GitHub repo** → pick this repo.
3. Railway will ask for the root directory — set it to `backend`.
4. **New → Database → Add MySQL** in the same project. Railway auto-generates
   `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD` variables.
5. In your backend service's **Variables** tab, add everything from `backend/.env.example`,
   mapping the DB ones to Railway's MySQL variables (`DB_HOST=${{MYSQLHOST}}`, etc. — Railway
   lets you reference another service's variables directly).
6. Add a **Deploy → Custom Start Command**: `php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT`
   (or use Railway's PHP/Nixpacks default if it detects `artisan` automatically).
7. Railway gives you a domain like `https://pentacodes-api.up.railway.app` — that's your API's
   `APP_URL`.

### Option B — Traditional shared hosting / cPanel (if you already have hosting)

1. Confirm PHP 8.2+ and a MySQL database are available (create the DB via cPanel's
   "MySQL Databases" tool, note the host/user/password/db name it gives you).
2. Upload the contents of `backend/` to the server (via Git pull if SSH is available, or
   zip+upload via cPanel File Manager otherwise). **Important:** point the domain/subdomain's
   document root at `backend/public/`, not at `backend/` itself.
3. Via SSH (or cPanel's Terminal, if offered): `cd` into `backend/`, run `composer install
   --no-dev --optimize-autoloader`. If Composer isn't available, install dependencies locally
   and upload the `vendor/` folder instead.
4. Copy `.env.example` to `.env`, fill in real values (see step 4 below), then run:
   `php artisan key:generate && php artisan migrate --force`

Either way, once it's live, note the API's URL (e.g. `https://api.pentacodes.com` or the
Railway URL) — you need it in step 5.

---

## 4. Configure the backend's `.env`

Whichever host you use, `backend/.env` needs real values (copy from `.env.example`):

| Variable | Value |
|---|---|
| `APP_URL` | this API's own URL, e.g. `https://api.pentacodes.com` |
| `APP_KEY` | generate with `php artisan key:generate` — don't leave blank |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `FRONTEND_URL` | your Vercel URL/domain, e.g. `https://www.pentacodes.com` |
| `CORS_ALLOWED_ORIGINS` | same as above, plus a Vercel preview URL if you use one, comma-separated |
| `DB_HOST` / `DB_PORT` / `DB_DATABASE` / `DB_USERNAME` / `DB_PASSWORD` | your host's MySQL credentials |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USERNAME` / `MAIL_PASSWORD` | your SMTP provider (Gmail app password, SendGrid, your host's own SMTP, etc.) |
| `LEAD_TO_EMAIL` | the inbox that should receive new-lead notifications |

Then run migrations if you haven't already: `php artisan migrate --force`

---

## 5. Point the frontend at the live backend

Edit `frontend/js/config.js` — change:

```js
: 'https://REPLACE_WITH_REAL_API_DOMAIN';
```

to your actual deployed backend URL, e.g. `https://api.pentacodes.com` (from step 3). Commit
and push — Vercel redeploys automatically. (Localhost testing is unaffected; that branch of the
config auto-detects and keeps pointing at `http://localhost:8000`.)

---

## 6. Fill in the remaining placeholders

Search the frontend for `REPLACE_WITH_REAL_DOMAIN` (canonical tags, Open Graph tags, JSON-LD,
`robots.txt`, `sitemap.xml`) and replace with your real frontend domain — these were left as
placeholders during development since the domain wasn't decided yet:

```bash
cd frontend
grep -rl "REPLACE_WITH_REAL_DOMAIN" .
# then replace in each file with your real domain, e.g.:
# find . -type f \( -name "*.html" -o -name "*.txt" -o -name "*.xml" \) -exec sed -i 's/REPLACE_WITH_REAL_DOMAIN/www.pentacodes.com/g' {} +
```

---

## 7. Post-deploy checklist

- [ ] Visit the live frontend URL, confirm all 5 pages load and look right
- [ ] Submit each form (footer "Let's Talk", Contact page, both Service Details forms) and
      confirm the success message appears
- [ ] Check the `leads` table in your MySQL database — confirm the test submissions landed
- [ ] Confirm the notification email arrives (check spam folder the first time)
- [ ] Check the backend's CORS is locked to your real frontend domain (not still `localhost`)
- [ ] Re-check `robots.txt` / `sitemap.xml` reference the real domain, submit the sitemap in
      Google Search Console
- [ ] If you have Google Analytics / Meta Pixel / Google Ads IDs, wire them in (not yet added —
      see the earlier SEO/ads audit notes)
