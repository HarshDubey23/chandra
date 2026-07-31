'use client'
// Blog Manager — admin CRUD for posts with a lightweight rich-text editor.
// Master doc §4.2. Categories: announcement, scheme, news, meeting, notice.
import { useEffect, useState, useCallback, useRef } from 'react'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Newspaper, Plus, Pencil, Trash2, Loader2, Save, Eye, EyeOff, Bold, Italic, List, ListOrdered, Heading2, Quote, Link2, X, Calendar, ExternalLink,
} from 'lucide-react'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string | null
  category: string
  status: string
  tags: string
  publishedAt: string | null
  createdAt: string
  author: { name: string } | null
}

const CATEGORIES = [
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

export function BlogManager() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'
  const [posts, setPosts] = useState<Post[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Post | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/posts?limit=50')
      .then(r => r.json())
      .then(d => setPosts(d.posts || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const openNew = () => {
    setEditing({
      id: '', title: '', slug: '', excerpt: '', content: '',
      coverImage: null, category: 'news', status: 'draft', tags: '[]',
      publishedAt: null, createdAt: new Date().toISOString(), author: null,
    })
    setDialogOpen(true)
  }

  const openEdit = (p: Post) => {
    setEditing({ ...p })
    setDialogOpen(true)
  }

  const handleDelete = async (p: Post) => {
    if (!confirm(isHi ? `क्या आप "${p.title}" को हटाना चाहते हैं?` : `Delete "${p.title}"?`)) return
    try {
      const r = await fetch(`/api/posts/${p.slug}`, { method: 'DELETE' })
      if (!r.ok) throw new Error('delete_failed')
      toast.success(isHi ? 'पोस्ट हटाई गई' : 'Post deleted')
      load()
    } catch (e) {
      toast.error(isHi ? 'हटाने में विफल' : 'Delete failed', { description: (e as Error).message })
    }
  }

  const togglePublish = async (p: Post) => {
    const newStatus = p.status === 'published' ? 'draft' : 'published'
    try {
      const r = await fetch(`/api/posts/${p.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!r.ok) throw new Error('update_failed')
      toast.success(newStatus === 'published' ? (isHi ? 'पोस्ट प्रकाशित हुई!' : 'Post published!') : (isHi ? 'ड्राफ्ट में बदला' : 'Moved to draft'))
      load()
    } catch (e) {
      toast.error(isHi ? 'अपडेट विफल' : 'Update failed')
    }
  }

  if (loading) {
    return <div className="grid gap-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold section-heading">{isHi ? 'ब्लॉग प्रबंधक' : 'Blog Manager'}</h2>
          <p className="text-xs text-muted-foreground mt-2">
            {isHi ? `${posts?.length || 0} पोस्ट — समाचार, योजना, घोषणाएँ, बैठक नोटिस प्रकाशित करें` : `${posts?.length || 0} posts — publish news, schemes, announcements, meeting notices`}
          </p>
        </div>
        <Button size="sm" onClick={openNew} className="gap-1.5 glow-saffron">
          <Plus className="h-3.5 w-3.5" />
          {isHi ? 'नई पोस्ट' : 'New Post'}
        </Button>
      </div>

      {/* Posts list */}
      {posts && posts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
            <Newspaper className="h-8 w-8 opacity-40" />
            {isHi ? 'अभी तक कोई पोस्ट नहीं। "नई पोस्ट" बटन से पहली पोस्ट बनाएं।' : 'No posts yet. Click "New Post" to create your first.'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {posts?.map(p => {
            const tags = (() => { try { return JSON.parse(p.tags) as string[] } catch { return [] } })()
            return (
              <Card key={p.id} className="card-hover-lift shadow-sm hover:shadow-md">
                <CardContent className="p-3 flex items-center gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${CATEGORY_STYLES[p.category] || 'bg-muted text-muted-foreground border-border'}`}>
                        {CATEGORIES.find(c => c.id === p.category)?.[isHi ? 'hi' : 'en'] || p.category}
                      </span>
                      <Badge variant={p.status === 'published' ? 'default' : 'outline'} className="text-[9px] h-4 gap-1">
                        {p.status === 'published' ? <Eye className="h-2 w-2" /> : <EyeOff className="h-2 w-2" />}
                        {p.status === 'published' ? (isHi ? 'प्रकाशित' : 'Published') : (isHi ? 'ड्राफ्ट' : 'Draft')}
                      </Badge>
                      {p.publishedAt && (
                        <span className="text-[9px] text-muted-foreground inline-flex items-center gap-0.5">
                          <Calendar className="h-2.5 w-2.5" />
                          {new Date(p.publishedAt).toLocaleDateString(isHi ? 'hi-IN' : 'en-IN')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium line-clamp-1">{p.title}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{p.excerpt}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => togglePublish(p)} title={p.status === 'published' ? (isHi ? 'अप्रकाशित करें' : 'Unpublish') : (isHi ? 'प्रकाशित करें' : 'Publish')}>
                      {p.status === 'published' ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(p)} title={isHi ? 'संपादित करें' : 'Edit'}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(p)} title={isHi ? 'हटाएं' : 'Delete'}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Editor dialog */}
      {editing && (
        <PostEditor
          post={editing}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSaved={() => { setDialogOpen(false); load() }}
          isHi={isHi}
        />
      )}
    </div>
  )
}

// ── Lightweight rich text editor (contentEditable + execCommand) ──
function RichTextEditor({ value, onChange, isHi }: { value: string; onChange: (html: string) => void; isHi: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (ref.current && !initializedRef.current) {
      ref.current.innerHTML = value || ''
      initializedRef.current = true
    }
  }, [value])

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val)
    if (ref.current) onChange(ref.current.innerHTML)
    ref.current?.focus()
  }

  const tools = [
    { icon: Bold, cmd: 'bold', title: 'Bold' },
    { icon: Italic, cmd: 'italic', title: 'Italic' },
    { icon: Heading2, cmd: 'formatBlock', val: '<h2>', title: 'Heading' },
    { icon: List, cmd: 'insertUnorderedList', title: 'Bullet list' },
    { icon: ListOrdered, cmd: 'insertOrderedList', title: 'Numbered list' },
    { icon: Quote, cmd: 'formatBlock', val: '<blockquote>', title: 'Quote' },
  ]

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 p-1.5 border-b border-border bg-secondary/50 flex-wrap">
        {tools.map(t => (
          <button
            key={t.title}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); exec(t.cmd, t.val) }}
            className="h-7 w-7 grid place-items-center rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title={t.title}
          >
            <t.icon className="h-3.5 w-3.5" />
          </button>
        ))}
        <div className="w-px h-5 bg-border mx-1" />
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); const url = prompt('URL:'); if (url) exec('createLink', url) }}
          className="h-7 w-7 grid place-items-center rounded hover:bg-accent text-muted-foreground hover:text-foreground"
          title="Link"
        >
          <Link2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {/* Editor area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => ref.current && onChange(ref.current.innerHTML)}
        className="prose prose-sm max-w-none min-h-[200px] p-3 focus:outline-none text-sm [&_h2]:font-semibold [&_h2]:text-base [&_h2]:mt-3 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-2 [&_blockquote]:italic [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
        data-placeholder={isHi ? 'यहाँ अपनी पोस्ट लिखें...' : 'Write your post here...'}
      />
    </div>
  )
}

function PostEditor({ post, open, onOpenChange, onSaved, isHi }: {
  post: Post
  open: boolean
  onOpenChange: (o: boolean) => void
  onSaved: () => void
  isHi: boolean
}) {
  const [title, setTitle] = useState(post.title)
  const [slug, setSlug] = useState(post.slug)
  const [excerpt, setExcerpt] = useState(post.excerpt)
  const [content, setContent] = useState(post.content)
  const [coverImage, setCoverImage] = useState(post.coverImage || '')
  const [category, setCategory] = useState(post.category)
  const [status, setStatus] = useState(post.status)
  const [tagsInput, setTagsInput] = useState((() => { try { return (JSON.parse(post.tags) as string[]).join(', ') } catch { return '' } })())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isNew = !post.id

  const save = async (publishNow?: boolean) => {
    setError(null)
    if (!title.trim()) { setError(isHi ? 'शीर्षक आवश्यक' : 'Title required'); return }
    if (!content.trim() || content.replace(/<[^>]+>/g, '').trim().length < 10) { setError(isHi ? 'सामग्री आवश्यक (कम से कम 10 अक्षर)' : 'Content required (min 10 chars)'); return }

    const finalStatus = publishNow ? 'published' : status
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    const body: Record<string, unknown> = {
      title, slug, excerpt: excerpt || content.replace(/<[^>]+>/g, '').slice(0, 160),
      content, coverImage: coverImage || null, category, status: finalStatus, tags,
    }

    setSaving(true)
    try {
      const url = isNew ? '/api/posts' : `/api/posts/${post.slug}`
      const method = isNew ? 'POST' : 'PATCH'
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message || d.error || 'save_failed')
      toast.success(isNew ? (isHi ? 'पोस्ट बनाई गई' : 'Post created') : (isHi ? 'पोस्ट अपडेट हुई' : 'Post updated'))
      onSaved()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!saving) onOpenChange(o) }}>
      <DialogContent className="sm:max-w-[760px] max-h-[92vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gradient-tricolor">
            <Newspaper className="h-4 w-4 text-primary" />
            {isNew ? (isHi ? 'नई ब्लॉग पोस्ट' : 'New Blog Post') : (isHi ? 'पोस्ट संपादित करें' : 'Edit Post')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs">{isHi ? 'शीर्षक *' : 'Title *'}</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={isHi ? 'पोस्ट का शीर्षक' : 'Post title'} className="text-sm" dir="auto" />
          </div>

          {/* Slug + Category */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">{isHi ? 'Slug (URL)' : 'Slug (URL)'}</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-from-title" className="text-sm font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{isHi ? 'श्रेणी' : 'Category'}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.id} value={c.id} className="text-sm">{isHi ? c.hi : c.en} / {isHi ? c.en : c.hi}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cover image */}
          <div className="space-y-1.5">
            <Label className="text-xs">{isHi ? 'कवर छवि URL (वैकल्पिक)' : 'Cover Image URL (optional)'}</Label>
            <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="/whatsapp/IMG-... or https://..." className="text-sm font-mono" />
            {coverImage && <img src={coverImage} alt="cover preview" className="h-20 w-full object-cover rounded border border-border" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />}
          </div>

          {/* Excerpt */}
          <div className="space-y-1.5">
            <Label className="text-xs">{isHi ? 'सारांश (वैकल्पिक)' : 'Excerpt (optional)'}</Label>
            <Input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder={isHi ? 'संक्षिप्त विवरण (रिक्त = स्वतः)' : 'Short summary (blank = auto)'} className="text-sm" dir="auto" />
          </div>

          {/* Rich text content */}
          <div className="space-y-1.5">
            <Label className="text-xs">{isHi ? 'सामग्री *' : 'Content *'}</Label>
            <RichTextEditor value={content} onChange={setContent} isHi={isHi} />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label className="text-xs">{isHi ? 'टैग (कॉमा से अलग)' : 'Tags (comma-separated)'}</Label>
            <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="PMAY, housing, 2026" className="text-sm" />
          </div>

          {error && <div className="text-sm text-destructive bg-destructive/5 p-3 rounded-lg border border-destructive/20">{error}</div>}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={saving}>
            <X className="h-3.5 w-3.5" /> {isHi ? 'रद्द करें' : 'Cancel'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => save(false)} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {isHi ? 'ड्राफ्ट सेव करें' : 'Save Draft'}
          </Button>
          <Button size="sm" onClick={() => save(true)} disabled={saving} className="gap-1.5 glow-saffron">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
            {isHi ? 'प्रकाशित करें' : 'Publish'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
