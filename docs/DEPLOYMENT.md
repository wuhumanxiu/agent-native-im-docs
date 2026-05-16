# ANI Docs Deployment

This document records the deployment model for the ANI documentation site. It intentionally avoids secrets, tunnel tokens, private keys, and account-specific credentials.

## Overview

ANI Docs is a standalone Next.js + Fumadocs site mounted under the main ANI domain:

```text
https://agent-native.im/docs
```

The current production topology is:

```text
Cloudflare Published Application
  agent-native.im -> http://<ani-production-host>

Production host
  nginx :80
    /docs  -> ani-docs.service on 127.0.0.1:4000
    /api   -> ANI backend on 127.0.0.1:9800
    /ws    -> ANI backend on 127.0.0.1:9800
    /      -> ANI Web static files
```

`expo.agent-native.im` is a separate Cloudflare Published Application for the mobile/Expo development entrypoint and is not part of the docs deployment path.

## Local Build

From this project directory:

```bash
npm install
npm run build
```

The build command runs:

```bash
fumadocs-mdx && next build
```

Important project settings:

- `next.config.mjs` sets `basePath: "/docs"`.
- `next.config.mjs` sets `output: "standalone"` for systemd deployment.
- Markdown/MDX content lives in `content/docs/`.
- Sidebar ordering and grouping is controlled by `content/docs/meta.json`.

## Production Directory

Recommended production install path:

```text
/opt/ani-docs
```

The standalone build should be deployed with both:

```text
.next/standalone/*
.next/static/*
```

The server entrypoint is:

```text
/opt/ani-docs/server.js
```

## systemd Service

Example service:

```ini
[Unit]
Description=ANI Documentation Site
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/ani-docs
Environment=NODE_ENV=production
Environment=PORT=4000
Environment=HOSTNAME=127.0.0.1
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Install or update:

```bash
sudo tee /etc/systemd/system/ani-docs.service >/dev/null < ani-docs.service
sudo systemctl daemon-reload
sudo systemctl enable --now ani-docs.service
sudo systemctl restart ani-docs.service
sudo systemctl status ani-docs.service --no-pager
```

## nginx Routing

The main ANI nginx server should proxy `/docs` to the docs service before the SPA fallback route.

Example server block snippets:

```nginx
location = /docs {
    proxy_pass http://127.0.0.1:4000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /docs/ {
    proxy_pass http://127.0.0.1:4000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Reload nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Deployment Command Pattern

From the local project directory:

```bash
npm run build

tar -C .next/standalone --no-xattrs -czf - . \
  | ssh ubuntu@<ani-production-host> \
      'sudo rm -rf /opt/ani-docs && sudo mkdir -p /opt/ani-docs && sudo tar -xzf - -C /opt/ani-docs && sudo mkdir -p /opt/ani-docs/.next/static'

tar -C .next/static --no-xattrs -czf - . \
  | ssh ubuntu@<ani-production-host> \
      'sudo tar -xzf - -C /opt/ani-docs/.next/static && sudo systemctl restart ani-docs.service'
```

`--no-xattrs` avoids noisy macOS extended attribute warnings during tar streaming.

## Verification

Local host checks on the production machine:

```bash
curl -I http://127.0.0.1:4000/docs
curl -I http://127.0.0.1/docs
systemctl is-active ani-docs.service nginx
```

Public checks:

```bash
curl -I https://agent-native.im/docs
curl -I https://agent-native.im/docs/openclaw
curl -I https://agent-native.im/docs/_next/static/chunks/main-app-a090dacf89944a22.js
```

The exact static chunk filename changes between builds. Use the current HTML output to find a valid `/docs/_next/static/...` path.

## Common Issues

### `/docs` redirects in a loop

Do not redirect `/docs` to `/docs/` in nginx. With Next.js `basePath: "/docs"`, the app may canonicalize `/docs/` back to `/docs`. Proxy both paths directly.

### Static assets return 404

Confirm `.next/static` was copied to:

```text
/opt/ani-docs/.next/static
```

### Main ANI Web app captures `/docs`

Ensure the nginx `/docs` locations appear before the root SPA fallback:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Dark mode text has unexpected background

Keep active-state overrides scoped to the sidebar:

```css
.dark #nd-sidebar [data-active="true"] {
  ...
}
```

Avoid global rules such as `.dark [data-active="true"]` because Fumadocs also uses `data-active` for the right-side table of contents.
