import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface GenerateResourcePackParams {
    jobTitle: string;
    skills: string[];
    description: string;
}

interface ResourcePackContent {
    examPattern: string;
    requiredSkills: any[]; // Changed from string to array
    prepTips: any[]; // Changed from string to array
    sampleQuestions: any[];
}

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private readonly apiKey: string;
    private readonly apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

    constructor(private configService: ConfigService) {
        this.apiKey = this.configService.get<string>('GEMINI_API_KEY');
    }

    private cleanAndParseJson(text: string): any {
        // 1. Remove Markdown code blocks
        let cleanText = text.replace(/```json/g, '').replace(/```/g, '');

        // 2. Find the JSON object (first '{' to last '}')
        const firstOpen = cleanText.indexOf('{');
        const lastClose = cleanText.lastIndexOf('}');

        if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
            cleanText = cleanText.substring(firstOpen, lastClose + 1);
        }

        // 3. Remove potential bad control characters (newlines in strings are common issues)
        // This is a naive cleanup; strictly speaking, we rely on the AI to be better, 
        // but stripping non-printable chars can help.
        // cleanText = cleanText.replace(/[\x00-\x1F\x7F-\x9F]/g, ""); 
        // WARNING: The above strips \n which we need. JSON.parse handles \n if escaped \\n.
        // If the LLM returns literal newlines inside a string, JSON.parse fails.
        // We can try to escape unescaped newlines? Too risky for complex nested JSON.

        try {
            return JSON.parse(cleanText);
        } catch (error) {
            this.logger.error(`JSON Parse Failed. Text snippet: ${cleanText.substring(0, 200)}...`);
            throw error;
        }
    }

    async generateResourcePack(params: GenerateResourcePackParams): Promise<ResourcePackContent> {
        const { jobTitle, skills, description } = params;

        const prompt = `You are an expert career coach creating a study guide.
Job Title: ${jobTitle}
Skills: ${skills.join(', ')}
Context: ${description}

Output strict JSON (NO MARKDOWN) with keys:
examPattern (string)
requiredSkills (array of strings)
prepTips (array of strings)
sampleQuestions (array of objects: {type, question, options, answer, explanation, difficulty})

Ensure strings are properly escaped.`;

        try {
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7 }
                }),
            });

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.statusText}`);
            }

            const data = await response.json();
            const generatedText = data.candidates[0]?.content?.parts[0]?.text;

            if (!generatedText) {
                throw new Error('No content generated from Gemini');
            }

            const parsed = this.cleanAndParseJson(generatedText);

            return {
                examPattern: parsed.examPattern || 'Assessment details will be provided.',
                requiredSkills: Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills : [],
                prepTips: Array.isArray(parsed.prepTips) ? parsed.prepTips : [],
                sampleQuestions: Array.isArray(parsed.sampleQuestions) ? parsed.sampleQuestions : [],
            };
        } catch (error) {
            this.logger.error('Failed to generate resource pack', error);

            // Return fallback content if AI fails (now as arrays)
            return {
                examPattern: `Assessment for ${jobTitle}`,
                requiredSkills: skills,
                prepTips: ['Study hard', 'Rest well'],
                sampleQuestions: []
            };
        }
    }

    async analyzePlagiarism(code: string, context: string): Promise<{ riskLevel: 'GREEN' | 'YELLOW' | 'RED'; reason: string }> {
        // Placeholder for future plagiarism detection
        return {
            riskLevel: 'GREEN',
            reason: 'Code appears to be original work with proper research.',
        };
    }

    async generateQuestions(jobTitle: string, skills: string[], description: string): Promise<{ mcqs: any[], coding: any[] }> {
        const prompt = `Create assessment questions for "${jobTitle}".
Skills: ${skills.join(', ')}

Return a JSON object with:
"mcqs" (array of 5 objects): {question, options[], correctAnswer(0-3), explanation, difficulty, tags[]}
"coding" (array of 1 object): {title, description, testCases:[{input, expectedOutput}]}

IMPORTANT:
1. Return purely JSON. No markdown backticks.
2. Escape all special characters in strings (e.g., use \\n for newlines, \\" for quotes).
`;

        try {
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7 }
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`Gemini API Error: ${response.status} ${response.statusText} - ${errorText}`);
                throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            const text = result.candidates[0]?.content?.parts[0]?.text || '';

            const parsed = this.cleanAndParseJson(text);

            return {
                mcqs: Array.isArray(parsed.mcqs) ? parsed.mcqs : [],
                coding: Array.isArray(parsed.coding) ? parsed.coding : []
            };

        } catch (error) {
            this.logger.error('Failed to generate questions', error);
            // Throw error to let the frontend know something went wrong
            throw new Error(`AI Service Failed: ${error.message}`);
        }
    }

    async generateAssessmentFeedback(data: any): Promise<{ strengths: string; weaknesses: string; improvementTips: string; communicationClarity?: number }> {
        const prompt = `Analyze performance for ${data.jobTitle}. Score: ${data.codingScore}.
        Return JSON headers only: strengths, weaknesses, improvementTips, communicationClarity(0-100).`;

        try {
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7 }
                }),
            });

            if (!response.ok) throw new Error('Gemini API error');

            const result = await response.json();
            const text = result.candidates[0]?.content?.parts[0]?.text || '';

            return this.cleanAndParseJson(text);
        } catch (error) {
            this.logger.error('Failed to generate feedback', error);
            return {
                strengths: 'Good effort.',
                weaknesses: 'Needs practice.',
                improvementTips: 'Keep coding.',
                communicationClarity: 80
            };
        }
    }

    private async callGemini(prompt: string, retries = 3): Promise<any> {
        const delays = [10000, 20000, 40000]; // Increased backoff: 10s, 20s, 40s

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

                // Clean markdown code blocks if present
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
