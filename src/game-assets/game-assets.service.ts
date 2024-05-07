import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { S3Client } from '@aws-sdk/client-s3';
@Injectable()
export class GameAssetsService {
   
    private readonly s3Client =  new S3Client({
        region: process.env.AWS_REGION,
    })
    async uploadGameAsset(){


    }
    async deleteGameAsset(){

    }
    async getGameAsset(){

    }
    async getGameAssets(){

    }
    async updateGameAsset(){

    }
    async getGameAssetByGameId(){

    }
    async getGameAssetsByGameId(){

    }

}
