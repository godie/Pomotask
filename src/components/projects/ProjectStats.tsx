

interface ProjectStatsProps {
  estimated: number
  real: number
}

export function ProjectStats({ estimated, real }: ProjectStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 bg-surface_container border border-outline/10 p-6 rounded-2xl">
      <div className="flex flex-col">
        <span className="font-label text-[10px] uppercase tracking-widest text-on_surface_variant">Total Estimated</span>
        <span className="text-3xl font-headline font-bold text-tertiary">{estimated}</span>
      </div>
      <div className="flex flex-col">
        <span className="font-label text-[10px] uppercase tracking-widest text-on_surface_variant">Total Realized</span>
        <span className="text-3xl font-headline font-bold text-primary">{real}</span>
      </div>
    </div>
  )
}
