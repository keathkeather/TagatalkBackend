import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { gameDTO } from './DTO/game.dto';
import { Game } from '@prisma/client';

@Injectable()
export class GameService {

    constructor(private readonly prisma:PrismaService){}
    async getGameByID(gameId:string):Promise<Game|null>{
        try{
            const game = await this.prisma.game.findUnique({
                where:{
                    id:gameId,
                }
            })
            if(!game){
                throw new  Error('game not found')
            }
            return game;
        }catch(error){
            throw new InternalServerErrorException('Failed fetching game')
        }
    }
    async createGame(gameDTO:gameDTO){
        try{
            const {
                gameSkill, 
                gameType,
                gameUnit,
                gameUnitNumber,
                gameLesson,
                gameLessonNumber,
                gameValue
            } = gameDTO;
        
            const newGame = await this.prisma.game.create({
                data:{
                    gameSkill:gameSkill,
                    gameType:gameType,
                    gameUnit:gameUnit,
                    gameUnitNumber:gameUnitNumber,
                    gameLesson:gameLesson,
                    gameLessonNumber:gameLessonNumber,
                    gameValue:gameValue
                } 
                
            })
            return newGame;  
        }catch(error){
            console.log(error.stack)    
        }
    }
    async getAllGames():Promise<Game[]|null>{
        try{
            return this.prisma.game.findMany();
        }catch(error){
            console.log(error.stack)
        }
    }
    async updateGame(gameId:string, gameDTO:gameDTO){
        try{
            const {
                gameSkill, 
                gameType,
                gameUnit,
                gameUnitNumber,
                gameLesson,
                gameLessonNumber,
                gameValue
            } = gameDTO;


            const data = Object.entries(gameDTO).reduce((acc,[key,value])=>{
                if(value){
                    acc[key] = value;
                }
                return acc;
            },{});
            const updatedGame = await this.prisma.game.update({
                where:{
                    id:gameId
                },
                data
            })
            return updatedGame;
        }catch(error){
            console.log(error.stack)
        }
    }
  
    async getGameByLesson(lessonNumber:number):Promise<Game[]|null>{
        try{
            const games = await this.prisma.game.findMany({
                where:{
                    gameLessonNumber:lessonNumber
                }
            })
            if(games){
                return games
            }
            return null
        }catch(error){
            console.log(error)
            throw new InternalServerErrorException('failed to get games')
        }
    }
    async getGameByUnit(gameUnitNumber: number): Promise<Game[] | null> {
        try {
            if (typeof gameUnitNumber !== 'number') {
                throw new Error('gameUnitNumber must be a number');
              }
          const games = await this.prisma.game.findMany({
            where: {
              gameUnitNumber: gameUnitNumber
            }
          })
          return games;
        } catch (error) {
          console.error('Error fetching games by unit:', error);
          throw new InternalServerErrorException('Failed to get games by unit');
        }
      }
    async getAllGameWithoutAssets(){
        try{
            
        }catch(error){
            console.log(error)
            throw new InternalServerErrorException('Error fetching all games')
        }
    }
}
