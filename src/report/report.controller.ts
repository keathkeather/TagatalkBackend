import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { reportDto } from './DTO/report.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('v1/report')
export class ReportController {
    constructor(private reportService: ReportService) {}

    @Post('createReport')
    @UseGuards(JwtAuthGuard)
    async createReport(@Req() request:Request, @Body() reportDto: reportDto) {
        return this.reportService.CreateReport(request,reportDto);
    }
    @Get('getAllReports')
    async getAllReports() {
        return this.reportService.getAllReports();
    }

}
