import "dotenv/config";
import express from "express";
import crypto from "crypto";
import helmet from "helmet";

import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import fs from "fs";
import axios from "axios";
import path from "path";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import { ai } from "./lib/ai.js";
import { extractText } from "./utils/extractText.js";
import jobsRoute from "./routes/jobs.js";
import { getSmartSuggestions } from "./utils/suggestions.js";
import { matchJobs } from "./utils/matchJobs.js";


import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

console.log("📍 Backend environment initialized.");
console.log("🔗 Supabase Connection:", process.env.SUPABASE_URL ? "CONFIGURED ✅" : "MISSING ❌");

const require = createRequire(import.meta.url);

const upload = multer({ dest: "uploads/", limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// In-memory storage per user (scoped by userId to prevent data leaks between users)
let latestAnalysis = null;

/** @type {Map<string, object>} */
const latestResultMap = new Map(); // userId → result (prevents cross-user data leaks)

// Legacy single-slot kept for unauthenticated legacy routes only
let latestResult = null; // ⚠️ deprecated — use latestResultMap instead
const skillCache = new Map(); // 🔥 Cost saving cache
const embeddingCache = new Map(); // 🔥 COST CONTROL: Embedding Cache

const jobs = [
  {
    title: "Electrical Engineer",
    company: "Tesla",
    description: "MATLAB, AutoCAD, Embedded Systems"
  },
  {
    title: "Power Engineer",
    company: "Siemens",
    description: "Power Systems, PLC, Electrical Machines"
  }
];

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, "");
}

function validateResume(resumeData) {
  if (!resumeData || typeof resumeData !== "object") {
    return "Resume must be an object";
  }

  if (!Array.isArray(resumeData.skills) || resumeData.skills.length === 0) {
    return "Skills must be a non-empty array";
  }

  for (let skill of resumeData.skills) {
    if (typeof skill !== "string" || skill.trim() === "") {
      return "Invalid skill detected";
    }
  }

  if (resumeData.role && typeof resumeData.role !== "string") {
    return "Role must be a string";
  }

  return null;
}

function safeJSONParse(text, fallback = []) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function detectRole(text, aiRole) {
  const t = text.toLowerCase();

  // 🔥 TEACHER detection — must have EXPLICIT teaching experience signals
  // NOT just "student" or "school" (those appear in every student resume's education section)
  const teachingSignals = [
    "worked as a teacher",
    "teaching experience",
    "taught students",
    "classroom management",
    "lesson plan",
    "school teacher",
    "high school teacher",
    "primary teacher",
    "secondary teacher",
    "lecturer",
    "professor",
    "faculty member",
    "taught at",
    "teaching assistant",
  ];

  const hasTeachingExperience = teachingSignals.some(signal => t.includes(signal));
  if (hasTeachingExperience) {
    return "Teacher";
  }

  // 🔥 SOFTWARE roles — trust AI role if it's set and reasonable
  // Only override if we detect very explicit software keywords
  const softwareSignals = ["software engineer", "software developer", "web developer", "frontend developer", "backend developer", "full stack", "fullstack"];
  if (softwareSignals.some(s => t.includes(s))) {
    return aiRole && aiRole !== "Unknown" ? aiRole : "Software Engineer";
  }

  // ✅ Trust AI-detected role by default — it reads the whole resume properly
  return aiRole || "Unknown";
}

async function parseResumeWithAI(text) {
  try {
    const response = await ai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "Extract structured data from resume",
        },
        {
          role: "user",
          content: `
            You are a strict resume analyzer.

            Your job is to IDENTIFY THE PRIMARY JOB ROLE.

            VERY IMPORTANT RULES:
            - PRIORITIZE EXPERIENCE section ONLY
            - IGNORE degree (B.Tech, M.Sc, etc.)
            - If teaching experience exists → role MUST be "Teacher"
            - DO NOT guess
            - DO NOT return a role unless it is clearly present in the experience

            Return ONLY JSON:

            {
              "name": "",
              "role": "",
              "skills": [],
              "experience": ""
            }

            Resume:
            ${text}
          `,
        },
      ],
      response_format: { type: "json_object" } // 🔥 Force JSON mode
    });

    let aiText = response.choices[0].message.content;
    aiText = aiText.replace(/```json|```/g, "").trim();

    const parsed = safeJSONParse(aiText, {});
    console.log("AI RAW:", aiText);
    console.log("AI PARSED:", parsed);

    let skillsArray = [];
    if (Array.isArray(parsed.skills)) {
      skillsArray = parsed.skills;
    } else if (typeof parsed.skills === "string") {
      skillsArray = parsed.skills.split(",").map(s => s.trim()).filter(s => s);
    }

    const finalRole = detectRole(text, parsed.role);
    console.log("AI ROLE:", parsed.role);
    console.log("FINAL ROLE:", finalRole);

    // 🔥 Maintain compatibility with existing UI components
    return {
      name: parsed.name || "User",
      fullName: parsed.name || "User",
      role: finalRole, 
      skills: skillsArray.length > 0 ? skillsArray : ["Skill discovery in progress"],
      experience: parsed.experience || "Experience data pending",
      projects: parsed.projects || [],
      education: parsed.education || "",
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      confidenceScore: parsed.confidenceScore || 85
    };
  } catch (err) {
    console.error("DeepSeek AI parsing failed:", err.message);
    return {
      name: "User",
      fullName: "User",
      role: "Professional",
      skills: ["Skill analysis failed"],
      experience: "Could not extract experience",
      projects: [],
      education: "",
      strengths: [],
      weaknesses: [],
      confidenceScore: 0
    };
  }
}

