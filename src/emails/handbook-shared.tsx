export function handbookSharedHtml(
  tenantName: string,
  landlordName: string,
  propertyName: string,
  handbookUrl: string,
  isPasswordProtected: boolean
): string {
  const passwordNote = isPasswordProtected
    ? `<tr>
        <td style="padding: 16px; background-color: #FAF7F2; border-radius: 8px; border: 1px solid #C4A882; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #8B8680;">
            <strong style="color: #2D2926;">Password protected</strong> — You'll need the password provided by your landlord to access this handbook.
          </p>
        </td>
      </tr>
      <tr><td style="height: 24px;"></td></tr>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You've been shared a Property Handbook</title>
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
                Your Property Handbook
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #2D2926;">
                Hi ${tenantName}, <strong>${landlordName}</strong> has shared a property handbook with you for <strong>${propertyName}</strong>.
              </p>
              <p style="margin: 0 0 28px 0; font-size: 16px; line-height: 1.6; color: #2D2926;">
                This handbook contains everything you need to know about your new home — from room-by-room guides and appliance instructions to emergency procedures and local recommendations.
              </p>
              <!-- Password Note -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${passwordNote}
              </table>
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${handbookUrl}" target="_blank" style="display: inline-block; padding: 14px 36px; background-color: #E8734A; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                      View Handbook
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
                This handbook was created with Threshold — the owner's manual for your home.
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
