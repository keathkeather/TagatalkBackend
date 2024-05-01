import { Controller, Post,Param, Body, Get } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { feedbackDto } from './DTO/feedback.dto';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';

@Controller('feedback')
export class FeedbackController {
    constructor(private feedbackService: FeedbackService) {}

    @Post('createFeedback/:userId')
    async createFeedback(@Param('userId')userId:string, @Body() feedbackDto: feedbackDto) {
       try{
        return this.feedbackService.createFeedback(userId,feedbackDto);
       }catch(Eeror){
        throw new HttpErrorByCode[500]('Failed to create feedback');
       }
    }

    @Get('getAllFeedback')
    async getAllFeedback() {
        return this.feedbackService.getAllFeedback();
    }
}
