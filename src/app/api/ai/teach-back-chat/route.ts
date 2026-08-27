import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export type ClassmateSpeaker = "Toby" | "Maya" | "Leo";
export type Mood = "confused" | "curious" | "skeptical" | "lightbulb" | "amazed" | "mastered";

interface Message {
  role: "user" | "assistant";
  speaker?: ClassmateSpeaker | "You";
  content: string;
  mood?: Mood;
  thought?: string;
  comprehensionDelta?: number;
}

interface RequestBody {
  conceptTitle: string;
  conceptDescription: string;
  messages: Message[];
  currentComprehensions?: {
    toby: number;
    maya: number;
    leo: number;
  };
  currentComprehension?: number;
  mode?: "teach" | "peer_explain" | "pop_quiz" | "hint";
  targetClassmate?: ClassmateSpeaker;
  streakCount?: number;
}

// Topic-Specific Knowledge Base for Rich Multi-Subject Classroom Responses
interface ConceptDialogueData {
  tobyPeerTeach: string;
  mayaClue: string;
  leoPopQuiz: string;
  mayaEdgeCase: string;
  tobyIntuition: string;
  leoSummary: string;
  blackboardFormula: string;
}

const CONCEPT_DIALOGUES: Record<string, ConceptDialogueData> = {
  // Chemistry
  acid: {
    tobyPeerTeach:
      "Okay let me try! 🧪 An acid has tons of loose H⁺ hydrogen ions (like a sour lemon with a pH under 7), while a base has OH⁻ hydroxide ions (like slippery soap with a pH over 7). When you mix them, the H⁺ and OH⁻ cancel out to form neutral H₂O water and salt! Did I get the core intuition right?",
    mayaClue:
      "💡 Maya's Clue: Remember that pH is logarithmic! A solution with pH 3 is 10 times more acidic than pH 4, and 100 times more acidic than pH 5. Think about what happens to [H⁺] concentration!",
    leoPopQuiz:
      "⚡ RAPID FIRE QUIZ! If you dilute an acid with a pH of 3 by adding 10x more pure water, what does the new pH become? And can dilution ever turn an acid into a base (pH > 7)?",
    mayaEdgeCase:
      "Wait... 🧐 If pure water has pH 7 at 25°C, what happens if we heat it up? Doesn't the ionization constant Kw increase, making neutral water have a pH lower than 7?! How does temperature affect acidity?",
    tobyIntuition:
      "Wait! 💡 So is an acid basically just an atom holding a hot potato (H⁺ proton) that it desperately wants to donate to someone else?!",
    leoSummary:
      "Boom! So: Low pH = Proton Donors (Acids), High pH = Proton Acceptors (Bases), pH 7 = Pure Balance! 🎯",
    blackboardFormula: "pH = -log10[H⁺] | [H⁺][OH⁻] = 10⁻¹⁴ at 25°C | Acid + Base → Salt + H₂O",
  },
  reaction: {
    tobyPeerTeach:
      "Let me summarize chemical reactions! 💥 Atoms can't be created or destroyed (conservation of mass), so the number of atoms going into the reaction (reactants) MUST equal what comes out (products). We balance equations with big coefficients in front! Is that right?",
    mayaClue:
      "💡 Maya's Clue: Don't just balance atoms—look at oxidation numbers! In redox reactions, one species loses electrons (oxidized) while another gains electrons (reduced).",
    leoPopQuiz:
      "⚡ POP QUIZ! In the reaction 2H₂ + O₂ → 2H₂O, why can't we just write H₂ + O → H₂O? What makes oxygen diatomic in nature?",
    mayaEdgeCase:
      "Hold on! 🧐 Why do some reactions give off heat (exothermic) while others get freezing cold (endothermic)? Where is that energy stored in the chemical bonds?",
    tobyIntuition:
      "Aha! 💡 So balancing equations is like a recipe: 2 slices of bread + 1 slice of cheese = 1 sandwich. You can't just change the cheese formula to make it work!",
    leoSummary:
      "Mass in = Mass out. Bonds break, new bonds form, and energy transfers! 💥",
    blackboardFormula: "Reactants → Products | ΔH = Σ(Bonds Broken) - Σ(Bonds Formed)",
  },
  atomic: {
    tobyPeerTeach:
      "Here is how I picture orbitals: ⚛️ Electrons aren't tiny planets orbiting in flat circles. They're 3D quantum probability clouds! An s-orbital is a sphere, and p-orbitals are like 3D dumbbells where electrons like to hang out 90% of the time! How's my explanation?",
    mayaClue:
      "💡 Maya's Clue: Keep Heisenberg's Uncertainty Principle in mind! You can never know both the exact position and momentum of an electron simultaneously—that's why orbitals are probability densities (ψ²).",
    leoPopQuiz:
      "⚡ POP QUIZ! How many total electrons can the entire n=3 principal energy shell hold? (Think: 3s, 3p, and 3d!)",
    mayaEdgeCase:
      "Wait... 🧐 If electrons are negatively charged and repel each other, why do two electrons fit into the exact same orbital? What is electron spin (ms = +1/2, -1/2)?",
    tobyIntuition:
      "Whoa! 🤯 So an orbital is like a strobe-light photo of a hyperactive bee buzzing around a flower! You don't know the exact path, just the cloud where it spends its time!",
    leoSummary:
      "Quantum numbers (n, l, ml, ms) define the address, shape, orientation, and spin of every electron! ⚛️",
    blackboardFormula: "max electrons in shell = 2n² | s(2), p(6), d(10), f(14)",
  },
  bond: {
    tobyPeerTeach:
      "Let me explain VSEPR! 🎈 Valence electron pairs are negatively charged, so they push each other away as far as possible in 3D space. In water (H₂O), the two lone pairs on oxygen push the two hydrogen bonds down, bending the molecule into a 104.5° boomerang! Did I explain that right?",
    mayaClue:
      "💡 Maya's Clue: Differentiate between electron geometry and molecular shape! In NH₃ (ammonia), electron geometry is tetrahedral, but molecular geometry is trigonal pyramidal because of the lone pair.",
    leoPopQuiz:
      "⚡ POP QUIZ! Why is carbon dioxide (CO₂) completely non-polar even though the individual C=O bonds are highly polar?",
    mayaEdgeCase:
      "Hold on! 🧐 Why do lone pairs repel more strongly than bonding pairs? Isn't an electron just an electron?",
    tobyIntuition:
      "Aha! 💡 It's like tying 4 balloons together at the knot—they automatically push into a 3D pyramid (tetrahedron) to give each other maximum room!",
    leoSummary:
      "Electron pairs repel → determines 3D bond angles → determines polarity and physical properties! 🧬",
    blackboardFormula: "Linear (180°) | Trigonal Planar (120°) | Tetrahedral (109.5°) | Bent (104.5°)",
  },

  // Physics
  vector: {
    tobyPeerTeach:
      "Okay let me try! 🧭 A scalar is just a plain number like speed (50 km/h) or mass (10 kg). But a VECTOR has direction too, like velocity (50 km/h North). If I walk 3m North and 4m East, my net displacement is √(3² + 4²) = 5m at 53° East of North! Did I nail it?",
    mayaClue:
      "💡 Maya's Clue: Remember vector resolution! Any vector at an angle θ can be split into perpendicular x and y components: Vx = V·cos(θ) and Vy = V·sin(θ).",
    leoPopQuiz:
      "⚡ RAPID FIRE QUIZ! Can two vectors of different magnitudes ever add up to give a zero resultant vector? What about three vectors?",
    mayaEdgeCase:
      "Wait! 🧐 What is the difference between a dot product (scalar result: A·B = |A||B|cos θ) and a cross product (vector result: A×B = |A||B|sin θ)? When do we use which?",
    tobyIntuition:
      "Wait! 💡 So vector addition is like walking through city blocks: you can take a zigzag path, but displacement is just the straight laser beam from start to finish!",
    leoSummary:
      "Scalars = Magnitude only. Vectors = Magnitude + Direction. Break into components, add x and y separately! 🚀",
    blackboardFormula: "R = √(Rx² + Ry²) | θ = arctan(Ry/Rx) | A·B = |A||B|cos(θ)",
  },
  newton: {
    tobyPeerTeach:
      "Let me explain Newton's Laws! 🛹 1st Law: Things keep doing what they're doing unless pushed. 2nd Law: F = m·a (more mass means you need more force to accelerate). 3rd Law: Forces come in pairs (if I push a skateboard, it pushes back on my foot with equal force)! How is that?",
    mayaClue:
      "💡 Maya's Clue: In Newton's 3rd law, the action and reaction forces NEVER act on the same object! That's why they don't cancel each other out.",
    leoPopQuiz:
      "⚡ POP QUIZ! If an elevator cord snaps and you are in free fall, what does a bathroom scale under your feet read? 0 kg or your normal weight?",
    mayaEdgeCase:
      "Wait! 🧐 Why is static friction (μs) always greater than kinetic friction (μk)? Why is it harder to start sliding a couch than to keep it sliding?",
    tobyIntuition:
      "Ohhh! 💡 F=ma is why a tiny bullet can do massive damage (huge acceleration) while a giant ship moving at 0.001 m/s can still crush a dock (huge mass)!",
    leoSummary:
      "Inertia resists change, Net Force causes acceleration, and all forces are mutual interactions! ⚖️",
    blackboardFormula: "ΣF = m·a | F_friction ≤ μ·N | F_AB = -F_BA",
  },
  light: {
    tobyPeerTeach:
      "Let me summarize Snell's Law and refraction! 🌈 Light bends when passing into glass or water because its speed slows down in denser mediums. Snell's law: n₁·sin(θ₁) = n₂·sin(θ₂). When entering a denser medium, it bends TOWARDS the normal line! Is that right?",
    mayaClue:
      "💡 Maya's Clue: Don't forget Total Internal Reflection (TIR)! When light travels from a denser medium to a rarer medium past the critical angle (sin θc = n₂/n₁), 100% of the light reflects back inside!",
    leoPopQuiz:
      "⚡ POP QUIZ! Why does a pencil look bent/broken when dipped in a glass of water, but a flat glass block just shifts the image sideways?",
    mayaEdgeCase:
      "Wait! 🧐 Why does white light split into a rainbow of colors inside a prism (dispersion)? Does red light travel at a different speed than violet light in glass?",
    tobyIntuition:
      "Aha! 💡 Light bending is like a lawnmower crossing from smooth concrete into thick mud at an angle—one wheel hits the mud first, slows down, and turns the whole mower!",
    leoSummary:
      "Index of refraction n = c/v. Slower speed = bends towards normal. Critical angle = Fiber optics magic! 💡",
    blackboardFormula: "n₁·sin(θ₁) = n₂·sin(θ₂) | n = c/v | sin(θc) = 1/n",
  },
  electrostat: {
    tobyPeerTeach:
      "Let me explain electric field vs potential! ⚡ An electric field E is a VECTOR measuring the force on a +1 Coulomb charge (how steep the hill is). Electric potential V is a SCALAR measuring the potential energy per unit charge (the height of the hill)! Did I explain the difference clearly?",
    mayaClue:
      "💡 Maya's Clue: Connect field to potential via calculus: E = -dV/dr! The electric field always points in the direction of the steepest drop in electric potential.",
    leoPopQuiz:
      "⚡ POP QUIZ! Inside a hollow charged metal conductor (like a car in a lightning storm), what is the electric field? Why is it safe inside?",
    mayaEdgeCase:
      "Wait! 🧐 If electric field inside a conductor is zero, does that mean the electric potential inside is also zero, or is it constant?",
    tobyIntuition:
      "Mind blown! 🤯 Electric potential is like elevation on a topographical map, and the electric field arrows show which way a ball would roll downhill!",
    leoSummary:
      "Coulomb's Law = 1/r² force. Field E is vector force/charge. Potential V is scalar energy/charge! ⚡",
    blackboardFormula: "F = k·q₁q₂/r² | E = F/q = -dV/dr | V = k·q/r",
  },

  // Mathematics
  derivative: {
    tobyPeerTeach:
      "Let me try to explain derivatives! 🚗 If my position is f(t), my speedometer reading at 2:15 PM is the DERIVATIVE f'(t)—the exact instantaneous rate of change at that split second. Geometrically, it's the slope of the tangent line touching the curve! Did I nail it?",
    mayaClue:
      "💡 Maya's Clue: Think about the formal limit definition: f'(x) = lim(h→0) [f(x+h) - f(x)] / h. Why can't we just set h = 0 immediately?",
    leoPopQuiz:
      "⚡ RAPID FIRE QUIZ! If a function has a peak or valley (local maximum/minimum), what must its derivative be at that point?",
    mayaEdgeCase:
      "Wait! 🧐 Does every continuous function have a derivative? What about the sharp corner on y = |x| at x = 0?",
    tobyIntuition:
      "Wait! 💡 So if you zoom into any smooth curved graph with a powerful microscope, it starts looking like a flat straight line—and the derivative is just the slope of that flat line!",
    leoSummary:
      "Position → Derivative = Velocity → Derivative = Acceleration. Slope of tangent line! 📈",
    blackboardFormula: "f'(x) = lim_{h→0} [f(x+h) - f(x)]/h | (xⁿ)' = n·xⁿ⁻¹ | (uv)' = u'v + uv'",
  },
  limit: {
    tobyPeerTeach:
      "Let me explain limits! 🎯 A limit isn't asking 'what happens when you slam into the wall', it's asking 'where were you headed right before you got there'. Even if there's a hole at x=2, as long as both sides approach 4, the limit is 4! Is that right?",
    mayaClue:
      "💡 Maya's Clue: For a two-sided limit to exist, the left-hand limit lim(x→a⁻) and right-hand limit lim(x→a⁺) MUST be equal! If they disagree (like in a step function), the limit does not exist.",
    leoPopQuiz:
      "⚡ POP QUIZ! If plugging in x=a gives 0/0 (indeterminate form), does that mean the limit is 0, undefined, or could it be any real number?",
    mayaEdgeCase:
      "Wait! 🧐 What is the epsilon-delta (ε-δ) definition actually saying? How do we prove that closeness in x guarantees closeness in f(x)?",
    tobyIntuition:
      "Ohhh! 💡 So finding a limit is like walking towards a doorway in the dark: you don't need to step through to know where the doorway is located!",
    leoSummary:
      "Approaching ≠ Value at point. Handle 0/0 by factoring, rationalizing, or L'Hôpital's rule! 🎯",
    blackboardFormula: "lim_{x→a} f(x) = L ⇔ lim_{x→a⁻} = lim_{x→a⁺} = L",
  },
  integral: {
    tobyPeerTeach:
      "Here is my explanation of integrals! 🍞 Slicing a loaf of bread into infinitely thin rectangular slices and adding them all together gives the total volume. In math, integration adds infinite slivers under a curve to find exact area, and it reverses differentiation! How is that?",
    mayaClue:
      "💡 Maya's Clue: The Fundamental Theorem of Calculus connects integration and differentiation: d/dx [∫_{a}^{x} f(t)dt] = f(x). It proves accumulation and rate of change are inverses!",
    leoPopQuiz:
      "⚡ POP QUIZ! If you integrate velocity v(t) from t=0 to t=5, what physical quantity do you get? (Displacement or acceleration?)",
    mayaEdgeCase:
      "Wait! 🧐 Why do indefinite integrals always require a constant of integration (+C)? What happens to constants when we differentiate?",
    tobyIntuition:
      "Mind blown! 🤯 If a derivative takes a speed graph and tells you acceleration, the integral takes the speed graph and tells you total distance traveled!",
    leoSummary:
      "Integration = Continuous summation (Riemann sum). Reverse of derivative + Area under curve! 📊",
    blackboardFormula: "∫ xⁿ dx = (xⁿ⁺¹)/(n+1) + C | ∫_{a}^{b} f(x)dx = F(b) - F(a)",
  },
};

