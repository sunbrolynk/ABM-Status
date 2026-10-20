// Don't edit this line
import { MaintenanceConfig, PageConfig, WorkerConfig } from './types/config'

// ABM's palette over Mantine's variables: purple accent, ABM's dark surfaces.
const theme = `<style>
:root:root { --mantine-color-blue-filled: #8b45c6; --mantine-color-blue-filled-hover: #7a3ab5; --mantine-color-anchor: #8b45c6; --mantine-primary-color-filled: #8b45c6; --mantine-primary-color-filled-hover: #7a3ab5; }
:root:root[data-mantine-color-scheme='dark'] { --mantine-color-body: #1a1a1a; --mantine-color-dark-7: #1a1a1a; --mantine-color-dark-6: #1e1e1e; --mantine-color-dark-5: #2a2a2a; --mantine-color-dark-4: #2a2a2a; --mantine-color-anchor: #b07ce0; }
</style>`

const pageConfig: PageConfig = {
  title: 'AudioBook Manager Status',
  links: [
    { link: 'https://audiobookmanager.com', label: 'Website' },
    { link: 'https://github.com/sunbrolynk/AudioBook-Manager', label: 'GitHub', highlight: true },
  ],
  favicon: '/favicon.png',
  logo: '/logo.png',
  customFooter:
    theme +
    '<p style="text-align: center; font-size: 12px; margin-top: 10px;">Status for <a href="https://audiobookmanager.com">AudioBook Manager</a>, powered by <a href="https://github.com/lyc8503/UptimeFlare" target="_blank">UptimeFlare</a>.</p>',
}

const workerConfig: WorkerConfig = {
  monitors: [
    {
      id: 'site',
      name: 'Website',
      method: 'GET',
      target: 'https://audiobookmanager.com/',
      statusPageLink: 'https://audiobookmanager.com/',
      expectedCodes: [200],
      timeout: 10000,
    },
    {
      id: 'docs_quick_start',
      name: 'Docs: Quick start',
      method: 'GET',
      target: 'https://audiobookmanager.com/getting-started/quick-start/',
      statusPageLink: 'https://audiobookmanager.com/getting-started/quick-start/',
      expectedCodes: [200],
      timeout: 10000,
    },
    {
      id: 'docs_installation',
      name: 'Docs: Installation',
      method: 'GET',
      target: 'https://audiobookmanager.com/installation/',
      statusPageLink: 'https://audiobookmanager.com/installation/',
      expectedCodes: [200],
      timeout: 10000,
    },
    {
      id: 'api_reference',
      name: 'API reference',
      method: 'GET',
      target: 'https://audiobookmanager.com/api-reference/',
      statusPageLink: 'https://audiobookmanager.com/api-reference/',
      expectedCodes: [200],
      timeout: 10000,
    },
    // radio.audiobookmanager.com doesn't resolve yet; uncomment once it's live.
    // {
    //   id: 'radio',
    //   name: 'ABM Radio',
    //   method: 'GET',
    //   target: 'https://radio.audiobookmanager.com/',
    //   statusPageLink: 'https://radio.audiobookmanager.com/',
    //   expectedCodes: [200],
    //   timeout: 10000,
    // },
  ],
  notification: {
    // Discord webhook from the DISCORD_WEBHOOK_URL repo secret, inlined when deploy.yml builds the worker
    webhook: process.env.DISCORD_WEBHOOK_URL
      ? {
          url: process.env.DISCORD_WEBHOOK_URL,
          payloadType: 'json',
          payload: { content: '$MSG' },
          timeout: 10000,
        }
      : undefined,
    timeZone: 'America/Denver',
    gracePeriod: 5,
    // Down and recovery only, not every change of error text while it's down
    skipErrorChangeNotification: true,
  },
}

const maintenances: MaintenanceConfig[] = []

// Don't edit this line
export { maintenances, pageConfig, workerConfig }
