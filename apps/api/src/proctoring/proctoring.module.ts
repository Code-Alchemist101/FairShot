import { Module } from '@nestjs/common';
import { ProctoringService } from './proctoring.service';
import { ProctoringGateway } from './proctoring.gateway';

@Module({
    providers: [ProctoringService, ProctoringGateway],
    exports: [ProctoringService],
})
export class ProctoringModule { }
