// Event categories shared by the calendar, the homepage and the admin form

export const eventCategories: Record<string, { label: string; className: string }> = {
  kultura: { label: 'Kultura', className: 'bg-accent-200 text-accent-800' },
  grad: { label: 'Grad', className: 'bg-paper-deep text-text-secondary' },
  akcija: { label: 'Akcija', className: 'bg-primary-50 text-primary' },
  pijaca: { label: 'Pijaca', className: 'bg-accent-200 text-accent-800' },
  sport: { label: 'Sport', className: 'bg-primary-50 text-primary' },
  ostalo: { label: 'Ostalo', className: 'bg-paper-deep text-text-secondary' },
};

export function isEventCategory(key: unknown): key is string {
  return typeof key === 'string' && Object.prototype.hasOwnProperty.call(eventCategories, key);
}

export function eventCategory(key: string | null) {
  return isEventCategory(key) ? eventCategories[key] : eventCategories.ostalo;
}
