import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ReportService } from './report.service';
import { reportDto } from './DTO/report.dto';

@Controller('report')
export class ReportController {
    constructor(private reportService: ReportService) {}

    @Post('createReport/:userId')
    async createReport(@Param('userId')userId:string, @Body() reportDto: reportDto) {
        return this.reportService.CreateReport(userId,reportDto);
    }
    @Get('getAllReports')
    async getAllReports() {
        return this.reportService.getAllReports();
    }

}
