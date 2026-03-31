import mongoose from "mongoose";

/*
    Job description: String (required)
    Resume text;(user uploads their resume and we extract text from it using some library like textract or pdf-parse) String (required)
    Self description: String (required)

    Match score: Number (calculated based on how well the resume and self description match the job description)

    Technical questions: Array of objects (each object contains question, intention behind the question and answer provided by the user)
    [{
        question: String,
        intention: String,
        answer: String
    }]

    Behavioral questions: Array of objects (each object contains question, intention behind the question and answer provided by the user)
    [{
        question: String,
        intention: String,
        answer: String
    }]

    Skill gaps: Array of objects (each object contains skill and severity of the gap)
    [{
        skill: String,
        severity: String (low, medium, high)
    }]

    Preparation plan: Array of objects (each object contains day, focus and tasks for the day)
    [{
    day: Number,
    focus: String,
    tasks: [String]
    }]

    User: Reference to the user who created the report

*/
const technicalQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [ true, "Technical question is required" ]
    },
    intention: {
        type: String,
        required: [ true, "Intention is required" ]
    },
    answer: {
        type: String,
        required: [ true, "Answer is required" ]
    }
}, {
    _id: false
})



const behavioralQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [ true, "Behavioral question is required" ]
    },
    intention: {
        type: String,
        required: [ true, "Intention is required" ]
    },
    answer: {
        type: String,
        required: [ true, "Answer is required" ]
    }
}, {
    _id: false
})


const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [ true, "Skill is required" ]
    },
    severity: {
        type: String,
        enum: [ "low", "medium", "high" ],
        required: [ true, "Severity is required" ]
    }
}, {
    _id: false
})



const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [ true, "Day is required" ]
    },
    focus: {
        type: String,
        required: [ true, "Focus is required" ]
    },
    tasks: [{
        type: String,
        required: [ true, "Task is required" ]
    }]
})



const interviewReportSchema = new mongoose.Schema({
    jobDescription: {
        type: String,
        required: [ true, "Job description is required" ]
    },
    jobTitle: {
        type: String,
        required: [ true, "Job title is required" ]
    },
    resume: {
        type: String,
    },
    selfDescription: {
        type: String,
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
    },
    technicalQuestions: [ technicalQuestionSchema ],
    behavioralQuestions: [ behavioralQuestionSchema ],
    skillGaps: [ skillGapSchema ],
    preparationPlan: [ preparationPlanSchema ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
}, {
    timestamps: true
})


export const InterviewReport = mongoose.model("InterviewReport", interviewReportSchema);
