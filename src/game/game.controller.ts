import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { GameService } from './game.service';
import { gameDTO } from './DTO/game.dto';
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('createGame/:lessonId')
  async createGame(
    @Body() gameDTO: gameDTO,
    @Param('lessonId') lessonId: string,
  ) {
    return this.gameService.createGame(gameDTO, lessonId);
  }
  @Put('updateGame/:gameId')
  async updateGame(@Body() gameDTO: gameDTO, @Param('gameId') gameId: string) {
    return this.gameService.updateGame(gameId, gameDTO);
  }
  @Get('getAllGames')
  async getAllGames() {
    return this.gameService.getAllGames();
  }
  @Get('getGameByUnit/:gameUnitNumber')
  async getGameByUnit(
    @Param('gameUnitNumber', ParseIntPipe) gameUnitNumber: number,
  ) {
    return this.gameService.getGameByUnit(gameUnitNumber);
  }
  @Get('getGameByLesson/:gameLessonNumber')
  async getGameByLessonNumber(
    @Param('gameLessonNumber', ParseIntPipe) gameLessonNumber: number,
  ) {
    return this.gameService.getGameByLesson(gameLessonNumber);
  }

  // @Put('updateType')
  // async updateType(){
  //     return this.gameService.updateGameType()
  // }
}
