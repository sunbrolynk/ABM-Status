<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/readme/banner-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="docs/readme/banner-light.svg">
    <img src="docs/readme/banner-dark.svg" alt="AudioBook Manager" width="560">
  </picture>
</p>

<p align="center"><b>The status page for AudioBook Manager's website and docs.</b></p>

<p align="center">
  <a href="https://status.audiobookmanager.com"><img src="https://img.shields.io/badge/status-status.audiobookmanager.com-8b45c6?style=for-the-badge" alt="Status page"></a>
  <img src="https://img.shields.io/badge/powered%20by-UptimeFlare-blue?style=for-the-badge" alt="Powered by UptimeFlare">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-8b45c6?style=for-the-badge" alt="Apache 2.0 license"></a>
</p>

<p align="center">
  <a href="https://github.com/sunbrolynk/abm-status/actions/workflows/checks.yml"><img src="https://github.com/sunbrolynk/abm-status/actions/workflows/checks.yml/badge.svg?branch=dev" alt="Checks"></a>
</p>

<hr>

This is the uptime page for [AudioBook Manager](https://audiobookmanager.com), live at
[status.audiobookmanager.com](https://status.audiobookmanager.com). It runs on
[UptimeFlare](https://github.com/lyc8503/UptimeFlare) by lyc8503: a Cloudflare Worker checks
each target every minute and a Cloudflare Pages site shows the history.

## What it watches

| Monitor | URL |
|---|---|
| Website | https://audiobookmanager.com/ |
| Docs: Quick start | https://audiobookmanager.com/getting-started/quick-start/ |
| Docs: Installation | https://audiobookmanager.com/installation/ |
| API reference | https://audiobookmanager.com/api-reference/ |

ABM Radio (`radio.audiobookmanager.com`) is in `uptime.config.ts` but commented out, because the
name doesn't resolve yet. I'll switch it on when the station goes live.

Downtime and recovery alerts go to Discord. Everything is set in `uptime.config.ts`.

## Deploying

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the worker and the page and
applies them with Terraform and wrangler. It needs these repository secrets:

| Secret | What it is |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare token with Workers, Pages and D1 edit rights |
| `CLOUDFLARE_ACCOUNT_ID` | Optional; looked up from the token when it's missing |
| `DISCORD_WEBHOOK_URL` | Discord webhook for alerts; with none set, no alerts are sent |

The webhook URL is inlined into the worker bundle at build time with `wrangler --define`, so it
never sits in the repo and never reaches the page.

## Cloudflare names

Three status pages share one Cloudflare account, so every resource name here comes from one
prefix, `uptimeflare-abm`, instead of upstream's fixed `uptimeflare` names:

| Resource | Name |
|---|---|
| Worker | `uptimeflare-abm_worker` |
| D1 database | `uptimeflare-abm_d1` |
| Pages project | `uptimeflare-abm` (`uptimeflare-abm.pages.dev`) |
| Old KV namespace the migration looks for | `uptimeflare-abm_kv` |

The prefix is `TF_VAR_UF_PREFIX` at the top of `deploy.yml`. These files carry the rename:

- `.github/workflows/deploy.yml`: the prefix, the Durable Object lookup, the Terraform imports
  and the Pages upload
- `deploy.tf`: the `UF_PREFIX` variable and the D1, Worker and Pages names
- `deploy/init_d1.py` and `deploy/migrate_kv.py`: the D1 and KV names
- `wrangler.toml`, `worker/wrangler.toml` and `entrypoint.sh`: the same names written out, for
  local builds and Docker

UptimeFlare's Upstream Sync workflow replaces everything except `uptime.config.ts`, which would
undo the rename and the repo checks, and the branch rules stop it pushing to `main` anyway. I
bring upstream changes in by hand on a branch and re-apply the rename to the files above.

## Custom domain

`status.audiobookmanager.com` is a custom domain on the `uptimeflare-abm` Pages project, added
in the Cloudflare dashboard under Workers & Pages, then the project's Custom domains tab.

## Working on it

`dev` is the work branch and changes land on it by PR. `main` deploys, and `dev` reaches it by PR.

```sh
bash scripts/install-hooks.sh
```

That installs the commit and push checks: gitleaks, a public-repo check for home-network
details, and a changelog check.

## Support

If you find AudioBook Manager useful, you can support it here:

<p align="center">
  <a href="https://ko-fi.com/sunbrolynk">
    <img src="https://img.shields.io/badge/Ko--fi-Support%20Development-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white" alt="Ko-fi">
  </a>
  <a href="https://buymeacoffee.com/sunbrolynk">
    <img src="https://img.shields.io/badge/Buy%20Me%20A%20Monster-Support-FFDD00?style=for-the-badge&logo=data:image/svg%2Bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iYmxhY2siPjxwYXRoIGQ9Ik01IDJoMTRsLTEgMThINkw1IDJ6bTIgMmwuNzUgMTRoOC41TDE3IDRIN3oiLz48cGF0aCBkPSJNMTMgNmwtMyA1aDIuNUwxMSAxN2w1LTdoLTNsMi00aC0yeiIvPjxwYXRoIGQ9Ik04IDIwaDh2Mkg4di0yeiIvPjwvc3ZnPg%3D%3D" alt="Buy Me A Monster">
  </a>
</p>

## Credits and licence

Built on [UptimeFlare](https://github.com/lyc8503/UptimeFlare) by
[lyc8503](https://github.com/lyc8503), under the Apache License 2.0. My changes are under the
same licence; see [LICENSE](LICENSE) and [NOTICE](NOTICE).
