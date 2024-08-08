import { Inject, Injectable, InternalServerErrorException, UnauthorizedException, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { GameService } from '../game/game.service';
import { Request,Response } from 'express';
import { Auth, Game } from '@prisma/client';
import { UnitService } from '../unit/unit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UserProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private eventEmitter: EventEmitter2,
  ) {}
    async addUserProgress(request:Request, gameId:string, response:Response){
        try{
            const decoded = this.jwtService.verify(request.headers['authorization'].split(' ')[1],{ secret: process.env.SECRET_KEY });
            const userId = decoded.authId;
            const existingProgress = await this.prisma.user_Progress.findFirst({
                where: {
                  userId: userId,
                  gameId: gameId,
                  isCompleted: true
                }
              });
      
              // If the user has already completed the game, return
              if (existingProgress) {
                return;
              }
              
            const userProgress = await this.prisma.user_Progress.create({
                data: {
                  userId: userId,
                  gameId: gameId,
                  isCompleted: true
                }
              });
              if(!userProgress){
                throw new Error('error in adding new progress')
              }
              this.eventEmitter.emit('points.added',{userId:userId,points:100})

            response.status(200).json({
              message: 'Progress added successfully'
            });
        }catch(error){
            console.log(error.stack)
            throw new InternalServerErrorException('failed to add user progress');
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
