import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; 
import { Auth,Game } from '@prisma/client';
import { RegisterDto } from './DTO/register.dto';
import * as bcrypt from 'bcrypt';
import { error } from 'console';
import { JwtService } from '@nestjs/jwt';
import { loginDto } from './DTO/login.dto';
import e, { Request, Response } from 'express';
import * as crypto from 'crypto';
import { MailerService } from '../mailer/mailer.service';
import { Role } from './enums/role.enum';
import { ChangePasswordDto } from './DTO/changePassword.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService:JwtService , 
    private mailerService:MailerService,
    @Inject(forwardRef(() => EventEmitter2))
    private readonly eventEmitter: EventEmitter2,
  ) {}
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
  async findContentEditorByEmail(email:string):Promise<Auth|null>{
    try{
      return this.prisma.auth.findFirst({
        where:{
          email:email,
          role:Role.CONTENT_EDITOR
        }
      })      
    }catch(error){
      console.log(error)
      throw new InternalServerErrorException('Failed to find content editor by email')
    }
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
          email_confirmed_at:new Date(),
          confirmation_token:null
        }
      });
      if(!updatedUser){
        throw new InternalServerErrorException('Failed to verify email')
      }
      
    
      return {message: 'Email verified succesfully'}
    }catch(error){
      console.log(error)
      throw new InternalServerErrorException('Failed to verify email')
    
    }
  }
    
  async RegisterUser(registerDto: RegisterDto) {
    const { email, password } = registerDto;
    if (!email || !password) {
        throw new BadRequestException('Email and password are required');
    }
    const saltedPassword = password + process.env.SALT //* Add the  salt to the password
    const hashedPassword = await bcrypt.hash(saltedPassword, 10); //* Hash the password with the salt
    const emailToken = crypto.randomBytes(20).toString('hex');
    console.log(emailToken)
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
        return {message: 'User registered'}; 
}

async generateAdminAccount(registerDto:RegisterDto){
  
    const {email,password} = registerDto;
    const saltedPassword = password+process.env.SALT;
    const hashedPassword = await bcrypt.hash(saltedPassword,10);
    const newUser = await this.prisma.auth.create({
      data:{
        email,
        encrypted_password:hashedPassword,
        role:Role.ADMIN,
        is_super_admin:true,
      },
      include:{
        user:true
      }
      
    });
    const updated =await this.prisma.user.update({
      where:{
        userId:newUser.authId
      },
      data:{
        isAdmin:true,
      }
    })
    if(!newUser && !updated){
      throw new InternalServerErrorException('Failed to create admin account')
    }
    return {message: 'Admin account created'}
}




//* Validate user credentials with promise of a sttring(token)
async validateUser( email:string, password:string): Promise<{token:string} | null> {
    //* Find the user through email  
    const user = await this.findByEmail(email);
    //* if user is nto found throw an Error 
    if (!user) {
      throw new BadRequestException('user not found');
    }
    if(user.email_confirmed_at===null){
      throw new UnauthorizedException('Email not verified')
    }
  
      const saltedPassword = password+process.env.SALT; //* Add the salt to the password
      const match = await bcrypt.compare(saltedPassword, user.encrypted_password); //* Compare the password with the encrypted password
      if (match) {
        const token =  this.jwtService.sign({ email: user.email ,role:user.role,authId: user.authId},{expiresIn: '30d'}); //* Signs the token with the email and role of the user
        this.eventEmitter.emit('USER_LOGGED_IN', { userId: user.authId });
        return {token:token};
      } else {
        throw new UnauthorizedException('Invalid password/email');
      }
  }

  //* Validate admin credentials with promise of a string(token)
  async validateAdmin(email: string, password: string): Promise<{ token: string } | null> {
      const user = await this.findAdminByEmail(email);
      if (!user || !user.is_super_admin) {
        throw new UnauthorizedException('Unauthorized');
      }

      const saltedPassword = password + process.env.SALT;
      const match = await bcrypt.compare(saltedPassword, user.encrypted_password);
      if (match) {
         const token = this.jwtService.sign({ email: user.email, role: user.role, authId: user.authId, isSuperAdmin: user.is_super_admin},{expiresIn: '1h'});
         return {token:token};
      } else {
        throw new UnauthorizedException('Admin Password/Email is invalid');
      }
  }

  async validateContentEditor(email:string, password:string):Promise<string|null>{
    try{
      const user = await this.findContentEditorByEmail(email);
      if(!user){
        throw new UnauthorizedException('Unauthorized')
      }
      const saltedPassword = password+process.env.SALT;
      const match = await bcrypt.compare(saltedPassword, user.encrypted_password);
      if(match){
        return this.jwtService.sign({email:user.email,role:user.role,authId:user.authId})
      }else{
        throw new UnauthorizedException('Unauthorized')
      }
    }catch(error){
      console.error(error);
      throw new InternalServerErrorException('Failed to validate content editor')
    }
  }
  
  async changePassword(request:Request, changePasswordDto:ChangePasswordDto){
      const {oldPassword,newPassword} = changePasswordDto;
      console.log(oldPassword)
      console.log(newPassword)
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
      if(!updatedUser){
        throw new InternalServerErrorException('Failed to update password')
      }
      await this.mailerService.sendPasswordChangeNotification(userEmail)
      return {message: 'Password updated'};
     
  }
  async verifyAdminJwtTokenForGuard( request:Request){
    try{
      const decoded = this.jwtService.verify(request.headers['authorization'].split(' ')[1],{ secret: process.env.SECRET_KEY });
      const isSuperAdmin = decoded.isSuperAdmin;
      console.log(decoded.isSuperAdmin)
      if(isSuperAdmin==false||isSuperAdmin==null||isSuperAdmin==undefined){
        throw new UnauthorizedException('Unauthorized')
      }
      return decoded.authId
    }catch(Error){
      throw new UnauthorizedException('invalid token')
    }
  }
  async verifyAdminToken(request: Request) {
    try {
      const token = request.headers['authorization'].split(' ')[1];
      const decoded = this.jwtService.verify(token, { secret: process.env.SECRET_KEY });
      const isSuperAdmin = decoded.isSuperAdmin;

      if (!isSuperAdmin) {
        throw new UnauthorizedException('Unauthorized');
      }

      return { message: 'Token is valid' };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
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

  async adminRefreshToken(request:Request):Promise<string|null>{
    try{
      const decoded = this.jwtService.verify(request.headers['authorization'].split(' ')[1],{ secret: process.env.SECRET_KEY });
      return this.jwtService.sign({email:decoded.email,role:decoded.role,authId:decoded.authId,isSuperAdmin:decoded.isSuperAdmin})
    }catch(error){
      console.log(error)
      throw new UnauthorizedException('Invalid token')
    }
  }

  async resendVerificationCode(email:string){
      const user = await this.findByEmail(email);
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
      return {message: 'Verification code sent'}
  }


  async requestOTP(email:string){
      const user = await this.findByEmail(email);
      console.log(user)
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
      return {message: 'OTP sent'}  
  }

  async verifyOTP(otp: string) {
      const user = await this.prisma.auth.findUnique({
        where: {
          recovery_token: otp,
        },
      });

      if (!user) {
        throw new BadRequestException('Invalid OTP');
      }
      return {message: 'OTP verified'};
  
  }
  async forgotPassword(otp:string,newPassword:string){
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
    await this.mailerService.sendPasswordChangeNotification(user.email)
    return {message: 'Password updated'}
  }
}


