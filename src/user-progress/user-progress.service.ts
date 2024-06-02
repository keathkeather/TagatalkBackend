import { Inject, Injectable, InternalServerErrorException, UnauthorizedException, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { GameService } from '../game/game.service';
import { Request,Response } from 'express';
import { Auth, Game } from '@prisma/client';
import { UnitService } from '../unit/unit.service';

@Injectable()
export class UserProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(()=>UserService)) private readonly userService: UserService, // Include UserService
    @Inject(forwardRef(()=>GameService)) private readonly gameService: GameService, // Include GameService
    @Inject(forwardRef(() => UnitService)) private readonly unitService: UnitService,
  ) {}
    async addUserProgress(request:Request, gameId:string, response:Response){
        try{
            const decoded = this.jwtService.verify(request.headers['authorization'].split(' ')[1],{ secret: process.env.SECRET_KEY });
            const user = await this.userService.getUserById(decoded.authId); 
            const game = await this.gameService.getGameByID(gameId);
            
            if(!game){
                response.status(404).json('game not found');
            }
            if(!user){
                throw new UnauthorizedException('user not found');
            }
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
            await this.prisma.user.update({
                where: {
                  userId: user.userId
                },
                data: {
                  userPoints: user.userPoints + game.gameValue
                }                
              })
              if(!userProgress){
                throw new Error('error in adding new progress')
            }
            response.status(200).json({
              message: 'Progress added successfully'
            });
        }catch(error){
            console.log(error.stack)
            throw new InternalServerErrorException('failed to add user progress');
        }
    }
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
    async getLatestCompletedLesson(request:Request){
        try{
            const decoded = this.jwtService.verify(request.headers['authorization'].split(' ')[1],{ secret: process.env.SECRET_KEY });
            const user = await this.userService.getUserById(decoded.authId);
            const latestCompletedLesson = await this.prisma.user_Progress.findFirst({

                
            })
        }catch(error){
            console.log(error.stack)
            throw new Error('error in getting latest completed game')
        }
    }

    async getUserProgressById(userId:string){
        try{
            const userProgress = await this.prisma.user_Progress.findMany({
                where:{
                    userId:userId
                }
            })
            if(!userProgress){
                throw new InternalServerErrorException('error in fetching user progress')
            }
            return userProgress;
        }catch(error){
            console.log(error)
            throw new InternalServerErrorException('error in fetching user progress')
        }
    }
    

}
