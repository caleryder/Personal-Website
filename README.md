# calethompson.com

Portfolio site for Cale Thompson.

## What's in this repo

- `index.html` — the entire site (single file, images embedded)
- `CNAME` — tells GitHub Pages to serve this repo at calethompson.com

## Deployment (GitHub Pages)

1. Push these files to the `main` branch of this repo.
2. Go to your repo → **Settings → Pages**.
3. Under "Build and deployment," set **Source** to "Deploy from a branch."
4. Set **Branch** to `main` and folder to `/ (root)`, then Save.
5. GitHub will show a message that it's building your site — this can take a minute or two.
6. Once it's live, GitHub Pages will show you a `yourusername.github.io/reponame` URL first. That's normal.

## Connecting your custom domain (calethompson.com)

1. Go to your domain registrar (wherever you bought calethompson.com — GoDaddy, Namecheap, Google Domains, etc.).
2. Add these DNS records:
   - Four **A records** for the root domain (`@`), pointing to GitHub Pages' IP addresses:
     - 185.199.108.153
     - 185.199.109.153
     - 185.199.110.153
     - 185.199.111.153
   - One **CNAME record** for `www`, pointing to `yourusername.github.io`
3. Back in GitHub → Settings → Pages, enter `calethompson.com` in the "Custom domain" field and Save. (The CNAME file in this repo does this automatically, but re-entering it in the UI triggers GitHub's DNS check.)
4. Check "Enforce HTTPS" once it becomes available (can take up to 24 hours after DNS propagates).

DNS changes can take anywhere from a few minutes to 24-48 hours to fully propagate.
