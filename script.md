# Resume-Gen-AI Demo Video Script

## [0:00 - 0:25] Opening
Hello everyone, I am excited to present my end-term MERN stack project, Resume-Gen-AI.

This project solves a practical problem for job seekers: preparing for interviews is usually scattered across different tools, random question lists, and generic advice. Resume-Gen-AI turns that into one focused workflow by generating a personalized interview strategy based on a target job description and the candidate profile.

The complete stack is MongoDB, Express.js, React, and Node.js.

[Open Browser]

## [0:25 - 1:10] Product Walkthrough (What the User Can Do)
Let me quickly show the user journey.

First, users can register and log in securely.
After authentication, they land on the main dashboard where they can:
- Paste a target job description
- Upload a resume PDF, or provide a self-description
- Generate an AI-powered interview report

Once the report is generated, users can explore:
- Technical questions with intent and strategy
- Behavioral questions with intent and strategy
- Skill gap analysis with severity
- A day-wise preparation roadmap

They can also view previous reports and download a generated resume-style PDF.

[Click through Home page -> Generate flow -> Interview report sections]

## [1:10 - 2:05] Backend Overview (Node.js + Express)
[Show Code]

Now I will show the backend architecture briefly.

The API is organized into route, controller, and middleware layers.
Main route groups are:
- User routes: registration, login, logout, profile, token refresh
- Interview routes: generate report, fetch report history, fetch single report, download resume PDF

A key protected endpoint is this one:

```js
interviewRouter.post("/", verifyJWT, upload.single("resume"), generateInterviewReport)
```

This one line demonstrates three important backend concepts:
- JWT protection through middleware
- Multipart file upload support for resume PDFs
- Controller-driven business logic

Inside the interview controller, there is strict validation before AI processing.

```js
if (!jobDescription) {
  return res.status(400).json({ success: false, message: "Job description is required" });
}

if (!resume && !selfDescription) {
  return res.status(400).json({ success: false, message: "Please provide either a resume PDF or self description" });
}
```

After validation, the server parses resume content, generates AI output, and persists the report in MongoDB linked to the authenticated user.

## [2:05 - 2:40] Auth Middleware and Security
[Show Code]

For security, private routes use a JWT verification middleware.

```js
const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
req.user = user;
```

This ensures only authenticated users can generate or view their reports.
The app also uses HttpOnly cookies and refresh-token flow for better session handling.

## [2:40 - 3:20] Database Design (MongoDB)
[Switch to MongoDB Atlas]

On MongoDB Atlas, I mainly use two collections:
- users
- interviewreports

The most important schema is InterviewReport, which stores:
- jobTitle and jobDescription
- resume text and selfDescription
- matchScore
- technicalQuestions
- behavioralQuestions
- skillGaps
- preparationPlan
- user reference

So the data flow is:
Frontend request -> Express route -> validation + AI service -> MongoDB save -> response back to frontend.

That gives each user a personalized and persistent interview history.

## [3:20 - 4:20] Frontend Overview (React)
[Show Code]

On the frontend, React is structured by features.

At app level, routing includes public pages and protected pages:
- /login
- /register
- /
- /profile
- /interview/:interviewId

Protected pages are wrapped to enforce authentication.

Auth state is managed through context and initialized on app load:

```js
useEffect(() => {
  const initAuth = async () => {
    try {
      const data = await getCurrentUser();
      setUser(data?.data ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  initAuth();
}, []);
```

Interview generation uses a clean API integration with FormData:

```js
const formData = new FormData();
if (jobDescription) formData.append("jobDescription", jobDescription);
if (selfDescription) formData.append("selfDescription", selfDescription);
if (resumeFile) formData.append("resume", resumeFile);

const response = await api.post("/api/v1/interview/", formData, {
  headers: { "Content-Type": "multipart/form-data" }
});
```

The generated response updates context state and drives report rendering in the Interview page.

## [4:20 - 4:45] Important Code Highlights Recap
[Show Code Split View]

Quick recap of key code highlights:
- Protected interview route with auth + file upload middleware
- Controller validation and report creation
- JWT middleware attaching user to request
- React auth initialization with context
- Multipart API call from frontend to backend

These are the core integration points that make the app production-oriented.

## [4:45 - 5:05] Deployment / Live Demo
[Open Browser - GitHub + Live URL]

This project is version-controlled on GitHub.
Frontend is deployed on Vercel.
Backend is deployed on Render.
Database is hosted on MongoDB Atlas.

If available during your recording, show:
- GitHub repository page
- Live deployed URL

## [5:05 - 5:25] Strong Closing
To conclude, Resume-Gen-AI is a complete MERN application that combines authentication, file processing, AI-powered report generation, and personalized interview planning in a single workflow.

The strongest part of this project is the end-to-end integration: each layer, from React UI to Express APIs to MongoDB persistence, is connected cleanly and serves a real user need.

Thank you for watching.

---

## Optional Delivery Tips While Recording
- Keep your pace steady and confident, around 125 to 145 words per minute.
- While showing code, zoom in and stay on only the lines you are narrating.
- Avoid reading every line; explain intent, not syntax.
- Keep transitions short: What user does -> what API does -> what database stores.
- End with one clear value statement: personalized interview preparation at scale.
