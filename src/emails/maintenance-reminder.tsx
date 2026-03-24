export function maintenanceReminderHtml(
  name: string,
  propertyName: string,
  items: { title: string; date: string }[],
  appUrl: string
): string {
  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px 16px; font-size: 15px; color: #2D2926; border-bottom: 1px solid #f0ece6;">
            ${item.title}
          </td>
          <td style="padding: 12px 16px; font-size: 15px; color: #8B8680; text-align: right; white-space: nowrap; border-bottom: 1px solid #f0ece6;">
            ${item.date}
          </td>
        </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Upcoming Maintenance Reminder — ${propertyName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: Arial, Helvetica, sans-serif; color: #2D2926;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 24px 40px; text-align: center; border-bottom: 1px solid #C4A882;">
              <span style="font-size: 28px; font-weight: 700; color: #2D2926; letter-spacing: -0.5px;">threshold</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #2D2926; line-height: 1.3;">
                Maintenance Reminder
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #2D2926;">
                Hi ${name}, you have upcoming maintenance items for <strong>${propertyName}</strong>:
              </p>
              <!-- Items Table -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px; border: 1px solid #C4A882; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: 600; color: #8B8680; text-transform: uppercase; letter-spacing: 0.5px; background-color: #FAF7F2; border-bottom: 1px solid #C4A882;">
                    Task
                  </td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: 600; color: #8B8680; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; background-color: #FAF7F2; border-bottom: 1px solid #C4A882;">
                    Due
                  </td>
                </tr>
                ${itemRows}
              </table>
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${appUrl}" target="_blank" style="display: inline-block; padding: 14px 36px; background-color: #E8734A; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                      View Property
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; text-align: center; background-color: #FAF7F2; border-top: 1px solid #C4A882;">
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #8B8680;">
                You're receiving this because you have maintenance tracking enabled.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #8B8680;">
                &copy; ${new Date().getFullYear()} Threshold. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
