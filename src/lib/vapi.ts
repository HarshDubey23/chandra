type VapiEventHandler = (...args: unknown[]) => void
type EventName = 'call-start' | 'call-end' | 'error' | 'speech-start' | 'speech-end' | 'volume-level' | 'function-call'

let vapi: any = null
const handlers = new Map<EventName, Set<VapiEventHandler>>()
let activeCall = false
let notifyState: ((active: boolean) => void) | null = null

/**
 * Detect "meeting ended" / "call ended" errors that are NORMAL when a Vapi
 * call finishes. These should NOT be surfaced to the user as errors.
 */
function isMeetingEndedError(e: unknown): boolean {
  const msg = String((e as any)?.message ?? e?.toString?.() ?? e ?? '')
  return (
    /meeting\s*(ended?|has ended|closed|due to ejection)/i.test(msg) ||
    /call\s*(ended?|has ended|closed)/i.test(msg) ||
    !msg ||
    msg === '[object Object]' ||
    msg === '{}'
  )
}

/**
 * The Vapi SDK internally calls `console.error('Meeting ended in error:', ...)`
 * when a call ends — even on a perfectly normal hangup. Next.js's dev error
 * overlay captures every console.error and renders a blocking modal that
 * makes the page look like CSS broke. We monkey-patch console.error (ONCE,
 * lazily, only filtering Vapi noise) so these normal call-end messages never
 * reach the overlay. Genuine errors still pass through.
 */
function installConsoleErrorFilter(): void {
  if (typeof window === 'undefined') return
  if ((window as any).__vapiConsoleErrorPatched) return
  ;(window as any).__vapiConsoleErrorPatched = true
  const original = console.error.bind(console)
  console.error = (...args: unknown[]) => {
    const joined = args.map((a) => {
      if (a instanceof Error) return `${a.message}`
      try { return typeof a === 'string' ? a : JSON.stringify(a) } catch { return String(a) }
    }).join(' ')
    // Vapi SDK normal call-end noise — swallow it entirely.
    if (
      /Meeting\s+ended/i.test(joined) ||
      /meeting\s*(has\s+)?ended/i.test(joined) ||
      /call\s*(has\s+)?ended/i.test(joined) ||
      /due to ejection/i.test(joined)
    ) {
      return // silently drop — this is normal Vapi call-end behavior
    }
    original(...args)
  }
}

// Install the console.error filter at MODULE LOAD TIME (not lazily) so it is
// active BEFORE the Vapi SDK ever emits noise. AIVoiceButton imports this
// module on the home page, so the filter is in place as soon as the page
// loads — well before any call starts/ends.
installConsoleErrorFilter()

async function getVapi() {
  if (typeof window === 'undefined') return null
  const key = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY
  if (!key) return null
  if (!vapi) {
    const Vapi = (await import('@vapi-ai/web')).default
    vapi = new (Vapi as any)(key)

    // ── CRITICAL FIX: Monkey-patch updateInputSettings to skip Krisp ──
    // The Vapi SDK v2.6.1 hardcodes Krisp noise cancellation (type: 'noise-cancellation').
    // When the AudioWorklet fails to load (CSP/blob issues), the audio pipeline crashes
    // and the call drops after ~30 seconds. This patch intercepts updateInputSettings
    // and replaces 'noise-cancellation' with 'none' — bypassing Krisp entirely.
    const originalStart = (vapi as any).start.bind(vapi)
    ;(vapi as any).start = async function (...args: unknown[]) {
      const result = await originalStart(...args)
      // After call starts, patch the Daily call object
      const call = (vapi as any).call
      if (call && call.updateInputSettings) {
        const originalUpdate = call.updateInputSettings.bind(call)
        call.updateInputSettings = function (settings: Record<string, unknown>) {
          // Replace noise-cancellation with none
          try {
            const audio = (settings as any)?.audio
            if (audio?.processor?.type === 'noise-cancellation') {
              audio.processor.type = 'none'
            }
          } catch { /* ignore */ }
          return originalUpdate(settings)
        }
        // Immediately set processor to none (pre-empt the SDK's Krisp attempt)
        try {
          await originalUpdate({ audio: { processor: { type: 'none' } } })
        } catch { /* ignore */ }
      }
      return result
    }

    vapi.on('call-start', () => { activeCall = true; notifyState?.(true) })
    vapi.on('call-start-success', () => { activeCall = true; notifyState?.(true) })
    vapi.on('call-end', () => { activeCall = false; notifyState?.(false) })
    // Backup: speech-start means the call IS active (AI is talking)
    vapi.on('speech-start', () => { if (!activeCall) { activeCall = true; notifyState?.(true) } })

    vapi.on('call-start-progress', () => {
      // Swallow progress events silently
    })
    vapi.on('call-start-failed', (e: unknown) => {
      if (!isMeetingEndedError(e)) {
        for (const fn of (handlers.get('error') || [])) fn(e)
      }
    })

    // CRITICAL: Swallow Krisp/AudioWorklet errors — they don't kill the call
    // The call still works for voice even if noise cancellation fails
    vapi.on('error', (e: unknown) => {
      const msg = String((e as any)?.message ?? e?.toString?.() ?? e ?? '')
      // Suppress: meeting ended, Krisp errors, worklet errors, audio level observer errors
      if (
        isMeetingEndedError(e) ||
        msg.includes('Krisp') ||
        msg.includes('WORKLET') ||
        msg.includes('worklet') ||
        msg.includes('audio level') ||
        msg.includes('noiseFilter') ||
        msg.includes('noise filter') ||
        msg.includes('addModule')
      ) {
        return // silently swallow — call continues without noise cancellation
      }
      for (const fn of (handlers.get('error') || [])) fn(e)
    })

    // Handle function calls from the AI assistant
    vapi.on('function-call', (call: unknown) => {
      for (const fn of (handlers.get('function-call') || [])) fn(call)
    })
  }

  // Install a global unhandledrejection catcher ONCE to silently absorb any
  // stray promise rejections from the Vapi SDK (e.g. "Meeting has ended"
  // thrown from an internal async generator after the call ends).
  if (!(window as any).__vapiRejectionGuard) {
    ;(window as any).__vapiRejectionGuard = true
    window.addEventListener('unhandledrejection', (ev: PromiseRejectionEvent) => {
      const reason = ev.reason
      const msg = String(
        (reason as any)?.message ?? reason?.toString?.() ?? reason ?? ''
      )
      if (isMeetingEndedError(reason) || msg.includes('Meeting has ended') || msg.includes('ejection')) {
        ev.preventDefault() // silently swallow — normal call-end behavior
      }
    })
  }

  return vapi
}

