import { Test, TestingModule } from '@nestjs/testing';
import { SpeechToTextService } from './speech-to-text.service';

jest.mock('openai', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      audio: {
        transcriptions: {
          create: jest.fn().mockResolvedValue({/* mock response for transcription */}),
        },
      },
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({/* mock response for chat completion */}),
        },
      },
    })),
  };
});

describe('SpeechToTextService', () => {
  let service: SpeechToTextService;

  beforeEach(async () => {
    process.env.OPENAI_API_KEY = 'test_api_key'; // Set a test API key

    const module: TestingModule = await Test.createTestingModule({
      providers: [SpeechToTextService],
    }).compile();

    service = module.get<SpeechToTextService>(SpeechToTextService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});