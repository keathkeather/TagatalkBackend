import { BadRequestException, Injectable, InternalServerErrorException, Logger, Res } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GameService } from '../game/game.service';
import { gameAssetDTO } from './DTO/game-asset.dto';
import { S3Service } from '../s3/s3.service';
import { textAssetArray, textAssetDto } from './DTO/text-asset-dto';
import { fileAssetArray, fileAssetDto } from './DTO/file-asset-dto';
import { gameAssetsDto } from './DTO/game-assets-dto';
@Injectable()
export class GameAssetsService {
    logger: Logger;
    constructor(private readonly prisma:PrismaService,private readonly gameService:GameService,private s3Service:S3Service){
        this.logger = new Logger('GameAssetsService');
    }    
  
    async uploadGameAssets(files: Record<string, Express.Multer.File[]>, gameId: string, gameAssetDto: gameAssetDTO) {
        const game = await this.gameService.getGameByID(gameId);
        const { assetType, textContent, assetClassifier, isCorrectAnswer } = gameAssetDto;
    
        if (!game) {
            throw new BadRequestException('Game not found');
        }
    
        const allFiles = Object.values(files).flat();
        const textAssets = Array.isArray(textContent) ? textContent : [];
        const numFiles = allFiles.length;
        const numTextAssets = textAssets.length;
    
        try {
            //* Process files
            await Promise.all(
                allFiles.map(async (file, index) => {
                    const currentAssetType = assetType?.[index] ?? file.originalname.split('.').pop();
                    const currentAssetClassifier = assetClassifier?.[index] ?? null;
                    let currentIsCorrectAnswer: boolean;
                    if (Array.isArray(isCorrectAnswer)) {
                        //* If isCorrectAnswer is an array, get the value by index
                        const value = isCorrectAnswer[index];
                        currentIsCorrectAnswer = value === 'true' || value === true;
                    } else {
                        //* If isCorrectAnswer is not an array, convert to boolean
                        currentIsCorrectAnswer = isCorrectAnswer === 'true' 
                    }
                    //*Upload the file to S3
                    await this.s3Service.uploadGameFile(file, process.env.AWS_GAME_ASSET_TESTING, gameId);
    
                    //*Save file details to the database
                    await this.prisma.game_Assets.create({
                        data: {
                            gameId: gameId,
                            assetName: file.originalname,
                            assetClassifier: currentAssetClassifier,
                            assetType: currentAssetType,
                            fileUrl: `gameAssets/${gameId}/${file.originalname}`,
                            isCorrectAnswer: currentIsCorrectAnswer,
                        },
                    });
                })
            );
    
            //* Process text assets
            await Promise.all(
                textAssets.map(async (content, index) => {
                    const currentAssetClassifier = assetClassifier?.[numFiles + index] ?? 'text';
                    let currentIsCorrectAnswer: boolean;
                    if (Array.isArray(isCorrectAnswer)) {
                        //* If isCorrectAnswer is an array, get the value by index
                        const value = isCorrectAnswer[index];
                        currentIsCorrectAnswer = value === 'true' || value === true;
                    } else {
                        //* If isCorrectAnswer is not an array, convert to boolean
                        currentIsCorrectAnswer = isCorrectAnswer === 'true' 
                    }  
                    //**  Save text asset details to the database
                    await this.prisma.game_Assets.create({
                        data: {
                            gameId: gameId,
                            assetName: `textAsset${index + 1}`,
                            assetClassifier: currentAssetClassifier,
                            assetType: 'text',
                            textContent: content,
                            isCorrectAnswer: currentIsCorrectAnswer,
                        },
                    });
                })
            );
        } catch (error) {
            this.logger.error('Error uploading game assets:', error);
            throw new InternalServerErrorException('Failed to upload game assets');
        }
    }
    
    
    async deleteGameAsset(assetId:string){
            const asset = await this.prisma.game_Assets.findUnique({
                where:{
                    id:assetId
                }
            })
            if(!asset){
                throw new BadRequestException('Asset not found')
            }
            if(asset.fileUrl){
                await this.s3Service.deleteObject(process.env.AWS_GAME_ASSET_TESTING,asset.fileUrl)
            }
            await this.prisma.game_Assets.delete({
                where:{
                    id:asset.id
                }
            })
    }
 



    async updateGameAsset(gameId:string,assetId:string,file: Express.Multer.File){
        try{    
            const game  = await this.gameService.getGameByID(gameId);
            const asset = await this.prisma.game_Assets.findUnique({
                where:{
                    id:assetId
                }
            })
            if(file){
                await this.s3Service.uploadGameFile(file,process.env.AWS_GAME_ASSET_TESTING,gameId)
                await this.prisma.game_Assets.update({
                    where:{
                        id:assetId
                    },
                    data:{
                        assetName: file.originalname,
                        assetType: file.originalname.split('.').pop(),
                        fileUrl:`gameAssets/${gameId}/${file.originalname}`
                    }
                })
                
                
            }
        }catch(error){
            console.log(error)
            throw new InternalServerErrorException('failed to updae asset')
        }
    }
    async fetchAllAssets(gameId:string):Promise<gameAssetsDto>{
        const assets = await this.prisma.game_Assets.findMany({
            where:{
                gameId:gameId
            }
        })
        const fileAssets:fileAssetArray = [];
        const textAssets:textAssetArray = [];

        for(const asset of assets){
            if(asset.fileUrl){
                const downloadUrl = await this.s3Service.getSignedUrl(process.env.AWS_GAME_ASSET_TESTING,asset.fileUrl)
                const fileAsset:fileAssetDto = {
                    assetId:asset.id,
                    assetClassifier:asset.assetClassifier,
                    assetType:asset.assetType,
                    filename:asset.assetName,
                    fileUrl: downloadUrl,
                    isCorrectAnswer:asset.isCorrectAnswer,
                }
                fileAssets.push(fileAsset)
            }
            else if(asset.textContent){
                    const textAsset:textAssetDto = {
                        assetId:asset.id,
                        assetClassifier:asset.assetClassifier,
                        assetName:asset.assetName,
                        assetType:asset.assetType,
                        textContent:asset.textContent,
                        isCorrectAnswer:asset.isCorrectAnswer
                    }
                    textAssets.push(textAsset)
            }
        }

        const gameAssets:gameAssetsDto = {
            fileAssets:fileAssets,
            textAssets:textAssets
        }
        return gameAssets
        
    }
}
