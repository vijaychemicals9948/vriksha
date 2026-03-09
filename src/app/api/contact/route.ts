import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { firstName, lastName, email, phone, message } = body;

        // EMAIL TO ADMIN
        await resend.emails.send({
            from: "Vriksha Website <onboarding@resend.dev>",
            to: process.env.CONTACT_EMAIL!,
            subject: "New Inquiry from Vriksha Website",
            html: `
      <div style="font-family:Arial, sans-serif; background:#f6f6f6; padding:30px;">
        
        <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:10px;">
          
          <h2 style="color:#2e7d32;">New Contact Form Submission</h2>

          <p>A new inquiry has been submitted through the website.</p>

          <hr style="margin:20px 0;" />

          <h3>Customer Details</h3>

          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>

          <h3>Message</h3>
          <p style="background:#f4f4f4;padding:15px;border-radius:6px;">
            ${message}
          </p>

          <hr style="margin:30px 0;" />

          <p style="font-size:13px;color:#777;">
          This message was sent from the contact form on <strong>vriksha.co.in</strong>
          </p>

        </div>
      </div>
      `,
        });

        // EMAIL TO CUSTOMER
        await resend.emails.send({
            from: "Vriksha Decor Studio <onboarding@resend.dev>",
            to: email,
            subject: "Thank you for contacting Vriksha",
            html: `
      <div style="font-family:Arial, sans-serif; background:#f6f6f6; padding:30px;">

        <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:10px;">

          <h2 style="color:#2e7d32;">Thank You for Contacting Vriksha</h2>

          <p>Hi ${firstName},</p>

          <p>
          Thank you for reaching out to <strong>Vriksha - Indian Home Decor Studio</strong>.
          Our team has received your message and will get back to you shortly.
          </p>

          <p>
          If your inquiry is urgent, feel free to contact us directly using the details below.
          </p>

          <hr style="margin:30px 0;" />

          <h3>Our Contact Information</h3>

          <p>
          <strong>Vriksha – Indian Home Decor Studio</strong>
          </p>

          <p>
          1B, Prince Arcade<br/>
          22A, Cathedral Road<br/>
          Chennai – 600086
          </p>

          <p>
          <strong>Email:</strong> vrikshaa@gmail.com<br/>
          <strong>Website:</strong> www.vriksha.co.in
          </p>

          <p>
          <strong>Vasumathi Ramesh:</strong> 9940419286<br/>
          <strong>Ramesh Kannan:</strong> 9444403249
          </p>

          <hr style="margin:30px 0;" />

          <p>
          Follow us:
          </p>

          <p>
          Facebook: https://www.facebook.com/VrikshaAPresentationPort/ <br/>
          Instagram: https://www.instagram.com/vrikshapresentationport/
          </p>

          <hr style="margin:30px 0;" />

          <p style="font-size:13px;color:#777;">
          This is an automated confirmation email. Our team will respond to your inquiry soon.
          </p>

          <p>
          Regards,<br/>
          <strong>Team Vriksha</strong>
          </p>

        </div>
      </div>
      `,
        });

        return Response.json({ success: true });
    } catch (error) {
        console.error(error);

        return Response.json({ error: "Email failed" }, { status: 500 });
    }
}