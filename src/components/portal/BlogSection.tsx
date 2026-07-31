'use client'
// Blog / CMS section — displays published posts with category filter + reading dialog.
import { useEffect, useState, useMemo } from 'react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Newspaper, Calendar, User, ArrowRight, X, Loader2, Tag, Eye } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  coverImage: string | null
  category: string
  status: string
  tags: string
  publishedAt: string | null
  createdAt: string
  author: { name: string } | null
  content?: string
}

const CATEGORIES = [
  { id: 'all', hi: 'सभी', en: 'All' },
  { id: 'announcement', hi: 'घोषणा', en: 'Announcement' },
  { id: 'scheme', hi: 'योजना', en: 'Scheme' },
  { id: 'news', hi: 'समाचार', en: 'News' },
  { id: 'meeting', hi: 'बैठक', en: 'Meeting' },
  { id: 'notice', hi: 'नोटिस', en: 'Notice' },
]

const CATEGORY_STYLES: Record<string, string> = {
  announcement: 'bg-primary/10 text-primary border-primary/30',
  scheme: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50',
  news: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/50',
  meeting: 'bg-accent-foreground/10 text-accent-foreground border-accent-foreground/30',
  notice: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50',
}

function formatDate(iso: string | null, locale: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function readingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, '')
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200))
}

