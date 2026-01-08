import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ProctoringService } from './proctoring.service';

interface ProctoringBatchPayload {
    sessionId: string;
    events: any[];
}

@WebSocketGateway({
    cors: {
        origin: '*', // Configure this properly in production
    },
    namespace: '/proctoring',
})
export class ProctoringGateway {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(ProctoringGateway.name);

    constructor(private proctoringService: ProctoringService) { }

    /**
     * Handle proctoring batch events from client
     * CRITICAL: Saves entire batch as a single row
     */
    @SubscribeMessage('proctoring-batch')
    async handleProctoringBatch(
        @MessageBody() payload: ProctoringBatchPayload,
        @ConnectedSocket() client: Socket,
    ) {
        const { sessionId, events } = payload;

        this.logger.log(`Received batch of ${events.length} events for session ${sessionId}`);

        try {
            // Save batch (creates single ProctoringEvent row)
            const result = await this.proctoringService.saveBatch(sessionId, events);

            // If high risk, emit warning back to client
            if (result.shouldWarn) {
                client.emit('proctoring-warning', {
                    message: 'Suspicious activity detected. Please stay focused on the assessment.',
                    riskScore: result.riskScore,
                });

                this.logger.warn(`High risk detected for session ${sessionId}`);
            }

            // Acknowledge receipt
            return {
                success: true,
                eventCount: result.eventCount,
                riskScore: result.riskScore,
            };
        } catch (error) {
            this.logger.error('Failed to save proctoring batch', error);
            return {
                success: false,
                error: 'Failed to save proctoring data',
            };
        }
    }

    /**
     * Handle client connection
     */
    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    /**
     * Handle client disconnection
     */
    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
}
