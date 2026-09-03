import { NextResponse } from "next/server";
import { getGeminiClient, generateWithGemini } from "@/lib/gemini";
import { globalRateLimiter, RATE_LIMITS, getClientIdentifier } from "@/lib/rateLimiter";
import { sanitizeAndGuardPrompt, sanitizeString } from "@/lib/securityGuard";

export async function POST(request: Request) {
  try {
    const clientId = getClientIdentifier(request);
    const rateCheck = globalRateLimiter.check(clientId, RATE_LIMITS.EVALUATION);
    if (!rateCheck.allowed) {
      const waitSeconds = Math.ceil(rateCheck.resetMs / 1000);
      return NextResponse.json(
        {
          error: "Rate limit exceeded.",
          message: `Please wait ${waitSeconds}s before requesting analysis.`,
          retryAfter: waitSeconds,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const contextType = sanitizeString(body.contextType || "quiz", 50);
    const topic = sanitizeString(body.topic || "STEM Topic", 100);
    const question = sanitizeString(body.question || "", 500);
    const studentAnswer = sanitizeString(body.studentAnswer || "", 300);
    const correctAnswer = sanitizeString(body.correctAnswer || "", 300);
    const isCorrect = Boolean(body.isCorrect);
    const studentReasoning = sanitizeAndGuardPrompt(body.studentReasoning || "").safeText;

    if (!studentReasoning || studentReasoning.trim().length === 0) {
      return NextResponse.json({
        feedback: isCorrect
          ? "Great job getting the correct answer!"
          : "Keep practicing! Review the step-by-step explanation.",
        thinkingQuality: isCorrect ? "Direct Recall" : "Needs Review",
        keyInsight: "Try explaining your thought process next time to see where your intuition shines!",
        tobyComment: isCorrect ? "Awesome work!" : "We'll get it right together on the next try!",
      });
    }

    const genAI = getGeminiClient();
    if (!genAI) {
      // Fallback rule-based diagnostic response
      const fallbackQuality = isCorrect
        ? studentReasoning.length > 25
          ? "Solid Intuition"
          : "Quick Recall"
        : "Misconception Detected";

      const fallbackFeedback = isCorrect
        ? `Your reasoning aligns well with the concept of ${topic}. You recognized the key relationship that leads to "${correctAnswer}".`
        : `Your thought process showed an attempt to apply logic, but in ${topic}, "${correctAnswer}" is the actual result. Double-check your initial assumptions.`;

      return NextResponse.json({
        feedback: fallbackFeedback,
        thinkingQuality: fallbackQuality,
        keyInsight: isCorrect
          ? "Solid deductive thinking! You connected the right principles."
          : `Remember: Check the prerequisite definition for ${topic}.`,
        tobyComment: isCorrect
          ? "That makes total sense! Your explanation helped me understand it too."
          : "I had that exact same thought at first! Let's remember the formula together.",
      });
    }

    const prompt = `You are an expert, encouraging Socratic STEM tutor analyzing a student's metacognitive thought process.
A student just answered a ${contextType} item on "${topic}".

QUESTION / PROMPT:
"${question}"

STUDENT'S ANSWER:
"${studentAnswer}"

CORRECT ANSWER:
"${correctAnswer}"

WAS ANSWER CORRECT: ${isCorrect ? "YES" : "NO"}

WHAT THE STUDENT WAS THINKING (THEIR STATED REASONING & WHAT LED TO THEIR ANSWER):
"${studentReasoning}"

Your goal is to evaluate the student's *THOUGHT PROCESS* (not just the final answer):
1. Did they have solid intuition, or did they make a lucky guess, formula confusion, sign error, or misconception?
2. Acknowledge what parts of their reasoning were correct and clarify exactly where their logic diverged if wrong.
3. Keep your language simple, friendly, encouraging, and easy for a college fresher to understand.

Respond ONLY with valid JSON in this exact structure:
{
  "feedback": "2-3 clear, friendly sentences evaluating their thought process and what led to their answer",
  "thinkingQuality": "One of: Solid Intuition | Good Logic, Minor Slip | Formula Confusion | Misconception Detected | Lucky Guess",
  "keyInsight": "1 memorable tip or rule of thumb for this topic",
  "tobyComment": "1 short encouraging comment from their AI study buddy Toby"
}`;

    const rawResponse = await generateWithGemini(genAI, prompt, true);
    const cleaned = rawResponse
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Reasoning analysis error:", error);
    return NextResponse.json({
      feedback: "Your thought process was recorded. Keep explaining your reasoning on every question!",
      thinkingQuality: "Reflective Thinking",
      keyInsight: "Explaining what led to your answer helps build long-term memory.",
      tobyComment: "Thanks for explaining your thought process!",
    });
  }
}
