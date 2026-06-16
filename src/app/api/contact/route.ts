import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, accredited, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Market Regime Capital <noreply@marketregimes.com>',
      to: ['marketregimereport@gmail.com'],
      replyTo: email,
      subject: `Contact Form: ${name}`,
      text: `
Name: ${name}
Email: ${email}
Company: ${company || 'N/A'}
Accredited Investor: ${accredited ? 'Yes' : 'No'}

Message:
${message}
      `,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #111827; margin-bottom: 24px;">New Contact Form Submission</h2>

          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p style="margin: 8px 0;"><strong>Company:</strong> ${company || 'N/A'}</p>
            <p style="margin: 8px 0;"><strong>Accredited Investor:</strong> ${accredited ? 'Yes' : 'No'}</p>
          </div>

          <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <p style="margin: 0 0 12px 0; font-weight: 600; color: #111827;">Message:</p>
            <p style="margin: 0; color: #374151; white-space: pre-wrap;">${message}</p>
          </div>

          <p style="margin-top: 24px; font-size: 12px; color: #6b7280;">
            Sent from marketregimes.com contact form
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
