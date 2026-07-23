export default function ChannelLoading() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col xl:flex-row">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="skeleton aspect-video w-full" />
        <div className="flex gap-3 p-4">
          <div className="skeleton h-14 w-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-5 w-40 rounded" />
            <div className="skeleton h-4 w-64 rounded" />
            <div className="skeleton h-3 w-32 rounded" />
          </div>
        </div>
      </div>
      <div className="hidden w-[340px] shrink-0 border-l border-edge xl:block">
        <div className="space-y-3 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-4 w-full rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
