import { Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, Post, Res, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileInterceptor,FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { GameAssetsService } from './game-assets.service';
import { Response } from 'express';

@Controller('game-assets')
export class GameAssetsController {
    constructor(private readonly gameAssetsService: GameAssetsService){}

    @Post('singleFile/:gameId')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file ,gameId:string){
        await this.gameAssetsService.uploadGameAssets(file, gameId);
    }

    
    @Post('multFiles/:gameId')
    @UseInterceptors(FilesInterceptor('files'))
    async uploadMultipleFiles(@UploadedFiles() files, @Param('gameId')gameId:string) {
        await this.gameAssetsService.uploadGameAssets(files, gameId);
    }

    @Get('listAllAssets/:gameId')
    async listAllAssets(@Param('gameId') gameId:string){
        return this.gameAssetsService.listGameAssets(gameId);
    }
    @Get('assets/:gameId/:fileName')  
  async getGameAsset(@Param('gameId') gameId: string,@Param('fileName') fileName: string) {
    try {
      const key = `gameAssets/${gameId}/${fileName}`;
      return   this.gameAssetsService.getGameAsset(key)
    } catch (error) {
      console.error('Error fetching game asset:', error);
      
    }
  }
}


