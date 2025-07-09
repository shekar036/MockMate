import { corsHeaders } from '../_shared/cors.ts'

interface FeedbackRequest {
  question: string
  answer: string
  role: string
}

interface FeedbackResponse {
  feedback: string
  score: number
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      // Fallback to mock feedback if OpenAI is not configured
      const mockFeedback = generateMockFeedback()
      return new Response(
        JSON.stringify(mockFeedback),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    const { question, answer, role }: FeedbackRequest = await req.json()

    const prompt = `You are an experienced ${role} interviewer. Evaluate this interview response and provide constructive feedback.

Question: ${question}

Candidate's Answer: ${answer}

Please provide:
1. Specific feedback on what they did well
2. Areas for improvement with actionable suggestions
3. A score from 1-10 based on the quality and completeness of their response

Keep the feedback encouraging but honest, and focus on helping them improve for real interviews.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert technical interviewer providing constructive feedback to help candidates improve.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const feedbackText = data.choices[0].message.content

    // Extract score from feedback (simple regex approach)
    const scoreMatch = feedbackText.match(/(\d+)\/10/)
    const score = scoreMatch ? parseInt(scoreMatch[1]) : Math.floor(Math.random() * 3) + 6

    return new Response(
      JSON.stringify({
        feedback: feedbackText,
        score: score
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  } catch (error) {
    console.error('Error generating feedback:', error)
    
    // Fallback to mock feedback on error
    const mockFeedback = generateMockFeedback()
    return new Response(
      JSON.stringify(mockFeedback),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  }
})

function generateMockFeedback(): FeedbackResponse {
  const feedbackOptions = [
    {
      feedback: "Good response! You demonstrated solid understanding of the topic. Consider providing more specific examples to strengthen your answer and discuss potential challenges you might face in implementation.",
      score: 7
    },
    {
      feedback: "Excellent answer! You showed deep knowledge and provided concrete examples. Your explanation was clear and well-structured. To reach the next level, consider discussing scalability concerns or alternative approaches.",
      score: 9
    },
    {
      feedback: "Your answer covers the basics well. To improve, try to elaborate on the practical applications and share more personal experience. Adding specific metrics or outcomes would make your response more compelling.",
      score: 6
    },
    {
      feedback: "Strong response with good technical depth. You could enhance it by discussing potential edge cases, performance considerations, or how you'd handle errors in this scenario.",
      score: 8
    }
  ]

  return feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)]
}