// Helper to find matching concept dialogue data
function getConceptDialogue(conceptTitle: string): ConceptDialogueData {
  const t = conceptTitle.toLowerCase();
  for (const [key, data] of Object.entries(CONCEPT_DIALOGUES)) {
    if (t.includes(key)) return data;
  }
  // Default versatile dialogue
  return {
    tobyPeerTeach: `Let me summarize what I learned about ${conceptTitle}! The core idea is that we are looking at how parts connect in the physical world rather than just memorizing definitions. It balances out and predicts how things change! Did I capture the main essence?`,
    mayaClue: `💡 Maya's Clue: Focus on the fundamental assumptions and boundary conditions of ${conceptTitle}. What happens at zero, infinity, or extreme values?`,
    leoPopQuiz: `⚡ RAPID FIRE QUIZ! In your own words, what is the #1 real-world application of ${conceptTitle}? How would you explain it to a 10-year-old?`,
    mayaEdgeCase: `Wait... 🧐 Does ${conceptTitle} hold true under all conditions, or are there special edge cases where the rule breaks down?`,
    tobyIntuition: `Wait! 💡 So ${conceptTitle} is like a seesaw—when one side goes up, the other adjusts to maintain balance!`,
    leoSummary: `Awesome! We connected the conceptual intuition directly to the formal rules for ${conceptTitle}! 🚀`,
    blackboardFormula: `Key Principle: Balance of inputs & outputs in ${conceptTitle}`,
  };
}

