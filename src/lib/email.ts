import { resend, FROM_EMAIL } from '@/lib/resend'
import { welcomeEmailHtml } from '@/emails/welcome'
import { maintenanceReminderHtml } from '@/emails/maintenance-reminder'
import { handbookSharedHtml } from '@/emails/handbook-shared'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3333'

export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<void> {
  if (!resend) { console.warn('Resend not configured, skipping email'); return }
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Welcome to Threshold',
    html: welcomeEmailHtml(name, APP_URL),
  })

  if (error) {
    console.error('Failed to send welcome email:', error)
    throw new Error('Failed to send welcome email')
  }
}

export async function sendMaintenanceReminder(
  email: string,
  name: string,
  propertyName: string,
  items: { title: string; date: string }[]
): Promise<void> {
  if (!resend) { console.warn('Resend not configured, skipping email'); return }
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Upcoming Maintenance Reminder — ${propertyName}`,
    html: maintenanceReminderHtml(name, propertyName, items, `${APP_URL}/dashboard`),
  })

  if (error) {
    console.error('Failed to send maintenance reminder:', error)
    throw new Error('Failed to send maintenance reminder')
  }
}

export async function sendHandbookSharedEmail(
  to: string,
  tenantName: string,
  landlordName: string,
  propertyName: string,
  handbookUrl: string,
  isPasswordProtected: boolean
): Promise<void> {
  if (!resend) { console.warn('Resend not configured, skipping email'); return }
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "You've been shared a Property Handbook",
    html: handbookSharedHtml(
      tenantName,
      landlordName,
      propertyName,
      handbookUrl,
      isPasswordProtected
    ),
  })

  if (error) {
    console.error('Failed to send handbook shared email:', error)
    throw new Error('Failed to send handbook shared email')
  }
}
