import { NextRequest, NextResponse } from 'next/server'
import { createClient, detectBibleReferences, normalizeBookName, bibleClient } from '@sunday-school/lib'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { query, translation = 'eng_web' } = await request.json()

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Detect Bible references in the query
    const references = detectBibleReferences(query)
    
    if (references.length === 0) {
      return NextResponse.json({ 
        message: "I didn't find any Bible references in your message. Try something like 'John 3:16' or 'Psalm 23'.",
        references: []
      })
    }

    const results = []

    for (const ref of references) {
      try {
        const verseData = await bibleClient.fetchReference(ref, translation)

        results.push({
          reference: ref.originalText,
          normalized: verseData.reference,
          text: verseData.text,
          translation: verseData.translation
        })

      } catch (error) {
        console.error('Error fetching Bible verse:', error)
        results.push({
          reference: ref.originalText,
          error: 'Could not fetch this Bible reference'
        })
      }
    }

    // Create a formatted response
    let message = ''
    if (results.length === 1) {
      const result = results[0]
      if (result.error) {
        message = `Sorry, I couldn't find ${result.reference}. Please check the spelling and try again.`
      } else {
        message = `**${result.normalized} (${result.translation})**\n\n${result.text}`
      }
    } else {
      message = 'Here are the Bible verses you requested:\n\n'
      results.forEach((result, index) => {
        if (result.error) {
          message += `${index + 1}. ${result.reference}: ${result.error}\n\n`
        } else {
          message += `${index + 1}. **${result.normalized} (${result.translation})**\n${result.text}\n\n`
        }
      })
    }

    return NextResponse.json({ 
      message: message.trim(),
      references: results,
      translation
    })

  } catch (error) {
    console.error('Bible API error:', error)
    return NextResponse.json({ 
      error: 'Failed to process Bible verse request' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const book = searchParams.get('book')
    const chapter = searchParams.get('chapter')
    const verse = searchParams.get('verse')
    const endVerse = searchParams.get('endVerse')
    const translation = searchParams.get('translation') || 'eng_web'

    if (!book || !chapter) {
      return NextResponse.json({ 
        error: 'Book and chapter are required' 
      }, { status: 400 })
    }

    const normalizedBook = normalizeBookName(book)
    if (!normalizedBook) {
      return NextResponse.json({ 
        error: 'Invalid book name' 
      }, { status: 400 })
    }

    const chapterNum = parseInt(chapter)
    if (isNaN(chapterNum) || chapterNum < 1) {
      return NextResponse.json({ 
        error: 'Invalid chapter number' 
      }, { status: 400 })
    }

    let verseData
    
    if (verse) {
      const verseNum = parseInt(verse)
      const endVerseNum = endVerse ? parseInt(endVerse) : undefined
      
      if (isNaN(verseNum) || verseNum < 1) {
        return NextResponse.json({ 
          error: 'Invalid verse number' 
        }, { status: 400 })
      }

      if (endVerseNum && endVerseNum !== verseNum) {
        verseData = await bibleClient.getVerseRange(
          normalizedBook, 
          chapterNum, 
          verseNum, 
          endVerseNum, 
          translation
        )
      } else {
        verseData = await bibleClient.getVerse(
          normalizedBook, 
          chapterNum, 
          verseNum, 
          translation
        )
      }
    } else {
      verseData = await bibleClient.getChapter(
        normalizedBook, 
        chapterNum, 
        translation
      )
    }

    return NextResponse.json(verseData)

  } catch (error) {
    console.error('Bible API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch Bible verse' 
    }, { status: 500 })
  }
}