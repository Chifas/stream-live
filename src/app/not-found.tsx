import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center p-6 text-center">
      <div>
        <p className="text-6xl font-black text-brand">404</p>
        <h1 className="mt-3 text-xl font-bold">Esta emisión ya no está disponible</h1>
        <p className="mt-2 text-muted">
          El canal que buscas no existe o ha terminado el directo.
        </p>
        <Link
          href="/"
          className="btn-brand mt-6 inline-block rounded-md px-5 py-2.5 font-semibold"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
