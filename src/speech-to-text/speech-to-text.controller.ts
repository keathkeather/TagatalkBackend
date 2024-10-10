import { Body, Controller, HttpStatus, ParseFilePipeBuilder, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { SpeechToTextService } from './speech-to-text.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
@Controller('v1/speech-to-text')
export class SpeechToTextController {   
  constructor(private readonly speechToTextService: SpeechToTextService) {}

  @Post('process-audio-file')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('audio')) // Use the name of the field that contains the audio file
  async processAudioFile(@UploadedFile(
    new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType: 'audio/*',
    })
    .addMaxSizeValidator({
      maxSize: 10 * 1024 * 1024, //
    })
    .build({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
    }),

  ) file: Express.Multer.File) {
    return await this.speechToTextService.processAudioFile(file);

    
  }@Post('process-audio-file-with-checker')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('audio')) // Use the name of the field that contains the audio file
  async processAudioFileWithChecker(@UploadedFile(
    new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType: 'audio/*',
    })
    .addMaxSizeValidator({
      maxSize: 10 * 1024 * 1024, //
    })
    .build({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
    }),

  ) file: Express.Multer.File, @Body('correctAnswer') correctAnswer: string) {
    return await this.speechToTextService.processAudioFileWithChecker(file,correctAnswer);
  }
}
