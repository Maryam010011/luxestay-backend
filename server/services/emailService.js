import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

/**
 * Generates an elegant HTML template for booking confirmation emails
 */
function generateBookingEmailHtml(booking) {
  const {
    bookingRef,
    hotelName,
    firstName,
    lastName,
    checkIn,
    checkOut,
    adults,
    children,
    roomType,
    totalPrice,
    paymentMethod,
    specialRequests,
  } = booking;

  const paymentLabel =
    paymentMethod === 'card'
      ? 'Credit / Debit Card (Paid)'
      : paymentMethod === 'paypal'
      ? 'PayPal Express (Paid)'
      : 'Pay at Property Check-in';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - ${hotelName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #334155;
      margin: 0;
      padding: 24px 12px;
      -webkit-font-smoothing: antialiased;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1a5f7a 100%);
      color: #ffffff;
      padding: 36px 28px;
      text-align: center;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin: 0;
      color: #ffffff;
    }
    .brand-tagline {
      font-size: 13px;
      color: #93c5fd;
      margin-top: 6px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-weight: 600;
    }
    .hero-badge {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #15803d;
      font-size: 12px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 999px;
      display: inline-block;
      margin-top: 18px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .content {
      padding: 32px 28px;
    }
    .greeting {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 8px;
    }
    .intro-text {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin-top: 0;
      margin-bottom: 24px;
    }
    .ref-box {
      background: #f8fafc;
      border: 1.5px dashed #cbd5e1;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ref-label {
      font-size: 12px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.8px;
      margin: 0;
    }
    .ref-code {
      font-size: 22px;
      font-weight: 800;
      color: #1a5f7a;
      letter-spacing: 1.5px;
      margin-top: 4px;
      font-family: monospace, Courier, monospace;
    }
    .details-card {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 28px;
    }
    .details-header {
      background: #f1f5f9;
      padding: 14px 20px;
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 1px solid #e2e8f0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
    }
    .details-table td {
      padding: 14px 20px;
      font-size: 14px;
      border-bottom: 1px solid #f1f5f9;
    }
    .details-table tr:last-child td {
      border-bottom: none;
    }
    .label-col {
      color: #64748b;
      font-weight: 600;
      width: 40%;
    }
    .value-col {
      color: #0f172a;
      font-weight: 700;
      text-align: right;
    }
    .total-highlight {
      color: #1a5f7a;
      font-size: 18px;
      font-weight: 800;
    }
    .special-notes {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 14px 18px;
      border-radius: 6px;
      margin-bottom: 28px;
      font-size: 13.5px;
      color: #92400e;
      line-height: 1.5;
    }
    .footer {
      background: #f8fafc;
      padding: 24px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      font-size: 12.5px;
      color: #94a3b8;
      line-height: 1.5;
    }
    .footer a {
      color: #1a5f7a;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1 class="brand-title">LuxeStay</h1>
      <div class="brand-tagline">Curated Luxury Stays</div>
      <div class="hero-badge">Reservation Confirmed</div>
    </div>
    
    <div class="content">
      <h2 class="greeting">Dear ${firstName} ${lastName},</h2>
      <p class="intro-text">
        Thank you for choosing <strong>LuxeStay</strong>. Your reservation at <strong>${hotelName}</strong> has been successfully confirmed.
      </p>

      <div class="ref-box">
        <div>
          <p class="ref-label">Booking Reference</p>
          <div class="ref-code">${bookingRef}</div>
        </div>
      </div>

      <div class="details-card">
        <div class="details-header">Stay Information</div>
        <table class="details-table">
          <tr>
            <td class="label-col">Property</td>
            <td class="value-col">${hotelName}</td>
          </tr>
          <tr>
            <td class="label-col">Check-in</td>
            <td class="value-col">${checkIn} (from 14:00)</td>
          </tr>
          <tr>
            <td class="label-col">Check-out</td>
            <td class="value-col">${checkOut} (until 11:00)</td>
          </tr>
          <tr>
            <td class="label-col">Guests</td>
            <td class="value-col">${adults} Adults${children > 0 ? `, ${children} Children` : ''}</td>
          </tr>
          <tr>
            <td class="label-col">Room Type</td>
            <td class="value-col" style="text-transform: capitalize;">${roomType} Room</td>
          </tr>
          <tr>
            <td class="label-col">Payment Method</td>
            <td class="value-col">${paymentLabel}</td>
          </tr>
          <tr>
            <td class="label-col">Total Amount</td>
            <td class="value-col total-highlight">$${totalPrice} USD</td>
          </tr>
        </table>
      </div>

      ${
        specialRequests
          ? `
      <div class="special-notes">
        <strong>Special Requests:</strong> ${specialRequests}
      </div>`
          : ''
      }

      <p class="intro-text" style="margin-bottom: 0;">
        If you need to make changes to your itinerary or require airport transfers, please reply directly to this email or visit your LuxeStay portal.
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 6px 0;">&copy; ${new Date().getFullYear()} LuxeStay Global Hospitality Group.</p>
      <p style="margin: 0;">24/7 Concierge Support: <a href="mailto:support@luxestay.com">support@luxestay.com</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Sends a real confirmation email using Resend
 * 
 * @param {Object} booking - The saved booking document
 * @returns {Promise<Object>} Resend response object or null
 */
export async function sendBookingConfirmationEmail(booking) {
  const resend = getResendClient();
  if (!resend) {
    console.warn('⚠️ [Resend] RESEND_API_KEY is not configured in environment variables. Skipping email dispatch.');
    return null;
  }

  const recipientEmail = booking.email?.trim();
  if (!recipientEmail) {
    console.warn('⚠️ [Resend] No recipient email address provided in booking.');
    return null;
  }

  const sender = 'LuxeStay <onboarding@resend.dev>';
  const subject = `Booking Confirmed - ${booking.hotelName} (Ref: ${booking.bookingRef})`;
  const html = generateBookingEmailHtml(booking);

  try {
    console.log(`📡 [Resend] Sending confirmation email to ${recipientEmail} for booking ${booking.bookingRef}...`);
    
    const response = await resend.emails.send({
      from: sender,
      to: recipientEmail,
      subject: subject,
      html: html,
    });

    if (response.error) {
      console.error(`❌ [Resend] Error response from API for ${recipientEmail}:`, response.error);
      return { success: false, error: response.error };
    }

    console.log(`✅ [Resend] Confirmation email sent successfully to ${recipientEmail} (Email ID: ${response.data?.id})`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`❌ [Resend] Exception occurred sending email to ${recipientEmail}:`, {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    return { success: false, error: error.message };
  }
}
