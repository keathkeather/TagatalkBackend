import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class SpeechToTextService {
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async processAudioFile(file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const transcription = await this.openai.audio.transcriptions.create({
        file: new File([file.buffer], file.originalname, { type: file.mimetype }), //* Convert buffer to File object
        model: "whisper-1",
        response_format: "text",
      });
    return transcription;

  }
}
