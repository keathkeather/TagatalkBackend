import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { GameService } from './game.service';
import { gameDTO } from './DTO/game.dto';
@Controller('game')
export class GameController {
    constructor(private readonly gameService:GameService) {}

    @Post('createGame')
    async createGame(@Body() gameDTO:gameDTO){
        return this.gameService.createGame(gameDTO);
    }
    @Put('updateGame/:gameId')
    async updateGame(@Body() gameDTO:gameDTO, @Param('gameId')gameId:string){
        return this.gameService.updateGame(gameId, gameDTO);
    }
    @Get('getAllGames')
    async getAllGames(){
        return this.gameService.getAllGames();
    }
    @Get('getGameByUnit/:gameUnitNumber')
    async getGameByUnit(@Param('gameUnitNumber') gameUnitNumber:number){
        return this.gameService.getGameByUnit(gameUnitNumber)
    }

}
