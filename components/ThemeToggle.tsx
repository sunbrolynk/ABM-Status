import { useComputedColorScheme, useMantineColorScheme } from '@mantine/core'

export default function ThemeToggle({ darkLabel, lightLabel, className = 'theme-toggle' }: { darkLabel: string; lightLabel: string; className?: string }) {
  const { setColorScheme } = useMantineColorScheme()
  const scheme = useComputedColorScheme('dark')
  return (
    <button type="button" className={className} onClick={() => setColorScheme(scheme === 'dark' ? 'light' : 'dark')}>
      {scheme === 'dark' ? lightLabel : darkLabel}
    </button>
  )
}
