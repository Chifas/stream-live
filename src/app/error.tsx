"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-[70vh] place-items-center p-6 text-center">
      <div>
        <p className="text-5xl">⚠️</p>
        <h1 className="mt-3 text-xl font-bold">Algo ha ido mal</h1>
        <p className="mt-2 text-muted">Ha ocurrido un error al cargar esta página.</p>
        <button
          onClick={reset}
          className="btn-brand mt-6 rounded-md px-5 py-2.5 font-semibold"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
