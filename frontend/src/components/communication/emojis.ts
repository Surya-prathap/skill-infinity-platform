export interface EmojiCategory {
  label: string;
  icon: string;
  emojis: string[];
}

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    label: 'Smileys',
    icon: '😀',
    emojis: ['😀', '😄', '😁', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '😘', '😜', '🤪', '😎', '🤓', '🥳', '😴', '🤔', '🙃', '😅'],
  },
  {
    label: 'Gestures',
    icon: '👍',
    emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '👏', '🙌', '🙏', '💪', '🤝', '✋', '🖐️', '👋', '🤙'],
  },
  {
    label: 'Hearts',
    icon: '❤️',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💖', '💗', '💓', '💞', '💕', '❣️', '💔', '💯'],
  },
  {
    label: 'Objects',
    icon: '💡',
    emojis: ['💡', '📚', '📝', '📌', '📎', '✏️', '🖊️', '🖥️', '💻', '⌨️', '🖱️', '📱', '🔑', '🔒', '🗂️', '📊', '📈', '🧠', '⚙️', '🧩'],
  },
  {
    label: 'Nature',
    icon: '🌱',
    emojis: ['🌱', '🌿', '🌳', '🌸', '🌻', '🌞', '🌙', '⭐', '🌟', '⚡', '🔥', '💧', '🌈', '☀️', '❄️', '🌊'],
  },
  {
    label: 'Food',
    icon: '☕',
    emojis: ['☕', '🍵', '🧋', '🍕', '🍔', '🌮', '🍣', '🍩', '🍪', '🎂', '🍓', '🍉', '🥑', '🍿', '🥂', '🍫'],
  },
  {
    label: 'Travel',
    icon: '🚀',
    emojis: ['🚀', '✈️', '🚗', '🚲', '🚆', '⛵', '🏔️', '🏖️', '🗺️', '📍', '🎯', '🎢', '🎡', '🌍', '🛰️', '🧭'],
  },
  {
    label: 'Symbols',
    icon: '✅',
    emojis: ['✅', '❌', '⚠️', '🚨', 'ℹ️', '❗', '❓', '💬', '💭', '📣', '🔔', '🔕', '🎉', '🎊', '🏆', '🥇', '🎁', '👀', '🫡', '🤝'],
  },
];

export const QUICK_REACTIONS = ['👍', '❤️', '😂', '🎉', '🔥', '👏'];

export const flattenEmojis = (): string[] => EMOJI_CATEGORIES.flatMap((category) => category.emojis);
