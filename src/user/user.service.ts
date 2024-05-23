import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
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

@Injectable()
export class UserService {
    constructor(private prisma:PrismaService, private authService:AuthService,private jwtService:JwtService,private gameService: GameService){}

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
    //TODO getUSER DATA using jwt token and return user dtothrough dto make sure profilePicture link is active url
    async getUserData(request:Request){
        console.log(request.headers['authorization'].split(' ')[1])
        const decoded = this.jwtService.verify(request.headers['authorization'].split(' ')[1],{ secret: process.env.SECRET_KEY });
        const user = await this.getUserById(decoded.authId); 
        if(!user){
            throw new Error('User not found')
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
    async addUserProgress(request:Request,gameID:string,res:Response){
        try{
            const decoded = this.jwtService.verify(request.headers['authorization'].split(' ')[1],{ secret: process.env.SECRET_KEY });
            const user = await this.getUserById(decoded.authId); 
            const game = await this.gameService.getGameByID(gameID)
            console.log(user)
            console.log(game)
           
            if(!user){
               throw new UnauthorizedException('user not authorized')
            }
            if(!game){
                res.status(404).json({message:'game not found'})
            }
            
            const userProgress = await this.prisma.user_Progress.create({
                data:{
                    userId:user.userId,
                    gameId:game.id,
                    isCompleted:true
                }
            })
            console.log(userProgress)
            if(!userProgress){
                throw new Error('error in adding new progress')
            }
            res.status(200).json({
                message: 'user progress added',
            });
        }catch(error){
            console.log(error)
        }
    }
    // async getGameProgress(request:Request, response:Res)
    async addAllGamesToUserProgress(userId:string){
        try{
            const games = await this.gameService.getAllGames();
            const data = games.map(game=>({
                userId: userId,
                gameId: game.id,
                isCompleted:false
            }))
            const succesful = await this.prisma.user_Progress.createMany({
                data:data
            })
            if(!succesful){
                return new Error('error in creating game')
            }
            }catch(error){
                console.log(error)
                throw new InternalServerErrorException('error in adding all games to userprogress')
        }
    }
    async getGameForUser(request: Request,gameSkill:string){
        try {
          // Decode the JWT to get the user ID
          console.log(request)
          const decoded = this.jwtService.verify(request.headers['authorization'].split(' ')[1],{ secret: process.env.SECRET_KEY });
          const user = await this.getUserById(decoded.authId); 
          console.log(user.userId)
          // Find the highest gameUnitNumber that the user has completed
          const latestCompletedGame = await this.prisma.user_Progress.findFirst({
            where: {
              userId: user.userId,
              isCompleted: true
            },
            orderBy: {
              game: {
                gameUnitNumber: 'desc'
              }
            },
            include: {
              game: true
            }
          });
      
          // If the user hasn't completed any games, start with unit 1
          const nextUnitNumber = latestCompletedGame ? latestCompletedGame.game.gameUnitNumber + 1 : 1;
      
          // Fetch all games up to the next unit number
          const games = await this.prisma.game.findMany({
            where: {
              gameUnitNumber: {
                lte: nextUnitNumber
              },
              gameSkill:gameSkill
            }
          });
      
          return games;
        } catch (error) {
          console.error('Error fetching games for user:', error);
          throw new InternalServerErrorException('Failed to get games for user');
        }
      }
    async getUserCourseTree(request:Request,gameSkill:string){
        try{
          const decoded = this.jwtService.verify(request.headers['authorization'].split(' ')[1],{ secret: process.env.SECRET_KEY });
          const user = await this.getUserById(decoded.authId); 
          const latestCompletedGame = await this.prisma.user_Progress.findFirst({
            where: {
              userId: user.userId,
              isCompleted: true
            },
            orderBy: {
              game: {
                gameUnitNumber: 'desc'
              }
            },
            include: {
              game: true
            }
          });
      
          // If the user hasn't completed any games, start with unit 1
          const nextUnitNumber = latestCompletedGame ? latestCompletedGame.game.gameUnitNumber + 1 : 1;
      
          // Fetch the first game for each gameLessonNumber up to the next unit number
          const games = await this.prisma.game.findMany({
            where: {
              gameUnitNumber: {
                lte: nextUnitNumber
              }
            },
            orderBy: {
              gameLessonNumber: 'asc'
            },
            distinct: ['gameLessonNumber']
          });
      
          const courTreeDTOs = games.map(game => new courTreeDTO({
            gameUnit: game.gameUnit,
            gameUnitNumber: game.gameUnitNumber,
            gameLesson: game.gameLesson,
            gameLessonNumber: game.gameLessonNumber
          }));
      
          return courTreeDTOs;
        } catch (error) {
          console.error('Error fetching games for user:', error);
          throw new InternalServerErrorException('Failed to get games for user');
        }
      }
       
    
    
    
}

