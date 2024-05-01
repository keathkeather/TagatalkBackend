import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { reportDto } from './DTO/report.dto';

@Injectable()
export class ReportService {
    constructor(private prisma:PrismaService){}

    async CreateReport(userId:string ,reportDto:reportDto){
        const {reportTitle,reportDescription} = reportDto;
        try{
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
