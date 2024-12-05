import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; 
import { Auth, User,Game,User_Progress } from '@prisma/client';
import { Request,Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { DeleteObjectCommand, GetObjectCommand, GetObjectCommandOutput, PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { userDto } from './DTO/user.dto';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { OnEvent } from '@nestjs/event-emitter';
import { leaderboardDto } from './DTO/leaderboard.dto';
import * as sharp from 'sharp';
import { S3Service } from '../s3/s3.service';
@Injectable()
export class UserService {
    logger: Logger;

    constructor(private prisma:PrismaService, private authService:AuthService,private jwtService:JwtService,private s3Service:S3Service){
        this.logger = new Logger('userService');
    }

   
    async getAllUser():Promise<User[]|null>{
        try{
            return this.prisma.user.findMany();
        }catch(Eror){
            throw new Error('failed to get all users')
        }
    }
    async getUserById(id:string):Promise<User|null>{
        try{
            const user = await this.prisma.user.findUnique({
                where:{
                    userId:id
                },
                
            })
            if(!user){
                return null
            }else{
                return user
            }
        }catch(Error){
            throw new Error('failed to get user by id')
        }
    }
  
    async getUserByEmail(email:string):Promise<User|null>{
        try{
            return this.prisma.user.findUnique({
                where:{
                    email:email
                }
            })
        }catch(Error){
            throw new Error('failed to get user by email')
        }
    }
    async addUserName(request:Request,username: string){
        try{
            console.log(username)
            const userEmail = (request.user as User).email;
            
            const user = await  this.authService.findByEmail(userEmail);
            console.log(user)
            return this.prisma.user.update({
                where:{
                    userId:user.authId
                },
                data:{
                    name:username
                }
            })
        } catch(error) {
            console.log(error.stack)
            throw new Error('Failed to create user name');
        }
    }
    async editUserProfile(file: Express.Multer.File,request:Request,username:string, profileDescription:string){
        try{
            const userId = (request.user as Auth).authId;
            const user =  await this.getUserById(userId)    
        
            const updateData:any ={
                name:username || user.name,
                profileDescription:profileDescription || user.profileDescription,
                profileImage: user.profileImage
            }
            
            if(file){
                if(user.profileImage){
                    await this.s3Service.deleteObject(process.env.AWS_PROFILE_BUCKET_NAME,user.profileImage);
                    const thumbnail = user.profileImage.replace(`${user.userId}`, `${user.userId}/thumbnail`);
                    await this.s3Service.deleteObject(process.env.AWS_PROFILE_BUCKET_NAME,thumbnail);
                }
                await this.s3Service.uploadProfileImage(file,userId,process.env.AWS_PROFILE_BUCKET_NAME);
                updateData.profileImage = `profilePictures/${user.userId}/${file.originalname}`;   
            }
            const succesful =  await this.prisma.user.update({
                where:{
                    userId:user.userId
                },
                data:updateData
            })
            if(!succesful){
                throw new Error('failed to edit user profile')
            }
            return {message: 'Profile updated succesfully'}
        }catch(error){
            console.log(error.stack)
            throw new Error('Failed to edit user profile')
        }
    }

    async getUserData(request:Request){
        const decoded = this.jwtService.verify(request.headers['authorization'].split(' ')[1],{ secret: process.env.SECRET_KEY });
        const user = await this.getUserById(decoded.authId); 
        if(!user){
            throw new BadRequestException('user not found')
        }
        
        if(user.profileImage === null){
            const userDTO: userDto={
                userId:user.userId,
                email:user.email,
                name:user.name,
                profileImage:null,
                profileDescription:user.profileDescription
            }
            return userDTO;
        }

        const profileUrl = await this.s3Service.getSignedUrl(process.env.AWS_PROFILE_BUCKET_NAME,user.profileImage);

        //TODO might want to add userThumbnail to userDTO ask for resolution
        const userDTO: userDto={
            userId:user.userId,
            email:user.email,
            name:user.name,
            profileImage:profileUrl,
            profileDescription:user.profileDescription
        }

        return userDTO;
    }
    
    @OnEvent('ADDPOINTS')
    async addUserPoints({userId,points}:{userId:string,points:number}){
        try{
            this.logger.log('running the event')
            this.logger.log(userId)
            this.logger.log(points)
            const user = await this.getUserById(userId);

            if(!user){
                throw new Error('user not found')
            }
            console.log("runing the evnt")
            return this.prisma.user.update({
                where:{
                    userId:user.userId
                },data:{
                    userPoints:user.userPoints + points
                }
                
            })
        }catch(error){
            throw new Error('failed to add user points')
        }
    } 
    
    async getLeaderBoard(){
       const leaderboard = await this.prisma.user.findMany({
            orderBy:{
                userPoints:'desc'
            },
            where:{
                isAdmin:false,
                auth:{
                    banned_until:null,
                    OR: [
                        { is_super_admin: null },
                        { is_super_admin: false }
                    ]
<<<<<<< HEAD
                    
                },
                isDeleted:false
=======

                }
>>>>>>> 3d4f037d07ac7182b921c002ce20765e8b74030a
            },
           
            take:10
        })
        
        const leaderboardArray: leaderboardDto[] = [];
        for (const [index, user] of leaderboard.entries()) {
            const userId = user.userId;
            let thumbnailUrl: string;
            if(user.profileImage){
                const originalProfileImage = user.profileImage;
                const thumbnailProfileImage = originalProfileImage.replace(`profilePictures/${userId}/`, `profilePictures/${userId}/thumbnail/`);
                thumbnailUrl = await this.s3Service.getSignedUrl(process.env.AWS_PROFILE_BUCKET_NAME,thumbnailProfileImage);
            }else{
                thumbnailUrl = '';
            }

            leaderboardArray.push({
                userId: user.userId,
                userProfileImage: thumbnailUrl,
                name: user.name,
                userPoints:user.userPoints,
                rank: index+1
            });
        }
        return leaderboardArray;
              
    }
    async getUserRank(request:Request){
        const decoded = this.jwtService.verify(request.headers['authorization'].split(' ')[1],{ secret: process.env.SECRET_KEY });
        const user = await this.getUserById(decoded.authId); 
        if(!user){
            throw new BadRequestException('user not found')
        }

        const rank = await this.calculateUserRank(user.userId);
        return rank;
        
    }
    async calculateUserRank(userId: string): Promise<number> {
        try {
            const result = await this.prisma.$queryRaw`
               SELECT rank from UserRankView WHERE "userId"::text = ${userId}
            `;
            return result[0]?.rank || 0;
        } catch (error) {
            console.log(error);
            throw new Error('Failed to calculate user rank');
        }
    }

    @OnEvent('USER_LOGGED_IN')
    async setLastLogin({userId}:{userId:string}){
        try{
            return this.prisma.user.update({
                where:{
                    userId:userId
                },
                data:{
                    lastLogin:new Date()
                }
            })
        }catch(error){
            throw new Error('failed to set last login')
        }
    }

   
    
}

