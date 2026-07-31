'use client'
import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { motion, AnimatePresence } from 'framer-motion'
import { Siren, X, Phone, Ambulance, Flame, ShieldAlert, Droplets, Zap, Stethoscope, ChevronUp } from 'lucide-react'

type Emergency = {
  id: string
  hi: string
  en: string
  number: string
  icon: React.ElementType
  color: string
  bg: string
  ring: string
  desc_hi: string
  desc_en: string
}

const EMERGENCIES: Emergency[] = [
  {
    id: 'police',
    hi: 'पुलिस',
    en: 'Police',
    number: '100',
    icon: ShieldAlert,
    color: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    ring: 'ring-blue-400/50',
    desc_hi: 'अपराध, हिंसा, चोरी, संदिग्ध गतिविधि',
    desc_en: 'Crime, violence, theft, suspicious activity',
  },
  {
    id: 'ambulance',
    hi: 'एम्बुलेंस',
    en: 'Ambulance',
    number: '108',
    icon: Ambulance,
    color: 'text-rose-700 dark:text-rose-300',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    ring: 'ring-rose-400/50',
    desc_hi: 'मेडिकल आपातकाल, दिल का दौरा, दुर्घटना',
    desc_en: 'Medical emergency, heart attack, accident',
  },
  {
    id: 'fire',
    hi: 'अग्निशमन',
    en: 'Fire Brigade',
    number: '101',
    icon: Flame,
    color: 'text-orange-700 dark:text-orange-300',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    ring: 'ring-orange-400/50',
    desc_hi: 'आग, धुआं, बिजली का शॉर्ट सर्किट',
    desc_en: 'Fire, smoke, electrical short-circuit',
  },
  {
    id: 'emergency_all',
    hi: 'समग्र आपातकाल',
    en: 'All-in-One Emergency',
    number: '112',
    icon: Siren,
    color: 'text-red-700 dark:text-red-300',
    bg: 'bg-red-50 dark:bg-red-950/40',
    ring: 'ring-red-500/60',
    desc_hi: 'किसी भी आपातकाल के लिए एक नंबर',
    desc_en: 'Single number for any emergency',
  },
  {
    id: 'water',
    hi: 'जल शिकायत',
    en: 'Water Complaint',
    number: '1916',
    icon: Droplets,
    color: 'text-cyan-700 dark:text-cyan-300',
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    ring: 'ring-cyan-400/50',
    desc_hi: 'पानी नहीं आ रहा, हैंडपंप खराब, टंकी लीक',
    desc_en: 'No water, handpump broken, tanker leak',
  },
  {
    id: 'electricity',
    hi: 'बिजली शिकायत',
    en: 'Electricity Complaint',
    number: '1912',
    icon: Zap,
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    ring: 'ring-amber-400/50',
    desc_hi: 'बिजली नहीं, तार टूटा, स्ट्रीट लाइट खराब',
    desc_en: 'No power, broken wire, street light issue',
  },
  {
    id: 'health',
    hi: 'स्वास्थ्य सहायता',
    en: 'Health Helpline',
    number: '104',
    icon: Stethoscope,
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    ring: 'ring-emerald-400/50',
    desc_hi: 'स्वास्थ्य जानकारी, बीमारी सलाह, टीकाकरण',
    desc_en: 'Health info, medical advice, vaccination',
  },
  {
    id: 'panchayat',
    hi: 'पंचायत कार्यालय',
    en: 'Panchayat Office',
    number: '9651035021',
    icon: Phone,
    color: 'text-primary',
    bg: 'bg-primary/10',
    ring: 'ring-primary/40',
    desc_hi: 'सभी पंचायत सेवाएँ — योजना, प्रमाण पत्र, पेंशन',
    desc_en: 'All panchayat services — schemes, certificates, pension',
  },
]

