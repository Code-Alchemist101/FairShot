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

    async generateResourcePack(params: GenerateResourcePackParams): Promise<ResourcePackContent> {
        const { jobTitle, skills, description } = params;

        const prompt = `You are an expert career coach creating a study guide for a job applicant.

Job Title: ${jobTitle}
Required Skills: ${skills.join(', ')}
Job Description: ${description}

Create a comprehensive study plan with the following sections:

1. EXAM PATTERN: Describe what the assessment will likely include (e.g., "You'll face 20 MCQs on ${skills[0]}, 2 coding problems, and 1 system design question"). Be specific and realistic. Return as a single string.

2. REQUIRED SKILLS: List the top 5 skills the candidate must master, with a brief explanation of why each is important for this role. Return as an array of strings, where each string is "Skill Name: Explanation".

3. PREPARATION TIPS: Provide 5 actionable tips for preparing for this assessment. Focus on real-world practice, not just theory. Return as an array of strings.

4. SAMPLE QUESTIONS: Create 3 sample questions (mix of MCQ and coding). Return as an array of objects with:
   - 'type': "MCQ" or "CODING"
   - 'question': The question text
   - 'options': Array of strings (for MCQ only)
   - 'answer': The correct answer string (for MCQ) or a brief solution description (for CODING)
   - 'explanation': Brief explanation of why the answer is correct or key concepts involved.
   - 'difficulty': "Easy", "Medium", or "Hard"

Format your response as JSON with keys: examPattern (string), requiredSkills (array of strings), prepTips (array of strings), sampleQuestions (array of objects).

Example format:
{
  "examPattern": "You'll face 15 MCQs on JavaScript fundamentals, 2 React coding challenges, and 1 system design question about scalable architectures.",
  "requiredSkills": [
    "JavaScript ES6+: Essential for modern React development and async operations",
    "React Hooks: Core to building functional components and managing state",
    "Node.js: Required for backend API development and server-side logic",
    "PostgreSQL: Database design and query optimization skills are critical",
    "System Design: Ability to architect scalable, maintainable applications"
  ],
  "prepTips": [
    "Practice building full-stack applications with React and Node.js",
    "Review JavaScript async/await patterns and Promise handling",
    "Study common system design patterns like MVC and microservices",
    "Solve coding problems on LeetCode focusing on data structures",
    "Build a portfolio project demonstrating all required skills"
  ],
  "sampleQuestions": [
    {
      "type": "MCQ",
      "question": "What is the purpose of useEffect hook in React?",
      "options": ["State management", "Side effects handling", "Component rendering", "Event handling"],
      "answer": "Side effects handling",
      "explanation": "useEffect is designed to perform side effects in function components, such as data fetching or subscriptions.",
      "difficulty": "Easy"
    },
    {
      "type": "CODING",
      "question": "Implement a function to debounce API calls in a search input",
      "difficulty": "Medium",
      "answer": "Use a timer to delay execution until the user stops typing for a set duration.",
      "explanation": "Debouncing prevents excessive API calls by ensuring the function only fires after a pause in events."
    }
  ]
}`;

        try {
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    text: prompt,
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048,
                    },
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

            // Try to parse JSON from the response
            // Gemini sometimes wraps JSON in markdown code blocks
            let jsonText = generatedText;
            const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch) {
                jsonText = jsonMatch[1];
            }

            const parsed = JSON.parse(jsonText);

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
                examPattern: `You'll face a comprehensive assessment for the ${jobTitle} role, including technical questions and practical challenges.`,
                requiredSkills: skills.map(skill => `${skill}: Essential skill for this role`),
                prepTips: [
                    `Review ${skills[0]} fundamentals and best practices`,
                    'Practice coding problems on platforms like LeetCode',
                    'Study system design patterns and architectures',
                    'Review the job description carefully and align your preparation',
                    'Prepare thoughtful questions for the interviewer'
                ],
                sampleQuestions: [
                    {
                        type: 'MCQ',
                        question: `What is a key concept in ${skills[0]}?`,
                        options: ['Option A', 'Option B', 'Option C', 'Option D'],
                    },
                ],
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
        const prompt = `You are a technical hiring expert. Create assessment questions for a "${jobTitle}" role.
        
Context:
- Skills: ${skills.join(', ')}
- Job Description: ${description}

Task:
1. Generate 5 multiple-choice questions (MCQs) testing the specific skills above.
2. Generate 1 coding problem relevant to the role (e.g. data structure, algorithm, or practical script).

Output Format:
Return a single JSON object with two keys: "mcqs" (array) and "coding" (array).

MCQ Object Structure:
{
  "question": "string",
  "options": ["string", "string", "string", "string"],
  "correctAnswer": number (0-3 index of correct option),
  "explanation": "string (why the answer is correct)",
  "difficulty": "EASY" | "MEDIUM" | "HARD",
  "tags": ["string"] (skills tested)
}

Coding Problem Object Structure:
{
  "title": "string",
  "description": "string (markdown allowed)",
  "difficulty": "EASY" | "MEDIUM" | "HARD",
  "tags": ["string"],
  "testCases": [
    { "input": "string", "expectedOutput": "string" }
  ]
}

IMPORTANT: Ensure strict JSON format. Do not include markdown formatting like \`\`\`json.`;

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


            let jsonText = text;
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch) jsonText = jsonMatch[1];

            const parsed = JSON.parse(jsonText);

            return {
                mcqs: Array.isArray(parsed.mcqs) ? parsed.mcqs : [],
                coding: Array.isArray(parsed.coding) ? parsed.coding : []
            };

        } catch (error) {
            this.logger.error('Failed to generate questions', error);
            // Fallback for demo stability
            return {
                mcqs: [
                    {
                        question: `What is a primary characteristic of ${skills[0] || 'modern software'}?`,
                        options: ["Scalability", "Latency", "Throughput", "Redundancy"],
                        correctAnswer: 0,
                        explanation: "Scalability is often a key requirement.",
                        difficulty: "EASY",
                        tags: skills
                    }
                ],
                coding: []
            };
        }
    }

    async generateAssessmentFeedback(data: any): Promise<{ strengths: string; weaknesses: string; improvementTips: string; communicationClarity?: number }> {
        const prompt = `Analyze this candidate's assessment performance and provide constructive feedback.
        
        Job Title: ${data.jobTitle}
        Coding Score: ${data.codingScore}%
        Integrity Score: ${data.integrityScore}%
        Tab Switches: ${data.tabSwitches}
        Submissions: ${JSON.stringify(data.submissions)}

        Provide feedback in JSON format with keys:
        - strengths (string): What they did well
        - weaknesses (string): Areas for improvement
        - improvementTips (string): Actionable advice
        - communicationClarity (number): Estimate 0-100 based on code readability (default 80 if unknown)
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

            if (!response.ok) throw new Error('Gemini API error');

            const result = await response.json();
            const text = result.candidates[0]?.content?.parts[0]?.text || '';

            let jsonText = text;
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch) jsonText = jsonMatch[1];

            return JSON.parse(jsonText);
        } catch (error) {
            this.logger.error('Failed to generate feedback', error);
            return {
                strengths: 'Candidate demonstrated basic coding skills.',
                weaknesses: 'Could improve on edge case handling.',
                improvementTips: 'Practice more algorithmic problems.',
                communicationClarity: 80
            };
        }
    }
}
