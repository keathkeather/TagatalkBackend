import { Controller, Post,Param, Body, Get, Req, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { feedbackDto } from './DTO/feedback.dto';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('feedback')
export class FeedbackController {
    constructor(private feedbackService: FeedbackService) {}

    @Post('createFeedback')
    @UseGuards(JwtAuthGuard)
    async createFeedback(@Req() request:Request, @Body() feedbackDto: feedbackDto) {
       try{
        return this.feedbackService.createFeedback(request,feedbackDto);
       }catch(Eeror){
        throw new HttpErrorByCode[500]('Failed to create feedback');
       }
    }

    @Get('getAllFeedback')
    async getAllFeedback() {
        return this.feedbackService.getAllFeedback();
    }
}
