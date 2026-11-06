import { ScheduledVisit, InquiryMessage } from '../types/property';

const FAVORITES_KEY = 'aura_saved_favorites_v1';
const VISITS_KEY = 'aura_scheduled_visits_v1';
const INQUIRIES_KEY = 'aura_inquiries_v1';
const TUTORIAL_KEY = 'aura_tutorial_dismissed_v1';
const COMPARE_KEY = 'aura_compare_properties_v1';

export const getFavorites = (): string[] => {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : ['prop-obsidian-flagship'];
  } catch {
    return ['prop-obsidian-flagship'];
  }
};

export const toggleFavorite = (propertyId: string): string[] => {
  const current = getFavorites();
  const next = current.includes(propertyId)
    ? current.filter((id) => id !== propertyId)
    : [...current, propertyId];
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  } catch (err) {
    console.error('Storage error', err);
  }
  return next;
};

export const isFavorite = (propertyId: string): boolean => {
  return getFavorites().includes(propertyId);
};

export const getScheduledVisits = (): ScheduledVisit[] => {
  try {
    const raw = localStorage.getItem(VISITS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveScheduledVisit = (visit: ScheduledVisit): ScheduledVisit[] => {
  const current = getScheduledVisits();
  const next = [visit, ...current];
  try {
    localStorage.setItem(VISITS_KEY, JSON.stringify(next));
  } catch (err) {
    console.error('Storage error', err);
  }
  return next;
};

export const saveInquiry = (msg: InquiryMessage): void => {
  try {
    const raw = localStorage.getItem(INQUIRIES_KEY);
    const current: InquiryMessage[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem(INQUIRIES_KEY, JSON.stringify([msg, ...current]));
  } catch (err) {
    console.error('Storage error', err);
  }
};

export const isTutorialDismissed = (): boolean => {
  try {
    return localStorage.getItem(TUTORIAL_KEY) === 'true';
  } catch {
    return false;
  }
};

export const setTutorialDismissed = (): void => {
  try {
    localStorage.setItem(TUTORIAL_KEY, 'true');
  } catch (err) {
    console.error('Storage error', err);
  }
};

export const getCompareList = (): string[] => {
  try {
    const raw = localStorage.getItem(COMPARE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const toggleCompare = (propertyId: string): string[] => {
  const current = getCompareList();
  let next: string[];
  if (current.includes(propertyId)) {
    next = current.filter((id) => id !== propertyId);
  } else {
    // limit compare list to max 3
    next = current.length >= 3 ? [...current.slice(1), propertyId] : [...current, propertyId];
  }
  try {
    localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
  } catch (err) {
    console.error('Storage error', err);
  }
  return next;
};
