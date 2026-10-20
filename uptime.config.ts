// Don't edit this line
import { MaintenanceConfig, PageConfig, WorkerConfig } from './types/config'

const pageConfig: PageConfig = {
  title: 'AudioBook Manager Status',
  links: [
    { link: 'https://audiobookmanager.com', label: 'Website' },
    { link: 'https://github.com/sunbrolynk/AudioBook-Manager', label: 'GitHub', highlight: true },
  ],
  favicon: '/favicon.png',
  logo: '/logo.png',
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
    // The station's own now-playing feed: up only while AzuraCast reports the station on air.
    {
      id: 'radio',
      name: 'ABM Radio',
      method: 'GET',
      target: 'https://stream.audiobookmanager.com/api/nowplaying/lofi',
      expectedCodes: [200],
      responseKeyword: '"is_online":true',
      timeout: 10000,
    },
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