export function EmergencyQuickDial() {
  const { locale } = useI18n()
  const [open, setOpen] = useState(false)
  const [pulseTime, setPulseTime] = useState(0)
  const hi = locale === 'hi'

  // Pulsing animation timer
  useEffect(() => {
    if (open) return
    const id = setInterval(() => setPulseTime(t => t + 1), 1500)
    return () => clearInterval(id)
  }, [open])

  return (
    <>
      {/* Floating Emergency Button — bottom-left, distinct from AI button on right */}
      <div className="fixed bottom-20 left-4 z-50 sm:bottom-6 sm:left-6">
        <AnimatePresence>
          {!open && (
            <motion.button
              key="trigger"
              type="button"
              onClick={() => setOpen(true)}
              className="relative flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-700 text-white pl-3.5 pr-4 py-3 shadow-2xl shadow-red-600/30 ring-2 ring-red-400/40 transition-all"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={hi ? 'आपातकालीन शीघ्र डायल खोलें' : 'Open Emergency Quick Dial'}
            >
              {/* Pulsing rings */}
              <span className="absolute inset-0 rounded-full animate-ping bg-red-500/30" style={{ animationDuration: '2s' }} />
              <span className="absolute inset-0 rounded-full animate-pulse bg-red-500/40" />
              <span className="relative">
                <Siren className="h-5 w-5" />
              </span>
              <span className="relative text-xs font-bold uppercase tracking-wider hidden sm:inline">
                {hi ? 'आपातकाल' : 'SOS'}
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Expanded Emergency Panel */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="panel"
              className="absolute bottom-0 left-0 w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl border-2 border-red-500/40 bg-background/95 backdrop-blur-xl shadow-2xl shadow-red-900/20 overflow-hidden"
              initial={{ scale: 0.7, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 px-4 py-3.5 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/30">
                      <Siren className="h-4 w-4" />
                      <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-300 opacity-80" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-yellow-400" />
                      </span>
                    </div>
                    <div>
                      <h2 className="text-sm font-bold leading-tight">
                        {hi ? 'आपातकालीन शीघ्र डायल' : 'Emergency Quick Dial'}
                      </h2>
                      <p className="text-[10px] text-white/80 leading-tight">
                        {hi ? 'एक टैप पर प्रत्यक्ष कॉल' : 'One tap to call directly'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full p-1.5 hover:bg-white/20 transition-colors"
                    aria-label={hi ? 'बंद करें' : 'Close'}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Body — grid of emergency buttons */}
              <div className="p-3 max-h-[60vh] overflow-y-auto custom-scroll">
                <div className="grid grid-cols-2 gap-2">
                  {EMERGENCIES.map((e, idx) => {
                    const Icon = e.icon
                    return (
                      <motion.a
                        key={e.id}
                        href={`tel:${e.number}`}
                        className={`group relative flex flex-col items-start gap-1.5 rounded-xl border border-border/60 ${e.bg} p-3 hover:border-transparent hover:ring-2 ${e.ring} transition-all`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.04 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-background shadow-sm ${e.color}`}>
                            <Icon className="h-4.5 w-4.5" />
                          </div>
                          <Phone className={`h-3 w-3 ${e.color} opacity-50 group-hover:opacity-100 group-hover:rotate-12 transition-all`} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-foreground leading-tight">
                            {hi ? e.hi : e.en}
                          </div>
                          <div className={`text-base font-mono font-bold ${e.color} leading-tight mt-0.5`}>
                            {e.number}
                          </div>
                          <div className="text-[9px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">
                            {hi ? e.desc_hi : e.desc_en}
                          </div>
                        </div>
                      </motion.a>
                    )
                  })}
                </div>

                {/* Footer note */}
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {hi
                      ? '📞 आपातकाल में तुरंत कॉल करें। गैर-आपातकालीन शिकायतों के लिए "AI सहायक" बटन दबाएँ।'
                      : '📞 Call immediately in emergencies. For non-emergency complaints, tap "AI Assistant".'}
                  </p>
                </div>
              </div>

              {/* Collapse button */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/40 py-2 text-[11px] font-medium text-red-700 dark:text-red-300 transition-colors"
              >
                <ChevronUp className="h-3 w-3" />
                {hi ? 'संक्षिप्त करें' : 'Collapse'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
