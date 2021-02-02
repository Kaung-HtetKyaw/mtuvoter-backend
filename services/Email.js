const nodemailer = require("nodemailer");
const pug = require("pug");
const html_to_text = require("html-to-text");
const sendgrid = require("@sendgrid/mail");
module.exports = class Email {
  constructor(user, url) {
    this.firstName = user.name.split(" ");
    this.to = user.email;
    this.from = `MTU VOTER <${process.env.ORG_EMAIL}>`;
    this.url = url;
  }
  createNewTransport() {
    if (process.env.NODE_ENV == "production") {
      return nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });
  }
  async send(template, subject, data) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      subject,
      url: this.url,
      firstName: this.firstName,
      data,
    });
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: html_to_text.fromString(html),
    };
    await this.createNewTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send("welcome", "Welcome to MTU Voter");
  }
  async sendVerfication(token) {
    await this.send("verify", "Plesae verfiy your account", { token });
  }
  async sendPasswordReset(token, url) {
    await this.send(
      "passwordReset",
      "Reset your password here (valid for 10 mins)",
      { token, url }
    );
  }
  // send bulk mails
  async sendNewsNoti(emails, data) {
    const html = pug.renderFile(`${__dirname}/../views/email/news.pug`, {
      subject: data.title,
      url: this.url,
      firstName: this.firstName,
      data,
    });
    const mailOptions = {
      from: this.from,
      to: emails,
      subject: data.title,
      html,
      text: html_to_text.fromString(html),
    };

    if (process.env.NODE_ENV === "production") {
      console.log(process.env.SENDGRID_API);
      await this.createNewTransport().sendMail(mailOptions);
    }
  }
};
