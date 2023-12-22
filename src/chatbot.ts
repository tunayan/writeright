import axios from 'axios';
import { Configuration } from './configuration';

export class OpenAIChatbot {
    // Assuming Configuration class has a method to retrieve keys
    private readonly openAIKey: string = this.config.getOpenAIKey();
    //private readonly openAIKey: string = ""

    constructor(private config: Configuration) {}

    async getAnswer(question: string): Promise<string> {
        if (!this.openAIKey) {
            return "OpenAI API key not set in settings.";
        }

        try {
            const prompt = `Proofread and correct the following text and rewrite the corrected version. If you don't find any errors, just say "No errors found". Don't use any punctuation around the text:\n\`\`\`${question}\`\`\``;

            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-4-1106-preview",
                messages: [{ role: "user", content: prompt }],
                temperature: 0
            }, {
                headers: {
                    'Authorization': `Bearer ${this.openAIKey}`,
                    'Content-Type': 'application/json'
                }
            });

            // Check if the response contains the answer and return it
            if (response.data.choices && response.data.choices.length > 0) {
                return response.data.choices[0].message.content.trim();
            }

            return "Failed to obtain a valid response from OpenAI.";

        } catch (error) {
            console.error("Error calling OpenAI:", error);
            return "An error occurred when contacting the OpenAI service.";
        }
    }
}
