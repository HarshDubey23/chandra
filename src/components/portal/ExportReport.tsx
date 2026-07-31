'use client'
import { useState } from 'react'
import { FileDown, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

/**
 * ExportReport — opens a dropdown with options to:
 *  - Print the page (browser print dialog → can "Save as PDF")
 *  - Quickly copy panchayat codes & key contacts to clipboard
 * Uses native browser print; no external libraries.
 */
export function ExportReport() {
  const { locale } = useI18n()
  const [busy, setBusy] = useState<'print' | 'copy' | null>(null)
  const [copied, setCopied] = useState(false)

  const handlePrint = () => {
    setBusy('print')
    // Small delay so the spinner can show before blocking print dialog
    setTimeout(() => {
      window.print()
      setBusy(null)
    }, 200)
  }

  const handleCopy = async () => {
    setBusy('copy')
    const summary =
      'ग्राम पंचायत चंद्रा — डिजिटल शासन पोर्टल सारांश\n' +
      '========================================\n' +
      'पंचायत कोड: 3145021064\n' +
      'ब्लॉक: शंकरगढ़ (3145021)\n' +
      'जिला: प्रयागराज (3145)\n' +
      'राज्य: उत्तर प्रदेश (31)\n' +
      'जनसंख्या (2011): 1,247 (पुरुष 652, महिला 595)\n' +
      'कुल वार्ड: 10 | कुल गृह: 187\n' +
      'साक्षरता: 67.8%\n' +
      'संपर्क: +91 96510 35021 | pradhan@chandra-gp.in\n' +
      'जल जीवन मिशन कवरेज: 93%\n' +
      'मनरेगा जॉब कार्ड: 187 (142 सक्रिय)\n' +
      'पीएमएवाई-जी लाभार्थी: 38\n' +
      '\n' +
      'Gram Panchayat Chandra — Digital Governance Portal Summary\n' +
      '=========================================================\n' +
      'Panchayat Code: 3145021064\n' +
      'Block: Shankargarh (3145021)\n' +
      'District: Prayagraj (3145)\n' +
      'State: Uttar Pradesh (31)\n' +
      'Population (2011): 1,247 (Male 652, Female 595)\n' +
      'Total Wards: 10 | Total Households: 187\n' +
      'Literacy: 67.8%\n' +
      'Contact: +91 96510 35021 | pradhan@chandra-gp.in\n' +
      'Jal Jeevan Mission coverage: 93%\n' +
      'MGNREGA job cards: 187 (142 active)\n' +
      'PMAY-G beneficiaries: 38'
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    } finally {
      setBusy(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 h-9 shadow-sm border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all"
          disabled={busy !== null}
        >
          {busy === 'print' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          ) : busy === 'copy' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          ) : copied ? (
            <Check className="h-3.5 w-3.5 text-accent-foreground" />
          ) : (
            <FileDown className="h-3.5 w-3.5 text-primary" />
          )}
          <span className="text-xs font-semibold">
            {copied
              ? locale === 'hi' ? 'कॉपी हुआ' : 'Copied'
              : locale === 'hi' ? 'रिपोर्ट' : 'Report'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
          {locale === 'hi' ? 'रिपोर्ट निर्यात करें' : 'Export Report'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handlePrint} className="gap-2 cursor-pointer">
          <FileDown className="h-4 w-4 text-primary" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {locale === 'hi' ? 'पीडीएफ / प्रिंट' : 'PDF / Print'}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {locale === 'hi' ? 'ब्राउज़र प्रिंट डायलॉग खोलें' : 'Open browser print dialog'}
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy} className="gap-2 cursor-pointer">
          <FileDown className="h-4 w-4 text-accent-foreground" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {locale === 'hi' ? 'सारांश कॉपी करें' : 'Copy summary'}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {locale === 'hi' ? 'मुख्य आँकड़े क्लिपबोर्ड पर' : 'Key stats to clipboard'}
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
