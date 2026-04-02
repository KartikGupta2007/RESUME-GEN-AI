import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import dotenv from "dotenv";
dotenv.config();

const AI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job description"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The behavioral question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

export default async function generateInterviewReportByOpenAi({ resume, selfDescription, jobDescription }) {
    if (!process.env.OPENAI_API_KEY) {
        const error = new Error("OPENAI_API_KEY is missing on server")
        error.statusCode = 500
        throw error
    }

    const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}
`

    try {
        const response = await client.responses.parse({
            model: AI_MODEL,
            temperature: 0.3,
            input: prompt,
            text: {
                format: zodTextFormat(interviewReportSchema, "interviewReport"),
            },
        });

        if (!response.output_parsed) {
            const parseError = new Error("Failed to parse AI response")
            parseError.statusCode = 502
            throw parseError
        }

        return response.output_parsed;
    } catch (error) {
        const wrappedError = new Error(error?.error?.message || error?.message || "AI generation failed")
        wrappedError.statusCode = error?.status || error?.statusCode || 502
        throw wrappedError
    }
}