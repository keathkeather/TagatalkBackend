import { Controller, Param, Post, Req, Res } from '@nestjs/common';
import { UserProgressService } from './user-progress.service';
import { Request,Response } from 'express';

@Controller('user-progress')
export class UserProgressController {

    constructor(private userProgressService: UserProgressService) { }
    

    @Post('create-user-progress/:gameId')
    addUserProgress(@Req() request: Request, @Param('gameId') gameId: string, @Res() response: Response) {
        this.userProgressService.addUserProgress(request, gameId, response);
    }
    


}
