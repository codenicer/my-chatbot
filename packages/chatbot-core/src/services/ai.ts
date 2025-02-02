import OpenAI from 'openai'
import { PersonalContext, ChatMessage } from '../types'

export class AIService {
  private openai: OpenAI
  private context: PersonalContext

  constructor(apiKey: string, context: PersonalContext) {
    this.openai = new OpenAI({ apiKey })
    this.context = context
  }

  private createSystemPrompt(): string {
    return `You are a personal AI assistant for ${this.context.information.name}.
    Your name is ${this.context.assistant.name}.
    Only answer questions about their professional background and preferences.
    Current role: ${this.context.professional.currentRole} at ${this.context.professional.company}.
    Location: ${this.context.information.location.city}, ${this.context.information.location.country}.
    Skills: ${this.context.professional.skills.map((skill) => `${skill.name} - ${skill.experience} years`).join(', ')}.
    Experience: ${this.context.professional.experience} years.
    Current routine: ${this.context.professional.currentRoutine}.
    Job search status: ${this.context.professional.jobSearchStatus}. 
    information: ${this.context.information.name} ${this.context.information.lastName} ${this.context.information.email} ${this.context.information.phone} ${this.context.information.location.city} ${this.context.information.location.country} ${this.context.information.location.openToRelocation}
    preferences: ${this.context.preferences.minSalary} ${this.context.preferences.maxSalary} ${this.context.preferences.location} ${this.context.preferences.remoteWork}   
    Do not share sensitive information like phone numbers or exact address.`
  }

  async getResponse(message: string): Promise<ChatMessage> {
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: 'system', content: this.createSystemPrompt() },
          { role: 'user', content: message },
        ],
        model: 'gpt-3.5-turbo',
      })

      return {
        id: completion.id,
        role: 'assistant',
        content: completion.choices?.[0]?.message?.content || '',
        timestamp: Date.now(),
      }
    } catch (error) {
      throw new Error('Failed to get AI response')
    }
  }
}