export function onVapiEvent(event: EventName, handler: VapiEventHandler) {
  if (!handlers.has(event)) handlers.set(event, new Set())
  handlers.get(event)!.add(handler)
  return () => { handlers.get(event)?.delete(handler) }
}

export function subscribeCallState(cb: (active: boolean) => void) {
  notifyState = cb
  return () => { notifyState = null }
}

export function isCallActive() { return activeCall }

/**
 * Start a Vapi call with optional assistant configuration.
 * If an assistantId is provided, it uses that. Otherwise, it uses
 * the NEXT_PUBLIC_VAPI_ASSISTANT_ID env var. If neither is available,
 * it starts with an inline assistant config using the system prompt.
 */
export async function startVapiCall(assistantId?: string) {
  const v = await getVapi()
  if (!v) throw new Error('Vapi not configured')

  const id = assistantId || process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID
  if (id) {
    // Use pre-configured assistant ID
    await v.start(id)
  } else {
    // No assistant ID configured — try starting with inline config
    // This requires the Vapi assistant to be set up in the dashboard
    throw new Error('Assistant ID not configured. Set NEXT_PUBLIC_VAPI_ASSISTANT_ID in .env')
  }
}

/**
 * Start a Vapi call with full assistant configuration including system prompt.
 * This is used when you want to override the assistant configuration dynamically.
 */
export async function startVapiCallWithConfig(config: {
  systemPrompt?: string
  firstMessage?: string
  model?: string
  voiceId?: string
  functions?: Array<{
    name: string
    description: string
    parameters: Record<string, unknown>
  }>
}) {
  const v = await getVapi()
  if (!v) throw new Error('Vapi not configured')

  const assistantConfig: Record<string, unknown> = {
    name: 'Chandra Sahayak',
    model: {
      provider: 'openai',
      model: config.model || 'gpt-4o',
      systemPrompt: config.systemPrompt || '',
      temperature: 0.3,
      maxTokens: 500,
    },
    voice: {
      provider: '11labs',
      voiceId: config.voiceId || 'pNInz6obpgDQGcFmaJgB',
      speed: 0.95,
    },
    firstMessage: config.firstMessage || 'नमस्ते! मैं चंद्रा सहायक हूँ। मैं आपकी शिकायत दर्ज करने में मदद करूँगी।',
    transcriber: {
      provider: 'deepgram',
      model: 'nova-2',
      language: 'hi',
    },
    recordingEnabled: true,
  }

  if (config.functions && config.functions.length > 0) {
    assistantConfig.functions = config.functions
  }

  await v.start(assistantConfig)
}

export function stopVapiCall() {
  vapi?.stop()
}

/**
 * Send a function call result back to the Vapi assistant.
 * Used when the AI calls a function and you need to return the result.
 */
export function sendFunctionCallResult(callId: string, result: unknown) {
  if (!vapi) return
  try {
    // Vapi SDK method to return function call results
    if (typeof vapi.send === 'function') {
      vapi.send({
        type: 'function-call-result',
        callId,
        result,
      })
    }
  } catch (e) {
    console.warn('[vapi] Failed to send function call result:', e)
  }
}
