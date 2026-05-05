export function badgeTone(badge) {
  if (!badge) return 'neutral';
  const b = String(badge).toUpperCase();
  if (b.includes('NEW')) return 'accent';
  if (b.includes('PREMIUM')) return 'premium';
  if (b.includes('BEST')) return 'hot';
  return 'accent';
}