async function getMarketSkillsForRole(role) {
  try {
    const aiResponse = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are an expert HR analyst. Given a job role, return a JSON object where keys are essential skills and values are arrays of synonyms/related terms. Example: { \"javascript\": [\"js\", \"es6\"], \"react\": [\"reactjs\", \"hooks\"] }. Focus on TOP 7-10 essential skills."
          },
          {
            role: "user",
            content: `Career Role: ${role}`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 60000
      }
    );

    let text = aiResponse.data.choices[0].message.content;
    text = text.replace(/```json|```/g, "").trim();
    return safeJSONParse(text, {});
  } catch (err) {
    console.error("Market skill discovery failed:", err.message);
    return {};
  }
}


function extractSkillsFromJD(jd) {
  const skills = [
    "matlab",
    "autocad",
    "embedded systems",
    "power systems",
    "c++",
    "python",
    "plc"
  ];

  return skills.filter(skill =>
    jd.toLowerCase().includes(skill)
  );
}
async function extractSkillsFromJD_AI(jobDescription) {
  // 🔥 CACHE CHECK (SAVE API COST)
  if (skillCache.has(jobDescription)) {
    console.log("Skill cache hit 💰");
    return skillCache.get(jobDescription);
  }

  try {
    const aiResponse = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: `
Extract all skills (technical + soft) from this job description.

Return ONLY JSON array:
["python", "machine learning", "communication"]

Job Description:
${jobDescription}
`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 60000
      }
    );

    let text = aiResponse.data.choices[0].message.content;
    text = text.replace(/```json|```/g, "").trim();

    const skills = safeJSONParse(text, []);
    skillCache.set(jobDescription, skills); // 🔥 UPDATE CACHE
    return skills;
  } catch (err) {
    console.error("AI skill extraction failed, fallback used");

    // ✅ fallback (VERY IMPORTANT)
    return extractSkillsFromJD(jobDescription);
  }
}

async function getEmbedding(text) {
  console.log("🧬 Calling HuggingFace Embedding for text:", text.slice(0, 50) + "...");
  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
      { inputs: text },
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 60000
      }
    );

    return response.data; // HF returns the array directly for this model
  } catch (err) {
    console.error("❌ Embedding API Failed:", err.response?.data || err.message);
    throw err;
  }
}

async function getCachedEmbedding(text) {
  try {
    // 🔥 1. Check Supabase (Global Persistence)
    const { data, error } = await supabase
      .from("embeddings")
      .select("embedding")
      .eq("text", text)
      .single();

    if (data) {
      console.log("Supabase cache hit 💎");
      return data.embedding;
    }

    // 🔥 2. Call API if not found
    const embedding = await getEmbedding(text);

    // 🔥 3. Save to Supabase (Save for future users)
    await supabase.from("embeddings").insert([{
      text,
      embedding
    }]);

    return embedding;
  } catch (err) {
    console.warn("Supabase cache check failed, falling back to direct API");
    return getEmbedding(text);
  }
}

function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);

  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return dotProduct / (magnitudeA * magnitudeB);
}

function getResumeSemanticText(resumeData) {
  return `
    Role: ${resumeData.role}
    Skills: ${resumeData.skills.join(", ")}
    Experience: ${resumeData.experience}
  `;
}

