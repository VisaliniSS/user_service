import { Controller, Get, Logger } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Controller('mailer')
export class MailerController {
  private readonly logger = new Logger(MailerController.name);
  private brevoAccountUrl = 'https://api.brevo.com/v3/account';
  private brevoSendUrl = 'https://api.brevo.com/v3/smtp/email';

  constructor(private mailerService: MailerService, private configService: ConfigService) {
    const apiKeyPresent = !!this.configService.get<string>('BREVO_API_KEY');
    console.log('\n🔑 Brevo API Configuration:');
    console.log(`   API Key Present: ${apiKeyPresent}`);
    console.log(`   Account URL: ${this.brevoAccountUrl}`);
    console.log(`   Send Email URL: ${this.brevoSendUrl}\n`);
  }

  @Get('test-connection')
  async testConnection() {
    console.log('\n🔍 Testing Brevo SMTP connection via MailerService...');
    
    try {
      await this.mailerService.testConnection();
      
      return {
        status: 'success',
        message: 'Brevo SMTP connection is working',
        provider: 'Brevo SMTP',
        host: 'smtp-relay.brevo.com',
        port: 587,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('\n❌ Brevo SMTP connection failed!');
      console.error(`   Error: ${error.message}`);

      return {
        status: 'error',
        message: 'Brevo SMTP connection failed',
        errorMessage: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('send-test')
  async sendTest() {
    console.log('\n📬 Sending test email...');
    try {
      await this.mailerService.sendVerificationEmail(
        'test@yopmail.com',
        'Test User',
        'a'.repeat(64), // 64-char hex string
      );
      return {
        status: 'success',
        message: 'Test email sent successfully',
        email: 'test@yopmail.com',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Test email failed:', error.message);
      return {
        status: 'error',
        message: 'Failed to send test email',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
