import { Body, Controller, Post } from '@nestjs/common';
import { MailerService } from './mailer.service';

@Controller('mailer')
export class MailerController {
    constructor(private readonly mailerService:MailerService) {}

    @Post('verification')
    async sendVerificationEmail(@Body('email') email:string , @Body('token') token:string){
        await this.mailerService.sendVerificationEmail(email, token);
    }
}
