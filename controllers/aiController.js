import Resume from "../models/Resume.js";
import ai from "../configs/ai.js";

// Helper to handle OpenAI errors properly
const handleOpenAIError = (error, res) => {
  console.error("OpenAI Error:", error);

  // 429 = Rate limit or quota exceeded (common on free tier)
  if (error?.status === 429 || error?.code === 'insufficient_quota') {
    return res.status(429).json({
      message: "OpenAI rate limit exceeded. Please wait a moment and try again. (Free tier has strict limits)"
    });
  }

  // 401 = Bad API key
  if (error?.status === 401) {
    return res.status(401).json({
      message: "Invalid OpenAI API key. Check your .env file."
    });
  }

  // 503 = OpenAI down
  if (error?.status === 503) {
    return res.status(503).json({
      message: "OpenAI service is temporarily unavailable. Try again later."
    });
  }

  return res.status(500).json({
    message: error?.message || "AI service error"
  });
};

// Enhance Professional Summary
export const enhanceProfessionalSummary = async (req, res) => {
  try {
    const { userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      max_tokens: 200, // ✅ Limit tokens to avoid quota burn
      messages: [
        {
          role: "system",
          content:
            "You are an expert in resume writing. Enhance the professional summary in 1-2 sentences, ATS-friendly, only return text.",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    const enhancedContent = response.choices[0].message.content;
    return res.status(200).json({ enhancedContent });

  } catch (error) {
    return handleOpenAIError(error, res);
  }
};

// Enhance Job Description
export const enhanceJobDescription = async (req, res) => {
  try {
    const { userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      max_tokens: 200, // ✅ Limit tokens to avoid quota burn
      messages: [
        {
          role: "system",
          content:
            "You are an expert in resume writing. Enhance job description with action verbs and achievements. 1-2 lines only, ATS-friendly.",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    const enhancedContent = response.choices[0].message.content;
    return res.status(200).json({ enhancedContent });

  } catch (error) {
    return handleOpenAIError(error, res);
  }
};

// Upload Resume
export const uploadResume = async (req, res) => {
  try {
    const { resumeText, title } = req.body;
    const userId = req.userId;

    // ✅ Reject empty or placeholder text — don't waste API quota
    if (
      !resumeText ||
      resumeText.trim() === "" ||
      resumeText === "resume uploaded without text extraction"
    ) {
      return res.status(400).json({
        message: "Could not extract text from the PDF. Please make sure it's a text-based PDF, not a scanned image."
      });
    }

    // ✅ Truncate long resumes to avoid hitting token limits on free tier
    const truncatedText = resumeText.slice(0, 3000);

    const systemPrompt =
      "You are an expert AI that extracts structured data from resumes. Return ONLY valid JSON with no explanation, no markdown, no code blocks.";

    const userPrompt = `Extract structured data from this resume text and return ONLY a JSON object:

${truncatedText}

Return this exact JSON structure (fill in what you find, leave empty string or empty array if not found):
{
  "personal_info": {
    "full_name": "",
    "profession": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "website": ""
  },
  "experience": [],
  "projects": [],
  "education": []
}`;

    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      max_tokens: 1000, // ✅ Cap tokens — free tier burns out fast
      temperature: 0,   // ✅ Deterministic output = more reliable JSON
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    let extractedData = response.choices[0].message.content.trim();

    // ✅ Strip markdown code fences if model wraps response in ```json ... ```
    if (extractedData.startsWith("```")) {
      extractedData = extractedData
        .replace(/^```json?\n?/, "")
        .replace(/```$/, "")
        .trim();
    }

    let parsedData;
    try {
      parsedData = JSON.parse(extractedData);
    } catch {
      console.error("AI returned invalid JSON:", extractedData);
      return res.status(500).json({
        message: "AI returned invalid data format. Please try again."
      });
    }

    const newResume = await Resume.create({
      userId,
      title: title || parsedData?.personal_info?.full_name || "Uploaded Resume",
      ...parsedData,
    });

    return res.json({ resumeId: newResume._id });

  } catch (error) {
    return handleOpenAIError(error, res);
  }
};