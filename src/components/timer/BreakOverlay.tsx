
import { SkipForward } from 'lucide-react'

interface BreakOverlayProps {
  mode: 'short_break' | 'long_break'
  onSkip: () => void
}

export function BreakOverlay({ mode, onSkip }: BreakOverlayProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-500">
      <div className="text-center space-y-8">
        <div className="w-24 h-24 rounded-full bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary animate-pulse mx-auto shadow-[0_0_30px_rgba(0,255,204,0.2)]">
          <span className="text-4xl">☕</span>
        </div>
        <div>
          <h2 className="text-4xl font-headline font-bold text-secondary mb-2 uppercase tracking-tighter glow-secondary">
            {mode === 'short_break' ? 'Short Break' : 'Long Break'}
          </h2>
          <p className="text-on_surface_variant font-label tracking-widest uppercase text-xs">Time to recharge neon energy</p>
        </div>
        <button
          onClick={onSkip}
          className="flex items-center gap-2 text-on_surface_variant hover:text-secondary transition-colors font-label uppercase tracking-widest text-sm border border-outline/20 px-6 py-3 rounded-xl hover:bg-secondary/5"
        >
          <SkipForward size={18} />
          Skip Break
        </button>
      </div>
    </div>
  )
}
