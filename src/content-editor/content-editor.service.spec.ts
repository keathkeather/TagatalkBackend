import { Test, TestingModule } from '@nestjs/testing';
import { ContentEditorService } from './content-editor.service';

describe('ContentEditorService', () => {
  let service: ContentEditorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentEditorService],
    }).compile();

    service = module.get<ContentEditorService>(ContentEditorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
