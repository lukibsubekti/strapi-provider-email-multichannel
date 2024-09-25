## About

This email provider allows creation of multiple email channels by leveraging some third-party tools like Axios and Nodemailer.
Currently, the supported channel types are:
- [x] Brevo
- [x] SMTP 

## Examples

```typescript
// file: config/plugins.ts

export default ({ env }) => ({
  email: {
    config: {
      provider: 'strapi-provider-email-multichannel',

      providerOptions: {
        defaultChannel: 'primary',
        channels: {

          primary: {
            type: 'brevo',
            options: {
              apiKey: env('BREVO_API_KEY', ''),
            },
          },

          marketing: {
            type: 'smtp',
            options: {
              host: env('SMTP_HOST', 'smtp.example.com'),
              port: env.int('SMTP_PORT', 587),
              secure: env.bool('SMTP_SECURE', false),
              auth: {
                user: env('SMTP_USERNAME'),
                pass: env('SMTP_PASSWORD'),
              },
            }
          }
        },
      },
      settings: {
        defaultFrom: env('EMAIL_DEFAULT_FROM', 'hi@example.com'),
        defaultReplyTo: env('EMAIL_DEFAULT_REPLY_TO', 'hi@example.com'),
        defaultFromName: env('EMAIL_DEFAULT_FROM_NAME', ''),
      },
    },
  },
})
```

```typescript
// file: some/path/controllers/custom.ts

export default {
  sendEmail: async () => {
    // ...

    await strapi.plugins['email'].services.email.send({
      channel: 'marketing',
      to: '...',
      subject: '...',
      text: '...',
      html: '...',
    })

    // ...
  }
}

```

## Parameters

### Provider Options

- `defaultChannel: string`
    Name of channel that will be used when `send` method is called without `channel` option parameter.
- `channels: Record<string, ChannelOptions>`
    List of channels.

### Channel Options

- `type: 'brevo' | 'smtp'`
- `options: any`
    - Brevo: `{ apiKey: string }`
    - SMTP: `nodemailer.TransportOptions`

### Send Options

- `from?: string`
- `to: string`
- `cc?: string`
- `bcc?: string`
- `replyTo?: string`
- `subject: string`
- `text: string`
- `html: string`
- `channel?: string`
    Name of channel based on keys in `channels` property in provider options. 
- `[key: string]: unknown`


