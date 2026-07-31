'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useI18n } from '@/lib/i18n'
import { startVapiCall, stopVapiCall, subscribeCallState, onVapiEvent, sendFunctionCallResult } from '@/lib/vapi'
import { COMPLAINT_CATEGORIES } from '@/lib/vapi-system-prompt'
import { Mic, Loader2, PhoneOff, FileText, Phone, MapPin, Clock, AlertTriangle, CheckCircle2, ChevronRight, X, PhoneForwarded, ShieldAlert } from 'lucide-react'
import { useUI } from '@/lib/ui-store'

type CallState = 'idle' | 'connecting' | 'active' | 'ending'
const CONNECT_TIMEOUT_MS = 20_000

interface CallSummary {
  category: string | null
  categoryHi: string | null
  department: string | null
  departmentHi: string | null
  trackingId: string | null
  transferStatus: string | null
  officerName: string | null
  officerPhone: string | null
}

interface LiveTransferInfo {
  officerName: string
  officerPhone: string
  departmentCode: string
}

export function AIVoiceButton() {
  const { locale } = useI18n()
  const { setView } = useUI()
  const [state, setState] = useState<CallState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [showPanel, setShowPanel] = useState(false)
  const [callSummary, setCallSummary] = useState<CallSummary | null>(null)
  const [detectedCategory, setDetectedCategory] = useState<string | null>(null)
  const [liveTransfer, setLiveTransfer] = useState<LiveTransferInfo | null>(null)
  const [callDuration, setCallDuration] = useState(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const durationRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stateRef = useRef<CallState>(state)
  const activeToolCallIdRef = useRef<string | null>(null)

  // Call duration timer
  useEffect(() => {
    if (state === 'active') {
      setCallDuration(0)
      durationRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    } else {
      if (durationRef.current) {
        clearInterval(durationRef.current)
        durationRef.current = null
      }
    }
    return () => {
      if (durationRef.current) clearInterval(durationRef.current)
    }
  }, [state])

  // ─── Subscribe to Vapi events (state + errors + function-calls) ────────
  useEffect(() => {
    const unsubState = subscribeCallState((active) => {
      if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null }
      if (active) {
        setState('active')
        setShowPanel(true)
      } else {
        setState('idle')
      }
    })

    const unsubError = onVapiEvent('error', () => {
      setError(locale === 'hi'
        ? 'Vapi असिस्टेंट से कनेक्ट नहीं हो पाया। कृपया Vapi डैशबोर्ड में असिस्टेंट को पब्लिश करें और Public Key वेरीफाय करें।'
        : 'Could not connect to Vapi assistant. Publish the assistant in Vapi dashboard and verify the Public Key.')
      setState('idle')
    })

    // ─── Real function-call handler ────────────────────────────────────
    // The Vapi SDK emits 'function-call' whenever the AI calls one of our
    // declared functions (registerComplaint, transferCall, getRoutingInfo,
    // endCall). We POST the payload to the vapi-webhook mini-service on port
    // 3003 (via the gateway), execute the side effect (DB write, WhatsApp,
    // transfer), and send the result back to the AI so it can continue the
    // conversation.
    const unsubFnCall = onVapiEvent('function-call', async (call: unknown) => {
      const fnCall = (call as any) || {}
      const toolCallId: string = fnCall?.toolCallId || fnCall?.id || `tcall-${Date.now()}`
      const functionCall = fnCall?.functionCall || { name: fnCall?.name, parameters: fnCall?.parameters }
      const fnName: string = functionCall?.name || ''
      const fnParams = functionCall?.parameters || {}
      console.log('[AIVoiceButton] function-call →', fnName, fnParams)

      try {
        const r = await fetch('/function-call?XTransformPort=3003', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toolCallId, functionCall }),
        })
        const result = await r.json().catch(() => ({ ok: false, error: 'invalid_response' }))
        console.log('[AIVoiceButton] /function-call result →', result)

        // Send the result back to the AI assistant so it can continue
        sendFunctionCallResult(toolCallId, result)

        // ─── Update the UI based on the function ──────────────────────
        if (fnName === 'registerComplaint' && result?.ok && result?.trackingId) {
          // Real category detection from the AI's parameters
          const cat = COMPLAINT_CATEGORIES.find(c => c.code === fnParams.category)
          setDetectedCategory(fnParams.category || cat?.code || null)
          // Store tracking ID for the post-call summary
          setCallSummary({
            category: fnParams.category || null,
            categoryHi: cat?.nameHi ?? null,
            department: cat?.departmentCode ?? null,
            departmentHi: result?.department?.nameHi ?? null,
            trackingId: result.trackingId,
            transferStatus: 'pending',
            officerName: result?.department?.officerName ?? null,
            officerPhone: result?.department?.officerPhone ?? null,
          })
        } else if (fnName === 'getRoutingInfo' && result?.ok) {
          // The AI is asking which department handles this category — show it
          setDetectedCategory(fnParams.category || null)
          if (result.officerPhone) {
            setLiveTransfer({
              officerName: result.officerName || 'अधिकारी',
              officerPhone: result.officerPhone,
              departmentCode: result.departmentCode || '',
            })
          }
        } else if (fnName === 'transferCall' && result?.ok) {
          setLiveTransfer({
            officerName: result.officerName || 'अधिकारी',
            officerPhone: result.officerPhone || '',
            departmentCode: result.departmentCode || '',
          })
          // Update call summary transfer status
          setCallSummary(prev => prev ? {
            ...prev,
            transferStatus: 'transferring',
            officerName: result.officerName || prev.officerName,
            officerPhone: result.officerPhone || prev.officerPhone,
          } : prev)
        } else if (fnName === 'endCall') {
          // The AI explicitly ended the call — show the summary
          setState('idle')
          if (callSummary?.trackingId || result?.autoRegisteredTrackingId) {
            const trackingId = callSummary?.trackingId || result?.autoRegisteredTrackingId
            setCallSummary(prev => prev ? { ...prev, trackingId } : {
              category: detectedCategory,
              categoryHi: null,
              department: null,
              departmentHi: null,
              trackingId: trackingId || null,
              transferStatus: 'completed',
              officerName: null,
              officerPhone: null,
            })
          }
        }
      } catch (e) {
        console.error('[AIVoiceButton] /function-call failed:', e)
        // Send a fallback error result so the AI doesn't hang
        sendFunctionCallResult(toolCallId, { ok: false, error: 'function_call_failed' })
      }
    })

    return () => {
      unsubState()
      unsubError()
      unsubFnCall()
      stopVapiCall()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [locale, callSummary, detectedCategory])

  const toggle = useCallback(async () => {
    setError(null)
    if (state === 'active' || state === 'connecting') {
      setState('ending')
      stopVapiCall()
      setState('idle')
      return
    }
    setState('connecting')
    setCallSummary(null)
    setDetectedCategory(null)
    setLiveTransfer(null)
    setShowPanel(true)
    timeoutRef.current = setTimeout(() => {
      if (stateRef.current === 'connecting') {
        stopVapiCall()
        setError(locale === 'hi'
          ? 'कॉल कनेक्ट नहीं हो पाया (20 सेकंड टाइमआउट)। Vapi असिस्टेंट को पब्लिश करें या Public Key चेक करें।'
          : 'Call connection timed out (20s). Publish the assistant or check the Public Key.')
        setState('idle')
      }
    }, CONNECT_TIMEOUT_MS)
    try {
      await startVapiCall()
    } catch {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setError(locale === 'hi'
        ? 'कॉल शुरू नहीं हो पाया। Vapi सेटअप चेक करें — असिस्टेंट पब्लिश है? Public Key सही है?'
        : 'Could not start the call. Check Vapi setup — is the assistant published? Is the Public Key correct?')
      setState('idle')
    }
  }, [state, locale])

  // Keep ref in sync with state
  stateRef.current = state

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const getCategoryLabel = (code: string) => {
    const cat = COMPLAINT_CATEGORIES.find(c => c.code === code)
    return locale === 'hi' ? (cat?.nameHi ?? code) : (cat?.nameEn ?? code)
  }

  const label = state === 'active'
    ? locale === 'hi' ? 'AI से बात हो रही है… समाप्त करें' : 'Talking to AI… tap to end'
    : state === 'connecting'
      ? locale === 'hi' ? 'Vapi से कनेक्ट हो रहा है…' : 'Connecting to Vapi…'
      : locale === 'hi' ? 'AI सहायक से बात करें' : 'Talk to AI assistant'

  const priorityColors: Record<string, string> = {
    emergency: 'bg-red-600 text-white',
    critical: 'bg-red-500 text-white',
    high: 'bg-orange-500 text-white',
    medium: 'bg-amber-500 text-white',
    low: 'bg-green-500 text-white',
  }

  return (
    <>
      {/* ── Call Detail Panel ── */}
      {showPanel && (
        <div className="fixed bottom-20 right-4 z-50 sm:bottom-6 sm:right-6 w-[320px] max-w-[calc(100vw-2rem)]">
          {/* Error */}
          {error && (
            <div className="mb-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive shadow-lg">{error}</div>
          )}

          {/* Active Call Panel */}
          {state === 'active' && (
            <div className="rounded-xl border border-red-500/30 bg-background/95 backdrop-blur-lg shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-500 px-4 py-3 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
                    </span>
                    <span className="text-sm font-semibold">{locale === 'hi' ? 'लाइव कॉल' : 'Live Call'}</span>
                  </div>
                  <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded">{formatDuration(callDuration)}</span>
                </div>
                <p className="text-xs text-white/80 mt-1">{locale === 'hi' ? 'चंद्रा सहायक आपकी बात सुन रहा है' : 'Chandra Sahayak is listening'}</p>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Live transfer banner (if a transfer is in progress) */}
                {liveTransfer && (
                  <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs">
                    <div className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
                      <PhoneForwarded className="h-3.5 w-3.5" />
                      {locale === 'hi' ? 'ट्रांसफर हो रहा है…' : 'Transferring…'}
                    </div>
                    <div className="mt-1 text-muted-foreground">
                      {liveTransfer.officerName} · {liveTransfer.officerPhone}
                    </div>
                  </div>
                )}

                {detectedCategory ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <AlertTriangle className="h-3 w-3" />
                      {locale === 'hi' ? 'पहचानी गई श्रेणी' : 'Detected Category'}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{getCategoryLabel(detectedCategory)}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${priorityColors['high']}`}>
                        {locale === 'hi' ? 'उच्च' : 'HIGH'}
                      </span>
                    </div>
                    {callSummary?.trackingId && (
                      <div className="flex items-center gap-2 text-xs">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{locale === 'hi' ? 'ट्रैकिंग:' : 'Tracking:'}</span>
                        <span className="font-mono font-bold text-primary">{callSummary.trackingId}</span>
                      </div>
                    )}
                    {callSummary?.officerName && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {locale === 'hi' ? 'रूटिंग: ' : 'Routing: '}{callSummary.officerName}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mic className="h-3 w-3 animate-pulse" />
                      {locale === 'hi' ? 'शिकायत सुन रहे हैं…' : 'Listening to complaint…'}
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className="w-1.5 bg-primary/60 rounded-full animate-pulse"
                          style={{
                            height: `${12 + Math.random() * 16}px`,
                            animationDelay: `${i * 0.15}s`,
                            animationDuration: '0.8s',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Categories */}
                <div className="border-t pt-2">
                  <div className="text-[10px] text-muted-foreground mb-1.5">
                    {locale === 'hi' ? 'शिकायत श्रेणियाँ' : 'Complaint Categories'}
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                    {COMPLAINT_CATEGORIES.map((cat) => (
                      <span
                        key={cat.code}
                        className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                          detectedCategory === cat.code
                            ? 'bg-primary/20 border-primary/40 text-primary font-medium'
                            : 'bg-muted/50 border-border text-muted-foreground'
                        }`}
                      >
                        {locale === 'hi' ? cat.nameHi : cat.nameEn}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* End Call Button */}
              <div className="px-4 pb-3">
                <button
                  type="button"
                  onClick={toggle}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 text-white py-2 text-sm font-medium transition-colors"
                >
                  <PhoneOff className="h-4 w-4" />
                  {locale === 'hi' ? 'कॉल समाप्त करें' : 'End Call'}
                </button>
              </div>
            </div>
          )}

          {/* Connecting State */}
          {state === 'connecting' && (
            <div className="rounded-xl border border-primary/30 bg-background/95 backdrop-blur-lg shadow-2xl p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <div>
                  <p className="text-sm font-medium">{locale === 'hi' ? 'कनेक्ट हो रहा है…' : 'Connecting…'}</p>
                  <p className="text-xs text-muted-foreground">{locale === 'hi' ? 'चंद्रा सहायक से जुड़ रहे हैं' : 'Connecting to Chandra Sahayak'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Call Summary (after call ends) */}
          {state === 'idle' && callSummary && (
            <div className="rounded-xl border border-green-500/30 bg-background/95 backdrop-blur-lg shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-500 px-4 py-3 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-semibold">{locale === 'hi' ? 'कॉल पूरी हुई' : 'Call Complete'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setShowPanel(false); setCallSummary(null) }}
                    className="text-white/80 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {callSummary.category && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">{locale === 'hi' ? 'शिकायत श्रेणी' : 'Complaint Category'}</div>
                      <div className="text-sm font-medium">{getCategoryLabel(callSummary.category)}</div>
                    </div>
                  </div>
                )}
                {callSummary.trackingId && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">{locale === 'hi' ? 'ट्रैकिंग आईडी' : 'Tracking ID'}</div>
                      <div className="text-sm font-mono font-bold text-primary">{callSummary.trackingId}</div>
                    </div>
                  </div>
                )}
                {callSummary.officerName && (
                  <div className="flex items-center gap-2">
                    {callSummary.transferStatus === 'transferring' || callSummary.transferStatus === 'completed'
                      ? <PhoneForwarded className="h-4 w-4 text-muted-foreground shrink-0" />
                      : <ShieldAlert className="h-4 w-4 text-muted-foreground shrink-0" />}
                    <div>
                      <div className="text-xs text-muted-foreground">{locale === 'hi' ? 'अधिकारी' : 'Officer'}</div>
                      <div className="text-sm font-medium">{callSummary.officerName}</div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground">{locale === 'hi' ? 'कॉल अवधि' : 'Call Duration'}</div>
                    <div className="text-sm font-medium">{formatDuration(callDuration)}</div>
                  </div>
                </div>
                <div className="border-t pt-3 space-y-2">
                  <button
                    type="button"
                    onClick={() => setView('complaints')}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground py-2 text-sm font-medium transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    {locale === 'hi' ? 'शिकायत ट्रैक करें' : 'Track Complaint'}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowPanel(false); setCallSummary(null) }}
                    className="w-full rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
                  >
                    {locale === 'hi' ? 'बंद करें' : 'Close'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Floating Action Button ── */}
      <div className="fixed bottom-20 right-4 z-50 sm:bottom-6 sm:right-6">
        {!showPanel && error && (
          <div className="mb-2 max-w-[260px] rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive shadow-lg">{error}</div>
        )}
        {!showPanel && (
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium shadow-md ring-1 ring-border backdrop-blur sm:inline-block">{label}</span>
            <button
              type="button"
              onClick={toggle}
              className={`relative flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all ${
                state === 'active' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}
              aria-label={locale === 'hi' ? 'AI सहायक से बात करें' : 'Talk to AI assistant'}
            >
              {state === 'active' && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-40" />}
              {state === 'connecting' || state === 'ending' ? <Loader2 className="h-6 w-6 animate-spin" /> : state === 'active' ? <PhoneOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </button>
          </div>
        )}
        {state === 'active' && !showPanel && (
          <span className="flex items-center gap-1.5 rounded-full bg-red-600/10 px-2.5 py-1 text-[11px] font-medium text-red-600 ring-1 ring-red-600/30">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" /></span>
            {locale === 'hi' ? 'लाइव' : 'LIVE'}
          </span>
        )}
      </div>
    </>
  )
}
