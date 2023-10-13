const nodemailer = require('nodemailer');

class MailerService {
  #transporter;

  constructor() {
    this.#transporter = nodemailer.createTransport(
      {
        service: 'gmail',
        auth: {
          user: process.env.MAIL_HOST_USERNAME,
          pass: process.env.MAIL_HOST_PASSWORD
        }
      }
    );
  }

  sendResetPasswordMail(to, token) {
    return this.#transporter.sendMail({
      to,
      from: 'Like Trello Support',
      subject: 'Password reset',
      html: `
        <h1>Password reset</h1>
        <p>Click this <a href="${process.env.SERVER_URL}/reset/${token}">link</a> to set a new password.</p>
      `
    });
  }
}

module.exports = new MailerService();
