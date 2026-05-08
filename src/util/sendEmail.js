import nodemailer from 'nodemailer'
import dotenv from "dotenv"
dotenv.config()
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  },
  family: 4 // Force IPv4 — this is the key fix
})

export const sendBookingConfirmation = async ({
  customerName,
  customerEmail,
  businessName,
  serviceName,
  date,
  startTime,
  reference,
}) => {
  const formattedDate = new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body style="margin:0;padding:0;background:#fff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

        <!-- Header -->
        <div style="text-align:center;margin-bottom:32px;">
          <div style="display:inline-flex;align-items:center;gap:8px;
            background:#0f172a;border:1px solid rgba(255,255,255,0.08);
            border-radius:12px;padding:10px 18px;">
            <span style="font-size:16px;font-weight:700;color:#ffffff;
              letter-spacing:-0.3px;">
              ⚡ Booker
            </span>
          </div>
        </div>

        <!-- Card -->
        <div style="background:#0f172a;border:1px solid rgba(255,255,255,0.06);
          border-radius:24px;overflow:hidden;">

          <!-- Top accent -->
          <div style="height:3px;background:linear-gradient(90deg,#5346dc,#818cf8);"></div>

          <!-- Body -->
          <div style="padding:36px 32px;">

            <!-- Icon -->
            <div style="text-align:center;margin-bottom:24px;">
              <div style="width:60px;height:60px;background:rgba(16,185,129,0.1);
                border-radius:50%;display:inline-flex;align-items:center;
                justify-content:center;font-size:28px;">
                ✅
              </div>
            </div>

            <h1 style="color:#ffffff;font-size:22px;font-weight:700;
              text-align:center;margin:0 0 8px;letter-spacing:-0.5px;">
              Booking Confirmed!
            </h1>
            <p style="color:#86a7d2;font-size:14px;text-align:center;
              margin:0 0 32px;line-height:1.6;">
              Hi ${customerName}, your appointment at
              <strong style="color:#94a3b8;">${businessName}</strong>
              is confirmed.
            </p>

            <!-- Details -->
            <div style="background:rgba(255,255,255,0.02);
              border:1px solid rgba(255,255,255,0.05);
              border-radius:16px;overflow:hidden;margin-bottom:24px;">

              ${[
      ['Service', serviceName],
      ['Date', formattedDate],
      ['Time', startTime],
      ['Business', businessName],
    ].map(([label, value], i, arr) => `
                <div style="display:flex;justify-content:space-between;
                  align-items:center;padding:14px 18px;
                  ${i < arr.length - 1 ? 'border-bottom:1px solid rgba(255,255,255,0.04);' : ''}">
                  <span style="color:#93a4bb;font-size:13px;">${label}:</span>
                  <span style="color:#e2e8f0;font-size:13px;
                    font-weight:500;margin-left:10px;">${value}</span>
                </div>
              `).join('')}
            </div>

            <!-- Reference -->
            <div style="background:rgba(83,70,220,0.08);
              border:1px solid rgba(83,70,220,0.2);
              border-radius:12px;padding:14px 18px;
              display:flex;justify-content:space-between;
              align-items:center;margin-bottom:28px;">
              <span style="color:#64748b;font-size:13px;">
                Booking reference:
              </span>
              <span style="color:#818cf8;font-size:13px;
                font-family:monospace;font-weight:600;margin-left:10px;">
                ${reference}
              </span>
            </div>

            <p style="color:#63748b;font-size:13px;text-align:center;
              line-height:1.7;margin:0;">
              Need to cancel? Reply to this email with your
              reference number and we'll sort it out.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <p style="color:#1e293b;font-size:12px;text-align:center;
          margin-top:24px;">
          Powered by Booker
        </p>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: customerEmail,
    subject: `Booking confirmed — ${serviceName} at ${businessName}`,
    html,
  })

}

