import { corsHeaders } from '../_shared/cors.ts'

interface ConversationRequest {
  persona_id: string
  conversation_name: string
  conversational_context: string
  properties?: {
    max_call_duration?: number
    participant_left_timeout?: number
    participant_absent_timeout?: number
    enable_recording?: boolean
    language?: string
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const tavusApiKey = Deno.env.get('TAVUS_API_KEY')
    
    if (!tavusApiKey) {
      throw new Error('TAVUS_API_KEY not configured')
    }

    const requestData: ConversationRequest = await req.json()
    
    // Use your specific persona ID
    const conversationPayload = {
      ...requestData,
      persona_id: 'pd47b095c82a'
    }

    const response = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': tavusApiKey,
      },
      body: JSON.stringify(conversationPayload),
    })

    if (!response.ok) {
      const errorData = await response.text()
      
      // Handle specific error cases
      if (errorData.includes('maximum concurrent conversations')) {
        throw new Error('maximum concurrent conversations')
      }
      
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
    console.error('Error creating Tavus conversation:', error)
    
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