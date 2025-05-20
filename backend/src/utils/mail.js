import { config } from 'dotenv';
import nodemailer from 'nodemailer';

config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  pool: true,
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Not recommended for production
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.error('Email server verification failed:', error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

const sendAccountVerificationEmail = async (email, names, verificationToken) => {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'ParkLot Account Verification',
      html: `
      <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Email Verification</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden;">
      <div style="text-align: center; padding: 20px; background-color: #f0f0ff;">
        <img src="https://parkenterpriseconstruction.com/site/wp-content/uploads/2020/07/image4.jpg" alt="ParkLot Logo" style="max-width: 100%; height: auto; border-bottom: 2px solid #ccc;" />
      </div>

      <div style="padding: 30px; color: #333;">
        <h2 style="margin-top: 0;">Dear ${names},</h2>
        <p style="font-size: 16px;">
          To verify your account, click the link below or use the verification code provided.
        </p>

        <p style="font-size: 18px; font-weight: bold; letter-spacing: 2px; color: #4200FE;">
          Verification Code: ${verificationToken}
        </p>

        <p style="font-size: 16px;">
          or 
          <a href="${process.env.CLIENT_URL}/auth/verify-email/${verificationToken}" style="color:#4200FE; text-decoration: none; font-weight: bold;">
            Click here
          </a>
        </p>

        <p style="color: #888; font-size: 14px;">The code expires in 6 hours.</p>

        <p style="margin-top: 40px; font-size: 16px;">
          Best regards,<br />
          <strong>ParkLot</strong>
        </p>
      </div>
    </div>
  </body>
</html>

      `,
    });

    return {
      message: 'Email sent successfully',
      status: true,
    };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return {
      message: 'Unable to send email',
      status: false,
    };
  }
};

const sendPaswordResetEmail = async (email, names, passwordResetToken) => {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'ParkLot Password Reset',
      html: `
       <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Password Reset</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden;">
      <div style="text-align: center; padding: 20px; background-color: #f0f0ff;">
        <img src="https://parkenterpriseconstruction.com/site/wp-content/uploads/2020/07/image4.jpg" alt="ParkLot Logo" style="max-width: 100%; height: auto; border-bottom: 2px solid #ccc;" />
      </div>

      <div style="padding: 30px; color: #333;">
        <h2 style="margin-top: 0;">Dear ${names},</h2>
        <p style="font-size: 16px;">
          Click the link below to reset your password or use the reset code provided.
        </p>

        <p style="font-size: 18px; font-weight: bold; letter-spacing: 2px; color: #4200FE;">
          Reset Code: ${passwordResetToken}
        </p>

        <p style="font-size: 16px;">
          or
          <a href="${process.env.CLIENT_URL}/auth/reset-password/${passwordResetToken}" style="color:#4200FE; text-decoration: none; font-weight: bold; margin-left: 5px;">
            Click here
          </a>
        </p>

        <p style="color: #888; font-size: 14px;">The code expires in 6 hours.</p>

        <p style="margin-top: 40px; font-size: 16px;">
          Best regards,<br />
          <strong>ParkLot</strong>
        </p>
      </div>
    </div>
  </body>
</html>

      `,
    });

    return {
      message: 'Email sent successfully',
      status: true,
    };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      message: 'Unable to send email',
      status: false,
    };
  }
};
const sendBookingStatusEmail = async (email, names, status) => {
  const subject =
    status === 'APPROVED'
      ? 'Your booking has been approved'
      : 'Your booking has been rejected';

  const htmlMessage = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Booking Status</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="text-align: center; padding: 20px; background-color: #f0f0ff;">
            <img src="https://parkenterpriseconstruction.com/site/wp-content/uploads/2020/07/image4.jpg" alt="ParkLot Logo" style="max-width: 100%; height: auto; border-bottom: 2px solid #ccc;" />
          </div>
          <div style="padding: 30px; color: #333;">
            <h2 style="margin-top: 0;">Hi ${names},</h2>
            ${
              status === 'APPROVED'
                ? `<p style="font-size: 16px;">
                    Your booking request has been <strong style="color: green;">approved</strong>. 
                    You can now access your reserved parking slot.
                  </p>`
                : `<p style="font-size: 16px;">
                    We're sorry to inform you that your booking request has been 
                    <strong style="color: red;">rejected</strong>. 
                    If you have any questions, please contact support.
                  </p>`
            }
            <p style="margin-top: 40px; font-size: 16px;">
              ${
                status === 'APPROVED'
                  ? 'Thanks for using ParkLot!'
                  : 'Best regards,<br/><strong>ParkLot Team</strong>'
              }
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject,
      html: htmlMessage,
    });

    return {
      message: 'Booking status email sent successfully',
      status: true,
    };
  } catch (error) {
    console.error('Error sending booking status email:', error);
    return {
      message: 'Unable to send booking status email',
      status: false,
    };
  }
};
const sendSlotRequestNotificationToAdmin = async (adminEmail, userName, slotDetails) => {
  try {
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: adminEmail, // Can be a string or array
      subject: 'New Parking Slot Request Notification',
      html: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>New Booking Request</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden;">
            <div style="text-align: center; padding: 20px; background-color: #f0f0ff;">
              <img src="https://parkenterpriseconstruction.com/site/wp-content/uploads/2020/07/image4.jpg" alt="ParkLot Logo" style="max-width: 100%; height: auto; border-bottom: 2px solid #ccc;" />
            </div>
            <div style="padding: 30px; color: #333;">
              <h2>New Slot Booking Request</h2>
              <p><strong>User:</strong> ${userName}</p>
              <p><strong>Requested Slot:</strong> ${slotDetails.slotName}</p>
              <p><strong>Type:</strong> ${slotDetails.slotType}</p>
              <p><strong>License Plate:</strong> ${slotDetails.plateNumber}</p>
              <p><strong>Plan:</strong> ${slotDetails.paymentPlan}</p>

              <p style="margin-top: 30px;">Please log into the dashboard to review and approve the request.</p>
            </div>
          </div>
        </body>
      </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent:', info.messageId);

    return {
      message: 'Admin notification email sent successfully',
      status: true,
    };
  } catch (error) {
    console.error('Error sending slot request email to admin:', error);
    throw new Error('Unable to notify admin');
  }
};


export {
  sendAccountVerificationEmail,
  sendPaswordResetEmail,
  sendBookingStatusEmail,
  sendSlotRequestNotificationToAdmin,
};