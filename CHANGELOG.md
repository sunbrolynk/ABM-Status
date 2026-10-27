# Changelog

All notable changes to the AudioBook Manager status page are recorded here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- ABM Radio joins the party as the Bard, up while the station's now-playing feed says it's on air.

### Fixed

- A young streak reads in hours, or "just rolled initiative", instead of "0 days".

### Added

- A new page design, The Uptime Party. Each monitor is a party member with an HP bar for its
  90-day uptime, a level, a status effect and a line of flavour text. A crystal ball shows the
  overall state, maintenance is the party taking a long rest, and past outages read as a quest
  log. Every state shows its plain word (Operational, Degraded, Down or Maintenance) as well as
  the colour.
- A Degraded state: a monitor that is up but recovered from an outage less than 24 hours ago
  shows as Degraded. The overall state is Degraded when any monitor is down or degraded, and Down
  only when every monitor is down.
- Response times open on demand under each monitor, and the 90-day history can be read with the
  keyboard.
- Monitors for the website, two docs pages and the API reference, with ABM Radio ready to switch
  on once its name resolves.
- ABM's logo, favicon and palette on the page, with links to the website and GitHub.
- Discord alerts for downtime and recovery, from the `DISCORD_WEBHOOK_URL` repo secret.
- Commit and push hooks and a Checks workflow for secrets, home-network details and the changelog.
- Dependabot for npm and GitHub Actions, one PR per package after a 14-day cooldown.

### Changed

- The README badge shows the website's live status, and the README covers adding monitors,
  alerts, deploying, the custom domain, the first run and upstream updates.
- The page's fonts (Pixelify Sans, Spectral and JetBrains Mono) are bundled with the build from
  `@fontsource`, so the page makes no third-party requests.
- Security reports go through GitHub's private vulnerability reporting.
- The Upstream Sync workflow is disabled.
- Every Cloudflare resource name comes from the `uptimeflare-abm` prefix, so this page can share
  an account with my other projects.
- Every GitHub Action is pinned by commit.

### Removed

- The upstream page components, the translations and the `customFooter` option, which the new
  page doesn't use.

- The Chinese README and the issue translation workflow.
