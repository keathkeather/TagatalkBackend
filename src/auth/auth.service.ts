import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; 
import { Auth,Game } from '@prisma/client';
import { RegisterDto } from './DTO/register.dto';
import * as bcrypt from 'bcrypt';
import { error } from 'console';
import { JwtService } from '@nestjs/jwt';
import { loginDto } from './DTO/login.dto';
import { Role } from './enums/role.enum';
import e, { Request, Response } from 'express';
import * as crypto from 'crypto';
import { MailerService } from '../mailer/mailer.service';
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService,private jwtService:JwtService , private mailerService:MailerService) {}
  //* Find the user through the email (Queries the database for the user with the email provided)
  async findByEmail(email: string): Promise<Auth | null> {
      return this.prisma.auth.findUnique({
          where:{
              email:email
          }
      });
  }
  //* find the admin through the email (Queries the database for the admin with the email provided)
  async findAdminByEmail(email:string):Promise<Auth|null>{
    return this.prisma.auth.findUnique({
      where:{
        email:email,
        role:Role.ADMIN ,
        is_super_admin:true
      }

    })
  }  
  
  async findUserByPassword(password:string):Promise<Auth|null>{
    const encryptedPassword = await this.encryptPassword(password)
    return this.prisma.auth.findFirst({
      where:{
        encrypted_password:encryptedPassword
      }
    })
  }
  async getAllBannedUsers():Promise<Auth[]|null>{
    try{
      return this.prisma.auth.findMany({
        where:{
          banned_until:{
            not:null
          }
        }
      });
    }catch(Error){
      throw Error('Failed to get all banned users');
    }
  }
  async getUserByID(userId:string):Promise<Auth|null>{
    try{
      return this.prisma.auth.findUnique({
        where:{
          authId:userId
        }
      })
    }catch(Error){
      throw Error('Failed to get user by ID')
    }
  }



  async encryptPassword(password:string):Promise<string|null>{
    const saltedPassword = password+process.env.SALT
    return await bcrypt.hash(saltedPassword,10)
  }

  async verifyEmail(token:string){
    try{
      const user = await  this.prisma.auth.findUnique({
        where:{
          confirmation_token:token
        }
      });
      if(!user){
        throw new BadRequestException('Invalid token')
      }
      if(user.confirmed_at){
        throw new BadRequestException('User already verified')
      }
      const updatedUser = await this.prisma.auth.update({
        where:{
          authId:user.authId
        },
        data:{
          email_confirmed_at:new Date()
        }
      });
      const games = await this.prisma.game.findMany();
      const data = games.map(game=>({
        userId: updatedUser.authId,
        gameId: game.id,
        isCompleted:false
    }))
    const succesful = await this.prisma.user_Progress.createMany({
        data:data
    })
    if(!succesful){
        return new Error('error in creating game')
    }
      if(!updatedUser){
        throw new InternalServerErrorException('Failed to verify email')
      }
      
    

    }catch(error){
      console.log(error)
      throw new InternalServerErrorException('Failed to verify email')
    
    }
  }
    
  async RegisterUser(registerDto: RegisterDto): Promise<Auth> {
    const { email, password } = registerDto;
    if (!email || !password) {
        throw new BadRequestException('Email and password are required');
    }
    
    const saltedPassword = password + process.env.SALT //* Add the  salt to the password
    const hashedPassword = await bcrypt.hash(saltedPassword, 10); //* Hash the password with the salt
    const emailToken = crypto.randomBytes(20).toString('hex');
    console.log(emailToken)
    try {
        const newUser = await this.prisma.auth.create({
            data: {
                email,
                encrypted_password: hashedPassword,
                confirmation_token:emailToken,
                confirmation_sent_at: new Date(),
            },
        });
        console.log(newUser.confirmation_token)
        const username = email.split('@')[0];
        await this.prisma.user.update({
          where:{
            userId:newUser.authId
          },data:{
            name : username
          }
        })
        await this.mailerService.sendVerificationEmail(email, emailToken);
        return newUser;
        
    } catch (error) {
        console.log(error);
        throw new BadRequestException('Failed to register user');
    }
}





