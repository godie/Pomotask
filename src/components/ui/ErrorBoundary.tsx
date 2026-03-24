import React, { useState, useEffect } from 'react'

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Uncaught error:", event.error)
      setHasError(true)
    }
    window.addEventListener('error', handleError)
    return () => { window.removeEventListener('error', handleError); }
  }, [])

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-10 text-center bg-surface_container rounded-3xl border border-error/20">
        <h2 className="text-2xl font-headline font-bold text-error mb-4">Something went wrong</h2>
        <p className="text-on_surface_variant mb-8">The neon lights flickered out. Please try refreshing the page.</p>
        <button
          className="bg-primary text-on_primary px-8 py-2 rounded-xl font-bold uppercase tracking-widest"
          onClick={() => { window.location.reload(); }}
        >
          Recharge
        </button>
      </div>
    )
  }

  return <>{children}</>
}
