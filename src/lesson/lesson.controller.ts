import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { LessonService } from './lesson.service';

@Controller('lesson')
export class LessonController { 
    constructor(private lessonService:LessonService) {}


    @Get('getAllLessons')
    async getAllLessons(){
        return this.lessonService.getAllLessons();
    }

    @Post('createLesson/:skillName/:unitNumber')
    async createLesson(@Body('lessonName') lessonName:string,@Param('skillName') skillName:string,@Param('unitNumber',ParseIntPipe) unitNumber:number){
        return this.lessonService.createLesson(lessonName,unitNumber,skillName);
    }
}
