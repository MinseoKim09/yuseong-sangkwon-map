import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const MODEL = 'claude-sonnet-5'
const MAX_TOKENS = 1500

const SYSTEM_PROMPT =
  '당신은 대전 유성구 소상공인의 SNS 마케팅을 돕는 전문가입니다. 자연스럽고 친근한 한국어로 작성하세요.'

type ContentType = 'instagram' | 'naver_blog' | 'kakao'

interface GenerateRequestBody {
  storeName: string
  category: string
  description?: string
  contentType: ContentType
  imageDescription?: string
}

const CONTENT_SCHEMA = {
  type: 'json_schema' as const,
  schema: {
    type: 'object',
    properties: {
      drafts: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
          },
          required: ['content'],
          additionalProperties: false,
        },
      },
      hashtags: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['drafts'],
    additionalProperties: false,
  },
}

function buildUserPrompt(body: GenerateRequestBody): string {
  const lines = [`가게명: ${body.storeName}`, `업종: ${body.category}`]

  if (body.description) lines.push(`오늘의 메뉴/소개: ${body.description}`)
  if (body.imageDescription) lines.push(`사진 설명: ${body.imageDescription}`)

  switch (body.contentType) {
    case 'instagram':
      lines.push(
        '',
        '인스타그램에 올릴 캡션 초안 3가지를 작성해주세요. 각 캡션은 서로 다른 톤(친근함, 감성적, 재치있음 등)으로 작성하고,',
        '캡션과는 별도로 이 게시물에 어울리는 해시태그를 30개 만들어주세요.',
        'drafts 배열의 각 항목은 content 필드에 캡션 전문을 담고, hashtags 배열에 "#" 없이 해시태그 30개를 담아주세요.'
      )
      break
    case 'naver_blog':
      lines.push(
        '',
        '네이버 블로그 포스팅 제목 3가지와, 그중 가장 좋은 제목에 맞는 본문 초안을 작성해주세요.',
        'drafts 배열에 3개 항목을 담되, 각 항목의 title 필드에 제목을 담고, 가장 좋은 첫 번째 항목의 content 필드에는 본문 초안을, 나머지 항목의 content 필드에는 그 제목에 어울리는 한 줄 요약을 담아주세요.'
      )
      break
    case 'kakao':
      lines.push(
        '',
        '카카오톡 채널로 발송할 메시지 초안 3가지를 작성해주세요. 짧고 명확하게, 채널 메시지 톤에 맞게 작성해주세요.',
        'drafts 배열의 각 항목은 content 필드에 메시지 전문을 담아주세요.'
      )
      break
  }

  return lines.join('\n')
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  let body: GenerateRequestBody

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  if (!body.storeName || !body.category || !body.contentType) {
    return NextResponse.json(
      { error: 'storeName, category, contentType은 필수입니다.' },
      { status: 400 }
    )
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      output_config: { format: CONTENT_SCHEMA },
      messages: [{ role: 'user', content: buildUserPrompt(body) }],
    })

    const textBlock = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    )

    if (!textBlock) {
      return NextResponse.json({ error: 'AI 응답을 받지 못했습니다.' }, { status: 502 })
    }

    const result = JSON.parse(textBlock.text)

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error('[ai-marketing] Claude API 인증 오류:', error)
      return NextResponse.json({ error: 'AI 서비스 인증에 실패했습니다.' }, { status: 500 })
    }
    if (error instanceof Anthropic.RateLimitError) {
      console.error('[ai-marketing] Claude API 요청 한도 초과:', error)
      return NextResponse.json(
        { error: '요청이 많아 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      )
    }
    if (error instanceof Anthropic.APIError) {
      console.error('[ai-marketing] Claude API 오류:', error)
      return NextResponse.json({ error: 'AI 콘텐츠 생성에 실패했습니다.' }, { status: 502 })
    }

    console.error('[ai-marketing] 알 수 없는 오류:', error)
    return NextResponse.json({ error: '콘텐츠 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
