import nodemailer from "nodemailer"
import ejs from "ejs"
import path from "path"
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const orgName = "Unimart";

// const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: Number(process.env.SMTP_PORT) || 587,
//     service: process.env.SMTP_SERVICE,
//     auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS
//     }
// })

const transporter = nodemailer.createTransport({
    host: 'smtp.resend.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: true,
    auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY,
    }
})

//Render ejs email template
const renderEmailTemplate = async (templateName: string, data: Record<string, any>): Promise<string> => {
    const templatePath = path.join(
        process.cwd(),
        "apps",
        "auth-service",
        "src",
        "utils",
        "email-templates",
        `${templateName}.ejs`
    )

    return ejs.renderFile(templatePath, data)
}

//Send an email usingnodemailer
export const sendEmail = async (to: string, subject: string, templateName: string, data: Record<string, any>) => {
    try {
        const html = await renderEmailTemplate(templateName, data)
        const result = await resend.emails.send({
            from: `"${orgName}" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
        console.log('[Email] Email sent successfully:', result.data?.id);

        return result;
    } catch (error) {
        console.log("Error sending email", error)
        return false
    }
}