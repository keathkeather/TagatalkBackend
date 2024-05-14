import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { gameDTO } from './DTO/game.dto';
import { Game } from '@prisma/client';

@Injectable()
export class GameService {

    constructor(private readonly prisma:PrismaService){}

    async createGame(gameDTO:gameDTO){
        try{
            const {
                gameName,
                gameSkill, 
                gameType,
                gameUnit,
                gameUnitNumber,
                gamelesson,
                gameLesson,
                gameLevel,
                gameValue
            } = gameDTO;
        
            const newGame = await this.prisma.game.create({
                data:{
                    gameName:gameName,
                    gameSkill:gameSkill,
                    gameType:gameType,
                    gameUnit:gameUnit,
                    gameUnitNumber:gameUnitNumber,
                    gamelesson:gamelesson,
                    gameLesson:gameLesson,
                    gameLevel:gameLevel,
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
                gameName,
                gameSkill, 
                gameType,
                gameUnit,
                gameUnitNumber,
                gamelesson,
                gameLesson,
                gameLevel,
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

}
