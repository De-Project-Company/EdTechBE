import path from 'path';
import { fileURLToPath } from 'url';
import htmlToText from 'html-to-text';
import nodemailer from 'nodemailer';
import pug from 'pug';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

class Email {
  constructor(model) {
    this.to = model.email;
    this.name = model.adminName;
    this.from = `Edtech <${process.env.EMAIL}>`;
  }

  newTransport() {
    return nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send(template, subject, licenceNumber) {
    const html = pug.renderFile(
      path.join(currentDir, `../views/email/welcome.pug`),
      {
        name: this.name,
        licenceNumber,
        subject
      }
    );

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    };
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome(licenceNumber) {
    await this.send('Welcome', 'Welcome to Edtech!', licenceNumber);
  }
}

export default Email;
