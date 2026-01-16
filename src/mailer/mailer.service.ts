import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailerService.name);
  private verificationTemplate: string | null;

  constructor(private configService: ConfigService) {
    console.log('🔧 Initializing MailerService');

    const emailHost = this.configService.get<string>('EMAIL_HOST') || 'smtp-relay.brevo.com';
    const emailPort = Number(this.configService.get<number>('EMAIL_PORT')) || 587;
    const emailUser = this.configService.get<string>('EMAIL_HOST_USER');
    const emailPassword = this.configService.get<string>('EMAIL_HOST_PASSWORD');
    const emailFrom = this.configService.get<string>('EMAIL_FROM') || 'no-reply@ibil.com';
    const emailUseTls = String(this.configService.get<string>('EMAIL_USE_TLS') || 'true').toLowerCase() === 'true';

    console.log(`   Host: ${emailHost}`);
    console.log(`   Port: ${emailPort}`);
    console.log(`   User: ${emailUser ? 'set' : 'not-set'}`);

    this.transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465, // true for 465, false for other ports (STARTTLS will be used when requireTLS=true)
      requireTLS: emailUseTls,
      auth: emailUser && emailPassword ? { user: emailUser, pass: emailPassword } : undefined,
    });

    this.logger.log('MailerService transporter created');

    // Verify connection immediately
    this.verifyConnection();

    // Load verification email template
    try {
      // Try dist first (production), then src (development)
      let templatePath = path.join(__dirname, 'templates', 'verification-email.template.html');
      if (!fs.existsSync(templatePath)) {
        templatePath = path.join(__dirname, '../../src/mailer/templates', 'verification-email.template.html');
      }
      if (fs.existsSync(templatePath)) {
        this.verificationTemplate = fs.readFileSync(templatePath, 'utf-8');
        console.log('📄 Verification email template loaded successfully');
      } else {
        console.warn('⚠️  Template file not found, using fallback template');
        this.verificationTemplate = null; // Will use fallback
      }
    } catch (error) {
      console.error('❌ Error loading verification email template:', error);
      this.logger.error('Failed to load verification email template', error);
    }
  }

  private async verifyConnection(): Promise<void> {
    try {
      console.log('🧪 Verifying SMTP connection on startup...');
      await this.transporter.verify();
      console.log('✅ SMTP connection verified on startup!');
      this.logger.log('SMTP connection verified successfully');
    } catch (error) {
      console.error('❌ SMTP connection failed on startup:', error);
      this.logger.error('SMTP connection verification failed', error);
    }
  }

  private renderTemplate(template: string | null, variables: Record<string, string>): string {
    // Fallback template if file not found
    if (!template) {
      const verificationLink = variables.verificationLink;
      const fullName = variables.fullName;
      return `
        <h2>Welcome to IBIL User Service</h2>
        <p>Hi ${fullName},</p>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${verificationLink}</p>
        <p>This link will expire in 24 hours.</p>
      `;
    }
    let html = template;
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      html = html.replace(new RegExp(placeholder, 'g'), value);
    });
    return html;
  }

  async sendVerificationEmail(email: string, fullName: string, token: string): Promise<void> {
    try {
      console.log(`\n📧 Preparing verification email for: ${email}`);
      console.log(`   Full Name: ${fullName}`);
      console.log(`   Token: ${token.substring(0, 16)}...`);
      this.logger.log(`Sending verification email to ${email}`);

      const base = this.configService.get<string>('APP_BASE_URL') || 'http://localhost:3001';
      const verificationLink = `${base}/api/v1/auth/verify-email?token=${token}`;
      console.log(`   Verification Link: ${verificationLink}`);

      const html = this.renderTemplate(this.verificationTemplate, {
        fullName: fullName || 'User',
        verificationLink,
      });

      const mailOptions = {
        from: this.configService.get<string>('MAIL_FROM') || 'no-reply@ibil.com',
        to: email,
        subject: 'Email Verification - IBIL User Service',
        html,
      };

      console.log(`📤 Sending email...`);
      console.log(`   From: ${mailOptions.from}`);
      console.log(`   To: ${email}`);
      console.log(`   Subject: ${mailOptions.subject}`);

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Verification email sent successfully via SendGrid!`);
      console.log(`   Message ID: ${info.messageId}`);
      console.log(`   Response: ${info.response}`);
      this.logger.log(`Email sent successfully. Message ID: ${info.messageId}`);
    } catch (error) {
      console.error(`\n❌ Error sending verification email to ${email}:`);
      console.error(`   Error Message: ${error.message}`);
      console.error(`   Error Code: ${error.code}`);
      console.error(`   Error Details:`, error);
      this.logger.error(`Failed to send verification email to ${email}`, error);
      throw error;
    }
  }

  async testConnection(): Promise<void> {
    try {
      console.log('🧪 Testing SMTP connection...');
      await this.transporter.verify();
      console.log('✅ SMTP connection verified successfully');
      this.logger.log('SMTP connection verified');
    } catch (error) {
      console.error('❌ SMTP connection failed:', error);
      this.logger.error('SMTP connection verification failed', error);
      throw error;
    }
  }
}
