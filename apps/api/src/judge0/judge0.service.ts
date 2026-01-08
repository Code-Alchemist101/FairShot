import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface SubmissionResult {
    token: string;
    status: {
        id: number;
        description: string;
    };
    stdout?: string;
    stderr?: string;
    compile_output?: string;
    message?: string;
    time?: string;
    memory?: number;
}

@Injectable()
export class Judge0Service {
    private readonly logger = new Logger(Judge0Service.name);
    private readonly apiUrl: string;
    private readonly apiKey: string;
    private readonly apiHost: string;

    constructor(private configService: ConfigService) {
        this.apiUrl = this.configService.get<string>('JUDGE0_API_URL') || 'https://judge0-ce.p.rapidapi.com';
        this.apiKey = this.configService.get<string>('JUDGE0_API_KEY');
        this.apiHost = this.configService.get<string>('JUDGE0_HOST') || 'judge0-ce.p.rapidapi.com';
    }

    /**
     * Submit code to Judge0 for execution
     * @param code - Source code to execute
     * @param languageId - Judge0 language ID (63=JS, 71=Python, 62=Java, 54=C++)
     * @param stdin - Optional input for the program
     * @returns Submission token
     */
    async submitCode(code: string, languageId: number, stdin?: string): Promise<string> {
        try {
            const response = await fetch(`${this.apiUrl}/submissions?base64_encoded=false&wait=false`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-RapidAPI-Key': this.apiKey,
                    'X-RapidAPI-Host': this.apiHost,
                },
                body: JSON.stringify({
                    source_code: code,
                    language_id: languageId,
                    stdin: stdin || '',
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Judge0 submission failed: ${response.statusText} - ${error}`);
            }

            const data = await response.json();
            return data.token;
        } catch (error) {
            this.logger.error('Failed to submit code to Judge0', error);
            throw error;
        }
    }

    /**
     * Get submission result from Judge0
     * @param token - Submission token
     * @returns Submission result with status, output, etc.
     */
    async getSubmission(token: string): Promise<SubmissionResult> {
        try {
            const response = await fetch(`${this.apiUrl}/submissions/${token}?base64_encoded=false`, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': this.apiKey,
                    'X-RapidAPI-Host': this.apiHost,
                },
            });

            if (!response.ok) {
                throw new Error(`Judge0 get submission failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            this.logger.error('Failed to get submission from Judge0', error);
            throw error;
        }
    }

    /**
     * Submit code and wait for result (with polling)
     * @param code - Source code
     * @param languageId - Language ID
     * @param stdin - Optional input
     * @param maxAttempts - Maximum polling attempts (default: 10)
     * @returns Final submission result
     */
    async executeAndWait(
        code: string,
        languageId: number,
        stdin?: string,
        maxAttempts: number = 10,
    ): Promise<SubmissionResult> {
        const token = await this.submitCode(code, languageId, stdin);

        // Poll for result
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await this.sleep(1000); // Wait 1 second between polls

            const result = await this.getSubmission(token);

            // Status IDs: 1=In Queue, 2=Processing, 3=Accepted, 4+=Error/Failed
            if (result.status.id > 2) {
                return result; // Completed (success or error)
            }
        }

        throw new Error('Execution timeout: Judge0 did not complete in time');
    }

    /**
     * Get language ID from language name
     */
    getLanguageId(language: string): number {
        const languageMap: Record<string, number> = {
            javascript: 63,
            python: 71,
            java: 62,
            cpp: 54,
            c: 50,
            csharp: 51,
            ruby: 72,
            go: 60,
        };

        return languageMap[language.toLowerCase()] || 63; // Default to JavaScript
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