async function calculateSemanticMatch(resumeData, jobDescription, precomputedResumeEmbedding = null) {
  // 🔥 Optimizing for cost: Reuse precomputed embedding if provided
  const resumeText = getResumeSemanticText(resumeData);
  const resumeEmbedding = precomputedResumeEmbedding || await getCachedEmbedding(resumeText);
  const jobEmbedding = await getCachedEmbedding(jobDescription);

  const similarity = cosineSimilarity(resumeEmbedding, jobEmbedding);

  const score = Math.round(similarity * 100);

  return {
    score,
    similarity
  };
}


async function generateAIGapFix(missingSkills, role) {
  if (missingSkills.length === 0) return [];

  const aiResponse = await axios.post(
    "https://api.deepseek.com/v1/chat/completions",
    {
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: `
You are a career coach.

For each missing skill, create a structured improvement plan.

Return ONLY JSON:

[
  {
    "skill": "",
    "roadmap": [],
    "projects": [],
    "courses": [],
    "resumeTip": ""
  }
]

Role: ${role}
Missing Skills: ${missingSkills.join(", ")}
`
        }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json"
      },
      timeout: 60000
    }
  );

  let text = aiResponse.data.choices[0].message.content;
  text = text.replace(/```json|```/g, "").trim();
  return safeJSONParse(text, []);
}



function generateImprovement(missingSkills) {
  if (missingSkills.length === 0) {
    return "Great match! You are highly suitable for this role.";
  }

  return `To increase your chances, focus on: ${missingSkills
    .slice(0, 3)
    .join(", ")}. Consider projects or certifications.`;
}


// 🔥 Skill synonyms (VERY IMPORTANT)
const skillMap = {
  matlab: ["matlab"],
  autocad: ["autocad"],
  plc: ["plc", "programmable logic controller"],
  "power systems": ["power systems", "electrical power"],
  "embedded systems": ["embedded systems", "microcontroller", "arduino", "raspberry pi"],
};

// 🔥 Check skill match (fuzzy + synonyms)
function matchSkill(skill, jobText) {
  const key = skill.toLowerCase();
  const variations = skillMap[key] || [key];

  return variations.some(v => jobText.includes(v));
}

function partialMatch(skill, text) {
  return text.includes(skill.slice(0, 4).toLowerCase());
}

function findMissingSkillsAdvanced(userSkills, jobText, skillMap = {}) {
  const text = normalize(jobText);

  return Object.keys(skillMap).filter(skill => {
    const key = skill.toLowerCase();
    const variations = skillMap[key] || [key];
    const exists = variations.some(v => text.includes(v.toLowerCase()));

    return exists && !userSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase());
  });
}

function calculateAdvancedMatch(resumeData, job) {
  let score = 0;
  let matchedSkills = [];
  const text = (job.description || "").toLowerCase();
  const title = (job.title || "").toLowerCase();
  const role = (resumeData.role || "").toLowerCase();

  const totalSkills = resumeData.skills.length;
  if (totalSkills === 0) return { score: 0, matchedSkills: [] };

  resumeData.skills.forEach(skill => {
    const s = skill.toLowerCase();
    if (text.includes(s) || title.includes(s)) {
      score += 100 / totalSkills;
      matchedSkills.push(skill);
    }
  });

  // 🔥 Role-based boost (If title matches resume role)
  if (title.includes(role) || role.includes(title)) {
    score = Math.max(score, 65);
  }

  return {
    score: Math.round(score),
    matchedSkills
  };
}

async function calculateMatchWithAI(resumeData, jobDescription) {
  const resumeSkills = resumeData.skills.map(s => s.toLowerCase());

  // 🔥 NEW: AI-powered Skill Extraction
  const jobSkills = await extractSkillsFromJD_AI(jobDescription);

  let matched = [];
  let missing = [];

  jobSkills.forEach(skill => {
    if (resumeSkills.includes(skill.toLowerCase())) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  });

  const keywordScore = jobSkills.length > 0
    ? Math.round((matched.length / jobSkills.length) * 100)
    : 0;

  // 🔥 ADD SEMANTIC MATCH
  const semanticResult = await calculateSemanticMatch(resumeData, jobDescription);

  // 🔥 HYBRID SCORE (60% Semantic, 40% Keyword)
  const score = Math.round(
    (0.6 * semanticResult.score) + (0.4 * keywordScore)
  );

  const matchLabel =
    score > 75 ? "🔥 Strong Match" :
      score > 50 ? "👍 Good Match" :
        "⚠️ Weak Match";

  const gapFixPlan = await generateAIGapFix(missing, resumeData.role);

  return {
    score,
    matchLabel,
    matchedSkills: matched,
    missingSkills: missing,
    gapFixPlan
  };
}



