import _ from 'lodash';
import axios from 'axios';
import nodemailer, { SendMailOptions } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

interface Settings {
  defaultFrom: string;
  defaultReplyTo: string;
  defaultFromName: string;
}

interface SendOptions {
  from?: string;
  to: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
  channel?: string;
  [key: string]: unknown;
}

type NodemailerSMTPOptions = Parameters<typeof nodemailer.createTransport<SMTPTransport>>[0];

type ChannelOptions = {
  type: 'brevo',
  options: {
    apiKey: string,
  },
} | { 
  type: 'smtp',
  options: NodemailerSMTPOptions,
} 


type ProviderOptions = {
  defaultChannel: string;
  channels: Record<string, ChannelOptions>
}

const emailFields = [
  'from',
  'replyTo',
  'to',
  'cc',
  'bcc',
  'subject',
  'text',
  'html',
  'attachments',
];

const brevoApiUrl = "https://api.brevo.com/v3";

export function init(providerOptions: ProviderOptions, settings: Settings) {

  return {
    async send(options: SendOptions): Promise<any> {

      try {
        const { from, to, cc, bcc, replyTo, subject, text, html, channel, ...rest } = options;
        const channelName = channel || providerOptions.defaultChannel;
        const selectedChannel = providerOptions.channels[channelName];

        let senderEmail = from || settings.defaultFrom;
        senderEmail = senderEmail.match(/<(.*?)>/g) ? senderEmail.match(/<(.*?)>/g)?.map((a) => a.replace(/<|>/g, ""))[0] || '' : senderEmail;

        let senderName = from || settings.defaultFromName;
        senderName = senderName.match(/(.*?)</g) ? senderName.match(/(.*?)</g)?.map((a) => a.replace(/<|>/g, ""))[0] || '' : senderName;

        if (selectedChannel.type === 'brevo') {
          const mail = {
            sender: {
              name: from || settings.defaultFromName,
              email: senderEmail,
            },
            to: [{ email: to }],
            cc,
            bcc,
            replyTo: { email: replyTo || settings.defaultReplyTo },
            subject,
            textContent: text,
            htmlContent: html,
            ...rest,
          };
  
          let send = await axios.post(brevoApiUrl + "/smtp/email", mail, {
            headers: { "api-key": selectedChannel.options.apiKey },
          });
        }

        if (selectedChannel.type === 'smtp') {
          const transporter = nodemailer.createTransport(selectedChannel.options);
          
          const mail: SendMailOptions = {
            ..._.pick(options, emailFields),
            from: from || `"${settings.defaultFromName}" ${settings.defaultFrom}`,
            replyTo: replyTo || settings.defaultReplyTo,
            text: text || options.html,
            html: html || options.text,
          };
  
          let send = await transporter.sendMail(mail);
        }

        else {
          throw new Error(`No supported channel type: ${selectedChannel.type}`);
        }

        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    },
  };
};
