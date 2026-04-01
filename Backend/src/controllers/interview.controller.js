import generateInterviewReportByOpenAi from "../services/ai.service.js";
import {PDFParse} from "pdf-parse";
import PDFDocument from "pdfkit";
import { InterviewReport } from "../models/interviewReport.model.js";

export const generateInterviewReport = async(req,res)=>{
    try {
        const resume = req.file?.buffer;
        let resumeText = "";
        if (resume) {
            const parser = new PDFParse({ data: resume });
            const resumeData = await parser.getText();
            resumeText = resumeData.text;
        }

        const selfDescription = req.body.selfDescription || "";
        const jobDescription = req.body.jobDescription || "";
    
        const interviewReportByAi = await generateInterviewReportByOpenAi({
            resume: resumeText,
            selfDescription,
            jobDescription
        })
        const interviewReport = await InterviewReport.create({
            ...interviewReportByAi,
            jobTitle: interviewReportByAi.title,
            user: req.user._id,
            resume: resumeText,
            selfDescription,
            jobDescription
        })
        res.status(200).json({
            success: true,
            message: "Interview report generated successfully",
            data: interviewReport
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error generating interview report",
            error: error.message
        })
    }
}

export async function getAllInterviewReports(req, res) {
    try {
        const interviewReports = await InterviewReport.find({ user: req.user._id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")
    
        if(!interviewReports){
            return res.status(404).json({
                success: false,
                message: "No interview reports found for this user"
            })
        }
    
        res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching interview reports",
            error: error.message
        })
    }
}

export async function getInterviewReportById(req, res) {
    try {
        const { interviewId } = req.params
        const interviewReport = await InterviewReport.findOne({ _id: interviewId, user: req.user._id })
    
        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }
    
        res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching interview report",
            error: error.message
        })
    }
}

export async function generateResumePdf(req, res) {
    try {
        const { interviewReportId } = req.params;
        const interviewReport = await InterviewReport.findOne({
            _id: interviewReportId,
            user: req.user._id
        });
        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }
        const doc = new PDFDocument();
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=resume.pdf");
        doc.pipe(res);
        doc.text("Resume\n\n");
        doc.text(interviewReport.resume);
        doc.text("\n\nJob Description\n\n");
        doc.text(interviewReport.jobDescription);
        doc.text("\n\nSelf Description\n\n");
        doc.text(interviewReport.selfDescription);
        doc.end();
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}