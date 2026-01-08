import { Module, Global } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiQuestionGeneratorService } from './ai-question-generator.service';

@Global()
@Module({
    providers: [AiService, AiQuestionGeneratorService],
    exports: [AiService, AiQuestionGeneratorService],
})
export class AiModule { }
