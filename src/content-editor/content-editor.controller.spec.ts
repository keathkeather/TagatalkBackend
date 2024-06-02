import { Test, TestingModule } from '@nestjs/testing';
import { ContentEditorController } from './content-editor.controller';

describe('ContentEditorController', () => {
  let controller: ContentEditorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentEditorController],
    }).compile();

    controller = module.get<ContentEditorController>(ContentEditorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