export function BlogSection() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'
  const [posts, setPosts] = useState<Post[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loadingPost, setLoadingPost] = useState(false)

  useEffect(() => {
    fetch('/api/posts?limit=20')
      .then(r => r.json())
      .then(d => setPosts(d.posts || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  const filteredPosts = useMemo(() => {
    if (!posts) return []
    if (activeCategory === 'all') return posts
    return posts.filter(p => p.category === activeCategory)
  }, [posts, activeCategory])

  const openPost = async (post: Post) => {
    setLoadingPost(true)
    setDialogOpen(true)
    setSelectedPost(post)
    try {
      const r = await fetch(`/api/posts/${post.slug}`)
      const d = await r.json()
      if (r.ok && d.post) setSelectedPost(d.post)
    } catch { /* keep excerpt */ }
    finally { setLoadingPost(false) }
  }

  return (
    <section id="blog" data-section="blog" className="section-premium py-16 md:py-20 border-b border-border/40">
      <div className="container mx-auto px-4">
        {/* Header */}
        <ScrollReveal delay={0.1}>
          <div className="text-center mb-10">
            <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
              <Newspaper className="h-3.5 w-3.5" />
              {isHi ? 'ब्लॉग / समाचार' : 'Blog / News'}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
              {isHi ? 'पंचायत ब्लॉग एवं समाचार' : 'Panchayat Blog & News'}
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              {isHi
                ? 'प्रधान जी के संदेश, योजना विवरण, ग्राम सभा नोटिस एवं गाँव के समाचार'
                : 'Pradhan messages, scheme details, gram sabha notices and village news'}
            </p>
          </div>
        </ScrollReveal>

        {/* Category filter */}
        <ScrollReveal delay={0.15}>
          <div className="flex flex-wrap gap-2 mb-8 justify-center" role="group" aria-label={isHi ? 'श्रेणी फ़िल्टर' : 'Category filter'}>
            {CATEGORIES.map(c => {
              const count = c.id === 'all' ? (posts?.length ?? 0) : (posts?.filter(p => p.category === c.id).length ?? 0)
              const active = activeCategory === c.id
              return (
                <Button
                  key={c.id}
                  type="button"
                  variant={active ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(c.id)}
                  className="h-8 px-3 text-xs gap-1.5"
                  aria-pressed={active}
                >
                  {isHi ? c.hi : c.en}
                  <Badge variant={active ? 'secondary' : 'outline'} className="text-[9px] px-1.5 py-0 h-4 min-w-[1rem] flex items-center justify-center">
                    {count}
                  </Badge>
                </Button>
              )
            })}
          </div>
        </ScrollReveal>

        {/* Posts grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card className="card-premium border-dashed rounded-xl">
            <CardContent className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
              <Newspaper className="h-10 w-10 opacity-40" />
              <div className="font-medium">
                {isHi ? 'अभी तक कोई ब्लॉग पोस्ट नहीं' : 'No blog posts yet'}
              </div>
              <div className="text-xs text-muted-foreground/80 max-w-md">
                {isHi
                  ? 'प्रधान जी एवं अधिकृत अधिकारी व्यवस्थापक पैनल से ब्लॉग पोस्ट प्रकाशित कर सकते हैं।'
                  : 'The Pradhan and authorized officials can publish blog posts from the admin panel.'}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, idx) => {
              const tags = (() => { try { return JSON.parse(post.tags) as string[] } catch { return [] } })()
              return (
                <Card
                  key={post.id}
                  className="card-premium overflow-hidden rounded-xl hover-lift-lg group cursor-pointer flex flex-col"
                  onClick={() => openPost(post)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') openPost(post) }}
                >
                  {/* Cover image or gradient header */}
                  {post.coverImage ? (
                    <div className="relative h-40 overflow-hidden bg-secondary">
                      <img src={post.coverImage} alt={post.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                  ) : (
                    <div className="h-32 bg-gradient-to-br from-primary/15 via-accent/10 to-primary/5 grid place-items-center">
                      <Newspaper className="h-10 w-10 text-primary/40" />
                    </div>
                  )}
                  <CardContent className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${CATEGORY_STYLES[post.category] || 'bg-muted text-muted-foreground border-border'}`}>
                        {CATEGORIES.find(c => c.id === post.category)?.[isHi ? 'hi' : 'en'] || post.category}
                      </span>
                      <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5" />
                        {formatDate(post.publishedAt || post.createdAt, locale)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                      <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                        <User className="h-2.5 w-2.5" />
                        {post.author?.name?.split('/')[0] || (isHi ? 'पंचायत' : 'Panchayat')}
                      </span>
                      <span className="text-[10px] text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        {isHi ? 'पढ़ें' : 'Read'}
                        <ArrowRight className="h-2.5 w-2.5" />
                      </span>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {tags.slice(0, 3).map(t => (
                          <span key={t} className="text-[9px] text-muted-foreground/70 inline-flex items-center gap-0.5">
                            <Tag className="h-2 w-2" />{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Post reader dialog */}
        <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) { setDialogOpen(false); setSelectedPost(null) } }}>
          <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
            {selectedPost && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${CATEGORY_STYLES[selectedPost.category] || 'bg-muted text-muted-foreground border-border'}`}>
                      {CATEGORIES.find(c => c.id === selectedPost.category)?.[isHi ? 'hi' : 'en'] || selectedPost.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" />
                      {formatDate(selectedPost.publishedAt || selectedPost.createdAt, locale)}
                    </span>
                    {selectedPost.content && (
                      <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                        <Eye className="h-2.5 w-2.5" />
                        {readingTime(selectedPost.content)} {isHi ? 'मिनट' : 'min'}
                      </span>
                    )}
                  </div>
                  <DialogTitle className="text-gradient-premium text-lg leading-tight">
                    {selectedPost.title}
                  </DialogTitle>
                </DialogHeader>
                {selectedPost.coverImage && (
                  <div className="rounded-lg overflow-hidden border border-border mb-3">
                    <img src={selectedPost.coverImage} alt={selectedPost.title} className="w-full h-48 object-cover" />
                  </div>
                )}
                {loadingPost ? (
                  <div className="py-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isHi ? 'लोड हो रहा है...' : 'Loading...'}
                  </div>
                ) : (
                  <div
                    className="prose prose-sm max-w-none text-foreground/85 leading-relaxed [&_a]:text-primary [&_a]:underline [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: selectedPost.content || selectedPost.excerpt }}
                  />
                )}
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <User className="h-2.5 w-2.5" />
                    {selectedPost.author?.name || (isHi ? 'ग्राम पंचायत चंद्रा' : 'Gram Panchayat Chandra')}
                  </span>
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => { setDialogOpen(false); setSelectedPost(null) }}>
                    <X className="h-3 w-3" />
                    {isHi ? 'बंद करें' : 'Close'}
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}
