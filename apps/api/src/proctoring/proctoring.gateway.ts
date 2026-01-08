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

            // If high risk, emit warning
            if (result.shouldWarn) {
                const reasons = [];
                if (result.details?.tabSwitches > 0) reasons.push(`${result.details.tabSwitches} Tab Switches`);
                if (result.details?.fullscreenExits > 0) reasons.push(`${result.details.fullscreenExits} Fullscreen Exits`);

                const reasonText = reasons.length > 0 ? ` (${reasons.join(', ')})` : '';

                client.emit('proctoring-warning', {
                    message: `Suspicious activity detected${reasonText}. Please stay focused.`,
                    riskScore: result.riskScore,
                    warningCount: result.warningCount,
                });

                this.logger.warn(`High risk detected for session ${sessionId}`);
            }

            // Check for termination
            if (result.shouldTerminate) {
                client.emit('session-terminated', {
                    reason: 'Excessive Tab Switching',
                });
                // Force disconnect
                client.disconnect();
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
