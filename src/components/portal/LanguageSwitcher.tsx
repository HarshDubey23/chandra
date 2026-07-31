'use client'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-9">
          <Globe className="h-4 w-4" />
          <span className="text-xs font-semibold">{locale === 'hi' ? 'हिं' : 'EN'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => setLocale('hi')}
          className={locale === 'hi' ? 'bg-accent text-accent-foreground' : ''}
        >
          <span className="text-base mr-2">🇮🇳</span> हिंदी
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLocale('en')}
          className={locale === 'en' ? 'bg-accent text-accent-foreground' : ''}
        >
          <span className="text-base mr-2">🌐</span> English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
