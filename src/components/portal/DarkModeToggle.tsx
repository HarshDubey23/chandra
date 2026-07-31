'use client'
import { Moon, Sun, Monitor, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/theme-store'
import { useI18n } from '@/lib/i18n'
import { useEffect } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

/**
 * DarkModeToggle — three-mode theme switcher (light / dark / auto)
 * with a dropdown menu for explicit selection. The icon button click
 * cycles through modes: light → dark → auto → light.
 */
export function DarkModeToggle() {
  const { theme, resolved, toggle, setTheme } = useTheme()
  const { locale } = useI18n()

  // Ensure theme class applied on first paint (matches theme-store applyInitialTheme)
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('gpchandra-theme')
      if (raw) {
        const parsed = JSON.parse(raw) as { state?: { theme?: 'light' | 'dark' | 'auto' } }
        const t = parsed?.state?.theme ?? 'light'
        const root = document.documentElement
        const mql = window.matchMedia('(prefers-color-scheme: dark)')
        const resolvedT = t === 'auto' ? (mql.matches ? 'dark' : 'light') : t
        if (resolvedT === 'dark') root.classList.add('dark')
        else root.classList.remove('dark')
        root.style.colorScheme = resolvedT
      }
    } catch {
      // ignore
    }
  }, [])

  const icon = theme === 'light' ? (
    <Sun className="h-4 w-4 text-amber-500" />
  ) : theme === 'dark' ? (
    <Moon className="h-4 w-4 text-primary" />
  ) : (
    <Monitor className="h-4 w-4 text-emerald-500" />
  )

  const tooltipHi =
    theme === 'light' ? 'डार्क मोड में बदलें' :
    theme === 'dark' ? 'ऑटो मोड में बदलें' :
    'लाइट मोड में बदलें'
  const tooltipEn =
    theme === 'light' ? 'Switch to dark mode' :
    theme === 'dark' ? 'Switch to auto mode' :
    'Switch to light mode'

  return (
    <div className="flex items-center rounded-lg border border-primary/30 shadow-sm overflow-hidden bg-background">
      {/* Quick-cycle icon button — click to cycle light → dark → auto → light */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => toggle()}
        className="h-9 w-9 rounded-r-none border-0 hover:bg-primary/5 transition-all relative shrink-0"
        aria-label={`${tooltipHi} / ${tooltipEn}`}
        title={`${tooltipHi} / ${tooltipEn}`}
      >
        {icon}
        {theme === 'auto' && (
          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-background" />
        )}
      </Button>
      {/* Dropdown chevron — opens explicit menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-6 rounded-l-none border-0 border-l border-primary/20 hover:bg-primary/5 transition-all shrink-0 px-0"
            aria-label={locale === 'hi' ? 'थीम विकल्प खोलें' : 'Open theme options'}
          >
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          थीम / Theme
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={theme === 'light' ? 'bg-accent text-accent-foreground' : ''}
        >
          <Sun className="h-4 w-4 mr-2 text-amber-500" />
          <span className="flex-1">लाइट / Light</span>
          {theme === 'light' && <span className="text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={theme === 'dark' ? 'bg-accent text-accent-foreground' : ''}
        >
          <Moon className="h-4 w-4 mr-2 text-primary" />
          <span className="flex-1">डार्क / Dark</span>
          {theme === 'dark' && <span className="text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('auto')}
          className={theme === 'auto' ? 'bg-accent text-accent-foreground' : ''}
        >
          <Monitor className="h-4 w-4 mr-2 text-emerald-500" />
          <span className="flex-1">ऑटो / Auto</span>
          {theme === 'auto' && <span className="text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-[10px] text-muted-foreground">
          {theme === 'auto' ? (
            <span>
              सिस्टम: <span className="font-medium text-foreground">{resolved === 'dark' ? 'डार्क' : 'लाइट'}</span>
              <br />
              System: <span className="font-medium text-foreground">{resolved === 'dark' ? 'Dark' : 'Light'}</span>
            </span>
          ) : (
            <span>
              वर्तमान: <span className="font-medium text-foreground">{theme === 'dark' ? 'डार्क' : 'लाइट'}</span>
              <br />
              Current: <span className="font-medium text-foreground">{theme === 'dark' ? 'Dark' : 'Light'}</span>
            </span>
          )}
        </div>
      </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