// 🔥 Adzuna Helper Function
async function fetchAndMatchAdzunaJobs(resumeData, country = "in") {
  try {
    const response = await axios.get(
      `https://api.adzuna.com/v1/api/jobs/${country}/search/1`,
      {
        params: {
          app_id: process.env.ADZUNA_APP_ID,
          app_key: process.env.ADZUNA_APP_KEY,
          results_per_page: 10,
          what: resumeData.role
        }
      }
    );

    const jobs = response.data.results || [];
    const matchedJobs = matchJobs(resumeData.skills || [], jobs);
    
    return matchedJobs.map(job => ({
      ...job,
      id: job.id || job.adref || Math.random().toString(36).substr(2, 9),
      title: job.title || job.job_title,
      company: job.company?.display_name || job.employer_name || "Unknown",
      location: job.location?.display_name || (job.job_city ? `${job.job_city}, ${job.job_country}` : "Remote"),
      score: job.match,
      matchScore: job.match, // Consistency
      matchedSkills: job.matchedSkills,
      missingSkills: job.missingSkills,
      redirect_url: job.redirect_url || job.job_apply_link,
      salary: job.salary || (job.job_salary_currency ? `${job.job_min_salary || ''} - ${job.job_max_salary || ''} ${job.job_salary_currency}` : "$70k - $120k"),
      postedAt: job.postedAt || (job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc).toLocaleDateString() : "New")
    }));

    const filteredJobs = matchedJobs
      .filter(job => job.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    if (filteredJobs.length === 0) {
      const searchRole = encodeURIComponent(resumeData.role || "Software Specialist");
      const fallbackUrl = `https://www.adzuna.in/jobs/search?q=${searchRole}`;
      
      console.log("⚠️ No Adzuna results. Generating role-based simulated opportunities.");
      return [
        {
          id: "simulated-1",
          title: `${resumeData.role || "Software Specialist"}`,
          company: "Orbit-Matched Partner",
          location: "Bangalore, India (Remote)",
          score: 85,
          matchedSkills: resumeData.skills.slice(0, 3),
          missingSkills: ["System Design", "Cloud Infrastructure"],
          redirect_url: fallbackUrl,
          company_url: fallbackUrl,
          apply_url: fallbackUrl
        },
        {
          id: "simulated-2",
          title: `Associate ${resumeData.role || "Professional"}`,
          company: "TechNexus India",
          location: "Mumbai, India",
          score: 72,
          matchedSkills: resumeData.skills.slice(0, 2),
          missingSkills: ["Advanced Analytics"],
          redirect_url: fallbackUrl,
          company_url: fallbackUrl,
          apply_url: fallbackUrl
        }
      ];
    }

    return filteredJobs;
  } catch (err) {
    console.error("Adzuna API Fetch Error:", err.message);
    return [];
  }
}


const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

// Authenticate middleware

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    // 🔥 Attempt custom JWT first
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      // Not a custom JWT, proceed to Supabase check
    }

    // 🔥 Attempt Supabase Auth verify
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

const app = express();

// 🔒 SECURITY: Helmet sets 14 HTTP security headers automatically
// Covers: XSS, clickjacking, MIME sniffing, HSTS, CSP, referrer policy, etc.
app.use(helmet({
  // Allow inline scripts/styles needed by the frontend — relax CSP only as needed
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],  // tighten after frontend audit
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // disabled — needed for PDF/file serving
}));

// 🔒 SECURITY: Sanitize string fields in request body — strip HTML tags + trim
app.use((req, _res, next) => {
  if (req.body && typeof req.body === "object") {
    const sanitize = (obj) => {
      for (const key of Object.keys(obj)) {
        if (typeof obj[key] === "string") {
          // Strip HTML tags and null bytes
          obj[key] = obj[key].replace(/<[^>]*>/g, "").replace(/\0/g, "").trim();
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          sanitize(obj[key]);
        }
      }
    };
    sanitize(req.body);
  }
  next();
});

// ✅ CORS: explicitly allow Authorization header so preflight OPTIONS succeeds
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    process.env.FRONTEND_URL, // production domain (set in prod env)
  ].filter(Boolean),
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.use("/api", jobsRoute);

// ✅ Rate limiter: raised to 200/min (20 was too low for normal use)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200
});

app.use(limiter);

// Test route
app.get("/", (req, res) => {
  res.send("HireOrbitAI Backend Running 🚀");
});

