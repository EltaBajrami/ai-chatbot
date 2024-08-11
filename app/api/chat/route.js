import { NextResponse } from "next/server"
import OpenAI from "openai"

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Make sure to set your API key in environment variables
  });


// Define your system prompt
const systemPrompt = `
You are an AI-powered customer support assistant for HeadstarterAi, a platform that provides AI-driven interviews for software engineering jobs.
Here's what you can expect:

1. **Tailored Interviews:** Engage in AI-driven interviews that are customized to match the job roles and technical skills you're targeting.
2. **Real-Time Feedback:** Receive instant, actionable feedback on your performance to help you improve continuously.
3. **Comprehensive Assessments:** Test your knowledge and problem-solving abilities with a variety of coding challenges, algorithm questions, and system design scenarios.
4. **Performance Analytics:** Track your progress over time with detailed analytics and identify areas for improvement.

Get started now to enhance your interview skills and boost your career prospects!
`;

export async function POST(req){
    const openai = new OpenAI()
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [
        {
            role: 'system', content: systemPrompt
        },

        ...data,
    ],

        model: 'gpt-4o-mini',
        stream: true,
    })

    const stream =  new ReadableStream({
        async start(controller){
            const encoder = new TestEncoder()
            try{
                for await (const chunk of completion){
                    const content = chunk.choices[0]?.delta?.content
                    if(content){
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            }
            catch(err){
                controller.error(err)
            } finally{
                controller.close()
            }
        },
        
    })

    return new NextResponse(stream)
}