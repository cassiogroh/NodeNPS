import nodemailer, { Transporter } from 'nodemailer';
import fs from 'fs';
import handleBars from 'handlebars';

export default new class SendEmailService {
  private client: Transporter;

  constructor() {
    nodemailer.createTestAccount().then(account => {
      const transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass
        }
      })

      this.client = transporter;
    });
  }

  async execute(to: string, subject: string, variables: object, path: string) {
    const templateFileContent = fs.readFileSync(path).toString('utf8');

    const mailTemplateParse = handleBars.compile(templateFileContent);

    const html = mailTemplateParse(variables);

    const message = await this.client.sendMail({
      to,
      subject,
      html,
      from: 'NPS <noreply@nps.com>'
    });

    console.log('Message sent: ', message.messageId);
    console.log('Preview URL: ', nodemailer.getTestMessageUrl(message))
  }
}