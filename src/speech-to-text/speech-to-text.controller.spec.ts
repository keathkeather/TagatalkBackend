import { Test, TestingModule } from '@nestjs/testing';
import { SpeechToTextController } from './speech-to-text.controller';
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

describe('SpeechToTextController', () => {
  let controller: SpeechToTextController;
  let service: SpeechToTextService;

  beforeEach(async () => {
    process.env.OPENAI_API_KEY = 'test_api_key'; // Set a test API key

    const mockSpeechToTextService = {
      processAudioFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpeechToTextController],
      providers: [
        {
          provide: SpeechToTextService,
          useValue: mockSpeechToTextService,
        },
      ],
    }).compile();

    controller = module.get<SpeechToTextController>(SpeechToTextController);
    service = module.get<SpeechToTextService>(SpeechToTextService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call processAudioFile', async () => {
    const file = { buffer: Buffer.from('test') } as Express.Multer.File;
    await controller.processAudioFile(file);
    expect(service.processAudioFile).toHaveBeenCalledWith(file);
  });
});