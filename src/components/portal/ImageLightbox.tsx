'use client'

import { useI18n } from '@/lib/i18n'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  MapPin,
  Tag,
  ShieldCheck,
  Lock,
  MessageSquareQuote,
  ZoomIn,
  X,
  Info,
  Layers,
  Percent,
} from 'lucide-react'

interface ImageAsset {
  imageId: string
  filename: string
  url: string
  category: string
  subcategory: string | null
  hiCaption: string
  enCaption: string
  schemeLogos: string | null
  purpose: string
  chatContext: string | null
  exif: string | null
  geoInferred: string | null
  scrollSection: string | null
  facesDetected: number
  confidence: number
  isPublic: boolean
}

interface ImageLightboxProps {
  image: ImageAsset | null
  open: boolean
  onClose: () => void
}

export function ImageLightbox({ image, open, onClose }: ImageLightboxProps) {
  const { locale } = useI18n()

  if (!image) return null

  const caption = locale === 'hi' ? image.hiCaption : image.enCaption
  const altCaption = locale === 'hi' ? image.enCaption : image.hiCaption
  const logos = image.schemeLogos ? (JSON.parse(image.schemeLogos) as string[]) : []
  const chatCtx = image.chatContext ? JSON.parse(image.chatContext) : null
  const geo = image.geoInferred ? JSON.parse(image.geoInferred) : null

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent
        className="
          max-w-4xl w-[calc(100%-2rem)]
          sm:max-w-3xl md:max-w-4xl
          bg-background border-border/70
          p-0 overflow-hidden
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0
          data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95
          duration-200
        "
        showCloseButton={false}
      >
        {/* Custom close button — positioned absolutely */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 z-10 rounded-full bg-background/80 backdrop-blur hover:bg-background/95"
          onClick={onClose}
          aria-label={locale === 'hi' ? 'बंद करें' : 'Close'}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Full-size image area */}
        <div className="relative bg-secondary/30">
          <div className="flex items-center justify-center max-h-[60vh] md:max-h-[65vh] overflow-hidden">
            <img
              src={image.url}
              alt={caption}
              className="object-contain max-w-full max-h-[60vh] md:max-h-[65vh] transition-transform duration-300 hover:scale-[1.05] cursor-zoom-in"
            />
            {/* Zoom hint overlay */}
            <div className="absolute bottom-3 right-3 opacity-60 hover:opacity-100 transition-opacity">
              <Badge variant="secondary" className="text-[10px] py-0.5 px-2 bg-background/80 backdrop-blur gap-1">
                <ZoomIn className="h-3 w-3" />
                {locale === 'hi' ? 'छवि बड़ी करें' : 'Hover to zoom'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Metadata panel */}
        <div className="p-4 md:p-6 space-y-4 max-h-[35vh] overflow-y-auto scrollbar-thin">
          {/* Title & description */}
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-lg md:text-xl font-semibold text-foreground">
              {caption}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {altCaption}
              <span className="ml-2 text-[10px] text-muted-foreground/70">
                ({locale === 'hi' ? 'अंग्रेज़ी कैप्शन' : 'Hindi caption'})
              </span>
            </DialogDescription>
          </DialogHeader>

          {/* Identity row */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs py-1 px-2">
              <Info className="h-3 w-3 mr-1" />
              {image.imageId}
            </Badge>
            <Badge variant="outline" className="text-xs py-1 px-2">
              <Tag className="h-3 w-3 mr-1" />
              {image.category}
            </Badge>
            {image.subcategory && (
              <Badge variant="outline" className="text-xs py-1 px-2">
                <Layers className="h-3 w-3 mr-1" />
                {image.subcategory}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs py-1 px-2">
              <Percent className="h-3 w-3 mr-1" />
              {locale === 'hi' ? 'विश्वसनीयता' : 'Confidence'}: {(image.confidence * 100).toFixed(0)}%
            </Badge>
          </div>

          <Separator className="opacity-50" />

          {/* Geo inferred */}
          {geo && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-primary mt-0.5" />
              <div className="text-sm space-y-0.5">
                <p className="font-medium">
                  {geo.village}, {geo.district}, {geo.state}
                </p>
                {geo.lat && geo.lng && (
                  <p className="text-xs text-muted-foreground font-mono">
                    {geo.lat.toFixed(4)}°N, {geo.lng.toFixed(4)}°E
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Scheme logos */}
          {logos.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">
                {locale === 'hi' ? 'संबंधित योजनाएँ:' : 'Related schemes:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {logos.map((l) => (
                  <Badge key={l} variant="secondary" className="text-xs py-1 px-2.5">
                    {l}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Purpose */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">
              {locale === 'hi' ? 'उद्देश्य:' : 'Purpose:'}
            </span>
            <Badge
              variant={image.purpose === 'asset-evidence' ? 'default' : 'secondary'}
              className="text-xs py-1 px-2.5"
            >
              {image.purpose}
            </Badge>
          </div>

          {/* Provenance badges */}
          <div className="flex flex-wrap gap-2">
            {image.confidence >= 0.85 && (
              <Badge className="text-xs py-1 px-2.5 bg-green-600/90 text-white hover:bg-green-600 gap-1">
                <ShieldCheck className="h-3 w-3" />
                {locale === 'hi' ? 'OSINT सत्यापित' : 'OSINT Verified'}
              </Badge>
            )}
            {image.purpose === 'asset-evidence' && (
              <Badge className="text-xs py-1 px-2.5 bg-orange-600/90 text-white hover:bg-orange-600 gap-1">
                <Lock className="h-3 w-3" />
                {locale === 'hi' ? 'साक्ष्य' : 'Evidence'}
              </Badge>
            )}
            {image.isPublic && (
              <Badge variant="outline" className="text-xs py-1 px-2.5 gap-1">
                {locale === 'hi' ? 'सार्वजनिक' : 'Public'}
              </Badge>
            )}
          </div>

          <Separator className="opacity-50" />

          {/* Chat context — voice annotation */}
          {chatCtx && (
            <div className="bg-secondary/40 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
                <MessageSquareQuote className="h-4 w-4 text-primary" />
                {locale === 'hi' ? 'वॉयस एनोटेशन' : 'Voice Annotation'}
              </div>
              <p className="text-sm text-foreground/70 italic">
                <span className="font-semibold not-italic">{chatCtx.sender}</span>: &ldquo;{locale === 'hi' ? (chatCtx.msg_hi || chatCtx.msg_before) : chatCtx.msg_before}&rdquo;
              </p>
              {chatCtx.msg_hi && locale === 'en' && (
                <p className="text-xs text-muted-foreground italic">
                  (hi) <span className="font-semibold not-italic">{chatCtx.sender}</span>: &ldquo;{chatCtx.msg_hi}&rdquo;
                </p>
              )}
            </div>
          )}

          {/* Additional info */}
          {image.facesDetected > 0 && (
            <p className="text-xs text-muted-foreground">
              {locale === 'hi'
                ? `चित्र में ${image.facesDetected} व्यक्ति पहचाने गए`
                : `${image.facesDetected} faces detected in image`}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
