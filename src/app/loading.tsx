/**
 * loading.tsx — layout-matching skeleton (Phase 5)
 * NOT a spinner. Mirrors the portal's structure with shimmer placeholders.
 */
export default function Loading() {
  return (
    <div
      className="min-h-[100svh] flex flex-col bg-background"
      aria-busy="true"
      aria-label="Loading Gram Panchayat Chandra portal"
    >
      {/* Hero skeleton */}
      <div className="relative h-[60svh] overflow-hidden bg-muted">
        <div className="absolute inset-0 shimmer-loading" />
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center gap-4">
          <div className="h-8 w-48 rounded-lg bg-foreground/10 shimmer-loading" />
          <div className="h-16 w-full max-w-xl rounded-xl bg-foreground/10 shimmer-loading" />
          <div className="h-16 w-2/3 max-w-md rounded-xl bg-foreground/10 shimmer-loading" />
          <div className="flex gap-3 mt-4">
            <div className="h-12 w-40 rounded-xl bg-foreground/10 shimmer-loading" />
            <div className="h-12 w-40 rounded-xl bg-foreground/10 shimmer-loading" />
          </div>
        </div>
      </div>

      {/* Stats row skeleton */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-card border border-border shimmer-loading"
            />
          ))}
        </div>
      </div>

      {/* Section skeletons */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-2xl bg-card border border-border shimmer-loading"
          />
        ))}
      </div>
    </div>
  )
}
