import nodemailer from 'nodemailer'
import axios from 'axios'
import { PersonalContext } from '../types'

export class EmailService {
  private transporter: nodemailer.Transporter
  private fromEmail: string

  constructor(config: { user: string; password: string }) {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: config.user,
        pass: config.password,
      },
    })
    this.fromEmail = config.user
  }
  private generateCSV(context: PersonalContext): string {
    const rows = [
      ['Name', `${context.information.name} ${context.information.lastName}`],
      ['Current Role', context.professional.currentRole],
      ['Company', context.professional.company],
      ['Experience', `${context.professional.experience} years`],
      [
        'Location',
        `${context.information.location.city}, ${context.information.location.country}`,
      ],
      [
        'Skills',
        context.professional.skills
          .map((s) => `${s.name} (${s.experience} years)`)
          .join(', '),
      ],
      ['Job Search Status', context.professional.jobSearchStatus],
      ['Minimum Salary', context.preferences.minSalary.toString()],
      ['Remote Work', context.preferences.remoteWork ? 'Yes' : 'No'],
    ]

    return rows.map((row) => row.join(',')).join('\n')
  }

  async sendPDFFromUrl(toEmail: string, context: PersonalContext) {
    try {
      const { name, lastName, resumeUrl } = context.information
      const fileName = `${name.toLowerCase()}_${lastName.toLowerCase()}_profile`

      let attachment = {
        filename: `${fileName}.csv`,
        content: this.generateCSV(context),
      }

      if (resumeUrl) {
        attachment = {
          filename: `${fileName}.pdf`,
          content: await axios.get(resumeUrl, { responseType: 'arraybuffer' }),
        }
      }

      return this.transporter.sendMail({
        from: this.fromEmail,
        to: toEmail,
        subject: `Professional Profile - ${name} ${lastName}`,
        text: 'Please find attached the professional profile.',
        attachments: [attachment],
      })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error('Failed to download PDF')
      }
      throw new Error('Failed to send email')
    }
  }
}
