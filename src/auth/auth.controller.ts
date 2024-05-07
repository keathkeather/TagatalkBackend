import { Body, Controller, Get, Post, Put, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './DTO/register.dto';
import { Auth, User } from '@prisma/client';
import { LocalGuard } from './guards/local.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { Request } from 'express';

import { GoogleAuthGuard } from './utils/GoogleGuards';

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
    async changePassowrd(@Req() req:Request ,@Body('newPassword') newPassword:string){
        return this.authService.changePassword(req,newPassword)
    }
    @Post('verifyToken')
    // @UseGuards(JwtAuthGuard)
    async verifyToken(@Req() req:Request){
        return this.authService.validateToken(req)
    }


    @Get('google/login')
    @UseGuards(GoogleAuthGuard)
    handlegooglelogin(){
        return {msg: 'Google Authentication'}

    }

    @Get('google/redirect')
    @UseGuards(GoogleAuthGuard)
    handleRedirect(){
        return {msg: "Ok"}

    }
  
}
