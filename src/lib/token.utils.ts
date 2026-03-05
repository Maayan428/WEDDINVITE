export function generateInviteToken(): string {
  return crypto.randomUUID();
}

export function buildInviteUrl(guestId: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/invite/${guestId}`;
  }
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  return `${base}/invite/${guestId}`;
}
