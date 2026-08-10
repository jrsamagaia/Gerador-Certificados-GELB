/**
 * Gerador de HASH único e URL de verificação de autenticidade
 * para os certificados do Grupo Escoteiro Leões de Blumenau (GELB 32/SC).
 */

export function generateCertificateHash(
  recipientName: string,
  registration: string,
  eventName: string,
  date: string
): string {
  const seed = `${recipientName.trim().toUpperCase()}-${registration.trim()}-${eventName.trim()}-${date.trim()}-GELB32SC`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  const timestamp = Date.now().toString(36).substring(3, 7).toUpperCase();
  return `GELB-${hex.substring(0, 4)}-${hex.substring(4, 8)}-${timestamp}`;
}

export function getVerificationUrl(hash: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gelb32sc.org.br';
  return `${baseUrl}?validar=${encodeURIComponent(hash)}`;
}
