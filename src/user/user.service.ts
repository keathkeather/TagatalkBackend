import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; 
import { Auth, User,Game,User_Progress } from '@prisma/client';
import { Request,Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { DeleteObjectCommand, GetObjectCommand, GetObjectCommandOutput, PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { userDto } from './DTO/user.dto';
import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GameService } from '../game/game.service';
import { courTreeDTO } from './DTO/courseTree.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { leaderboardDto } from './DTO/leaderboard.dto';

@Injectable()
export class UserService {
    constructor(private prisma:PrismaService, private authService:AuthService,private jwtService:JwtService){}

    private s3 = new S3({
        region: process.env.AWS_S3_REGION,
        credentials:{
            accessKeyId:process.env.AWS_ACCES_KEY,
            secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
        }
    })
   
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
                }
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
          
            if(file){
                if (user.profileImage) {
                    await this.s3.send(new DeleteObjectCommand({
                        Bucket: process.env.AWS_PROFILE_BUCKET_NAME,
                        Key: user.profileImage,
                    }));
                }
                const succesful = await this.s3.send(new PutObjectCommand({
                    Bucket:process.env.AWS_PROFILE_BUCKET_NAME,
                    Key:`profilePictures/${user.userId}/${file.originalname}`,
                    Body:file.buffer,
                    ContentDisposition: 'inline',
                    ContentType: 'image/jpeg'
                }))
                if(succesful){
                    const updateData: any = {};
                
                        if (username) {
                            updateData.name = username;
                        }
                
                        if (profileDescription) {
                            updateData.profileDescription = profileDescription;
                        }
                
                        updateData.profileImage = `profilePictures/${user.userId}/${file.originalname}`;
                
                        return this.prisma.user.update({
                            where:{
                                userId:user.userId
                            },
                            data: updateData
                        })
                }
            }else{
                const updateData: any = {};
                
                        if (username) {
                            updateData.name = username;
                        }
                
                        if (profileDescription) {
                            updateData.profileDescription = profileDescription;
                        }
                
                        updateData.profileImage = user.profileImage;
                
                        return this.prisma.user.update({
                            where:{
                                userId:user.userId
                            },
                            data: updateData
                        })
            }

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

        const getObjectParams = {
            Bucket: process.env.AWS_PROFILE_BUCKET_NAME,
            Key: user.profileImage,
        }
        const command = new GetObjectCommand(getObjectParams)
        const url = await getSignedUrl(this.s3,command,{expiresIn:3600})
        console.log(url)
        const userDTO: userDto={
            userId:user.userId,
            email:user.email,
            name:user.name,
            profileImage:url,
            profileDescription:user.profileDescription
        }
        return userDTO;
    }
    
    @OnEvent('points.added')
    async addUserPoints({userId,points}:{userId:string,points:number}){
        try{
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
                isAdmin:false
            },
            take:10
        })
        const leaderboardArray: leaderboardDto[] = leaderboard.map((user,index) => ({
            userId: user.userId,
            email: user.email,
            name: user.name,
            userPoints:user.userPoints,
            rank: index+1
        }));
    
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
}

