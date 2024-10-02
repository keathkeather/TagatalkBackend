import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UnitService } from './unit.service';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
@Controller('/unit')
export class UnitController {
    constructor(private unitService:UnitService) {}

    @Get('getAllUnits')
    async getAllUnits(){
        return this.unitService.getAllUnits();
    }

    @Post('createUnit/:skillName')
    async createUnit(@Body('unitName') unitName:string ,@Param('skillName') skillName:string){
        return this.unitService.createUnit(unitName,skillName);
    }

    @Get('courseTree/:skillName')
    @UseGuards(JwtAuthGuard)
    async getCourseTree(@Param('skillName') skillName:string,@Req() request:Request){
        return this.unitService.getCourseTree(request, skillName);
    }
}