//* Validate user credentials with promise of a sttring(token)
async validateUser( email:string, password:string): Promise<String | null> {
    
    //* Find the user through emal  
    const user = await this.findByEmail(email);
    //* if user is nto found throw an Error 
    if (!user) {
      throw new BadRequestException('user not found');
    }
    if(user.email_confirmed_at===null){
      throw new UnauthorizedException('Email not verified')
    }
    try {
      const saltedPassword = password+process.env.SALT; //* Add the salt to the password
      const match = await bcrypt.compare(saltedPassword, user.encrypted_password); //* Compare the password with the encrypted password
      if (match) {
        return this.jwtService.sign({ email: user.email ,role:user.role,authId: user.authId}); //* Signs the token with the email and role of the user
      } else {
        throw new UnauthorizedException('Invalid password/email');
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to validate user');
    }
  }

  //* Validate admin credentials with promise of a string(token)
  async validateAdmin(email: string, password: string): Promise<string | null> {
    try {
      const user = await this.findAdminByEmail(email);
      if (!user || !user.is_super_admin) {
        throw new UnauthorizedException('Unauthorized');
      }

      const saltedPassword = password + process.env.SALT;
      const match = await bcrypt.compare(saltedPassword, user.encrypted_password);
      if (match) {
        return this.jwtService.sign({ email: user.email, role: user.role, authId: user.authId, isSuperAdmin: user.is_super_admin});
      } else {
        throw new UnauthorizedException('Unauthorized');
      }
    } catch (error) {
      //* If the error is an UnauthorizedException, rethrow it
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      //* Log the error and throw InternalServerErrorException for other types of errors
      console.error(error);
      throw new InternalServerErrorException('Failed to validate admin');
    }
  }
  
  async changePassword(request:Request, newPassword:string,oldPassword:string):Promise<Auth|null>{
    try{
      const decoded = this.jwtService.verify(request.headers['authorization'].split(' ')[1],{ secret: process.env.SECRET_KEY });
      const userEmail = decoded.email;
      const user = await this.findByEmail(userEmail);
      
      if(!user){
        throw new BadRequestException('User not found');
      }
      const saltedOldPassword = oldPassword+process.env.SALT;
      const match = await bcrypt.compare(saltedOldPassword, user.encrypted_password);
      if(!match){
        throw new UnauthorizedException('Invalid password');
      }
      
      console.log(newPassword)
      const saltedPassword = (newPassword as string) + process.env.SALT;
      const newEncryptedPassword = await bcrypt.hash(saltedPassword, 10);
  
      const updatedUser = await this.prisma.auth.update({
        where:{
          authId: user.authId
        },
        data:{
          encrypted_password: newEncryptedPassword
        }
      });
  
      return updatedUser;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
  async verifyAdminToken(request:Request,Response:Response){
    try{
      const decoded = this.jwtService.verify(request.headers['authorization'].split(' ')[1],{ secret: process.env.SECRET_KEY });
      const isSuperAdmin = decoded.isSuperAdmin;
      console.log(decoded.isSuperAdmin)
      if(isSuperAdmin==false||isSuperAdmin==null||isSuperAdmin==undefined){
        throw new UnauthorizedException('Unauthorized')
      }
      if(decoded){
        Response.status(200).json({
          message:'Token is valid'
        })
      }
      ;
    }catch(error){
      console.log(error)
      throw new UnauthorizedException('Invalid token')
    }
  }
  async refreshToken(request:Request):Promise<string|null>{
    try{
      const decoded = this.jwtService.verify(request.headers['authorization'].split(' ')[1],{ secret: process.env.SECRET_KEY });
      return this.jwtService.sign({email:decoded.email,role:decoded.role,authId:decoded.authId})
    }catch(error){
      console.log(error)
      throw new UnauthorizedException('Invalid token')
    } 
  }
  async resendVerificationCode(email:string){
    try{
      const user = await this.findByEmail(email);
      console.log(user);
      if(!user){
        throw new BadRequestException('Email not found')
      }
      if(user.email_confirmed_at){
        throw new UnauthorizedException('Email already verified')
      }
      const emailToken = crypto.randomBytes(20).toString('hex');
      const updatedUser = await this.prisma.auth.update({
        where:{
          authId:user.authId
        },
        data:{
          confirmation_token:emailToken,
          confirmation_sent_at: new Date()
        }
      });
      if(!updatedUser){
        throw new InternalServerErrorException('Failed to resend verification code')
      }
      await this.mailerService.sendVerificationEmail(email,emailToken)
    }catch(error){
      console.log(error)
      throw new InternalServerErrorException('Failed to resend verification code')
    }
  }


  async requestOTP(email:string){
    try{
      const user = await this.findByEmail(email);
      if(!user){
        throw new BadRequestException('Email not  found')
      }
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const succesful =   await this.prisma.auth.update({
        where:{
          authId: user.authId
        },
        data:{
          recovery_sent_at: new Date(),
          recovery_token: otp
        }
      });
      if(!succesful){
        throw new InternalServerErrorException('Failed to request OTP')
      }
      await this.mailerService.sendOTPCOde(email,otp)
      
    }catch(error){
      console.log(error)
      throw new InternalServerErrorException('Failed to request OTP')
    }
  }
  async verifyOTP(otp: string, res: Response) {
    try {
      const user = await this.prisma.auth.findUnique({
        where: {
          recovery_token: otp,
        },
      });

      if (!user) {
        throw new BadRequestException('Invalid OTP');
      }

      res.status(200).json({
        message: 'OTP verified',
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to verify OTP');
    }
  }
  async forgotPassword(otp:string,newPassword:string,res:Response){
    const user = await  this.prisma.auth.findUnique({
      where:{
        recovery_token:otp
      }
    });
    if(!user){
      throw new BadRequestException('Invalid OTP')
    }
    console.log(newPassword)
    const saltedPassword = (newPassword as string) + process.env.SALT;
    const newEncryptedPassword = await bcrypt.hash(saltedPassword, 10);

    const updatedUser = await this.prisma.auth.update({
      where:{
        authId: user.authId
      },
      data:{
        encrypted_password: newEncryptedPassword,
        recovery_token:null
      }
    });
    if(!updatedUser){
      throw new InternalServerErrorException('Failed to update password')
    }
    res.status(200).json({
      message:'Password updated'
    })
  }
}

