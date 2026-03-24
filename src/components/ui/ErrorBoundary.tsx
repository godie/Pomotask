import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  public static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  public override render() {
    if (this.state.hasError) {
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

    return this.props.children
  }
}
