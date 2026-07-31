'use client'

import { useI18n } from '@/lib/i18n'
import { MessageCircle } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

interface WhatsAppShareButtonProps {
  /** Text to share (Hindi+English) */
  text: string
  /** Optional section name for context */
  section?: string
}

/**
 * WhatsAppShareButton — floating action button to share portal content via WhatsApp.
 * Uses MessageCircle icon (lucide-react) as WhatsApp icon substitute.
 * Generates wa.me share URL with pre-filled text.
 */
export function WhatsAppShareButton({ text, section }: WhatsAppShareButtonProps) {
  const { locale } = useI18n()
  const isHi = locale === 'hi'

  const shareText = section
    ? `${section} — ${text}`
    : text

  const encodedText = encodeURIComponent(shareText)
  const whatsappUrl = `https://wa.me/?text=${encodedText}`

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 hover:shadow-xl transition-all duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
            aria-label={isHi ? 'WhatsApp पर शेयर करें' : 'Share on WhatsApp'}
          >
            <MessageCircle className="h-5 w-5" />
          </a>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-green-700 text-white border-green-600">
          <p className="text-xs font-medium">
            {isHi ? 'WhatsApp पर शेयर करें' : 'Share on WhatsApp'}
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
