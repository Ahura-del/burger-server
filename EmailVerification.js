const nodemailer = require("nodemailer");
const env = require("dotenv");
env.config();

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  }
});

const sendEmailVerificationCode = async (user, code) => {
  let mailOption = {
    from: "burger@example.com",
    to: user.email,
    subject: "Burger app verification code",
    html: `
            <p>Dear ${user.name} ${user.lastName}</p>
            <p>Thank you for register in my app .<br/>
             you'r code is :</p>
            <h2>${code}</h2>
            <br/>
            <br/>
            <small>Burger app</small>
        `,
  };
  return await transport.sendMail(mailOption);
};

module.exports = sendEmailVerificationCode;
