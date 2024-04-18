import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Auth } from '@prisma/client';
import { RegisterDto } from './DTO/register.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) {}

    async RegisterUser(registerDto: RegisterDto): Promise<Auth> {
        const { email, password } = registerDto;
        if (!email || !password) {
            throw new BadRequestException('Email and password are required');
        }
        // Validate email and password here if needed

        const hashedPassword = await bcrypt.hash(password, 10);
     
        try {
            // Create a new user record in the database
            console.log(email)
            console.log(hashedPassword)
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
}

