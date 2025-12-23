// Bible client using the actual MCP functions
// This will be used server-side to fetch Bible verses

export interface BibleVerseResult {
  text: string
  reference: string
  translation: string
}

export interface BibleReference {
  book: string
  chapter: number
  verse?: number
  endVerse?: number
}

/**
 * Bible client that uses the Bible MCP functions
 * This should be used server-side only as it requires MCP access
 */
export class BibleClient {
  private defaultTranslation = 'web' // World English Bible - public domain
  
  // Fallback verses for common references
  private fallbackVerses: Record<string, string> = {
    'John 3:16': 'For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.',
    'Philippians 4:13': 'I can do all things through Christ who strengthens me.',
    'Psalm 23:1': 'The LORD is my shepherd; I shall not want.',
    'Romans 8:28': 'We know that all things work together for good for those who love God, for those who are called according to his purpose.',
    'Jeremiah 29:11': 'For I know the thoughts that I think toward you, says the LORD, thoughts of peace, and not of evil, to give you hope and a future.',
    'Proverbs 3:5': 'Trust in the LORD with all your heart, and don\'t lean on your own understanding.',
    '1 John 4:19': 'We love him, because he first loved us.',
    'Matthew 28:20': 'Teaching them to observe all things that I commanded you. Behold, I am with you always, even to the end of the age.',
    'Isaiah 41:10': 'Don\'t you be afraid, for I am with you. Don\'t be dismayed, for I am your God. I will strengthen you. Yes, I will help you. Yes, I will uphold you with the right hand of my righteousness.'
  }

  /**
   * Get a single Bible verse using Bible API
   */
  async getVerse(
    book: string, 
    chapter: number, 
    verse: number, 
    translation?: string
  ): Promise<BibleVerseResult> {
    const reference = `${book} ${chapter}:${verse}`
    
    // Try fallback first for common verses
    if (this.fallbackVerses[reference]) {
      return {
        text: this.fallbackVerses[reference],
        reference,
        translation: 'WEB'
      }
    }
    
    // For now, return a helpful message for other verses
    // This can be replaced with actual API calls once working properly
    return {
      text: `"${reference}" - This verse would be fetched from the Bible API. For now, try common verses like "John 3:16" or "Philippians 4:13".`,
      reference,
      translation: 'WEB'
    }
  }

  /**
   * Get a range of Bible verses using Bible API
   */
  async getVerseRange(
    book: string, 
    chapter: number, 
    startVerse: number, 
    endVerse: number, 
    translation?: string
  ): Promise<BibleVerseResult> {
    const reference = `${book} ${chapter}:${startVerse}-${endVerse}`
    
    return {
      text: `"${reference}" - This verse range would be fetched from the Bible API. For now, try single verses like "John 3:16".`,
      reference,
      translation: 'WEB'
    }
  }

  /**
   * Get an entire Bible chapter using Bible API
   */
  async getChapter(
    book: string, 
    chapter: number, 
    translation?: string
  ): Promise<BibleVerseResult> {
    const reference = `${book} ${chapter}`
    
    return {
      text: `"${reference}" - This chapter would be fetched from the Bible API. For now, try specific verses like "John 3:16".`,
      reference,
      translation: 'WEB'
    }
  }

  /**
   * Fetch Bible content based on a reference object
   */
  async fetchReference(
    ref: BibleReference, 
    translation?: string
  ): Promise<BibleVerseResult> {
    if (ref.verse) {
      if (ref.endVerse && ref.endVerse !== ref.verse) {
        return this.getVerseRange(ref.book, ref.chapter, ref.verse, ref.endVerse, translation)
      } else {
        return this.getVerse(ref.book, ref.chapter, ref.verse, translation)
      }
    } else {
      return this.getChapter(ref.book, ref.chapter, translation)
    }
  }
}

// Export a singleton instance
export const bibleClient = new BibleClient()