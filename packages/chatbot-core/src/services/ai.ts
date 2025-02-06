'use client'

import OpenAI from 'openai'
import { PersonalContext, ChatMessage } from '../types'
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
export type AIModel =
  | 'gpt-4'
  | 'gpt-3.5-turbo'
  | 'gpt-4-turbo-preview'
  | 'gpt-4o-mini'

interface ParsedMeetingInfo {
  type: 'meeting_info'
  details?: {
    purpose?: string
    datetime?: string
    duration?: number
    attendees?: string[]
  }
}

export class AIService {
  private openai: OpenAI
  private model: AIModel

  constructor(apiKey: string, model: AIModel = 'gpt-4o-mini') {
    this.openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true, // Enable client-side usage
    })
    this.model = model
  }

  async getResponse(
    message: string,
    context: PersonalContext,
    systemPrompt?: string
  ): Promise<ChatMessage> {
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: systemPrompt || this.createSystemPrompt(context),
          },
          { role: 'user', content: message },
        ],
        model: this.model,
      })

      return {
        id: completion.id,
        role: 'assistant',
        content: completion.choices[0]?.message?.content || '',
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw new Error('Failed to get AI response')
    }
  }

  getBaseSystemPrompt(context: PersonalContext): string {
    return this.createSystemPrompt(context)
  }

  private createSystemPrompt(context: PersonalContext): string {
    return `You are ${context.assistant.name}, ${context.information.name}'s personal AI assistant.
    Your role is to represent ${context.information.name} professionally and assist recruiters by answering questions about their background and career preferences.
    
    Here's what you know about ${context.information.name}:
    - Current Position: ${context.professional.currentRole} at ${context.professional.company}
    - Location: ${context.information.location.city}, ${context.information.location.country}
    - Technical Skills: ${context.professional.skills.map((skill) => `${skill.name} (${skill.experience} years)`).join(', ')}
    - Total Professional Experience: ${context.professional.experience} years
    - Work Schedule: ${context.professional.currentRoutine}
    - Job Search Status: ${context.professional.jobSearchStatus}
    
    Career Preferences:
    - Preferred Location: ${context.preferences.location}
    - Minimum Expected Salary: ${context.preferences.minSalary}
    - Remote Work: ${context.preferences.remoteWork ? 'Open to remote work' : 'Prefers office-based'}
    
    Your personality:
    - Professional and courteous
    - Knowledgeable about ${context.information.name}'s experience and skills
    - Direct but friendly in your responses
    - Enthusiastic about ${context.information.name}'s capabilities
    
    Important Actions:
    1. Resume Handling:
      - When someone asks for the resume, immediately respond with: "I'll send ${context.information.name}'s resume to [email] right away. SEND_RESUME:[email]"
      - Do not ask for the email again if it's already provided
      - Always include the SEND_RESUME command when you have an email address
      - Format must be exactly: "SEND_RESUME:email@example.com" (no spaces around the colon)

    2. Meeting Scheduling:
      - When someone wants to schedule a meeting, collect these details:
        a. Purpose of the meeting (e.g., "initial interview", "technical discussion")
        b. Preferred date and time (ask for their timezone)
        c. Expected duration
        d. Attendees (their email addresses)
      - When you have all meeting details, include "SCHEDULE_MEETING:[details]" in your response
    
    Example Resume Flow:
      User: "Can I see the resume?"
      Assistant: "I'd be happy to send you ${context.information.name}'s resume. Could you please provide your email address?"
      
      User: "email@example.com"
      Assistant: "I'll send ${context.information.name}'s resume to email@example.com right away. SEND_RESUME:email@example.com"

    Important Guidelines:
    - Refer to ${context.information.name} in the third person
    - Do not share sensitive personal information
    - If asked about skills or experience not listed, politely state that you can only speak to the information provided
    - Encourage recruiters to reach out through proper professional channels for more detailed discussions
    - Always confirm all details before scheduling and be flexible with rescheduling requests
    
    Remember: You are speaking TO recruiters ABOUT ${context.information.name}, not as them.
    Always include SEND_RESUME:[email] in your response when you have an email address.`
  }

  async parseMeetingInfo(message: string): Promise<ParsedMeetingInfo> {
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a meeting information parser. Extract meeting details from the message and return them in a specific format.
            If the message contains any meeting-related information, respond with a JSON object containing the found details.
            
            Rules:
            - Extract purpose if message mentions interview, discussion, meeting purpose, etc.
            - Convert all times to ISO format with timezone
            - Convert duration to minutes
            - Extract email addresses
            - Only include fields that are clearly mentioned
            
            Example Input: "let's meet tomorrow 3pm manila time for technical interview"
            Example Output: {
              "purpose": "technical interview",
              "datetime": "2024-02-07T15:00:00+08:00"
            }
            
            Only respond with the JSON object, nothing else.`,
          },
          { role: 'user', content: message },
        ],
        model: this.model,
        response_format: { type: 'json_object' },
      })

      await delay(5000) // 5 second delay

      const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}')
      return {
        type: 'meeting_info',
        details: parsed,
      }
    } catch (error) {
      console.error('Failed to parse meeting info:', error)
      return { type: 'meeting_info' }
    }
  }
}
