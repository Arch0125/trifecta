// For Next.js App Router in TypeScript (e.g., src/app/api/sendInvoice/route.ts)
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { toEmail, subject, image } = await request.json();

    // Check if image data is provided
    if (!image || typeof image !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid image data' }), { status: 400 });
    }

    // Convert the DataURL (e.g. "data:image/png;base64,...") to a Base64 string
    const base64Image = image.split(';base64,').pop();

    // Create a transporter using Gmail's SMTP service (ensure env variables are set)
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for port 465, false for other ports
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });

      const textBody = `Please find your beautified invoice attached. \n - To pay using crypto reply to this mail typing Confirm and cc to relayer@emailwallet.org \n - To pay using UPI send the amount to the UPI ID: dasarchisman25@oksbi \n Regards, \n zkPay`;

    // Send the email with the image attachment
    await transporter.sendMail({
      from: `"zkPay Bot" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: `Invoice ${Date.now()} : `+subject,
      text: textBody,
      attachments: [
        {
          filename: 'invoice.png',
          content: base64Image,
          encoding: 'base64',
        },
      ],
    });

    return new Response(JSON.stringify({ message: 'Invoice sent successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error sending invoice:', error);
    return new Response(JSON.stringify({ error: 'Failed to send invoice' }), { status: 500 });
  }
}



// export async function POST(req: Request) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     const { toEmail, subject, image } = req.body;

//     // For demonstration only:
//     // Create a test SMTP account (this won't send to real mailboxes).
//     // Instead, it logs a preview URL in the console.
//     // Replace with real SMTP credentials for production usage.
//     const testAccount = await nodemailer.createTestAccount();

//     const transporter = nodemailer.createTransport({
//       host: testAccount.smtp.host,
//       port: testAccount.smtp.port,
//       secure: testAccount.smtp.secure,
//       auth: {
//         user: testAccount.user,
//         pass: testAccount.pass,
//       },
//     });

//     if (!image || typeof image !== 'string') {
//         return new Response(JSON.stringify({ error: 'Missing or invalid image data' }), { status: 400 });
//       }
  
//       // Convert the DataURL (e.g. "data:image/png;base64,...") to a Base64 string
//       const base64Image = image.split(';base64,').pop();

//     await transporter.sendMail({
//       from: '"Invoice Bot" <invoice@example.com>"',
//         to: toEmail,
//         subject: subject,
//         text: 'Please find your beautified invoice attached.',
//         attachments: [
//             {
//                 filename: 'invoice.png',
//                 content: base64Image,
//                 encoding: 'base64',
//             },
//             ],
//         });
//     } catch (error) {
//         console.error('Error sending invoice:', error);
//         res.status(500).json({ error: 'Failed to send invoice' });
//     }
// }
