import { corsHeaders } from '../_shared/cors.ts'

interface VideoRequest {
  replica_id?: string
  script: string
  video_name: string
  background_url?: string
  callback_url?: string
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

    const requestData: VideoRequest = await req.json()
    
    // EXPLICITLY USE YOUR SPECIFIC REPLICA ID
    // Replica ID: rb17cf590e15 - Your trained AI avatar
    const REPLICA_ID = 'rb17cf590e15'
    
    console.log(`Creating Tavus video with Replica ID: ${REPLICA_ID}`)
    
    const videoPayload = {
      replica_id: REPLICA_ID, // Your specific replica ID - AI avatar
      script: requestData.script,
      video_name: requestData.video_name,
      background_url: requestData.background_url,
      callback_url: requestData.callback_url
    }

    console.log('Video payload:', JSON.stringify(videoPayload, null, 2))

    const response = await fetch('https://tavusapi.com/v2/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': tavusApiKey,
      },
      body: JSON.stringify(videoPayload),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error(`Tavus API error for replica ${REPLICA_ID}:`, response.status, errorData)
      
      // Handle specific error cases
      if (errorData.includes('maximum concurrent conversations')) {
        throw new Error('maximum concurrent conversations')
      }
      
      throw new Error(`Tavus API error: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    console.log(`Successfully created video with replica ${REPLICA_ID}:`, data)

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
    console.error('Error creating Tavus video:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        replica_id: 'rb17cf590e15' // Include replica ID in error response for debugging
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