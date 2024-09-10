import { Body, Controller, Delete, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, Post, Res, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileInterceptor,FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { GameAssetsService } from './game-assets.service';
import { Response } from 'express';
import { gameAssetDTO } from './DTO/game-asset.dto';

@Controller('v1/game-assets')
export class GameAssetsController {
  constructor(private readonly gameAssetsService: GameAssetsService){}


  @Post('multFiles/:gameId')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMultipleFiles(@UploadedFiles() files, @Param('gameId') gameId:string,@Body() gameAssetDto:gameAssetDTO) {
     return  await this.gameAssetsService.uploadGameAssets(files, gameId ,gameAssetDto);
  }
  @Get('gameAssets/:gameId')
  async getGameAssets(@Param('gameId') gameId: string) {
    try {
      return this.gameAssetsService.fetchAllAssets(gameId)
    } catch (error) {
      console.error('Error fetching game asset:', error);
    } 
  }
  @Delete('deleteAsset/:assetId')
  async deleteGameAsset(@Param('assetId') assetId: string) {
    try {
      return this.gameAssetsService.deleteGameAsset(assetId)
    } catch (error) {
      console.error('Error deleting game asset:', error);
    }
  }
  
}


