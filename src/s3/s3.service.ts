import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import * as sharp from 'sharp';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
@Injectable()
export class S3Service {
    constructor(){}
    private s3 = new S3({
        region: process.env.AWS_S3_REGION,
        credentials:{
            accessKeyId:process.env.AWS_ACCES_KEY,
            secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
        }
    })

    async uploadGameFile(file:Express.Multer.File,bucket:string,gameId:string){
       try{
            await this.s3.send(new PutObjectCommand({
                Bucket:bucket,
                Key:`gameAssets/${gameId}/${file.originalname}`,
                Body:file.buffer,
                ContentDisposition: 'inline'
            }))
       }catch(error){
            throw new InternalServerErrorException('Failed to upload game file')
       }
    }   

    async uploadProfileImage(file:Express.Multer.File,userId:string,bucket:string){
        try{ 
            await this.s3.send(new PutObjectCommand({
                Bucket:bucket,
                Key:`profilePictures/${userId}/${file.originalname}`,
                Body:file.buffer,
                ContentDisposition: 'inline',
                ContentType: 'image/jpeg'    
            }))
            
            const thumbnailBuffer = await sharp(file.buffer)
                .resize(120,120)
                .toBuffer();
            
            await this.s3.send(new PutObjectCommand({
                Bucket:bucket,
                Key:`profilePictures/${userId}/thumbnail/${file.originalname}`,
                Body:thumbnailBuffer,
                ContentDisposition: 'inline',
                ContentType: 'image/jpeg'
            }))
        }catch(error){
            console.log(error)
            throw new InternalServerErrorException('Failed to upload profile image')
        }
    }

    async deleteObject(bucket:string,key:string){
        await this.s3.send(new DeleteObjectCommand({
            Bucket:bucket,
            Key:key
        }))
    }
    
    async getSignedUrl(bucket:string, key:string){
        const getObjectParams = {
            Bucket: bucket,
            Key: key,
        }
        const command = new GetObjectCommand(getObjectParams)
        const signedUrl = await getSignedUrl(this.s3,command,{expiresIn:3600});
        return signedUrl;
    }
    async getGameAsset(bucket:string,key:string){
        const getObjectParams = {
            Bucket: bucket,
            Key: key,
        }
        const command = new GetObjectCommand(getObjectParams)
        const data = await this.s3.send(command);
        return data;
    }
   
    
}
