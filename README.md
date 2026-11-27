# Cyber Tuna Labs LLC

Official studio website for Cyber Tuna Labs LLC, published at [cybertunalabs.com](https://cybertunalabs.com).

The site is static HTML and CSS. GitHub Pages can serve it from the root of the `main` branch. `CNAME` sets the custom domain. `.nojekyll` disables Jekyll so the files are published as written.

## Pages

- `/` — studio home (About, Games, Contact, Legal)
- `/swarm-genesis/privacy/` — Swarm Genesis Privacy Policy
- `/swarm-genesis/terms/` — Swarm Genesis Terms of Service and EULA

The policy pages are the public Privacy Policy and Terms of Service. A studio bar above each document links back to the studio and to the companion policy.

Swarm Genesis logo, key art, nebula, and screenshots in `assets/` are the studio’s published game art, optimized for the web.

## Local preview

From the repository root:

```bash
python3 -m http.server 8000
```

Open `http://127.0.0.1:8000/`.

## GitHub Pages

In the repository settings, set Pages to deploy from the `main` branch and the root folder. The custom domain is `cybertunalabs.com`.
