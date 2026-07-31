'use client'
// Image upload dialog — lets admins upload new images with Sharp processing.
// Master improvement doc §3.3: drag-and-drop, preview, category dropdown,
// bilingual captions, public/private toggle. Calls POST /api/images/upload.
import { useState, useRef, useCallback } from 'react'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2, Upload, X, ImageIcon, CheckCircle2 } from 'lucide-react'
import { IMAGE_CATEGORIES } from './lib'

interface UploadDialogProps {
  onUploaded: () => void
}

export function ImageUploadDialog({ onUploaded }: UploadDialogProps) {
  const { locale } = useI18n()
  const isHi = locale === 'hi'
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [category, setCategory] = useState<string>('representatives.pradhan')
  const [hiCaption, setHiCaption] = useState('')
  const [enCaption, setEnCaption] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setFile(null)
    setPreview(null)
    setCategory('representatives.pradhan')
    setHiCaption('')
    setEnCaption('')
    setIsPublic(true)
    setUploading(false)
    setDragOver(false)
  }

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) {
      toast.error(isHi ? 'केवल छवि फ़ाइलें' : 'Image files only')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error(isHi ? 'फ़ाइल 10MB से कम होनी चाहिए' : 'File must be under 10MB')
      return
    }
    setFile(f)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }, [isHi])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }, [handleFile])

  const handleUpload = async () => {
    if (!file) {
      toast.error(isHi ? 'कृपया एक फ़ाइल चुनें' : 'Please select a file')
      return
    }
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('category', category)
      form.append('hiCaption', hiCaption || (isHi ? 'नई अपलोड की गई तस्वीर' : 'नई अपलोड की गई तस्वीर'))
      form.append('enCaption', enCaption || 'Newly uploaded photograph')
      form.append('isPublic', String(isPublic))
      const r = await fetch('/api/images/upload', { method: 'POST', body: form })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'upload_failed')
      toast.success(isHi ? 'तस्वीर सफलतापूर्वक अपलोड हुई!' : 'Image uploaded successfully!', {
        description: isHi ? 'Sharp द्वारा WebP में प्रोसेस की गई' : 'Processed to WebP by Sharp',
      })
      reset()
      setOpen(false)
      onUploaded()
    } catch (e) {
      toast.error(isHi ? 'अपलोड विफल' : 'Upload failed', { description: (e as Error).message })
    } finally {
      setUploading(false)
    }
  }

  const handleOpenChange = (o: boolean) => {
    if (!o) reset()
    setOpen(o)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 shadow-sm glow-saffron">
          <Upload className="h-3.5 w-3.5" />
          {isHi ? 'तस्वीर अपलोड करें' : 'Upload Image'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gradient-tricolor">
            <Upload className="h-4 w-4 text-primary" />
            {isHi ? 'नई तस्वीर अपलोड करें' : 'Upload New Image'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Dropzone / preview */}
          {!preview ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/30'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />
              <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm font-medium">
                {isHi ? 'फ़ाइल यहाँ खींचें या क्लिक करें' : 'Drag file here or click'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isHi ? 'JPG, PNG, WebP • अधिकतम 10MB' : 'JPG, PNG, WebP • Max 10MB'}
              </p>
            </div>
          ) : (
            <div className="relative rounded-lg overflow-hidden border border-border">
              <img src={preview} alt="preview" className="w-full h-48 object-cover" />
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2 h-7 w-7 shadow-md"
                onClick={() => { setFile(null); setPreview(null) }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
              <div className="absolute bottom-2 left-2 bg-green-600/90 text-white text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <CheckCircle2 className="h-2.5 w-2.5" />
                {file?.name}
              </div>
            </div>
          )}

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-xs">{isHi ? 'श्रेणी' : 'Category'}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {IMAGE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c} className="text-xs font-mono">{c}</SelectItem>
                ))}
                <SelectItem value="other" className="text-xs font-mono">other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Hindi caption */}
          <div className="space-y-1.5">
            <Label className="text-xs">{isHi ? 'हिंदी कैप्शन' : 'Hindi Caption'}</Label>
            <Input
              value={hiCaption}
              onChange={(e) => setHiCaption(e.target.value)}
              placeholder={isHi ? 'हिंदी में कैप्शन लिखें...' : 'Enter Hindi caption...'}
              className="text-xs h-9"
              dir="auto"
            />
          </div>

          {/* English caption */}
          <div className="space-y-1.5">
            <Label className="text-xs">{isHi ? 'अंग्रेज़ी कैप्शन' : 'English Caption'}</Label>
            <Input
              value={enCaption}
              onChange={(e) => setEnCaption(e.target.value)}
              placeholder="Enter English caption..."
              className="text-xs h-9"
            />
          </div>

          {/* Public toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30">
            <div>
              <Label className="text-xs font-medium">{isHi ? 'सार्वजनिक दृश्यता' : 'Public visibility'}</Label>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {isHi ? 'सार्वजनिक तस्वीरें गैलरी में दिखाई देंगी' : 'Public images appear in the gallery'}
              </p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)} disabled={uploading}>
            {isHi ? 'रद्द करें' : 'Cancel'}
          </Button>
          <Button size="sm" onClick={handleUpload} disabled={!file || uploading} className="gap-1.5">
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {uploading ? (isHi ? 'अपलोड हो रहा है...' : 'Uploading...') : (isHi ? 'अपलोड करें' : 'Upload')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
