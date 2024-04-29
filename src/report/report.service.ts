import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportService {
    constructor(private prisma:PrismaService){}

    async CreateReport(userId:string , reportTitle: string, reportDecription: string){
        const reportCreated = this.prisma.report.create({
            data:{
                userId:userId,
                reportTitle:reportTitle,
                reportDescription:reportDecription
            }
        })

        if (!reportCreated){
            throw Error('Failed to create report')
        }
        
    }
    async getAllReports(){
        try{
            return this.prisma.report.findMany()
        }
        catch(error){
            throw Error('Failed to get all reports)')
        }
    }
    
}
