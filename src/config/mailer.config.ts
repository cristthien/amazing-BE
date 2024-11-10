// src/config/mailer.config.ts

import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

export const mailerConfig = async (configService: ConfigService) => ({
  transport: {
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
      user: configService.get<string>('MAILDEV_INCOMING_USER'),
      pass: configService.get<string>('MAILDEV_INCOMING_PASS'),
    },
  },
  defaults: {
    from: '"No Reply" <no-reply@localhost>',
  },
  template: {
    dir: join(__dirname, '..', 'mail/templates/'),
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
});
