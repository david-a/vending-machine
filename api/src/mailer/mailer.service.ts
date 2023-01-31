import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

const MAIL_DETAILS = {
  from: '"Vending Machine" <no-reply@vending-machine-app.com>',
};

@Injectable()
export class MailerService {
  smtpConfig: Record<string, any>;
  transporter: Transporter;
  constructor(private configService: ConfigService) {
    this.smtpConfig = this.configService.get('smtp');
    if (!this.smtpConfig?.host || !this.smtpConfig?.auth?.user) {
      throw new Error('SMTP configuration is missing');
    }
    this.transporter = createTransport(this.smtpConfig);
  }

  async sendPasswordlessOneTimeCodeMail(
    to: string,
    code: string,
    oneTimeCodeUrl: string,
  ): Promise<any> {
    const info = await this.transporter.sendMail({
      from: MAIL_DETAILS.from,
      to: to,
      subject: 'Your Vending Machine One Time Code', // Subject line
      text: 'Hi, your Vending Machine one-time code is: ' + code,
      html: `<div><h2>Your Vending Machine One Time Code</h2><p>Hi, your Vending Machine one-time code is: <strong>${code}</strong></p><p>You can also login directly using this url: <a target="_blank" rel="noopener" href="${oneTimeCodeUrl}">${oneTimeCodeUrl}</a></p></div>`,
    });
    return info; // TODO: handle errors
  }
}
