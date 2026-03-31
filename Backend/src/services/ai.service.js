import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
const run = async () => {
    try {
        const response = await client.responses.create({
            model: "gpt-5.4",
            input: "Write a one-sentence bedtime story about a unicorn."
        });
        console.log(response.output_text);
    } catch (error) {
        console.error(error);
    }
};
run();