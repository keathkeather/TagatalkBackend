import { Body, Controller, Get, Param, Post, Put, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './DTO/register.dto';
import { Auth, User } from '@prisma/client';
import { LocalGuard } from './guards/local.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { Request, Response } from 'express';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Post('register')
    async register(@Body() registerDto: RegisterDto): Promise<Auth> {
        return this.authService.RegisterUser(registerDto);
    }
    @Post('login')
    @UseGuards(LocalGuard)
    async login(@Req() req:Request) {
        try{
            return req.user;
        
        }
        catch(error){
           
            console.log(error)
            
        }
        
    }

    @Get('status')
    @UseGuards(JwtAuthGuard)
    status(@Req() req:Request){
        const userEmail = (req.user as User).email;
        console.log('User Email:', userEmail);
        return req.user;
    }
    @Post('loginAdmin')
    @UseGuards(LocalGuard)
    async loginAdmin(@Req() req:Request){
        return req.user
    }
    @Put('changePassword')
    @UseGuards(JwtAuthGuard)
    async changePassword(@Req() req:Request,@Body('newPassword') newPassword:string,@Body('oldPassword') oldPassword:string){
        return this.authService.changePassword(req,newPassword,oldPassword)
    }
    @Get('verify/:token')
    async verify(@Param('token') token: string) {
        const result = await this.authService.verifyEmail(token);
        if (result!==null) {
            return 'Email verified successfully';
        }

    }

    @Post('requestOTP')
    async requestOTP(@Body('email') email: string) {
        return this.authService.requestOTP(email);
    }

    @Post('verifyOTP')
    async verifyOTP( @Body('OTP') otp: string,@Res() Res:Response) {
        return this.authService.verifyOTP(otp,Res);
    }
    @Put('forgotPassword')
    async forgotPassword(@Body('OTP')otp:string, @Body('newPassword') newPassword:string,@Res() Res:Response){
        return this.authService.forgotPassword(otp,newPassword,Res)
    }
    @Post('resendVerification')
    async resendVerification(@Body('email') email: string) {
        return this.authService.resendVerificationCode(email);
    }

    

}
