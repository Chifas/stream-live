/** Formatea un número de espectadores/seguidores de forma compacta (1,2 mil / 3,4 M). */
export function formatViewers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",")} M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(".", ",")} mil`;
  return String(n);
}
