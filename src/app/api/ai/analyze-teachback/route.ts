import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const MOCK_ANALYSIS = {
  completeness: 55,
  accuracy: 60,
  depth: 45,
  overallScore: 53,
  feedback:
    "Your explanation covers some key points but misses important details. You correctly identified the basic idea but need to explain the relationship between the concept and its prerequisites more clearly. Try using specific examples to deepen your understanding.",
  misconceptionsFound: [
    "Treats the concept as a static value rather than a dynamic process",
  ],
  missingConcepts: [
    "Connection to prerequisite concepts",
    "Real-world application examples",
    "Mathematical notation and formal definition",
  ],
};

export async function POST(request: Request) {
  try {
    const { concept, conceptDescription, explanation } = await request.json();

    // Try Gemini API if key is available
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.log("No GEMINI_API_KEY found, using mock response");
      return NextResponse.json(MOCK_ANALYSIS);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an educational AI evaluating a student's "teach-back" explanation of a concept.

CONCEPT: ${concept}
CONCEPT DESCRIPTION: ${conceptDescription}

STUDENT'S EXPLANATION:
"${explanation}"

Evaluate the student's explanation on these dimensions (score 0-100):
1. Completeness: Does it cover all key aspects of the concept?
2. Accuracy: Is the information correct? Are there any misconceptions?
3. Depth: Does it go beyond surface-level understanding?

Also identify:
- Any misconceptions in the explanation
- Key concepts that are missing from the explanation

Respond ONLY with valid JSON in this exact format (no markdown, no code fences):
{
  "completeness": <number 0-100>,
  "accuracy": <number 0-100>,
  "depth": <number 0-100>,
  "overallScore": <number 0-100>,
  "feedback": "<detailed feedback string>",
  "misconceptionsFound": ["<misconception 1>", "<misconception 2>"],
  "missingConcepts": ["<missing concept 1>", "<missing concept 2>"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Failed to parse AI response:", text);
      return NextResponse.json(MOCK_ANALYSIS);
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (
      typeof analysis.completeness !== "number" ||
      typeof analysis.accuracy !== "number" ||
      typeof analysis.depth !== "number" ||
      typeof analysis.overallScore !== "number"
    ) {
      return NextResponse.json(MOCK_ANALYSIS);
    }

    return NextResponse.json({
      completeness: Math.min(100, Math.max(0, analysis.completeness)),
      accuracy: Math.min(100, Math.max(0, analysis.accuracy)),
      depth: Math.min(100, Math.max(0, analysis.depth)),
      overallScore: Math.min(100, Math.max(0, analysis.overallScore)),
      feedback: analysis.feedback || MOCK_ANALYSIS.feedback,
      misconceptionsFound: analysis.misconceptionsFound || [],
      missingConcepts: analysis.missingConcepts || [],
    });
  } catch (error) {
    console.error("AI analysis error:", error);
    return NextResponse.json(MOCK_ANALYSIS);
  }
}
