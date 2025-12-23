import { NextResponse } from 'next/server'
import { getMarkdownPromptLoader } from '@sunday-school/lib/prompts/markdown-loader'
import fs from 'fs'
import path from 'path'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const debug = searchParams.get('debug') === 'true'
  
  if (debug) {
    // Debug mode to check file paths
    const loader = getMarkdownPromptLoader()
    const promptsDir = path.join(process.cwd(), 'src/lib/prompts/markdown')
    const exists = fs.existsSync(promptsDir)
    const files = exists ? fs.readdirSync(promptsDir) : []
    
    return NextResponse.json({
      cwd: process.cwd(),
      promptsDir,
      exists,
      files,
      availablePrompts: loader.getAvailablePrompts(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        SUNDAY_SCHOOL_PROMPT_VERSION: process.env.SUNDAY_SCHOOL_PROMPT_VERSION
      }
    })
  }
  
  try {
    const loader = getMarkdownPromptLoader()
    const prompt = loader.loadPromptByVersion('2.1')
    
    if (!prompt) {
      return NextResponse.json({ 
        error: 'Prompt not found' 
      }, { status: 500 })
    }
    
    return NextResponse.json({
      version: prompt.metadata.version,
      description: prompt.metadata.description,
      author: prompt.metadata.author,
      features: prompt.metadata.features,
      promptLength: prompt.content.length,
      promptPreview: prompt.content.substring(0, 500),
      environment: process.env.SUNDAY_SCHOOL_PROMPT_VERSION || 'not set',
      defaultVersion: 'v2.1'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined 
    }, { status: 500 })
  }
}