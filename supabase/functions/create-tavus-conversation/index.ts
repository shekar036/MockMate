import { corsHeaders } from '../_shared/cors.ts'

interface ConversationRequest {
  persona_id?: string
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
    const tavusApiKey = Deno.env.get('TAVUS_API_KEY') || '6127bd97f2214f90b5f1888b775cb85f'
    
    if (!tavusApiKey) {
      throw new Error('TAVUS_API_KEY not configured')
    }

    const requestData: ConversationRequest = await req.json()
    
    // EXPLICITLY USE YOUR SPECIFIC PERSONA ID
    // Persona ID: pd47b095c82a - Your trained AI interviewer Alex Chen
    const PERSONA_ID = 'pd47b095c82a'
    
    console.log(`Creating Tavus conversation with Persona ID: ${PERSONA_ID}`)
    
    const conversationPayload = {
      persona_id: PERSONA_ID, // Your specific persona ID - Alex Chen AI interviewer
      conversation_name: requestData.conversation_name,
      conversational_context: requestData.conversational_context,
      properties: {
        max_call_duration: requestData.properties?.max_call_duration || 1200,
        participant_left_timeout: requestData.properties?.participant_left_timeout || 120,
        participant_absent_timeout: requestData.properties?.participant_absent_timeout || 60,
        enable_recording: requestData.properties?.enable_recording || false,
        language: requestData.properties?.language || "English"
      }
    }

    console.log('Conversation payload:', JSON.stringify(conversationPayload, null, 2))

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
      console.error(`Tavus API error for persona ${PERSONA_ID}:`, response.status, errorData)
      
      // Handle specific error cases
      if (errorData.includes('maximum concurrent conversations')) {
        throw new Error('maximum concurrent conversations')
      }
      
      throw new Error(`Tavus API error: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    console.log(`Successfully created conversation with persona ${PERSONA_ID}:`, data)

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
        error: error instanceof Error ? error.message : 'Unknown error',
        persona_id: 'pd47b095c82a' // Include persona ID in error response for debugging
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