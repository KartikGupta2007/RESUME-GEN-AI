import generateInterviewReportByOpenAi from "./src/services/ai.service.js";
generateInterviewReportByOpenAi({
    resume: "Software Engineer",
    selfDescription: "5 years experience",
    jobDescription: "Senior Software Engineer"
}).then(console.log).catch(console.error);
