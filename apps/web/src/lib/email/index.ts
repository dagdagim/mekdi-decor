import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 465;
const SMTP_USER = process.env.SMTP_USER || 'mydeveloper444@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || 'butvaazyizzyvaxx';
const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || SMTP_USER;
const FROM_NAME = process.env.SMTP_FROM_NAME || 'Mekdi Decor Concierge';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465 (SSL)
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export interface SendVerificationOptions {
  toEmail: string;
  fullName: string;
  verificationCode: string;
  verificationUrl: string;
}

export interface SendPaymentConfirmationOptions {
  toEmail: string;
  customerName: string;
  amount: number;
  currency?: string;
  quoteNumber: string;
  eventTitle: string;
  eventDate?: string;
  venueName?: string;
  provider: string;
  transactionRef: string;
}

export interface SendQuoteOfferOptions {
  toEmail: string;
  customerName: string;
  quoteNumber: string;
  quoteId: string;
  eventTitle: string;
  eventType: string;
  eventDate: string;
  venueName?: string;
  guestCount?: number;
  totalAmount: number;
  depositPercentage?: number;
  currency?: string;
  validityDate?: string;
  quotePaymentUrl: string;
}

/**
 * Send an email with Mekdi Decor royal luxury aesthetic
 */
export async function sendVerificationEmail({
  toEmail,
  fullName,
  verificationCode,
  verificationUrl,
}: SendVerificationOptions): Promise<boolean> {
  try {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Verify Your Email — Mekdi Decor</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF6F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1C1917;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAF6F0; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(91, 20, 36, 0.08); border: 1px solid #EADBCE;">
          
          <!-- Royal Header Banner -->
          <tr>
            <td style="background-color: #5B1424; padding: 40px 30px; text-align: center; border-bottom: 3px solid #D4AF37;">
              <span style="display: inline-block; font-size: 26px; font-weight: 700; letter-spacing: 4px; color: #FAF6F0; text-transform: uppercase;">
                MEKDI DECOR
              </span>
              <div style="font-family: Georgia, serif; font-style: italic; font-size: 13px; color: #E5C365; margin-top: 6px; letter-spacing: 1px;">
                Making Moments Unforgettable
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 40px 35px;">
              <h1 style="font-size: 22px; font-weight: 600; color: #1C1917; margin: 0 0 16px 0;">
                Welcome to Mekdi Decor, ${fullName}!
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #57534E; margin: 0 0 24px 0;">
                Thank you for creating an account with Mekdi Decor. To finalize your registration and start designing your bespoke celebrations, please verify your email address using the confirmation code below:
              </p>

              <!-- Verification Code Display Box -->
              <div style="background-color: #FAF6F0; border: 2px dashed #D4AF37; border-radius: 16px; padding: 24px; text-align: center; margin: 28px 0;">
                <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #78716C; font-weight: 600; display: block; margin-bottom: 8px;">
                  Your Verification Code
                </span>
                <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #5B1424; display: inline-block;">
                  ${verificationCode}
                </span>
                <div style="font-size: 11px; color: #A8A29E; margin-top: 8px;">
                  This code expires in 24 hours.
                </div>
              </div>

              <!-- One-click Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="background-color: #5B1424; color: #FAF6F0; padding: 14px 32px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; text-decoration: none; border-radius: 50px; display: inline-block; box-shadow: 0 4px 12px rgba(91, 20, 36, 0.25);">
                  Verify Email Directly
                </a>
              </div>

              <p style="font-size: 12px; color: #78716C; line-height: 1.5; margin: 24px 0 0 0;">
                If you did not register for an account with Mekdi Decor, you can safely disregard this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F5EFEB; padding: 24px 35px; text-align: center; border-top: 1px solid #EADBCE; font-size: 11px; color: #78716C; line-height: 1.5;">
              <p style="margin: 0 0 6px 0; font-weight: 600; color: #5B1424;">
                MEKDI DECOR LUXURY EVENT ATELIER
              </p>
              <p style="margin: 0;">
                Bole Medhanialem, Luxury Design Center 4th Floor, Addis Ababa, Ethiopia<br>
                Concierge: +251 911 234 567 &bull; contact@mekdidecor.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: toEmail,
      subject: `Verify Your Email: ${verificationCode} — Mekdi Decor`,
      text: `Hello ${fullName},\n\nYour verification code for Mekdi Decor is: ${verificationCode}\n\nOr click here to verify: ${verificationUrl}\n\nMaking Moments Unforgettable.\nMekdi Decor Concierge`,
      html: htmlContent,
    });

    console.log(`[Email] Verification email successfully sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error(`[Email Error] Failed to send verification email to ${toEmail}:`, error);
    return false;
  }
}

/**
 * Send official deposit / payment confirmation receipt
 */
export async function sendPaymentConfirmationEmail({
  toEmail,
  customerName,
  amount,
  currency = 'ETB',
  quoteNumber,
  eventTitle,
  eventDate,
  venueName,
  provider,
  transactionRef,
}: SendPaymentConfirmationOptions): Promise<boolean> {
  try {
    const formattedAmount = `${currency} ${amount.toLocaleString()}`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Payment Confirmation Receipt — Mekdi Decor</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF6F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1C1917;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAF6F0; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(91, 20, 36, 0.08); border: 1px solid #EADBCE;">
          
          <!-- Royal Header Banner -->
          <tr>
            <td style="background-color: #5B1424; padding: 40px 30px; text-align: center; border-bottom: 3px solid #D4AF37;">
              <span style="display: inline-block; font-size: 26px; font-weight: 700; letter-spacing: 4px; color: #FAF6F0; text-transform: uppercase;">
                MEKDI DECOR
              </span>
              <div style="font-family: Georgia, serif; font-style: italic; font-size: 13px; color: #E5C365; margin-top: 6px; letter-spacing: 1px;">
                Official Deposit & Booking Receipt
              </div>
            </td>
          </tr>

          <!-- Receipt Details -->
          <tr>
            <td style="padding: 40px 35px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 50px; padding: 6px 16px; color: #047857; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                  &#10003; Payment Confirmed
                </div>
              </div>

              <h1 style="font-size: 22px; font-weight: 600; color: #1C1917; margin: 0 0 10px 0; text-align: center;">
                Thank You, ${customerName}!
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #57534E; margin: 0 0 24px 0; text-align: center;">
                We have received your 50% deposit. Your celebration date is officially secured in our production calendar.
              </p>

              <!-- Amount Highlight Box -->
              <div style="background-color: #5B1424; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0; color: #FAF6F0;">
                <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #E5C365; font-weight: 600; display: block; margin-bottom: 6px;">
                  Deposit Amount Paid
                </span>
                <span style="font-size: 32px; font-weight: 700; letter-spacing: 1px; color: #FAF6F0; display: inline-block;">
                  ${formattedAmount}
                </span>
                <div style="font-size: 11px; color: #FAF6F0; opacity: 0.8; margin-top: 6px;">
                  Gateway: ${provider} &bull; Ref: ${transactionRef}
                </div>
              </div>

              <!-- Transaction Line Items Table -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0; font-size: 13px; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #EADBCE;">
                  <td style="padding: 10px 0; color: #78716C;">Quote Reference</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #1C1917;">${quoteNumber}</td>
                </tr>
                <tr style="border-bottom: 1px solid #EADBCE;">
                  <td style="padding: 10px 0; color: #78716C;">Event Title</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #1C1917;">${eventTitle}</td>
                </tr>
                ${
                  eventDate
                    ? `<tr style="border-bottom: 1px solid #EADBCE;">
                  <td style="padding: 10px 0; color: #78716C;">Celebration Date</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #5B1424;">${eventDate}</td>
                </tr>`
                    : ''
                }
                ${
                  venueName
                    ? `<tr style="border-bottom: 1px solid #EADBCE;">
                  <td style="padding: 10px 0; color: #78716C;">Venue</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #1C1917;">${venueName}</td>
                </tr>`
                    : ''
                }
                <tr style="border-bottom: 1px solid #EADBCE;">
                  <td style="padding: 10px 0; color: #78716C;">Payment Method</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #1C1917;">${provider}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #78716C;">Status</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: 700; color: #047857;">CONFIRMED</td>
                </tr>
              </table>

              <!-- Next Steps Box -->
              <div style="background-color: #FAF6F0; border-radius: 16px; padding: 20px; margin-top: 24px; border: 1px solid #EADBCE;">
                <h4 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #5B1424; text-transform: uppercase; letter-spacing: 1px;">
                  What Happens Next?
                </h4>
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #57534E;">
                  Lead Designer Mekdes Tadesse will coordinate your detailed 3D spatial staging, floral selection, and delivery timetable. You can view updates anytime in your client dashboard.
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F5EFEB; padding: 24px 35px; text-align: center; border-top: 1px solid #EADBCE; font-size: 11px; color: #78716C; line-height: 1.5;">
              <p style="margin: 0 0 6px 0; font-weight: 600; color: #5B1424;">
                MEKDI DECOR PLC
              </p>
              <p style="margin: 0;">
                Bole Medhanialem, Luxury Design Center 4th Floor, Addis Ababa, Ethiopia<br>
                Direct Concierge Hotline: +251 911 234 567
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: toEmail,
      subject: `Deposit Confirmed: ${formattedAmount} for ${eventTitle} — Mekdi Decor`,
      text: `Thank you ${customerName}!\n\nWe have received your deposit of ${formattedAmount} (${provider} Ref: ${transactionRef}) for ${eventTitle}.\nYour event date is locked in our production calendar.\n\nMekdi Decor Concierge\n+251 911 234 567`,
      html: htmlContent,
    });

    console.log(`[Email] Payment confirmation email successfully sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error(`[Email Error] Failed to send payment confirmation email to ${toEmail}:`, error);
    return false;
  }
}

