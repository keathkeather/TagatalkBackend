import { Controller, Get, Param, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { UserProgressService } from './user-progress.service';
import { Request,Response } from 'express';

@Controller('user-progress')
export class UserProgressController {

    constructor(private userProgressService: UserProgressService) { }
    

    @Post('create-user-progress/:gameId')
    addUserProgress(@Req() request: Request, @Param('gameId') gameId: string) {
        this.userProgressService.addUserProgress(request, gameId);
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
