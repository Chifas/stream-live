export default function Loading() {
  return (
    <div className="mx-auto max-w-[1600px] p-4 sm:p-6">
      <div className="skeleton mb-8 h-48 w-full rounded-xl" />
      <div className="skeleton mb-4 h-6 w-48 rounded" />
      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton aspect-video w-full rounded-md" />
            <div className="mt-2 flex gap-2">
              <div className="skeleton h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
