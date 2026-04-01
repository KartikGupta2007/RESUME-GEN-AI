import { Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { generateInterviewReport, getAllInterviewReports, getInterviewReportById, generateResumePdfController } from "../controllers/interview.controller.js";
import { upload } from "../middlewares/upload.middleware.js";


const interviewRouter = Router();


interviewRouter.post("/", verifyJWT, upload.single("resume"), generateInterviewReport)

interviewRouter.get("/report/:interviewId", verifyJWT, getInterviewReportById)

interviewRouter.get("/reports", verifyJWT, getAllInterviewReports)

interviewRouter.get("/report/:interviewReportId/resume", verifyJWT, generateResumePdfController)

export default interviewRouter;