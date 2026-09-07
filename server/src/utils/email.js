const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // If credentials are mock or empty, simulate email dispatch in console
  if (
    !process.env.EMAIL_USER ||
    process.env.EMAIL_USER.includes('mock') ||
    !process.env.EMAIL_PASS ||
    process.env.EMAIL_PASS.includes('mock')
  ) {
    console.log('--- EMAIL SIMULATION ---');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body:\n${options.text || options.html}`);
    console.log('------------------------');
    return { message: 'Mock email sent successfully' };
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const message = {
    from: `"Vastraa Saree Shop" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  const info = await transporter.sendMail(message);
  console.log(`Email dispatched: ${info.messageId}`);
  return info;
};

module.exports = sendEmail;
