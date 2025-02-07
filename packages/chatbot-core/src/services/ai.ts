'use client'

import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  AIProvider,
  AIModelConfig,
  PersonalContext,
  ChatMessage,
} from '../types'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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
  private openai?: OpenAI
  private genAI?: GoogleGenerativeAI
  private config: AIModelConfig

  constructor(config: AIModelConfig) {
    this.config = config

    switch (config.provider) {
      case 'openai':
        this.openai = new OpenAI({
          apiKey: config.apiKey,
          dangerouslyAllowBrowser: true,
        })
        break
      case 'gemini':
        this.genAI = new GoogleGenerativeAI(config.apiKey)
        break
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`)
    }
  }

  async getResponse(
    message: string,
    context: PersonalContext,
    systemPrompt?: string
  ): Promise<ChatMessage> {
    try {
      switch (this.config.provider) {
        case 'openai':
          return await this.getOpenAIResponse(message, context, systemPrompt)
        case 'gemini':
          return await this.getGeminiResponse(message, context, systemPrompt)
        default:
          throw new Error(`Unsupported AI provider: ${this.config.provider}`)
      }
    } catch (error) {
      console.error('AI Service error:', error)
      throw new Error('Failed to get AI response')
    }
  }

  private async getOpenAIResponse(
    message: string,
    context: PersonalContext,
    systemPrompt?: string
  ): Promise<ChatMessage> {
    if (!this.openai) throw new Error('OpenAI not initialized')

    const completion = await this.openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt || this.createSystemPrompt(context),
        },
        { role: 'user', content: message },
      ],
      model: this.config.model || 'gpt-4o-mini',
      temperature: this.config.temperature || 0.7,
    })

    return {
      id: completion.id,
      role: 'assistant',
      content: completion.choices[0]?.message?.content || '',
      timestamp: Date.now(),
    }
  }

  private async getGeminiResponse(
    message: string,
    context: PersonalContext,
    systemPrompt?: string
  ): Promise<ChatMessage> {
    if (!this.genAI) throw new Error('Gemini AI not initialized')

    const model = this.genAI.getGenerativeModel({
      model: this.config.model || 'gemini-2.0-flash',
      generationConfig: {
        temperature: this.config.temperature || 1,
        responseMimeType: 'text/plain',
      },
    })

    const prompt = `${systemPrompt || this.createSystemPrompt(context)}\n\nUser: ${message}`
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    return {
      id: Math.random().toString(36).substring(7),
      role: 'assistant',
      content: text,
      timestamp: Date.now(),
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
      - When someone wants to schedule a meeting, respond with: "I'll help you schedule a meeting with ${context.information.name}. SHOW_MEETING_FORM"
      - Do not ask for meeting details, the form will collect them
    
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
}
