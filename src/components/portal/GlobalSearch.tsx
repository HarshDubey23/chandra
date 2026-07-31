'use client'
// Global search dialog — searches across all portal content.
// Master doc §5.4. Triggered via Ctrl+K / Cmd+K or search button in header.
import { useEffect, useState, useRef, useCallback } from 'react'
import { useI18n } from '@/lib/i18n'
import { useUI } from '@/lib/ui-store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, X, Bell, FileText, Newspaper, MessageSquare, Store, Home, Briefcase, Wallet, Droplet, Route, GraduationCap, Heart, User, IndianRupee, Scale, Vote, Image, Video, Map, Clock, HelpCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchResult {
  type: string
  title: string
  subtitle: string
  href: string
  icon: string
}

const ICONS: Record<string, React.ElementType> = {
  bell: Bell, file: FileText, newspaper: Newspaper, message: MessageSquare, store: Store,
  home: Home, briefcase: Briefcase, wallet: Wallet, droplet: Droplet, road: Route,
  graduation: GraduationCap, heart: Heart, user: User, rupee: IndianRupee, scale: Scale,
  vote: Vote, image: Image, video: Video, map: Map, clock: Clock, help: HelpCircle,
}

interface GlobalSearchProps {
  open: boolean
  onOpenChange: (o: boolean) => void
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const { locale } = useI18n()
  const isHi = locale === 'hi'
  const { setView } = useUI()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery(''); setResults([]); setActiveIdx(0)
    }
  }, [open])

  // Debounced search
  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const r = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`)
      const d = await r.json()
      setResults(d.results || [])
      setActiveIdx(0)
    } catch { setResults([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(query), 250)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, search])

  const handleSelect = (r: SearchResult) => {
    onOpenChange(false)
    // If href is a view (complaints), switch view; otherwise scroll to section
    if (r.href === 'complaints') {
      setView('complaints')
    } else {
      setView('home')
      setTimeout(() => {
        const el = document.querySelector(r.href)
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && results[activeIdx]) { e.preventDefault(); handleSelect(results[activeIdx]) }
    if (e.key === 'Escape') { onOpenChange(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-0 gap-0 overflow-hidden" aria-describedby={undefined}>
        <DialogHeader className="sr-only">
          <DialogTitle>{isHi ? 'वैश्विक खोज' : 'Global Search'}</DialogTitle>
        </DialogHeader>
        {/* Search input */}
        <div className="flex items-center gap-2 p-3 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isHi ? 'खोजें: योजना, शिकायत, प्रधान, घोषणा...' : 'Search: scheme, complaint, pradhan, announcement...'}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            dir="auto"
          />
          {query && (
            <button onClick={() => { setQuery(''); inputRef.current?.focus() }} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="text-[9px] text-muted-foreground border border-border rounded px-1.5 py-0.5 hidden sm:inline-block">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[420px] overflow-y-auto custom-scroll">
          {loading ? (
            <div className="p-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
            </div>
          ) : query.trim().length < 2 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Search className="h-8 w-8 mx-auto opacity-30 mb-2" />
              {isHi ? 'खोजने के लिए कम से कम 2 अक्षर टाइप करें' : 'Type at least 2 characters to search'}
              <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
                {['PMAY', 'मनरेगा', 'प्रधान', 'शिकायत', 'बजट', 'RTI'].map(tag => (
                  <button key={tag} onClick={() => setQuery(tag)} className="text-[10px] px-2 py-1 rounded-full border border-border bg-secondary/50 hover:bg-secondary hover:border-primary/40 transition-colors">
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Search className="h-8 w-8 mx-auto opacity-30 mb-2" />
              {isHi ? `"${query}" के लिए कोई परिणाम नहीं` : `No results for "${query}"`}
            </div>
          ) : (
            <div className="p-2">
              <div className="text-[10px] text-muted-foreground px-2 py-1.5 uppercase tracking-wider">
                {isHi ? `${results.length} परिणाम` : `${results.length} results`}
              </div>
              {results.map((r, i) => {
                const Icon = ICONS[r.icon] || Search
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(r)}
                    onMouseEnter={() => setActiveIdx(i)}
                    className={cn(
                      'w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors',
                      i === activeIdx ? 'bg-primary/10 ring-1 ring-primary/20' : 'hover:bg-secondary/60'
                    )}
                  >
                    <div className={cn(
                      'h-8 w-8 rounded-lg grid place-items-center shrink-0',
                      i === activeIdx ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium line-clamp-1">{r.title}</div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1">{r.subtitle}</div>
                    </div>
                    <ArrowRight className={cn('h-3.5 w-3.5 shrink-0 transition-opacity', i === activeIdx ? 'opacity-100 text-primary' : 'opacity-0')} />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-3 py-2 border-t border-border bg-secondary/30 flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-2">
            <kbd className="border border-border rounded px-1">↑↓</kbd>
            {isHi ? 'नेविगेट' : 'navigate'}
            <kbd className="border border-border rounded px-1">↵</kbd>
            {isHi ? 'चुनें' : 'select'}
          </span>
          <span>{isHi ? 'सभी पंचायत सामग्री में खोज' : 'Searches all panchayat content'}</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
