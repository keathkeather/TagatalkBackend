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
        
        // Log the gameAssetDto for debugging
        this.logger.log('gameAssetDto:', gameAssetDto);
    
        const { assetType, textContent, assetClassifier, isCorrectAnswer } = gameAssetDto;
    
        if (!game) {
            throw new BadRequestException('Game not found');
        }
    
        this.logger.log('textContent:', textContent);
        this.logger.log('gameId:', gameId);
        this.logger.log('Uploading game assets');
    
        const allFiles = Object.values(files).flat();
        const textAssets = Array.isArray(textContent) ? textContent : [textContent]; // Ensure textContent is always an array
        const numFiles = allFiles.length;
        const numTextAssets = textAssets.length;
    
        this.logger.log('textAssets:', textAssets);
        this.logger.log('assetClassifier:', assetClassifier); // Log assetClassifier for debugging
    
        try {
            // * Process files
            if (numFiles > 0) {
                await Promise.all(
                    allFiles.map(async (file, index) => {
                        // Handle assetType
                        let currentAssetType: string;
                        if (Array.isArray(assetType)) {
                            currentAssetType = assetType[index] || file.originalname.split('.').pop();
                        } else {
                            currentAssetType = assetType || file.originalname.split('.').pop(); // Handle single string value
                        }
    
                        // Handle assetClassifier
                        let currentAssetClassifier: string;
                        if (Array.isArray(assetClassifier)) {
                            currentAssetClassifier = assetClassifier[index] || 'default-classifier';
                        } else {
                            currentAssetClassifier = assetClassifier || 'default-classifier'; // Handle single string value
                        }
    
                        // Handle isCorrectAnswer
                        let currentIsCorrectAnswer: boolean;
                        if (Array.isArray(isCorrectAnswer)) {
                            const value = isCorrectAnswer[index];
                            currentIsCorrectAnswer = value === 'true' || value === true;
                        } else {
                            currentIsCorrectAnswer = isCorrectAnswer === 'true'; // Handle single value
                        }
    
                        // * Upload the file to S3
                        await this.s3Service.uploadGameFile(file, process.env.AWS_BUCKET_NAME, gameId);
    
                        // * Save file details to the database
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
            }
    
            // * Process text assets
            // Process text assets
            if (numTextAssets > 0 && textAssets[0] !== null && textAssets[0] !== undefined) {
                await Promise.all(
                    textAssets.map(async (textContent, index) => {
                        // Handle assetType
                        let currentAssetType: string;
                        if (Array.isArray(assetType)) {
                            currentAssetType = assetType[index + numFiles] || 'null';
                        } else {
                            currentAssetType = assetType || 'null'; // Handle single string value
                        }

                        // Handle assetClassifier
                        let currentAssetClassifier: string;
                        if (Array.isArray(assetClassifier)) {
                            currentAssetClassifier = assetClassifier[index] || 'default-classifier'; // Use index directly for text assets
                        } else {
                            currentAssetClassifier = assetClassifier || 'default-classifier'; // Handle single string value
                        }

                        // Handle isCorrectAnswer
                        let currentIsCorrectAnswer: boolean;
                        if (Array.isArray(isCorrectAnswer)) {
                            const value = isCorrectAnswer[index];
                            currentIsCorrectAnswer = value === 'true' || value === true;
                        } else {
                            currentIsCorrectAnswer = isCorrectAnswer === 'false' ? false : true; // Handle single value
                        }

                        const assetName = `textAsset${index + 1 + numFiles}`; // Ensure unique asset names
                        // Log details for debugging
                        this.logger.log('textContent:', textContent);
                        this.logger.log('assetName:', assetName);
                        this.logger.log('currentAssetClassifier:', currentAssetClassifier);
                        this.logger.log('currentAssetType:', currentAssetType);
                        this.logger.log('currentIsCorrectAnswer:', currentIsCorrectAnswer);

                        // Save text details to the database
                        await this.prisma.game_Assets.create({
                            data: {
                                gameId: gameId,
                                assetName: assetName,
                                assetClassifier: currentAssetClassifier,
                                assetType: 'text',
                                textContent: textContent,
                                isCorrectAnswer: currentIsCorrectAnswer,
                            },
                        });
                    })
                );
}

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
                await this.s3Service.deleteObject(process.env.AWS_BUCKET_NAME,asset.fileUrl)
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
                await this.s3Service.uploadGameFile(file,process.env.AWS_BUCKET_NAME,gameId)
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
                const downloadUrl = await this.s3Service.getSignedUrl(process.env.AWS_BUCKET_NAME,asset.fileUrl)
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
