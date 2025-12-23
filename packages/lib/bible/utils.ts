// Bible verse detection and parsing utilities

// List of all 66 Protestant Bible books
export const BIBLE_BOOKS = [
  // Old Testament
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 
  'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 
  'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
  'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
  'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  // New Testament
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
  'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
  '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
  '1 John', '2 John', '3 John', 'Jude', 'Revelation'
] as const

// Common abbreviations for Bible books
export const BIBLE_ABBREVIATIONS: Record<string, string> = {
  // Old Testament
  'gen': 'Genesis', 'ex': 'Exodus', 'exod': 'Exodus', 'lev': 'Leviticus', 'num': 'Numbers',
  'deut': 'Deuteronomy', 'dt': 'Deuteronomy', 'josh': 'Joshua', 'judg': 'Judges',
  '1sam': '1 Samuel', '2sam': '2 Samuel', '1ki': '1 Kings', '1kgs': '1 Kings',
  '2ki': '2 Kings', '2kgs': '2 Kings', '1chr': '1 Chronicles', '2chr': '2 Chronicles',
  'neh': 'Nehemiah', 'est': 'Esther', 'ps': 'Psalms', 'psa': 'Psalms', 'psalm': 'Psalms',
  'prov': 'Proverbs', 'pr': 'Proverbs', 'eccl': 'Ecclesiastes', 'ecc': 'Ecclesiastes',
  'song': 'Song of Solomon', 'sos': 'Song of Solomon', 'isa': 'Isaiah', 'is': 'Isaiah',
  'jer': 'Jeremiah', 'lam': 'Lamentations', 'ezek': 'Ezekiel', 'ez': 'Ezekiel',
  'dan': 'Daniel', 'hos': 'Hosea', 'joel': 'Joel', 'am': 'Amos', 'obad': 'Obadiah',
  'ob': 'Obadiah', 'jon': 'Jonah', 'mic': 'Micah', 'nah': 'Nahum', 'hab': 'Habakkuk',
  'zeph': 'Zephaniah', 'zep': 'Zephaniah', 'hag': 'Haggai', 'zech': 'Zechariah',
  'zec': 'Zechariah', 'mal': 'Malachi',
  // New Testament
  'matt': 'Matthew', 'mt': 'Matthew', 'mk': 'Mark', 'lk': 'Luke', 'jn': 'John',
  'joh': 'John', 'acts': 'Acts', 'rom': 'Romans', '1cor': '1 Corinthians',
  '2cor': '2 Corinthians', 'gal': 'Galatians', 'eph': 'Ephesians', 'phil': 'Philippians',
  'php': 'Philippians', 'col': 'Colossians', '1thess': '1 Thessalonians', '1th': '1 Thessalonians',
  '2thess': '2 Thessalonians', '2th': '2 Thessalonians', '1tim': '1 Timothy', '1ti': '1 Timothy',
  '2tim': '2 Timothy', '2ti': '2 Timothy', 'tit': 'Titus', 'philem': 'Philemon',
  'phlm': 'Philemon', 'heb': 'Hebrews', 'jas': 'James', 'jam': 'James', '1pet': '1 Peter',
  '1pe': '1 Peter', '2pet': '2 Peter', '2pe': '2 Peter', '1jn': '1 John', '1jo': '1 John',
  '2jn': '2 John', '2jo': '2 John', '3jn': '3 John', '3jo': '3 John', 'jude': 'Jude',
  'rev': 'Revelation'
}

export interface DetectedBibleReference {
  book: string
  chapter: number
  verse?: number
  endVerse?: number
  originalText: string
}

/**
 * Detects Bible verse references in text
 * Supports formats like: John 3:16, Phil 4:13, Genesis 1:1-3, Psalm 23
 */
export function detectBibleReferences(text: string): DetectedBibleReference[] {
  const references: DetectedBibleReference[] = []
  const seen = new Set<string>() // Prevent duplicates
  
  // Single comprehensive pattern for Bible references
  const pattern = /\b((?:\d\s+)?[A-Za-z]+(?:\s+of\s+[A-Za-z]+)?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?/gi
  
  let match
  while ((match = pattern.exec(text)) !== null) {
    const [fullMatch, bookText, chapterText, verseText, endVerseText] = match
    
    // Normalize book name
    const normalizedBook = normalizeBookName(bookText.trim())
    if (!normalizedBook) continue
    
    const chapter = parseInt(chapterText)
    const verse = verseText ? parseInt(verseText) : undefined
    const endVerse = endVerseText ? parseInt(endVerseText) : undefined
    
    // Create unique key to prevent duplicates
    const key = `${normalizedBook}:${chapter}:${verse || 'chapter'}:${endVerse || ''}`
    if (seen.has(key)) continue
    
    seen.add(key)
    references.push({
      book: normalizedBook,
      chapter,
      verse,
      endVerse,
      originalText: fullMatch
    })
  }
  
  return references
}

/**
 * Normalizes book name from various formats to standard Bible book name
 */
export function normalizeBookName(input: string): string | null {
  const normalized = input.toLowerCase().replace(/[^\w\s]/g, '').trim()
  
  // Check abbreviations first
  if (BIBLE_ABBREVIATIONS[normalized]) {
    return BIBLE_ABBREVIATIONS[normalized]
  }
  
  // Check for partial matches in full book names
  for (const book of BIBLE_BOOKS) {
    if (book.toLowerCase() === normalized || 
        book.toLowerCase().startsWith(normalized) ||
        normalized === book.toLowerCase().replace(/\s+/g, '')) {
      return book
    }
  }
  
  return null
}

/**
 * Checks if text contains biblical keywords that might indicate a Bible-related request
 */
export function containsBiblicalKeywords(text: string): boolean {
  const keywords = [
    'verse', 'scripture', 'bible', 'biblical', 'psalm', 'proverb', 
    'testament', 'gospel', 'apostle', 'prophet', 'lord', 'god',
    'jesus', 'christ', 'holy', 'prayer', 'faith', 'worship'
  ]
  
  const lowerText = text.toLowerCase()
  return keywords.some(keyword => lowerText.includes(keyword))
}

/**
 * Determines if a chat message should trigger Bible verse lookup
 */
export function shouldLookupBibleVerse(message: string): boolean {
  const hasReference = detectBibleReferences(message).length > 0
  const hasKeywords = containsBiblicalKeywords(message)
  const hasRequest = /\b(show|read|quote|find|lookup|get)\b.*\b(verse|scripture|bible)\b/i.test(message)
  
  return hasReference || (hasKeywords && hasRequest)
}

/**
 * Formats a Bible reference for display
 */
export function formatBibleReference(ref: DetectedBibleReference): string {
  let result = `${ref.book} ${ref.chapter}`
  
  if (ref.verse) {
    result += `:${ref.verse}`
    if (ref.endVerse && ref.endVerse !== ref.verse) {
      result += `-${ref.endVerse}`
    }
  }
  
  return result
}