export function welcomeEmailHtml(name: string, appUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Threshold</title>
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
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #2D2926; line-height: 1.3;">
                Welcome to Threshold, ${name}!
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #2D2926;">
                We're glad you're here. Threshold is your home's owner manual — a single place to organize everything about the properties you own or manage.
              </p>
              <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #2D2926;">
                Here's what you can do:
              </h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="padding: 10px 0; font-size: 15px; line-height: 1.5; color: #2D2926; border-bottom: 1px solid #f0ece6;">
                    <strong style="color: #E8734A;">Document</strong> — Catalog rooms, appliances, warranties, and manuals in one place.
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 15px; line-height: 1.5; color: #2D2926; border-bottom: 1px solid #f0ece6;">
                    <strong style="color: #E8734A;">Organize</strong> — Track maintenance schedules, service history, and important documents.
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 15px; line-height: 1.5; color: #2D2926;">
                    <strong style="color: #E8734A;">Share</strong> — Generate beautiful property handbooks for tenants or buyers.
                  </td>
                </tr>
              </table>
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/dashboard" target="_blank" style="display: inline-block; padding: 14px 36px; background-color: #E8734A; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; mso-padding-alt: 0;">
                      <!--[if mso]><i style="mso-font-width: 200%; mso-text-raise: 21pt;">&nbsp;</i><![endif]-->
                      Go to Dashboard
                      <!--[if mso]><i style="mso-font-width: 200%;">&nbsp;</i><![endif]-->
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
                Stop Googling your own house.
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
