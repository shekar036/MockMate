import { corsHeaders } from '../_shared/cors.ts'

interface EndConversationRequest {
  conversation_id: string
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const tavusApiKey = Deno.env.get('TAVUS_API_KEY') || '6127bd97f2214f90b5f1888b775cb85f'
    
    if (!tavusApiKey) {
      throw new Error('TAVUS_API_KEY not configured')
    }

    // Check if request has content
    const contentLength = req.headers.get('Content-Length')
    if (contentLength === '0' || contentLength === null) {
      return new Response(
        JSON.stringify({ error: 'Request body is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    const { conversation_id }: EndConversationRequest = await req.json()

    const response = await fetch(`https://tavusapi.com/v2/conversations/${conversation_id}/end`, {
      method: 'POST',
      headers: {
        'x-api-key': tavusApiKey,
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Tavus API error: ${response.status} - ${errorData}`)
    }

    const data = await response.json()

    return new Response(
      JSON.stringify(data),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  } catch (error) {
    console.error('Error ending Tavus conversation:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  }
})