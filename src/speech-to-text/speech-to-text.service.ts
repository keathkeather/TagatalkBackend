import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class SpeechToTextService {
  logger:Logger;
  constructor(){
    this.logger = new Logger('SpeechToTextService');
  }
   OpenAI = require('openai');

  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async processAudioFile(file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const transcription = await this.openai.audio.transcriptions.create({
        file: new File([file.buffer], file.originalname, { type: file.mimetype }), //* Convert buffer to File object
        model: "whisper-1",
        response_format: "text",
        language:'tl'
      });
    return transcription;

  }

  async processAudioFileWithChecker(file: Express.Multer.File, correctAnswer: string) {
    if (!file) {
      throw new Error('No file uploaded');
    }
  
    // Step 1: Transcribe the audio using Whisper
    const transcription = await this.openai.audio.transcriptions.create({
      file: new File([file.buffer], file.originalname, { type: file.mimetype }), // Convert buffer to File object
      model: "whisper-1",
      response_format: "text",
      language: 'tl', // Specify Filipino for the transcription
    });
  
    // Step 2: Use GPT-3.5-Turbo to translate and check correctness
    const checking = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an assistant that translates text to Filipino (Tagalog) and verifies if it matches a given correct answer.',
        },
        {
          role: 'user',
          content: `
          Here is an English transcription: "${transcription}".
          Translate it to Filipino and compare it with the correct answer: "${correctAnswer}".
          If your translation matches, return 1. If it doesn't match, return 0.
          `,
        },
      ],
    });
  
    // Step 3: Extract the relevant content from GPT's response
    const gptResponse = checking.choices[0].message.content.trim();
  
    // Parse the result to extract the integer (0 or 1) from GPT's response
    const isCorrect = gptResponse.includes('1') ? 1 : 0;
  
    // Step 4: Return both transcriptions and whether it matched
    return {
      transcription,  // The original transcription from Whisper
      gptTranslation: gptResponse, // The response from GPT, including its translation
      isCorrect,  // Whether the translation matched the correct answer (1 if correct, 0 if not)
    };
  }
  async transcribeAudio(file: Express.Multer.File){
    const transcription = await this.openai.audio.transcriptions.create({
      file: new File([file.buffer], file.originalname, { type: file.mimetype }), //* Convert buffer to File object
      model: "whisper-1",
      response_format: "text",
      language:'tl'
    })
    return transcription;
  }
  async checkTranscription(transcriptedText:string, correctAnswer: string){
    const checking = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an assistant that checks if the transcripted text  and verifies if it matches a given correct answer.',
        },
        {
          role: 'user',
          content: `
          Here is the transcription: "${transcriptedText}".
          compare it with the correct answer: "${correctAnswer}".
          If the transcription:${transcriptedText} is close enough to the correctAnswer: "${correctAnswer}" return 1. If it doesn't match, return 0.
          Note: do not be strict give a little leeway for the translation.
          `,
        },
      ],
    });
  
    // Step 3: Extract the relevant content from GPT's response
    const gptResponse = checking.choices[0].message.content.trim();
    this.logger.log(gptResponse)
    // Parse the result to extract the integer (0 or 1) from GPT's response
    const isCorrect = gptResponse.includes('1') ? 1 : 0;

    return isCorrect;
  }
}
