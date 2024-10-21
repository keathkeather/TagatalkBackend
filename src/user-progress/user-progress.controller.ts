import { Controller, Get, Param, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { UserProgressService } from './user-progress.service';
import { Request,Response } from 'express';

@Controller('v1/user-progress')
export class UserProgressController {

    constructor(private userProgressService: UserProgressService) { }
    

    @Post('create-user-progress/:lessonId')
    addUserProgress(@Req() request: Request, @Param('lessonId') lessonId: string) {
        return this.userProgressService.addUserProgress(request, lessonId);
    }
    @Get('getUserProgress')
    getUserProgress(@Req() request:Request){
        try{
            
        }catch(error){
            if(error instanceof UnauthorizedException){
                
            }
        }
    }


}
