import nodemailer from "nodemailer";

export const emailRegister = async (data) => {
    const { email, name, token } = data;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
    });

    // email info
    await transport.sendMail({
        from: '"UpTask - Projects manager" <account@uptask.com>',
        to: email,
        subject: "UpTask - Confirm your account",
        text: "Confirm your account in UpTask",
        html: `<p>Hi: ${name}, confirm your account in UpTask</p>
        <p>Your account is almost ready, you only have to confirm it on the following link:</p>

        <a href="${process.env.FRONT_END_URL}/confirm/${token}">Confirm account</a>

        <p>If you didn't create this account, you can ignore this message.</p>
        `
    });
}

export const emailForgotPassword = async (data) => {
    const { email, name, token } = data;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
    });

    // email info
    await transport.sendMail({
        from: '"UpTask - Projects manager" <account@uptask.com>',
        to: email,
        subject: "UpTask - Reset your password",
        text: "Reset your password",
        html: `<p>Hi: ${name}, </p>
        <p>Your have requested to reset your password, you only have to follow the following link:</p>

        <a href="${process.env.FRONT_END_URL}/forgot-password/${token}">Reset your password</a>

        <p>If you didn't create this account, you can ignore this message.</p>
        `
    });
}
