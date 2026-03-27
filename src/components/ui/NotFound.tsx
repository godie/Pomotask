import { Link } from '@tanstack/react-router'

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
      <div className="text-9xl font-headline font-bold text-outline/10 absolute -z-10 select-none">
        404
      </div>
      <h1 className="text-4xl font-headline font-bold text-primary mb-4 [text-shadow:0_0_20px_rgba(255,45,120,0.3)]">
        404 Not Found
      </h1>
      <p className="text-on_surface_variant text-lg mb-8 text-center max-w-md">
        The page you are looking for has faded into the digital void.
      </p>
      <Link
        to="/"
        className="bg-primary text-on_primary px-8 py-3 rounded-xl font-headline font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(255,45,120,0.3)] hover:shadow-[0_0_25px_rgba(255,45,120,0.5)] transition-all active:scale-95"
      >
        Back to Safety
      </Link>
    </div>
  )
}
