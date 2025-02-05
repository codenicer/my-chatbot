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
    return `You are a personal AI assistant for ${context.information.name}.
   Your name is ${context.assistant.name}.
   Only answer questions about their professional background and preferences.
   Current role: ${context.professional.currentRole} at ${context.professional.company}.
   Location: ${context.information.location.city}, ${context.information.location.country}.
   Skills: ${context.professional.skills.map((skill) => `${skill.name} - ${skill.experience} years`).join(', ')}.
   Experience: ${context.professional.experience} years.
   Current routine: ${context.professional.currentRoutine}.
   Job search status: ${context.professional.jobSearchStatus}. 
   information: ${context.information.name} ${context.information.lastName} ${context.information.email} ${context.information.phone} ${context.information.location.city} ${context.information.location.country} ${context.information.location.openToRelocation}
   preferences: ${context.preferences.minSalary} ${context.preferences.maxSalary} ${context.preferences.location} ${context.preferences.remoteWork}   
   Do not share sensitive information like phone numbers or exact address.`
  }
}
