export function toEnglishSlug(value = '') {
  const map = {
    ا: 'a',
    أ: 'a',
    إ: 'a',
    آ: 'a',
    ب: 'b',
    ت: 't',
    ث: 'th',
    ج: 'j',
    ح: 'h',
    خ: 'kh',
    د: 'd',
    ذ: 'dh',
    ر: 'r',
    ز: 'z',
    س: 's',
    ش: 'sh',
    ص: 's',
    ض: 'd',
    ط: 't',
    ظ: 'z',
    ع: 'a',
    غ: 'gh',
    ف: 'f',
    ق: 'q',
    ك: 'k',
    ل: 'l',
    م: 'm',
    ن: 'n',
    ه: 'h',
    و: 'w',
    ي: 'y',
    ة: 'a',
    ى: 'a',
    ؤ: 'w',
    ئ: 'y',
    ء: 'a',
  }

  const transliterated = value
    .trim()
    .toLowerCase()
    .split('')
    .map((char) => map[char] || char)
    .join('')

  return transliterated
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}