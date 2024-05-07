import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './DTO/register.dto';
import { Auth } from '@prisma/client';
import { LocalGuard } from './guards/local.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { Request } from 'express';
import { GoogleAuthGuard } from './utils/GoogleGuards';
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
        return req.user;
    }

    @Get('status')
    @UseGuards(JwtAuthGuard)
    status(@Req() req:Request){
        return req.user;
    }
    @Post('loginAdmin')
    @UseGuards(LocalGuard)
    async loginAdmin(@Req() req:Request){
        return req.user
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
