import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { reportDto } from './DTO/report.dto';
import { Request } from 'express';
import { Auth, User } from '@prisma/client';

@Injectable()
export class ReportService {
    constructor(private prisma:PrismaService){}

    async CreateReport(request:Request ,reportDto:reportDto){
        const {reportTitle,reportDescription} = reportDto;
        try{
            const userId = (request.user as Auth).authId;
            const reportCreated = await this.prisma.report.create({
                data:{
                    userId:userId,
                    reportTitle:reportTitle,
                    reportDescription:reportDescription
                }
            })

            if (!reportCreated){
                throw Error('Failed to create report')
            }
        
        }catch(Error){
            throw Error('Failed to create report')
        }
    }
    async getAllReports(){
        try{
            return this.prisma.report.findMany(
                {
                    where:{
                        isDeleted:false
                    }
                }
            )
        }
        catch(error){
            throw Error('Failed to get all reports)')
        }
    }
    
}