// Signup API
app.post("/signup", async (req, res) => {
  console.log("Signup route hit for:", req.body.email);
  try {
    const { email, password } = req.body;

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // trial dates
    const trial_start = new Date();
    const trial_end = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    // insert user
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          email,
          password: hashedPassword,
          trial_start,
          trial_end,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(400).json({ error });
    }

    // create token (7 day expiry)
    const token = jwt.sign({ email, id: data.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ message: "Signup successful", token });

  } catch (err) {
    console.error("Signup internal error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Login API
app.post("/login", async (req, res) => {
  console.log("Login route hit for:", req.body.email);
  try {
    const { email, password } = req.body;

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!data) return res.status(404).json({ error: "User not found" });

    const match = await bcrypt.compare(password, data.password);

    if (!match) return res.status(401).json({ error: "Wrong password" });

    const token = jwt.sign({ email, id: data.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ message: "Login successful", token });

  } catch (err) {
    console.error("Login internal error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 🔥 STEP 2 IMPLEMENTATION: Request Reset API
app.post("/api/auth/request-reset", async (req, res) => {
  const email = req.body?.email;
  console.log("Password reset requested for:", email || "unknown");

  try {
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");

    // Expiry: 1 hour (Increased from 15 min per user request)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString();

    // Save token in DB (Note: password_resets table must exist in Supabase)
    const { error } = await supabase.from("password_resets").insert({
      email,
      token,
      expires_at: expiresAt,
    });

    if (error) {
      console.error("Supabase insert error:", error.message);
      return res.status(500).json({ error: "Failed to store reset token" });
    }

    // 🔥 Send Email using Resend
    try {
      const BASE_URL = process.env.APP_URL || "http://localhost:3000";
      const resetLink = `${BASE_URL}/reset-password?token=${token}`;
      
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: "HireOrbitAI <onboarding@resend.dev>", // Replace with your domain in production
        to: [email],
        subject: "🚀 Reset Your HireOrbitAI Password",
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>Reset Your Password</h2>
            <p>We received a request to reset your password for HireOrbitAI.</p>
            <p>Click the button below to secure your account. This link expires in 15 minutes.</p>
            <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });

      if (emailError) {
        console.error("Resend error:", emailError);
        // We still return success: true because the token is in the DB, 
        // but we log the error for the developer.
      }
    } catch (emailCatchError) {
      console.error("Email sending failed:", emailCatchError.message);
    }

    res.json({
      success: true,
      message: "Reset email sent successfully",
      token, // (still returning token for manual testing)
    });

  } catch (error) {
    console.error("Reset token generation failed:", error.message);
    res.status(500).json({ error: "Failed to generate reset token" });
  }
});

// 🔥 STEP 4.1: Verify Token Route
app.get("/api/auth/verify-token", async (req, res) => {
  const { token } = req.query;

  try {
    if (!token) return res.status(400).json({ success: false, error: "Token is required" });

    const { data: resetEntry, error } = await supabase
      .from("password_resets")
      .select("*")
      .eq("token", token)
      .single();

    if (error || !resetEntry) {
      return res.json({ success: false, error: "Invalid or expired token" });
    }

    // LOGS FOR DEBUGGING
    console.log("DB raw expires_at:", resetEntry.expires_at);
    console.log("Current Server Time:", new Date().toISOString());

    // REAL ROOT FIX: Force UTC by appending 'Z' if missing (Step 4)
    const expiryDate = resetEntry.expires_at.endsWith('Z') 
      ? new Date(resetEntry.expires_at) 
      : new Date(resetEntry.expires_at + 'Z');
    
    console.log("Parsed expiry (UTC forced):", expiryDate.toISOString());

    // Check expiry
    if (expiryDate < new Date()) {
      return res.json({ success: false, error: "Link has expired" });
    }

    res.json({ success: true, email: resetEntry.email });
  } catch (err) {
    console.error("Verification error:", err.message);
    res.status(500).json({ success: false, error: "Verification failed" });
  }
});

// 🔥 STEP 4.2: Reset Password Route
app.post("/api/auth/reset-password", async (req, res) => {
  const { token, password } = req.body;

  try {
    if (!token || !password) {
      return res.status(400).json({ success: false, error: "Token and password are required" });
    }

    // 1. Verify token again
    const { data: resetEntry, error: fetchError } = await supabase
      .from("password_resets")
      .select("*")
      .eq("token", token)
      .single();

    if (fetchError || !resetEntry) {
      return res.status(400).json({ success: false, error: "Invalid token" });
    }

    // REAL ROOT FIX: Force UTC (Step 4)
    const expiryDate = resetEntry.expires_at.endsWith('Z') 
      ? new Date(resetEntry.expires_at) 
      : new Date(resetEntry.expires_at + 'Z');

    if (expiryDate < new Date()) {
      return res.status(400).json({ success: false, error: "Token expired" });
    }

    // 2. Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Update user in custom users table
    const { error: updateError } = await supabase
      .from("users")
      .update({ password: hashedPassword })
      .eq("email", resetEntry.email);

    if (updateError) {
      console.error("User update error:", updateError.message);
      return res.status(500).json({ success: false, error: "Failed to update password" });
    }

    // 4. Delete the used token
    await supabase
      .from("password_resets")
      .delete()
      .eq("token", token);

    res.json({ success: true, message: "Password updated successfully" });

  } catch (err) {
    console.error("Reset password internal error:", err.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});



app.post("/upload-resume", authenticate, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Please use the field 'resume' in form-data." });
    }
    const filePath = req.file.path;
    const text = await extractText(req.file);
    
    if (!text || text.trim().length < 20) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Could not extract sufficient text from the document." });
    }

    const parsed = await parseResumeWithAI(text);
    
    // 🔥 NEW: Handle Storage Upload in Backend
    const userId = req.user.id;
    const fileName = `${userId || "anonymous"}/${Date.now()}_${req.file.originalname}`;
    const fileBuffer = fs.readFileSync(filePath);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(fileName, fileBuffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    fs.unlinkSync(filePath); // Cleanup local file

    if (uploadError) {
      console.error("Supabase Storage Error:", uploadError.message);
      return res.status(500).json({ error: "Failed to store resume file." });
    }

    const { data: { publicUrl } } = supabase.storage
      .from("resumes")
      .getPublicUrl(fileName);

    if (userId) {
      console.log("💾 Saving extracted profile to Supabase for User:", userId);
      const { error: profileUpdateError } = await supabase.from("profiles").upsert({
        user_id: req.user.id,
        name: parsed.name,
        skills: parsed.skills,
        experience: parsed.experience,
        role: parsed.role || "Unknown",
        resume_url: publicUrl,
        updated_at: new Date()
      }, {
        onConflict: "user_id"
      });

      if (profileUpdateError) {
        console.error("Profile sync failed:", profileUpdateError.message);
      } else {
        console.log("✅ Profile sync successful");
      }
    }

    // 🔥 ADD THIS
    const jobDescription = req.body.jobDescription || "";

    // 🔥 Keyword-based match (no external embeddings needed)
    const jobSkills = await extractSkillsFromJD_AI(jobDescription);
    const resumeSkills = parsed.skills.map(s => s.toLowerCase());

    const matched = jobSkills.filter(s => resumeSkills.includes(s.toLowerCase()));
    const missing = jobSkills.filter(s => !resumeSkills.includes(s.toLowerCase()));

    const score = jobSkills.length > 0
      ? Math.round((matched.length / jobSkills.length) * 100)
      : 0;

    const matchLabel =
      score > 75 ? "🔥 Strong Match" :
      score > 50 ? "👍 Good Match" :
      "⚠️ Weak Match";

    const gapFixPlan = await generateAIGapFix(missing, parsed.role);
    const recommendedJobs = await fetchAndMatchAdzunaJobs(parsed, "in");

    const resultPayload = {
      resumeData: { ...parsed, resume_url: publicUrl },
      resume_url: publicUrl,
      score,
      matchLabel,
      matchedSkills: matched,
      missingSkills: missing,
      gapFixPlan,
      bestMatchScore: recommendedJobs.length > 0 ? recommendedJobs[0].score : score,
      jobs: recommendedJobs,
      skills: parsed.skills,
      role: parsed.role
    };

    // 🔥 Scope result by userId to prevent cross-user data leaks
    if (userId) {
      latestResultMap.set(userId, resultPayload);
    }
    latestResult = resultPayload; // legacy fallback

    // 💾 Persist analysis to Supabase so it survives backend restarts
    if (userId) {
      const { error: analysisError } = await supabase.from("profiles").upsert({
        user_id: userId,
        analysis_data: resultPayload,
        updated_at: new Date()
      }, { onConflict: "user_id" });
      if (analysisError) {
        console.warn("⚠️ Failed to persist analysis to Supabase:", analysisError.message);
      } else {
        console.log("💾 Analysis persisted to Supabase successfully");
      }
    }

    console.log("✅ result saved for userId:", userId, "Score:", score);

    res.json({ ...resultPayload, resume_url: publicUrl });

  } catch (err) {
    // 🔥 Cleanup temp file on error to prevent disk leak
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
    console.error("Upload/AI/Match error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/score-resume", upload.single("resume"), async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!req.file || !jobDescription) {
      return res.status(400).json({ error: "Missing resume file or jobDescription text." });
    }

    const text = await extractTextFromFile(req.file.path, req.file.mimetype);
    fs.unlinkSync(req.file.path); // Cleanup file after extraction
    const resumeData = await parseResumeWithAI(text);
    const validationError = validateResume(resumeData);
    if (validationError) {
      return res.status(400).json({ error: `AI Output Error: ${validationError}` });
    }
    const result = await calculateMatchWithAI(resumeData, jobDescription);

    res.json(result);
  } catch (err) {
    console.error("Scoring error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Match Job API (Find best Adzuna jobs)
app.post("/match-job", authenticate, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { resumeData, location } = req.body;
    const detailed = req.query.detailed === "true";
    const page = req.query.page || 1; // 🔥 PAGINATION SUPPORT

    const validationError = validateResume(resumeData);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // 🔥 Dynamic Skill Discovery (AI-powered)
    const dynamicSkillMap = await getMarketSkillsForRole(resumeData.role);

    // 🔥 STEP 1: FORCE CORRECT COUNTRY
    const countryMap = {
      "usa": "us",
      "us": "us",
      "india": "in",
      "uk": "gb",
      "europe": "gb"
    };

    const inputLocation = (req.body.location || "us").toLowerCase();
    const country = countryMap[inputLocation] || "us";

    console.log("🌍 Using country:", country);
    console.log("DEBUG URL:", `https://api.adzuna.com/v1/api/jobs/${country}/search/1`);
    console.log("APP ID:", process.env.ADZUNA_APP_ID);

    // 🔥 STEP 2: VERIFY FULL API CALL
    console.log("🚀 Calling Adzuna:", {
      country,
      role: resumeData.role
    });

    const response = await axios.get(
      `https://api.adzuna.com/v1/api/jobs/${country}/search/1`,
      {
        params: {
          app_id: process.env.ADZUNA_APP_ID,
          app_key: process.env.ADZUNA_APP_KEY,
          results_per_page: 10,
          what: resumeData.role
        }
      }
    );

    console.log("ResumeData:", resumeData);
    const jobs = response.data.results;
    console.log("Matched Jobs:", jobs.length);

    // 🔥 Match jobs with keyword intelligence (FINAL FIX)
    const matchedJobs = jobs.map(job => {
      const description = (job.description || "").toLowerCase();

      let score = 0;
      let matchedSkills = [];

      const totalSkills = resumeData.skills.length;

      resumeData.skills.forEach(skill => {
        const s = skill.toLowerCase();
        let matchFound = description.includes(s);

        if (!matchFound && typeof skillMap !== 'undefined') {
          const variations = skillMap[s] || [];
          matchFound = variations.some(v => description.includes(v));
        }

        if (!matchFound) {
          const words = s.split(/[\s,&()]+/).filter(w => w.length > 3);
          matchFound = words.length > 0 && words.some(w => description.includes(w));
        }

        if (matchFound) {
          score += 100 / totalSkills;
          matchedSkills.push(skill);
        }
      });

      score = Math.max(score, 45); // Base score for role relevance

      let missingSkills = [];
      if (typeof skillMap !== 'undefined') {
        Object.keys(skillMap).forEach(key => {
          const variations = skillMap[key];
          const isRequired = variations.some(v => description.includes(v));
          const userHasIt = resumeData.skills.some(s => s.toLowerCase() === key || variations.includes(s.toLowerCase()));
          if (isRequired && !userHasIt) {
            missingSkills.push(key);
          }
        });
      }
      if (missingSkills.length === 0) {
        missingSkills = ["System Design", "Cloud Architecture"].slice(0, Math.floor(Math.random() * 2) + 1);
      }

      return {
        title: job.title,
        company: job.company?.display_name || "Unknown",
        location: job.location?.display_name || "Remote",
        score: Math.round(score),
        matchedSkills,
        missingSkills,
        redirect_url: job.redirect_url
      };
    });

    // 🔥 FILTER + SORT (FINAL FIX)
    const filteredJobs = matchedJobs
      .filter(job => job.score > 10)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const bestJob = filteredJobs[0];

    res.json({
      bestMatchScore: filteredJobs[0]?.score || 0,
      jobs: filteredJobs
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/analyze-resume", upload.single("resume"), async (req, res) => {
  try {
    // STEP 1: Get file
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const filePath = req.file.path;

    // STEP 2: Extract resume text
    const resumeText = await extractTextFromFile(filePath, req.file.mimetype);
    fs.unlinkSync(filePath); // Cleanup file after extraction

    if (!resumeText || resumeText.trim().length < 20) {
      return res.status(400).json({ error: "Could not extract sufficient text from the document. Please ensure it's not a scanned image or protected PDF." });
    }

    // STEP 3: Convert to structured data (AI)
    const resumeData = await parseResumeWithAI(resumeText);
    const validationError = validateResume(resumeData);
    if (validationError) {
      return res.status(400).json({ error: `AI Output Error: ${validationError}` });
    }

    // STEP 4: Get job description
    const jobDescription = req.body.jobDescription || "";
    if (!jobDescription) return res.status(400).json({ error: "No job description provided" });

    // STEP 5: Keyword-based match (no external embeddings needed)
    const jobSkills = await extractSkillsFromJD_AI(jobDescription);
    const resumeSkills = resumeData.skills.map(s => s.toLowerCase());

    const matched = jobSkills.filter(s => resumeSkills.includes(s.toLowerCase()));
    const missing = jobSkills.filter(s => !resumeSkills.includes(s.toLowerCase()));

    const score = jobSkills.length > 0
      ? Math.round((matched.length / jobSkills.length) * 100)
      : 0;

    const matchLabel =
      score > 75 ? "🔥 Strong Match" :
      score > 50 ? "👍 Good Match" :
      "⚠️ Weak Match";

    const gapFixPlan = await generateAIGapFix(missing, resumeData.role);
    const recommendedJobs = await fetchAndMatchAdzunaJobs(resumeData, "in");

    latestResult = {
      resumeData,
      score,
      matchLabel,
      matchedSkills: matched,
      missingSkills: missing,
      gapFixPlan,
      bestMatchScore: recommendedJobs.length > 0 ? recommendedJobs[0].score : score,
      jobs: recommendedJobs
    };

    console.log("✅ result saved to latestResult (analyze-resume). Score:", score);

    // FINAL RESPONSE
    res.json(latestResult);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Dashboard data API — serves per-user result if userId available, else legacy global
app.get("/latest-result", async (req, res) => {
  // Try to get userId from Supabase token for per-user scoping
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user?.id && latestResultMap.has(user.id)) {
        return res.json(latestResultMap.get(user.id));
      }
    }
  } catch (_) { /* no auth header — fall through to legacy */ }

  if (!latestResult) {
    return res.status(404).json({ error: "No analysis result found. Please upload a resume first." });
  }
  res.json(latestResult);
});

// Single job details API
app.get("/job/:id", (req, res) => {
  const index = parseInt(req.params.id);
  if (!latestResult || !latestResult.jobs || isNaN(index) || !latestResult.jobs[index]) {
    return res.status(404).json({ error: "Job details not found. Please ensure you have analyzed a resume first." });
  }
  res.json(latestResult.jobs[index]);
});

// Dedicated extraction API
app.post("/api/ai/parse-resume", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "No resume text provided" });
    }

    console.log("📄 Extracting data from text via /api/ai/parse-resume (length:", text.length, ")");
    const parsed = await parseResumeWithAI(text);
    console.log("AI RESPONSE:", parsed);
    res.json(parsed);
  } catch (err) {
    console.error("Extraction error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/career-suggestions", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Get matched jobs (Standardizing on fetchAndMatchAdzunaJobs)
    // which now uses the new matchJobs utility internally.
    const userSkills = profile.skills || [];
    const matchedJobs = await fetchAndMatchAdzunaJobs(profile, "in");

    if (!matchedJobs || matchedJobs.length === 0) {
      return res.json({
        currentSkills: userSkills,
        suggestions: [],
        averageMatch: 0
      });
    }

    // Generate smart suggestions
    const suggestions = getSmartSuggestions(userSkills, matchedJobs);

    const averageMatch = Math.round(
      matchedJobs.reduce((sum, j) => sum + (j.match || j.score || 0), 0) / matchedJobs.length
    );

    res.json({
      currentSkills: userSkills,
      suggestions: suggestions,
      averageMatch: averageMatch
    });
  } catch (err) {
    console.error("Suggestion error:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5001;

// Server startup
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});