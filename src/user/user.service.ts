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
           
            if(!user){
               throw new UnauthorizedException('user not authorized')
            }
            if(!game){
                res.status(404).json({message:'game not found'})
            }
            
            // Check if the user has already completed the game
            const existingProgress = await this.prisma.user_Progress.findFirst({
              where: {
                userId: user.userId,
                gameId: game.id,
                isCompleted: true
              }
            });
    
            // If the user has already completed the game, return
            if (existingProgress) {
              return;
            }
    
            const userProgress = await this.prisma.user_Progress.updateMany({
                where: {
                  userId: user.userId,
                  gameId: game.id
                },
                data: {
                  isCompleted: true
                }
              });
    
            if(!userProgress){
                throw new Error('error in adding new progress')
            }
            res.status(200).json({
              message: 'Progress added successfully'
            });
        } catch (error) {
            res.status(500).json({
              message: 'An error occurred',
              error: error.message
            });
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
      async getUserCourseTree(request: Request, gameSkill: string) {
        try {
            const token = request.headers['authorization'].split(' ')[1];
            const decoded = this.jwtService.verify(token, { secret: process.env.SECRET_KEY });
            const user = await this.getUserById(decoded.authId);
    
            // Fetch the latest completed game for the user
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
    
            // Fetch games up to the next unit number
            const games = await this.prisma.game.findMany({
                where: {
                    gameUnitNumber: {
                        lte: nextUnitNumber
                    },
                    gameSkill: gameSkill
                },
                orderBy: {
                    gameLessonNumber: 'asc'
                },
                include: {
                    userProgress: true
                }
            });
    
            const courseTree = {};
    
            // Organize games into a course tree
            games.forEach(game => {
                if (!courseTree[game.gameUnitNumber]) {
                    courseTree[game.gameUnitNumber] = {
                        games: [],
                        isCompleted: true
                    };
                }
    
                courseTree[game.gameUnitNumber].games.push(game);
    
                const userProgress = game.userProgress.find(progress => progress.userId === user.userId);
                if (!userProgress || !userProgress.isCompleted) {
                    courseTree[game.gameUnitNumber].isCompleted = false;
                }
            });
    
            // Create course tree DTOs
            const courseTreeDTOs = [];
            for (const unitNumber in courseTree) {
                const unitGames = courseTree[unitNumber].games;
                const isCompleted = courseTree[unitNumber].isCompleted;
    
                unitGames.forEach(game => {
                    courseTreeDTOs.push({
                        gameUnit: game.gameUnit,
                        gameUnitNumber: game.gameUnitNumber,
                        gameLesson: game.gameLesson,
                        gameLessonNumber: game.gameLessonNumber,
                        isCompleted: isCompleted
                    });
                });
            }
    
            return courseTreeDTOs;
        } catch (error) {
            console.error('Error fetching games for user:', error);
            throw new InternalServerErrorException('Failed to get games for user');
        }
    }
      async getUserGamesPerLesson(request: Request, gameSkill: string) {
        try {
          const token = request.headers['authorization'].split(' ')[1];
          const decoded = this.jwtService.verify(token, { secret: process.env.SECRET_KEY });
          const user = await this.getUserById(decoded.authId);
      
          // Fetch all completed games for the user
          const completedGames = await this.prisma.user_Progress.findMany({
            where: {
              userId: user.userId,
              isCompleted: true
            },
            include: {
              game: true
            }
          });
      
          // Find the highest completed game unit number
          const highestCompletedUnitNumber = completedGames.length > 0
            ? Math.max(...completedGames.map(cg => cg.game.gameUnitNumber))
            : 0;
      
          const nextUnitNumber = highestCompletedUnitNumber + 1;
      
          // Fetch games for the next unit to be completed
          const nextUnitGames = await this.prisma.game.findMany({
            where: {
              gameUnitNumber: nextUnitNumber,
              gameSkill: gameSkill
            },
            orderBy: {
              gameLessonNumber: 'asc'
            }
          });
      
          // Combine the results: completed games and next unit games
          const combinedGames = [
            ...completedGames.map(cg => cg.game),
            ...nextUnitGames
          ];
      
          return combinedGames;
        } catch (error) {
          console.error('Error fetching games for user:', error);
          throw new InternalServerErrorException('Failed to get games for user');
        }
    }

    

      
}

