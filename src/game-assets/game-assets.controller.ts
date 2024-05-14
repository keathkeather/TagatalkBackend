import { Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, Post, Res, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileInterceptor,FileFieldsInterceptor } from '@nestjs/platform-express';
import { GameAssetsService } from './game-assets.service';
import { Response } from 'express';

@Controller('game-assets')
export class GameAssetsController {
    constructor(private readonly gameAssetsService: GameAssetsService){}

    @Post('singleFile/:gameId')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile(
        new ParseFilePipe({
            validators:[
                new MaxFileSizeValidator({ maxSize: 2097152 }), new FileTypeValidator({ fileType: 'image/png' })
            ],
        }),
       
    )files,gameId:string){
        await this.gameAssetsService.uploadGameAssets(files, gameId);
    }

    
    @Post('multFiles/:gameId')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'avatar', maxCount: 1 },
        { name: 'background', maxCount: 1 },
    ]))
    async uploadMultipleFiles(@UploadedFiles() files, @Param('gameId')gameId:string) {
        await this.gameAssetsService.uploadGameAssets(files, gameId);
    }

    @Get('listAllAssets/:gameId')
    async listAllAssets(@Param('gameId')gameId:string){
        return this.gameAssetsService.listGameAssets(gameId);
    }
    @Get('assets/:gameId/:fileName')
  async getGameAsset(
    @Param('gameId') gameId: string,
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    try {
      const key = `gameAssets/${gameId}/${fileName}`;
      const fileStream = await this.gameAssetsService.getGameAsset(key);

      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error fetching game asset:', error);
      
    }
  }
}


