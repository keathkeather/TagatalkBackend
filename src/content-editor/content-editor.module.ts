import { Module } from '@nestjs/common';
import { ContentEditorService } from './content-editor.service';
import { ContentEditorController } from './content-editor.controller';

@Module({
  providers: [ContentEditorService],
  controllers: [ContentEditorController]
})
export class ContentEditorModule {}
