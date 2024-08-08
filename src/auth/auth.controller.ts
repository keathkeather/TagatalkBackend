import { BadRequestException, Body, Controller, Get, HttpException, HttpStatus, InternalServerErrorException, Logger, Param, Post, Put, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './DTO/register.dto';
import { Auth, User } from '@prisma/client';
import { LocalGuard } from './guards/local.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { Request, Response } from 'express';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import { adminGuard } from './guards/admin.guard';
import { ChangePasswordDto } from './DTO/changePassword.dto';
@Controller('v1/auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
       try{
        const result = await this.authService.RegisterUser(registerDto);
        return result;
       }catch(error){
            if(error instanceof BadRequestException){
            throw new HttpException(error.message,HttpStatus.BAD_REQUEST);
            }
            throw new HttpException(error.message,HttpStatus.INTERNAL_SERVER_ERROR);
            
       }
    }

    @Post('login')
    @UseGuards(LocalGuard)
    async login(@Req() req:Request,@Res() response:Response) {
        try{
            const result = req.user
            return response.status(HttpStatus.OK).json(result);   
        }
        catch(error){
            if (error instanceof BadRequestException){
                throw new HttpException(error.message,HttpStatus.BAD_REQUEST);
            }
            if (error instanceof UnauthorizedException){
                throw new HttpException(error.message,HttpStatus.UNAUTHORIZED);
            }
 
            throw new HttpException(error.message,HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
    }
    @Get('status')
    @UseGuards(JwtAuthGuard)
    status(@Req() req:Request){
        return req.user;
    }

    @Post('loginAdmin')
    @UseGuards(LocalGuard)
    async loginAdmin(@Req() req:Request,@Res() response:Response){
        try{
            const result = req.user
            return response.status(HttpStatus.OK).json(result);   
        }
        catch(error){
            if (error instanceof BadRequestException){
                throw new HttpException(error.message,HttpStatus.BAD_REQUEST);
            }
            if (error instanceof UnauthorizedException){
                throw new HttpException(error.message,HttpStatus.UNAUTHORIZED);
            }
            throw new HttpException(error.message,HttpStatus.INTERNAL_SERVER_ERROR);  
        }
    }

    @Put('changePassword')
    @UseGuards(JwtAuthGuard)
    async changePassword(@Req() req:Request,@Body() changePasswordDto:ChangePasswordDto){
        try{
            console.log(changePasswordDto);
            const result = await this.authService.changePassword(req,changePasswordDto);
            return result;
        }catch(error){
            if(error instanceof UnauthorizedException){
                throw new HttpException(error.message,HttpStatus.UNAUTHORIZED);
            }
            if(error instanceof BadRequestException){
                throw new HttpException(error.message,HttpStatus.BAD_REQUEST);
            }
            if(error instanceof InternalServerErrorException){
                throw new HttpException(error.message,HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    
    }

    @Get('verify/:token')
    async verify(@Param('token') token: string) {
        try{
            const result = await this.authService.verifyEmail(token);
            if (result!==null) {
                return result;
            }
        }catch(error){
            if(error instanceof UnauthorizedException){
                throw new HttpException(error.message,HttpStatus.UNAUTHORIZED);
            }
            if(error instanceof BadRequestException){
                throw new HttpException(error.message,HttpStatus.BAD_REQUEST);
            }
            if(error instanceof InternalServerErrorException){
                throw new HttpException("Failed to verify OTP",HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    @Post('requestOTP')
    async requestOTP(@Body('email') email: string) {
        try{
            const result = await this.authService.requestOTP(email);
            return result;
        }
        catch(error){
            if(error instanceof UnauthorizedException){
                throw new HttpException(error.message,HttpStatus.UNAUTHORIZED);
            }
            if(error instanceof BadRequestException){
                throw new HttpException(error.message,HttpStatus.BAD_REQUEST);
            }
            if(error instanceof InternalServerErrorException){
                throw new HttpException(error.message,HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    @Post('verifyOTP')
    async verifyOTP( @Body('OTP') otp: string,@Res() response:Response) {
        try{
            const result = await this.authService.verifyOTP(otp);
            return response.status(HttpStatus.OK).json(result);
        }catch(error){
            if(error instanceof UnauthorizedException){
                throw new HttpException(error.message,HttpStatus.UNAUTHORIZED);
            }
            throw new HttpException('Internal server error',HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put('forgotPassword')
    async forgotPassword(@Body('OTP')otp:string, @Body('newPassword') newPassword:string,response:Response){
        try{
            const result = await this.authService.forgotPassword(otp,newPassword)
            console.log(result)
            return response.status(HttpStatus.OK).json(result);
        }catch(error){
            if(error instanceof UnauthorizedException){
                throw new HttpException(error.message,HttpStatus.UNAUTHORIZED);
            }
            if(error instanceof BadRequestException){
                throw new HttpException(error.message,HttpStatus.BAD_REQUEST);
            }
            if(error instanceof InternalServerErrorException){
                throw new HttpException(error.message,HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    @Post('resendVerification')
    async resendVerification(@Body('email') email: string,@Res() response:Response) {
        try{
            const result = await  this.authService.resendVerificationCode(email);
            return response.status(HttpStatus.OK).json(result);
        }catch(error){
            if(error instanceof UnauthorizedException){
                throw new HttpException(error.message,HttpStatus.UNAUTHORIZED);
            }
            if(error instanceof BadRequestException){
                throw new HttpException(error.message,HttpStatus.BAD_REQUEST);
            }
            if(error instanceof InternalServerErrorException){
                throw new HttpException(error.message,HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    @Post('admin/verifyToken')
    async verifyAdminToken(@Req() request: Request, @Res() response: Response) {
        try {
          const result = await this.authService.verifyAdminToken(request);
          return response.status(HttpStatus.OK).json(result);
        } catch (error) {
          if (error instanceof UnauthorizedException) {
            throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
          }
          throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    @Post('admin/login')
    @UseGuards(adminGuard)
    async adminLogin(@Req() req:Request,@Res() response:Response) {
        try{
            const result =  req.user;
            return response.status(HttpStatus.OK).json(result);
        }
        catch(error){
            if(error instanceof UnauthorizedException){
               throw new HttpException(error.message,HttpStatus.UNAUTHORIZED);
            }
            if(error instanceof BadRequestException){
               throw new HttpException(error.message,HttpStatus.BAD_REQUEST);
            }
            if(error instanceof InternalServerErrorException){
                throw new HttpException(error.message,HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    @Post('admin/register')
    async adminRegister(@Body() registerDto: RegisterDto,@Res() response:Response){ 
        try{
                const result = await this.authService.generateAdminAccount(registerDto);
                return response.status(HttpStatus.OK).json(result);
        }catch(error){
                    if(error instanceof BadRequestException){
                    throw new HttpException(error.message,HttpStatus.BAD_REQUEST);
                    }
                    if(error instanceof InternalServerErrorException){
                        throw new HttpException(error.message,HttpStatus.INTERNAL_SERVER_ERROR);
                    }
        }
    }
    

}
