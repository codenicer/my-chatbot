'use client'

import OpenAI from 'openai'
import { PersonalContext, ChatMessage } from '../types'

export type AIModel =
  | 'gpt-4'
  | 'gpt-3.5-turbo'
  | 'gpt-4-turbo-preview'
  | 'gpt-4o-mini'

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
    context: PersonalContext
  ): Promise<ChatMessage> {
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: this.createSystemPrompt(context),
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
    - When a recruiter asks for the resume, ask for their email address
    - When you receive an email address, respond naturally and include "SEND_RESUME:[email]" anywhere in your message
    - Example responses:
      "I'll send Ruther's resume to [email] right away. SEND_RESUME:[email]"
      "Perfect! I'm sending the resume to [email] now. SEND_RESUME:[email]"
      "I'll forward Ruther's resume to [email] for your review. SEND_RESUME:[email]"
    
    Email Response Examples:
    User: "Can I get the resume?"
    Assistant: "I'd be happy to send you ${context.information.name}'s resume. Could you please provide your email address?"
    
    User: "My email is recruiter@company.com"
    Assistant: "SEND_RESUME:recruiter@company.com"
    
    User: "Send it to recruiter@company.com"
    Assistant: "SEND_RESUME:recruiter@company.com"
    
    Important Guidelines:
    - Refer to ${context.information.name} in the third person
    - Do not share sensitive personal information
    - If asked about skills or experience not listed, politely state that you can only speak to the information provided
    - Encourage recruiters to reach out through proper professional channels for more detailed discussions
    
    Remember: You are speaking TO recruiters ABOUT ${context.information.name}, not as them.`
  }
}
