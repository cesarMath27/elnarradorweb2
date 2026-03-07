export function ArticleCardSkeleton() {
  return (
    <div className="bg-surface rounded-lg overflow-hidden border border-border animate-pulse">
      <div className="aspect-video bg-border" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-border rounded w-20" />
        <div className="h-5 bg-border rounded w-full" />
        <div className="h-5 bg-border rounded w-3/4" />
        <div className="h-3 bg-border rounded w-32" />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[500px] bg-border rounded-lg animate-pulse">
      <div className="absolute bottom-0 left-0 right-0 p-8 space-y-3">
        <div className="h-4 bg-white/20 rounded w-24" />
        <div className="h-8 bg-white/20 rounded w-3/4" />
        <div className="h-4 bg-white/20 rounded w-1/2" />
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="bg-surface rounded-lg p-5 border border-border animate-pulse">
      <div className="h-6 bg-border rounded w-32 mb-4" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-3 mb-4">
          <div className="w-20 h-20 bg-border rounded shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-border rounded w-16" />
            <div className="h-4 bg-border rounded w-full" />
            <div className="h-4 bg-border rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