/**
 * Send official Quote / Proposal Offer Email with Payment Link
 */
export async function sendQuoteOfferEmail({
  toEmail,
  customerName,
  quoteNumber,
  quoteId,
  eventTitle,
  eventType,
  eventDate,
  venueName,
  guestCount,
  totalAmount,
  depositPercentage = 50,
  currency = 'ETB',
  validityDate,
  quotePaymentUrl,
}: SendQuoteOfferOptions): Promise<boolean> {
  try {
    const depositAmount = (totalAmount * depositPercentage) / 100;
    const formattedTotal = `${currency} ${totalAmount.toLocaleString()}`;
    const formattedDeposit = `${currency} ${depositAmount.toLocaleString()}`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Your Decoration Proposal: ${quoteNumber} — Mekdi Decor</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF6F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1C1917;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAF6F0; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(91, 20, 36, 0.08); border: 1px solid #EADBCE;">
          
          <!-- Royal Header Banner -->
          <tr>
            <td style="background-color: #5B1424; padding: 40px 30px; text-align: center; border-bottom: 3px solid #D4AF37;">
              <span style="display: inline-block; font-size: 26px; font-weight: 700; letter-spacing: 4px; color: #FAF6F0; text-transform: uppercase;">
                MEKDI DECOR
              </span>
              <div style="font-family: Georgia, serif; font-style: italic; font-size: 13px; color: #E5C365; margin-top: 6px; letter-spacing: 1px;">
                Official Proposal & Digital Contract
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 40px 35px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background-color: #FEF3C7; border: 1px solid #FCD34D; border-radius: 50px; padding: 6px 18px; color: #92400E; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
                  Proposal ${quoteNumber} Ready
                </div>
              </div>

              <h1 style="font-size: 22px; font-weight: 600; color: #1C1917; margin: 0 0 12px 0;">
                Dear ${customerName},
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #57534E; margin: 0 0 24px 0;">
                Our lead designer <strong>Mekdes Tadesse</strong> and the production atelier have reviewed your celebration requirements and prepared your official quotation for <strong>${eventTitle}</strong>.
              </p>

              <!-- Event Overview Box -->
              <div style="background-color: #FAF6F0; border-radius: 16px; padding: 20px; border: 1px solid #EADBCE; margin: 20px 0;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; border-collapse: collapse;">
                  <tr style="border-bottom: 1px solid #EADBCE;">
                    <td style="padding: 8px 0; color: #78716C;">Occasion:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1C1917;">${eventType}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #EADBCE;">
                    <td style="padding: 8px 0; color: #78716C;">Event Date:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #5B1424;">${eventDate}</td>
                  </tr>
                  ${venueName ? `
                  <tr style="border-bottom: 1px solid #EADBCE;">
                    <td style="padding: 8px 0; color: #78716C;">Venue:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1C1917;">${venueName}</td>
                  </tr>` : ''}
                  ${guestCount ? `
                  <tr style="border-bottom: 1px solid #EADBCE;">
                    <td style="padding: 8px 0; color: #78716C;">Expected Guests:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1C1917;">${guestCount} Guests</td>
                  </tr>` : ''}
                  <tr style="border-bottom: 1px solid #EADBCE;">
                    <td style="padding: 8px 0; color: #78716C;">Total Investment:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #1C1917;">${formattedTotal}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #5B1424; font-weight: 700;">50% Required Deposit:</td>
                    <td style="padding: 10px 0; text-align: right; font-weight: 700; font-size: 16px; color: #5B1424;">${formattedDeposit}</td>
                  </tr>
                </table>
              </div>

              <!-- Main Call To Action Button (Direct Pay Link) -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${quotePaymentUrl}" style="background-color: #5B1424; color: #FAF6F0; padding: 16px 36px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; text-decoration: none; border-radius: 50px; display: inline-block; box-shadow: 0 6px 18px rgba(91, 20, 36, 0.35); border: 2px solid #D4AF37;">
                  Review Proposal & Pay Deposit &rarr;
                </a>
              </div>

              <div style="background-color: #FFFBEB; border-left: 4px solid #D4AF37; padding: 14px 18px; margin: 24px 0; font-size: 12px; color: #78350F; line-height: 1.5; border-radius: 0 12px 12px 0;">
                <strong>Secure Payment via Telebirr, Chapa, or CBE Birr:</strong><br>
                Your date is held tentatively. Authorizing the 50% deposit will immediately lock your date in our calendar and initiate final stage & floral blueprints.
                ${validityDate ? `<br><span style="color: #92400E; font-size: 11px;">Quotation valid until ${validityDate}.</span>` : ''}
              </div>

              <p style="font-size: 13px; color: #57534E; line-height: 1.6; margin: 24px 0 0 0;">
                If you have questions or wish to customize specific floral arrangements, feel free to reply directly to this email or contact our concierge at <a href="tel:+251911234567" style="color: #5B1424; font-weight: 600;">+251 911 234 567</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F5EFEB; padding: 24px 35px; text-align: center; border-top: 1px solid #EADBCE; font-size: 11px; color: #78716C; line-height: 1.5;">
              <p style="margin: 0 0 6px 0; font-weight: 600; color: #5B1424;">
                MEKDI DECOR PLC &bull; Making Moments Unforgettable
              </p>
              <p style="margin: 0;">
                Bole Medhanialem, Luxury Design Center 4th Floor, Addis Ababa, Ethiopia<br>
                contact@mekdidecor.com &bull; +251 911 234 567
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: toEmail,
      subject: `Your Decoration Proposal: ${quoteNumber} (${formattedDeposit} deposit) — Mekdi Decor`,
      text: `Dear ${customerName},\n\nYour official decoration proposal for ${eventTitle} is ready.\n\nTotal Investment: ${formattedTotal}\n50% Required Deposit: ${formattedDeposit}\n\nReview your proposal and pay deposit online here:\n${quotePaymentUrl}\n\nMekdi Decor Concierge\n+251 911 234 567`,
      html: htmlContent,
    });

    console.log(`[Email] Quote offer email with payment link successfully sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error(`[Email Error] Failed to send quote offer email to ${toEmail}:`, error);
    return false;
  }
}

