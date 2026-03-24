import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { welcomeEmailHtml } from '@/emails/welcome'
import { maintenanceReminderHtml } from '@/emails/maintenance-reminder'
import { handbookSharedHtml } from '@/emails/handbook-shared'

type EmailType = 'welcome' | 'maintenance-reminder' | 'handbook-shared'

interface EmailRequestBody {
  type: EmailType
  to: string
  data: Record<string, unknown>
}

export async function POST(request: NextRequest) {
  try {
    // Verify authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = (await request.json()) as EmailRequestBody

    if (!body.type || !body.to || !body.data) {
      return NextResponse.json(
        { error: 'Missing required fields: type, to, data' },
        { status: 400 }
      )
    }

    let subject: string
    let html: string
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3333'

    switch (body.type) {
      case 'welcome': {
        const { name } = body.data as { name: string }
        if (!name) {
          return NextResponse.json(
            { error: 'Missing required data field: name' },
            { status: 400 }
          )
        }
        subject = 'Welcome to Threshold'
        html = welcomeEmailHtml(name, appUrl)
        break
      }

      case 'maintenance-reminder': {
        const { name, propertyName, items, propertyUrl } = body.data as {
          name: string
          propertyName: string
          items: { title: string; date: string }[]
          propertyUrl?: string
        }
        if (!name || !propertyName || !items) {
          return NextResponse.json(
            { error: 'Missing required data fields: name, propertyName, items' },
            { status: 400 }
          )
        }
        subject = `Upcoming Maintenance Reminder — ${propertyName}`
        html = maintenanceReminderHtml(
          name,
          propertyName,
          items,
          propertyUrl || `${appUrl}/dashboard`
        )
        break
      }

      case 'handbook-shared': {
        const {
          tenantName,
          landlordName,
          propertyName,
          handbookUrl,
          isPasswordProtected,
        } = body.data as {
          tenantName: string
          landlordName: string
          propertyName: string
          handbookUrl: string
          isPasswordProtected: boolean
        }
        if (!tenantName || !landlordName || !propertyName || !handbookUrl) {
          return NextResponse.json(
            {
              error:
                'Missing required data fields: tenantName, landlordName, propertyName, handbookUrl',
            },
            { status: 400 }
          )
        }
        subject = "You've been shared a Property Handbook"
        html = handbookSharedHtml(
          tenantName,
          landlordName,
          propertyName,
          handbookUrl,
          isPasswordProtected ?? false
        )
        break
      }

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${body.type}` },
          { status: 400 }
        )
    }

    if (!resend) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 503 }
      )
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: body.to,
      subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err) {
    console.error('Email API error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
