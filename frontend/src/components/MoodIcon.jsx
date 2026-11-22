import { Laugh, Smile, Meh, Frown, Annoyed } from 'lucide-react';

const MOOD_ICONS = {
  great: Laugh,
  good: Smile,
  okay: Meh,
  sad: Frown,
  anxious: Annoyed,
};

// Normalises legacy/capitalised mood values ("Happy", "Sad", "Anxious") to the canonical ids.
const ALIASES = { happy: 'good', sad: 'sad', anxious: 'anxious', neutral: 'okay', radiant: 'great' };

export function MoodIcon({ mood, className = 'w-5 h-5', ...rest }) {
  const key = String(mood || '').toLowerCase();
  const Icon = MOOD_ICONS[key] || MOOD_ICONS[ALIASES[key]] || Smile;
  return <Icon className={className} aria-hidden="true" {...rest} />;
}

export default MoodIcon;
