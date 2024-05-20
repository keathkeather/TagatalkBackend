import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
@Injectable()
export class MailerService {
    private transporter;
    constructor() {
        console.log(process.env.EMAIL_USER);
        console.log(process.env.EMAIL_PASS);
        this.transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
      }
      async sendVerificationEmail(email: string, token: string) {
        const url = `http://${process.env.VERIFICATION_IP}:3000/auth/verify/${token}`;
    
        await this.transporter.sendMail({
          to: email,
          subject: 'Email Verification',
          html: `Click <a href="${url}">here</a> to verify your email.`,
        });
      }
      async sendOTPCOde(email: string, otp: string) {
        await this.transporter.sendMail({
          to: email,
          subject: 'OTP Verification',
          html: `Your OTP is ${otp}`,
        });
      }
    
}
