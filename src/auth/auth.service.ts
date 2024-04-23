import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Auth } from '@prisma/client';
import { RegisterDto } from './DTO/register.dto';
import * as bcrypt from 'bcrypt';
import { error } from 'console';
import { JwtService } from '@nestjs/jwt';
import { loginDto } from './DTO/login.dto';
import { Role } from './enums/role.enum';
@Injectable()
export class AuthService {
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
        role:Role.ADMIN 
      }

    })
  }  
  constructor(private prisma: PrismaService,private jwtService:JwtService) {}

    async RegisterUser(registerDto: RegisterDto): Promise<Auth> {
        const { email, password } = registerDto;
        if (!email || !password) {
            throw new BadRequestException('Email and password are required');
        }
        
        const saltedPassword = password + process.env.SALT //* Add the  salt to the password
        const hashedPassword = await bcrypt.hash(saltedPassword, 10); //* Hash the password with the salt
     
        try {
            const newUser = await this.prisma.auth.create({
                data: {
                    email,
                    encrypted_password: hashedPassword,
                    
                },
            });
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
        try {
          const saltedPassword = password+process.env.SALT; //* Add the salt to the password
          const match = await bcrypt.compare(password, user.encrypted_password); //* Compare the password with the encrypted password
          if (match) {
            return this.jwtService.sign({ email: user.email ,role:user.role}); //* Signs the token with the email and role of the user
          } else {
            throw new UnauthorizedException('Invalid password');
          }
        } catch (error) {
          throw new InternalServerErrorException('Failed to validate user');
        }
      }

      //* Validate admin credentials with promise of a string(token)
      async validateAdmin(email:string , password:string): Promise<String|null>{
        //*Find the admin through email
        const user =  await this.findAdminByEmail(email);
        if(!user){
          throw new BadRequestException('user not found')
        } 
        try{
          const saltedPassword= password+process.env.SALT; //*Add the salt to the password
          const match= await bcrypt.compare(saltedPassword, user.encrypted_password); //* Compare the password wit the encrypted password
          if(match){
            
            //* Signs the token with the email and role of the user
            return this.jwtService.sign({email:user.email, role:user.role})
        
          }else{
            
            throw new UnauthorizedException('Invalid password/email');
            
          }
        }catch(erorr){
          console.log(error)
          throw new InternalServerErrorException('failed to validate admin')
        }
    }
   
   

}