export const sendBookingNotificationToAdmin = async ({
  adminEmail,
  businessName,
  customerName,
  customerEmail,
  customerPhone,
  serviceName,
  date,
  startTime,
  reference,
}) => {
  const formattedDate = new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#fff;
      font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

        <div style="text-align:center;margin-bottom:32px;">
          <div style="display:inline-flex;align-items:center;gap:8px;
            background:#0f172a;border:1px solid rgba(255,255,255,0.08);
            border-radius:12px;padding:10px 18px;">
            <span style="font-size:16px;font-weight:700;color:#ffffff;
              letter-spacing:-0.3px;">
              ⚡ Booker
            </span>
          </div>
        </div>

        <div style="background:#0f172a;border:1px solid rgba(255,255,255,0.06);
          border-radius:24px;overflow:hidden;">
          <div style="height:3px;background:linear-gradient(90deg,#5346dc,#818cf8);">
          </div>
          <div style="padding:36px 32px;">

            <div style="text-align:center;margin-bottom:24px;font-size:32px;">
              🔔
            </div>

            <h1 style="color:#ffffff;font-size:20px;font-weight:700;
              text-align:center;margin:0 0 8px;">
              New Booking!
            </h1>
            <p style="color:#86a7d2;font-size:14px;text-align:center;
              margin:0 0 28px;">
              You have a new appointment at ${businessName}
            </p>

            <div style="background:rgba(255,255,255,0.02);
              border:1px solid rgba(255,255,255,0.05);
              border-radius:16px;overflow:hidden;margin-bottom:16px;">
              ${[
      ['Customer', customerName],
      ['Email', customerEmail],
      ['Phone', customerPhone],
      ['Service', serviceName],
      ['Date', formattedDate],
      ['Time', startTime],
      ['Reference', reference],
    ].map(([label, value], i, arr) => `
                <div style="display:flex;justify-content:space-between;
                  align-items:center;padding:13px 18px;
                  ${i < arr.length - 1 ? 'border-bottom:1px solid rgba(255,255,255,0.04);' : ''}">
                  <span style="color:#93a4bb;font-size:13px;">${label}:</span>
                  <span style="color:#e2e8f0;font-size:13px;
                    font-weight:500;margin-left:10px;">${value}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <p style="color:#1e293b;font-size:12px;text-align:center;
          margin-top:24px;">
          Powered by Booker
        </p>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: adminEmail,
    subject: `New booking — ${customerName} booked ${serviceName}`,
    html,
  })
}

export const sendCancellationEmail = async ({
  customerEmail,
  customerName,
  businessName,
  serviceName,
  date,
  startTime,
  reference,
}) => {
  const formattedDate = new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#fff;
      font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

        <div style="text-align:center;margin-bottom:32px;">
          <span style="font-size:16px;font-weight:700;color:#ffffff;">
            ⚡ Booker
          </span>
        </div>

        <div style="background:#0f172a;border:1px solid rgba(255,255,255,0.06);
          border-radius:24px;overflow:hidden;">
          <div style="height:3px;background:#ef4444;"></div>
          <div style="padding:36px 32px;">

            <div style="text-align:center;margin-bottom:24px;font-size:32px;">
              ❌
            </div>

            <h1 style="color:#ffffff;font-size:20px;font-weight:700;
              text-align:center;margin:0 0 8px;">
              Booking Cancelled
            </h1>
            <p style="color:#86a7d2;font-size:14px;text-align:center;
              margin:0 0 28px;">
              Hi ${customerName}, your booking has been cancelled.
            </p>

            <div style="background:rgba(255,255,255,0.02);
              border:1px solid rgba(255,255,255,0.05);
              border-radius:16px;overflow:hidden;">
              ${[
      ['Service', serviceName],
      ['Date', formattedDate],
      ['Time', startTime],
      ['Reference', reference],
    ].map(([label, value], i, arr) => `
                <div style="display:flex;justify-content:space-between;
                  padding:13px 18px;
                  ${i < arr.length - 1 ? 'border-bottom:1px solid rgba(255,255,255,0.04);' : ''}">
                  <span style="color:#93a4bb;font-size:13px;">${label}:</span>
                  <span style="color:#e2e8f0;font-size:13px;margin-left:10px;">${value}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: customerEmail,
    subject: `Booking cancelled — ${reference}`,
    html,
  })
}