// Dynamic response generator for offline / fallback simulation
function generateMockClassroomResponse(
  conceptTitle: string,
  userMessage: string,
  turnCount: number,
  comprehensions: { toby: number; maya: number; leo: number },
  mode: string = "teach",
  targetSpeaker: ClassmateSpeaker = "Toby"
) {
  const lower = userMessage.toLowerCase();
  const dialogue = getConceptDialogue(conceptTitle);

  // Auto-detect target speaker if mentioned in user's prompt
  let speaker: ClassmateSpeaker = targetSpeaker || "Toby";
  if (lower.includes("maya")) speaker = "Maya";
  else if (lower.includes("leo")) speaker = "Leo";
  else if (lower.includes("toby")) speaker = "Toby";

  // 1. PEER EXPLAIN MODE
  if (mode === "peer_explain" || lower.includes("your turn") || lower.includes("teach it back")) {
    const tobyScore = Math.min(100, comprehensions.toby + 20);
    const mayaScore = Math.min(100, comprehensions.maya + 15);
    const leoScore = Math.min(100, comprehensions.leo + 20);

    return {
      speaker: speaker === "Maya" ? "Maya" : speaker === "Leo" ? "Leo" : "Toby",
      reply:
        speaker === "Maya"
          ? `Let me test my logical derivation: For ${conceptTitle}, if we take the governing principle and test edge cases, the outputs stay balanced because the underlying equations enforce conservation. Did my rigorous summary hit the mark?`
          : dialogue.tobyPeerTeach,
      mood: "lightbulb",
      thought: `${speaker} is testing their synthesized mental model of ${conceptTitle}.`,
      comprehensionDelta: 20,
      newComprehensions: { toby: tobyScore, maya: mayaScore, leo: leoScore },
      xpAwarded: 70,
      comboMultiplier: 2.0,
      classmateChime: {
        speaker: speaker === "Toby" ? "Maya" : "Toby",
        emoji: speaker === "Toby" ? "🧐" : "💡",
        reaction:
          speaker === "Toby"
            ? "Toby's analogy was surprisingly solid! Let's make sure the edge cases check out."
            : "Maya's explanation was super sharp!",
      },
      blackboardTip: dialogue.blackboardFormula,
    };
  }

  // 2. POP QUIZ MODE
  if (mode === "pop_quiz" || lower.includes("pop quiz") || lower.includes("challenge")) {
    return {
      speaker: "Leo",
      reply: dialogue.leoPopQuiz,
      mood: "curious",
      thought: "Leo threw a quick rapid-fire conceptual challenge.",
      comprehensionDelta: 10,
      newComprehensions: {
        toby: comprehensions.toby,
        maya: comprehensions.maya,
        leo: Math.min(100, comprehensions.leo + 10),
      },
      xpAwarded: 45,
      comboMultiplier: 1.5,
      classmateChime: {
        speaker: "Maya",
        emoji: "🧐",
        reaction: "Pay attention to the units and boundary values!",
      },
      blackboardTip: dialogue.blackboardFormula,
    };
  }

  // 3. HINT / CLUE MODE
  if (mode === "hint" || lower.includes("clue") || lower.includes("hint") || lower.includes("help")) {
    return {
      speaker: "Maya",
      reply: dialogue.mayaClue,
      mood: "curious",
      thought: "Maya offered a scaffold hint to anchor the tutor's reasoning.",
      comprehensionDelta: 10,
      newComprehensions: {
        toby: Math.min(100, comprehensions.toby + 5),
        maya: Math.min(100, comprehensions.maya + 10),
        leo: Math.min(100, comprehensions.leo + 5),
      },
      xpAwarded: 35,
      comboMultiplier: 1.0,
      classmateChime: {
        speaker: "Toby",
        emoji: "🎨",
        reaction: "That clue helps a lot! Can you explain it with an everyday example?",
      },
      blackboardTip: dialogue.blackboardFormula,
    };
  }

  // 4. STANDARD TEACHING CONVERSATION
  const hasAnalogy =
    lower.includes("like") ||
    lower.includes("imagine") ||
    lower.includes("car") ||
    lower.includes("water") ||
    lower.includes("lemon") ||
    lower.includes("soap") ||
    lower.includes("proton") ||
    lower.includes("balloon") ||
    lower.includes("hill") ||
    lower.includes("slope") ||
    lower.includes("cloud") ||
    lower.includes("pizza");

  if (hasAnalogy) {
    const tobyScore = Math.min(100, comprehensions.toby + 25);
    const mayaScore = Math.min(100, comprehensions.maya + 20);
    const leoScore = Math.min(100, comprehensions.leo + 25);

    return {
      speaker: speaker,
      reply:
        speaker === "Maya"
          ? `That's a very clever metaphor! 🧐 But tell me: how does this hold up when variables reach boundary extremes or zero? Does the analogy still work?`
          : dialogue.tobyIntuition,
      mood: "lightbulb",
      thought: "The student used an intuitive real-world analogy.",
      comprehensionDelta: 25,
      newComprehensions: { toby: tobyScore, maya: mayaScore, leo: leoScore },
      xpAwarded: 80,
      comboMultiplier: 2.0,
      classmateChime: {
        speaker: speaker === "Maya" ? "Leo" : "Maya",
        emoji: speaker === "Maya" ? "⚡" : "🧐",
        reaction:
          speaker === "Maya"
            ? "I love that analogy! It totally clicks for me!"
            : "The analogy holds up well logically.",
      },
      blackboardTip: dialogue.blackboardFormula,
    };
  }

  // Target specific responses
  if (speaker === "Maya") {
    const mayaScore = Math.min(100, comprehensions.maya + 18);
    return {
      speaker: "Maya",
      reply: dialogue.mayaEdgeCase,
      mood: "skeptical",
      thought: "Maya is probing mathematical and physical edge cases.",
      comprehensionDelta: 18,
      newComprehensions: {
        toby: Math.min(100, comprehensions.toby + 10),
        maya: mayaScore,
        leo: Math.min(100, comprehensions.leo + 12),
      },
      xpAwarded: 60,
      comboMultiplier: 1.5,
      classmateChime: {
        speaker: "Toby",
        emoji: "😵‍💫",
        reaction: "Maya is asking the tough questions! Help us understand why!",
      },
      blackboardTip: dialogue.blackboardFormula,
    };
  }

  if (speaker === "Leo") {
    const leoScore = Math.min(100, comprehensions.leo + 22);
    return {
      speaker: "Leo",
      reply: `${dialogue.leoSummary} What do you think the next logical step in this topic would be?`,
      mood: "amazed",
      thought: "Leo is summarizing and driving forward momentum.",
      comprehensionDelta: 22,
      newComprehensions: {
        toby: Math.min(100, comprehensions.toby + 15),
        maya: Math.min(100, comprehensions.maya + 15),
        leo: leoScore,
      },
      xpAwarded: 65,
      comboMultiplier: 1.5,
      classmateChime: {
        speaker: "Maya",
        emoji: "🧐",
        reaction: "Good synthesis, Leo!",
      },
      blackboardTip: dialogue.blackboardFormula,
    };
  }

  // Toby default conversational progress
  const tobyScore = Math.min(100, comprehensions.toby + 20);
  const mayaScore = Math.min(100, comprehensions.maya + 15);
  const leoScore = Math.min(100, comprehensions.leo + 20);

  return {
    speaker: "Toby",
    reply:
      turnCount === 1
        ? `Hmm, okay! But if you had to explain ${conceptTitle} using a simple story or a picture in my head, how would you draw it? 🤔`
        : `Wait, that makes so much sense! 💡 So in ${conceptTitle}, everything balances out based on how the components interact! Can you summarize the golden rule for us?`,
    mood: tobyScore >= 80 ? "mastered" : "curious",
    thought: "Toby is building intuitive scaffolding.",
    comprehensionDelta: 20,
    newComprehensions: { toby: tobyScore, maya: mayaScore, leo: leoScore },
    xpAwarded: 60,
    comboMultiplier: 1.5,
    classmateChime: {
      speaker: "Leo",
      emoji: "⚡",
      reaction: "We are making serious progress on this topic!",
    },
    blackboardTip: dialogue.blackboardFormula,
  };
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const {
      conceptTitle,
      conceptDescription,
      messages,
      currentComprehensions = { toby: 15, maya: 10, leo: 15 },
      mode = "teach",
      targetClassmate = "Toby",
      streakCount = 1,
    } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      console.log(`Using Topic-Aware Classroom Pod engine for: ${conceptTitle} (${mode})`);
      const userLastMessage = messages[messages.length - 1]?.content || "";
      const result = generateMockClassroomResponse(
        conceptTitle,
        userLastMessage,
        messages.filter((m) => m.role === "user").length,
        currentComprehensions,
        mode,
        targetClassmate
      );
      return NextResponse.json(result);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemPrompt = `You are a lively high-school classroom study group consisting of 3 interactive classmates:
1. **Toby (Visual & Intuitive Thinker)**: Enthusiastic, naive, loves real-world analogies (cars, pizza, rockets, water flow). Gets confused by dry formulas without intuition.
2. **Maya (Skeptical Challenger & Fact-Checker)**: Sharp, questions boundary conditions, edge cases (what if x=0, what if friction=0?), demands rigorous explanation.
3. **Leo (Cheerful Quizzer & Peer Partner)**: Energetic, offers quick pop-quizzes, loves summarizing, cheers on the tutor.

TARGET CONCEPT: "${conceptTitle}"
CONCEPT SUMMARY: "${conceptDescription}"
CURRENT COMPREHENSIONS:
- Toby: ${currentComprehensions.toby}%
- Maya: ${currentComprehensions.maya}%
- Leo: ${currentComprehensions.leo}%

CURRENT MODE: "${mode}" (Options: "teach", "peer_explain" = student explains back in their own words, "pop_quiz" = classmate asks tutor a rapid fire test, "hint" = classmate gives a clue)
TARGET CLASSMATE: "${targetClassmate}"

GAMIFICATION RULES:
1. Act like real high school classmates in a collaborative study session. Use natural expressions, banter, and emojis.
2. If mode is "peer_explain": The speaker explains the concept back to the user in their own words with high-school flair, and asks the user to verify if their reasoning is accurate.
3. If mode is "pop_quiz": The speaker asks a fun, conceptual rapid-fire question.
4. If mode is "hint": Maya or Toby provides a helpful clue or analogy scaffold.
5. Reward real-world analogies with XP (+50 to +100) and combo multipliers.

OUTPUT FORMAT:
Respond with ONLY valid JSON:
{
  "speaker": "Toby" | "Maya" | "Leo",
  "reply": "Spoken dialogue response to the tutor",
  "mood": "confused" | "curious" | "skeptical" | "lightbulb" | "amazed" | "mastered",
  "thought": "Internal study pod thoughts (1-2 sentences)",
  "comprehensionDelta": <number 5 to 30>,
  "newComprehensions": {
    "toby": <number 0-100>,
    "maya": <number 0-100>,
    "leo": <number 0-100>
  },
  "xpEarned": <number 20-100>,
  "comboMultiplier": <number 1.0, 1.5, 2.0, or 3.0>,
  "classmateChime": {
    "speaker": "Maya" | "Toby" | "Leo",
    "emoji": "🧐" | "💡" | "⚡" | "🤯",
    "reaction": "Quick 1-sentence banter reaction"
  } | null,
  "blackboardTip": "<LaTeX equation or key visual tip for the chalkboard, or null>"
}`;

    const conversationHistory = messages
      .map((m) => `${m.role === "user" ? "TUTOR (User)" : `${m.speaker || "CLASSMATE"}`}: ${m.content}`)
      .join("\n\n");

    const prompt = `${systemPrompt}\n\nCONVERSATION HISTORY:\n${conversationHistory}\n\nGenerate the next classroom response in exact JSON:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      const userLastMessage = messages[messages.length - 1]?.content || "";
      return NextResponse.json(
        generateMockClassroomResponse(
          conceptTitle,
          userLastMessage,
          messages.filter((m) => m.role === "user").length,
          currentComprehensions,
          mode,
          targetClassmate
        )
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      speaker: parsed.speaker || targetClassmate || "Toby",
      reply: parsed.reply || "Wait, could you give a real-world example for that?",
      mood: parsed.mood || "curious",
      thought: parsed.thought || "The study group is considering your explanation...",
      comprehensionDelta: parsed.comprehensionDelta || 15,
      newComprehensions: {
        toby: Math.min(100, Math.max(0, parsed.newComprehensions?.toby ?? (currentComprehensions.toby + 15))),
        maya: Math.min(100, Math.max(0, parsed.newComprehensions?.maya ?? (currentComprehensions.maya + 12))),
        leo: Math.min(100, Math.max(0, parsed.newComprehensions?.leo ?? (currentComprehensions.leo + 18))),
      },
      xpEarned: parsed.xpEarned || 50,
      comboMultiplier: parsed.comboMultiplier || (streakCount >= 3 ? 2.0 : 1.5),
      classmateChime: parsed.classmateChime || null,
      blackboardTip: parsed.blackboardTip || null,
    });
  } catch (error) {
    console.error("Classroom chat error:", error);
    const body: RequestBody = await request.json().catch(() => ({}));
    const userLastMessage = body.messages?.[body.messages.length - 1]?.content || "";
    return NextResponse.json(
      generateMockClassroomResponse(
        body.conceptTitle || "Chemistry",
        userLastMessage,
        body.messages ? body.messages.filter((m) => m.role === "user").length : 1,
        body.currentComprehensions || { toby: 15, maya: 10, leo: 15 },
        body.mode || "teach",
        body.targetClassmate || "Toby"
      )
    );
  }
}
