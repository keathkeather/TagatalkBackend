import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { LessonService } from './lesson.service';

@Controller('lesson')
export class LessonController { 
    constructor(private lessonService:LessonService) {}


    @Get('getAllLessons')
    async getAllLessons(){
        return this.lessonService.getAllLessons();
    }

    @Post('createLesson/:unitId')
    async createLesson(@Body('lessonName') lessonName:string,@Param('unitId') unitId:string ){
        return this.lessonService.createLesson(lessonName,unitId);
    }
}
