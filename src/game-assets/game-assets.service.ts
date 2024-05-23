import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { PrismaService } from '../prisma/prisma.service';
import { Readable } from 'stream';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
@Injectable()
export class GameAssetsService {
    constructor(private readonly prisma:PrismaService){}    

    private s3 = new S3({
        region: process.env.AWS_S3_REGION,
        credentials:{
            accessKeyId:process.env.AWS_ACCES_KEY,
            secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
        }
    })

    async uploadGameAssets(files: Record<string, Express.Multer.File[]>, gameId: string) {
        try{
            const allFiles = Object.values(files).flat();
            for(const file of allFiles){
                const result = await this.s3.send(new PutObjectCommand({
                    Bucket:process.env.AWS_BUCKET_NAME,
                    Key:`gameAssets/${gameId}/${file.originalname}`,
                    Body:file.buffer,
                    ContentDisposition:'inline'
                }))
                if(result){
                    await this.prisma.game_Assets.create({
                        data:{
                            gameId:gameId,
                            assetName:file.originalname,
                            assetType:file.originalname.split('.')[1],
                            fileUrl:`gameAssets/${gameId}/${file.originalname}`
                        }
                    })
                }else{
                    throw new InternalServerErrorException('Failed to upload game asset')
                }
            }
            
        }catch(error){
            console.log(error.stack)
            throw new InternalServerErrorException('Failed to upload game asset')
        }
    }
    //TODO update
    async deleteGameAsset(filename:string, gameId){
        try{
            const result = await this.s3.send(new DeleteObjectCommand({
                Bucket:process.env.AWS_BUCKET_NAME,
                Key:'gameAssets/1/1.png',
            }))
            //TODO delete properly from db wihtout getting the id
            if(result){
                await this.prisma.game_Assets.delete({
                    where:{
                        id:"asdasdasd",
                        gameId : gameId,
                        assetName:filename
                    }
                })
            }else{
                throw new InternalServerErrorException('Failed to delete game asset')
            }
        }catch(error){
            console.log(error.stack)
            throw new InternalServerErrorException('Failed to delete game asset')
        }
    }
    async listGameAssets(gameId: string): Promise<string[]> {
        try {
          const command = new ListObjectsV2Command({
            Bucket: process.env.AWS_BUCKET_NAME,
            Prefix: `gameAssets/${gameId}/`,
          });
    
          const result = await this.s3.send(command);
          return result.Contents.map(item => item.Key);
        } catch (error) {
          console.error('Error listing game assets:', error);
          throw new InternalServerErrorException('Failed to list game assets');
        }
    }

    //TODO get all assets in the db -> for all game assets in db return url
    async getGameAsset(key: string):Promise<string>{
        try {
            const getObjectParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key
            }
          const command = new GetObjectCommand(getObjectParams) 
          const result = await this.s3.send(command);
          const url = await getSignedUrl(this.s3,command,{expiresIn:3600})
          console.log(url)
          return url
        } catch (error) {
          console.error('Error fetching game asset:', error);
          throw new InternalServerErrorException('Failed to get game asset');
        } 
      }

    async updateGameAsset(){

    }
    async getGameAssetByGameId(){

    }
    async getGameAssetsByGameId(){

    }
 
    
    


}
