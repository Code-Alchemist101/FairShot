import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiQuestionGeneratorService {
    private readonly logger = new Logger(AiQuestionGeneratorService.name);
    private readonly apiKey: string;
    private readonly apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService
    ) {
        this.apiKey = this.configService.get<string>('GEMINI_API_KEY');
    }

    async generateQuestionsForJob(jobId: string, jobTitle: string, description: string, skills: string[]) {
        this.logger.log(`Generating AI questions for Job: ${jobTitle} (${jobId})`);

        const prompt = `
        You are a technical hiring manager creating an assessment for a ${jobTitle} role.
        
        Job Description: ${description}
        Required Skills: ${skills.join(', ')}

        Generate a JSON object containing:
        1. "mcqs": Array of 10 multiple-choice questions. Each object must have:
           - "question": string
           - "options": array of 4 strings
           - "correctAnswer": integer (0-3)
           - "difficulty": "EASY", "MEDIUM", or "HARD"
           - "explanation": string (brief reasoning)

        2. "codingProblems": Array of 2 coding challenges. Each object must have:
           - "title": string
           - "description": string (in markdown)
           - "difficulty": "EASY", "MEDIUM", or "HARD"
           - "testCases": array of objects { "input": string, "expectedOutput": string } (provide 3 test cases)

        Make the questions relevant to the skills and job description.
        Ensure the output is valid JSON.
        `;

        try {
            const result = await this.callGemini(prompt);

            // Save MCQs
            if (result.mcqs && Array.isArray(result.mcqs)) {
                await this.prisma.mCQQuestion.createMany({
                    data: result.mcqs.map(q => ({
                        question: q.question,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation,
                        difficulty: q.difficulty,
                        isAiGenerated: true,
                        jobId: jobId,
                        tags: skills,
                    }))
                });
                this.logger.log(`Saved ${result.mcqs.length} MCQs`);
            }

            // Save Coding Problems
            if (result.codingProblems && Array.isArray(result.codingProblems)) {
                for (const p of result.codingProblems) {
                    await this.prisma.codingProblem.create({
                        data: {
                            title: p.title,
                            description: p.description,
                            difficulty: p.difficulty,
                            testCases: p.testCases,
                            isAiGenerated: true,
                            jobId: jobId,
                            tags: skills
                        }
                    });
                }
                this.logger.log(`Saved ${result.codingProblems.length} Coding Problems`);
            }

            return { success: true, mcqCount: result.mcqs?.length || 0, codingCount: result.codingProblems?.length || 0 };

        } catch (error) {
            this.logger.error('Failed to generate questions', error);
            // Don't throw, just log. We don't want to break the job creation flow.
            return { success: false, error: error.message };
        }
    }

    private async callGemini(prompt: string, retries = 3): Promise<any> {
        const delays = [5000, 10000, 20000]; // Increased backoff: 5s, 10s, 20s

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ role: "user", parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.7, responseMimeType: "application/json" }
                    }),
                });

                if (response.status === 429) {
                    if (attempt < retries) {
                        const waitTime = delays[attempt] || 10000;
                        this.logger.warn(`Gemini Rate Limit (429). Retrying in ${waitTime / 1000}s... (Attempt ${attempt + 1}/${retries})`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                        continue;
                    } else {
                        throw new Error('Gemini API Rate Limit Exceeded after retries');
                    }
                }

                if (!response.ok) throw new Error(`Gemini API error: ${response.statusText}`);

                const data = await response.json();
                const text = data.candidates[0]?.content?.parts[0]?.text;

                // Clean markdown code blocks if present (Gemini sometimes adds them despite MIME type)
                const cleanText = text.replace(/```json\n|```/g, '');
                return JSON.parse(cleanText);

            } catch (error) {
                if (attempt < retries && (error.message.includes('429') || error.message.includes('FetchError') || error.message.includes('overloaded'))) {
                    const waitTime = delays[attempt] || 10000;
                    this.logger.warn(`Gemini API Error: ${error.message}. Retrying in ${waitTime / 1000}s...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                } else {
                    throw error;
                }
            }
        }
    }
}
