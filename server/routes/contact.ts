import { Router } from 'express';
import { Resend } from 'resend';

const router = Router();

const resend = new Resend(process.env.RESEND_API_KEY);

router.post('/inquiry', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      inquiryType,
      message,
    } = req.body;

    // Required field validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required.',
      });
    }

    const inquiryLabels: Record<string, string> = {
      general: 'General Patient Question',
      booking: 'Appointment / Test Scheduling',
      home_draw: 'Mobile Home Phlebotomy',
      physician: 'Physician Requisition / Account',
      billing: 'Insurance & Billing Support',
    };

    const inquiryLabel =
      inquiryLabels[inquiryType] || 'General Patient Question';

    const { data, error } = await resend.emails.send({
      from: 'Serine Diagnostics <admin@serinediagnostics.com>',
      to: [process.env.CONTACT_EMAIL || 'admin@serinediagnostics.com'],
      subject: `New Patient Inquiry - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
          <h2 style="color: #103d4a;">
            New Patient Inquiry
          </h2>

          <div style="border: 1px solid #dce8ea; border-radius: 12px; padding: 20px;">
            <p>
              <strong>Name:</strong>
              ${escapeHtml(name)}
            </p>

            <p>
              <strong>Email:</strong>
              ${escapeHtml(email)}
            </p>

            <p>
              <strong>Phone:</strong>
              ${escapeHtml(phone || 'Not provided')}
            </p>

            <p>
              <strong>Inquiry Type:</strong>
              ${escapeHtml(inquiryLabel)}
            </p>

            <hr style="border: 0; border-top: 1px solid #dce8ea; margin: 20px 0;" />

            <p>
              <strong>Message:</strong>
            </p>

            <p style="white-space: pre-wrap;">
              ${escapeHtml(message)}
            </p>
          </div>

          <p style="color: #66838d; font-size: 12px; margin-top: 20px;">
            This inquiry was submitted through the Serine Diagnostics website.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);

      return res.status(502).json({
        success: false,
        message: 'Unable to send inquiry email.',
      });
    }

    console.log('Inquiry email sent:', data?.id);

    return res.status(200).json({
      success: true,
      message: 'Inquiry sent successfully.',
      id: data?.id,
    });
  } catch (error) {
    console.error('Contact inquiry error:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong while sending the inquiry.',
    });
  }
});

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default router;