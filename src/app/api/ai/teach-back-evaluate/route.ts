import { NextResponse } from "next/server";
import { getGeminiClient, generateWithGemini } from "@/lib/gemini";
import { globalRateLimiter, RATE_LIMITS, getClientIdentifier } from "@/lib/rateLimiter";
import { sanitizeAndGuardPrompt, sanitizeString } from "@/lib/securityGuard";

interface Message {
  role: "user" | "assistant";
  speaker?: string;
  content: string;
}

interface RequestBody {
  conceptTitle: string;
  conceptDescription: string;
  messages: Message[];
  finalComprehension: number;
  finalComprehensions?: {
    toby: number;
    maya: number;
    leo: number;
    sam?: number;
  };
  totalXpEarned?: number;
  maxComboStreak?: number;
}

export async function POST(request: Request) {
  try {
    // ── RATE LIMITING & PROTECTION ──
    const clientId = getClientIdentifier(request);
    const rateCheck = globalRateLimiter.check(clientId, RATE_LIMITS.EVALUATION);
    if (!rateCheck.allowed) {
      const waitSeconds = Math.ceil(rateCheck.resetMs / 1000);
      return NextResponse.json(
        {
          error: "Rate limit exceeded. System protected against API credit exhaustion.",
          message: `Please wait ${waitSeconds}s before requesting evaluation.`,
          retryAfter: waitSeconds,
        },
        { status: 429 }
      );
    }

    const body: RequestBody = await request.json();
    let {
      conceptTitle,
      conceptDescription,
      messages,
      finalComprehension,
      finalComprehensions = { toby: 85, maya: 75, leo: 90, sam: 90 },
      totalXpEarned = 250,
      maxComboStreak = 3,
    } = body;

    conceptTitle = sanitizeString(conceptTitle || "Concept", 100);
    conceptDescription = sanitizeString(conceptDescription || "", 300);

    messages = (messages || []).map((m) => ({
      ...m,
      content: sanitizeAndGuardPrompt(m.content).safeText,
    }));

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    // Helper for Tutor Rank title based on score
    const getTutorTitle = (score: number) => {
      if (score >= 90) return "🏆 Feynman Grandmaster";
      if (score >= 80) return "🌟 Intuitive Socratic Master";
      if (score >= 70) return "💡 Analogy Specialist";
      if (score >= 60) return "📚 Apprentice Explainer";
      return "🌱 Curious Peer Tutor";
    };

    // Calculate badges
    const userTurns = messages.filter((m) => m.role === "user").length;
    const avgClassComprehension = Math.round(
      (finalComprehensions.toby + finalComprehensions.maya + finalComprehensions.leo) / 3
    );

    const badges = [
      {
        id: "analogy_maestro",
        title: "Analogy Maestro",
        emoji: "🎨",
        description: "Explained complex ideas using concrete real-world imagery",
        unlocked: true,
      },
      {
        id: "skeptic_silencer",
        title: "Skeptic Silencer",
        emoji: "🛡️",
        description: "Satisfied Maya's rigorous boundary condition counter-arguments",
        unlocked: finalComprehensions.maya >= 70,
      },
      {
        id: "triple_lightbulb",
        title: "Triple Lightbulb",
        emoji: "💡",
        description: "Brought all 3 study pod classmates above 75% comprehension",
        unlocked:
          finalComprehensions.toby >= 75 &&
          finalComprehensions.maya >= 75 &&
          finalComprehensions.leo >= 75,
      },
      {
        id: "combo_king",
        title: "Combo Surge",
        emoji: "🔥",
        description: `Achieved a ${maxComboStreak}x Tutor Streak Multiplier`,
        unlocked: maxComboStreak >= 2,
      },
    ];

    if (!apiKey) {
      const baseScore = Math.max(
        60,
        Math.min(96, Math.round(avgClassComprehension * 0.75 + userTurns * 4))
      );

      return NextResponse.json({
        completeness: Math.min(100, baseScore + 4),
        accuracy: Math.min(100, baseScore + 2),
        depth: Math.min(100, baseScore - 3),
        overallScore: baseScore,
        tutorTitle: getTutorTitle(baseScore),
        xpAwarded: totalXpEarned + 100,
        badges,
        feedback: `Brilliant classroom teaching session on "${conceptTitle}"! You engaged Toby with clear analogies, answered Maya's edge-case questions with poise, and kept Leo energized with reciprocal explanations. Your teaching showcased authentic Feynman-style intuition.`,
        misconceptionsFound:
          baseScore < 75 ? ["Could further highlight formal algebraic connections alongside analogies"] : [],
        missingConcepts: [
          `Formal notation bridging for ${conceptTitle}`,
          "Edge case behavior when values approach limits / zero",
        ],
        classmateReportCards: {
          toby: {
            name: "Toby",
            role: "Visual Learner",
            emoji: "🎨",
            score: finalComprehensions.toby,
            verdict: `"The real-world analogies made it click instantly! I finally see how ${conceptTitle} works!"`,
          },
          maya: {
            name: "Maya",
            role: "Skeptical Challenger",
            emoji: "🧐",
            score: finalComprehensions.maya,
            verdict: `"Your explanation held up well even when considering boundary cases and extreme scenarios."`,
          },
          leo: {
            name: "Leo",
            role: "Peer Quizzer",
            emoji: "⚡",
            score: finalComprehensions.leo,
            verdict: `"That was super fun! I'm ready to ace tomorrow's classroom diagnostic because of you!"`,
          },
          sam: {
            name: "Sam",
            role: "Direct & Precise",
            emoji: "🎯",
            score: finalComprehensions.sam || 90,
            verdict: `"Clear, accurate, and straight to the point. Exactly the facts needed for ${conceptTitle}."`,
          },
        },
        tobyVerdict: `Toby says: "You're a lifesaver! Our study group finally gets ${conceptTitle}!" 🎓`,
      });
    }

    const genAI = getGeminiClient();
    if (!genAI) throw new Error("No Gemini API key available");

    const conversationTranscript = messages
      .map((m) => `${m.role === "user" ? "TUTOR (Student)" : `${m.speaker || "CLASSMATE"}`}: ${m.content}`)
      .join("\n\n");

    const prompt = `You are an expert pedagogical supervisor evaluating a gamified classroom peer-tutoring session.
The student (TUTOR) taught a study pod consisting of 4 classmates: Toby (visual learner), Maya (skeptic), Leo (quizzer), and Sam (direct/straightforward).

TARGET CONCEPT: "${conceptTitle}"
CONCEPT SUMMARY: "${conceptDescription}"
CLASSROOM COMPREHENSIONS ACHIEVED:
- Toby: ${finalComprehensions.toby}%
- Maya: ${finalComprehensions.maya}%
- Leo: ${finalComprehensions.leo}%
- Sam: ${finalComprehensions.sam ?? 90}%

FULL CONVERSATION TRANSCRIPT:
${conversationTranscript}

Evaluate the student on scores 0-100:
1. Completeness
2. Accuracy
3. Depth
4. Overall Score

Also provide personalized verdicts from each of the 4 classmates (Toby, Maya, Leo, Sam).

Respond with ONLY valid JSON:
{
  "completeness": <number 0-100>,
  "accuracy": <number 0-100>,
  "depth": <number 0-100>,
  "overallScore": <number 0-100>,
  "feedback": "<detailed constructive feedback string in Markdown>",
  "misconceptionsFound": ["<misconception 1>"],
  "missingConcepts": ["<missing concept 1>"],
  "tobyQuote": "<Toby's enthusiastic in-character quote>",
  "mayaQuote": "<Maya's sharp in-character quote>",
  "leoQuote": "<Leo's cheerful in-character quote>",
  "samQuote": "<Sam's concise, direct in-character quote>"
}`;

    const text = await generateWithGemini(genAI, prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Could not parse JSON evaluation");
    }

    const evaluation = JSON.parse(jsonMatch[0]);
    const overallScore = Math.min(100, Math.max(0, evaluation.overallScore || 80));

    return NextResponse.json({
      completeness: Math.min(100, Math.max(0, evaluation.completeness || 80)),
      accuracy: Math.min(100, Math.max(0, evaluation.accuracy || 85)),
      depth: Math.min(100, Math.max(0, evaluation.depth || 78)),
      overallScore,
      tutorTitle: getTutorTitle(overallScore),
      xpAwarded: totalXpEarned + 100,
      badges,
      feedback: evaluation.feedback || "Exceptional reverse-tutoring session with the study pod!",
      misconceptionsFound: evaluation.misconceptionsFound || [],
      missingConcepts: evaluation.missingConcepts || [],
      classmateReportCards: {
        toby: {
          name: "Toby",
          role: "Visual Learner",
          emoji: "🎨",
          score: finalComprehensions.toby,
          verdict: evaluation.tobyQuote || `"Your analogies made ${conceptTitle} crystal clear!"`,
        },
        maya: {
          name: "Maya",
          role: "Skeptical Challenger",
          emoji: "🧐",
          score: finalComprehensions.maya,
          verdict: evaluation.mayaQuote || `"Solid conceptual logic that stood up to scrutiny."`,
        },
        leo: {
          name: "Leo",
          role: "Peer Quizzer",
          emoji: "⚡",
          score: finalComprehensions.leo,
          verdict: evaluation.leoQuote || `"Great pace and reciprocal practice!"`,
        },
        sam: {
          name: "Sam",
          role: "Direct & Precise",
          emoji: "🎯",
          score: finalComprehensions.sam || 90,
          verdict: evaluation.samQuote || `"Accurate, direct, and factual. Great job on ${conceptTitle}."`,
        },
      },
      tobyVerdict: evaluation.tobyQuote || `Toby says: "Thanks for helping our study pod master ${conceptTitle}!" 🎓`,
    });
  } catch (error) {
    console.error("Evaluation API error:", error);
    return NextResponse.json({
      completeness: 82,
      accuracy: 86,
      depth: 80,
      overallScore: 83,
      tutorTitle: "🌟 Intuitive Socratic Master",
      xpAwarded: 350,
      badges: [
        {
          id: "analogy_maestro",
          title: "Analogy Maestro",
          emoji: "🎨",
          description: "Explained complex ideas using concrete real-world imagery",
          unlocked: true,
        },
      ],
      feedback: "Great job guiding the study pod through the core concept intuition!",
      misconceptionsFound: [],
      missingConcepts: [],
      classmateReportCards: {
        toby: {
          name: "Toby",
          role: "Visual Learner",
          emoji: "🎨",
          score: 85,
          verdict: `"The intuitive analogies really helped me visualize it!"`,
        },
        maya: {
          name: "Maya",
          role: "Skeptical Challenger",
          emoji: "🧐",
          score: 80,
          verdict: `"Clear logic and solid responses to doubts."`,
        },
        leo: {
          name: "Leo",
          role: "Peer Quizzer",
          emoji: "⚡",
          score: 88,
          verdict: `"Our study group is fully prepared now!"`,
        },
      },
      tobyVerdict: `Toby says: "Thanks for teaching our class pod!" 🎓`,
    });
  }
}
