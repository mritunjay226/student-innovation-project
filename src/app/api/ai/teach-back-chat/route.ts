import { NextResponse } from "next/server";
import { getGeminiClient, generateWithGemini } from "@/lib/gemini";
import { globalRateLimiter, RATE_LIMITS, getClientIdentifier } from "@/lib/rateLimiter";
import { sanitizeAndGuardPrompt, sanitizeString } from "@/lib/securityGuard";

export type ClassmateSpeaker = "Toby" | "Maya" | "Leo" | "Sam";
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
    sam: number;
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
  samDirectAnswer: string;
  blackboardFormula: string;
}

const CONCEPT_DIALOGUES: Record<string, ConceptDialogueData> = {
  // Chemistry
  acid: {
    tobyPeerTeach:
      "Here is my summary of **Acids, Bases & pH**: 🧪\n\n* **Acids**: High concentration of $[\\text{H}^+]$ ions (sour, $\\text{pH} < 7$).\n* **Bases**: High concentration of $[\\text{OH}^-]$ ions (bitter/slippery, $\\text{pH} > 7$).\n* **Neutralization**: Mixing acid and base produces neutral water and salt: $$\\text{HCl} + \\text{NaOH} \\rightarrow \\text{NaCl} + \\text{H}_2\\text{O}$$\n\nDid I get the core intuition right?",
    mayaClue:
      "💡 **Maya's Clue**: Remember that the $\\text{pH}$ scale is **logarithmic** ($-\\log_{10}[\\text{H}^+]$):\n\n* A change of **1 pH unit** represents a **10-fold change** in $[\\text{H}^+]$ concentration.\n* Example: $\\text{pH } 2$ is **100 times more acidic** than $\\text{pH } 4$.",
    leoPopQuiz:
      "⚡ **Leo's Rapid Quiz**:\n\n1. If a solution has a hydrogen ion concentration $[\\text{H}^+] = 10^{-4}\\text{ M}$, what is its exact $\\text{pH}$?\n2. Is this solution **acidic**, **neutral**, or **basic**?",
    mayaEdgeCase:
      "**Analytical Question** 🧐:\n\nIf pure water has a $\\text{pH}$ of $7$ at $25^\\circ\\text{C}$, what happens when temperature increases? Since auto-ionization ($K_w$) is endothermic, $[\\text{H}^+]$ increases, so pure water's $\\text{pH}$ drops below 7—yet it remains **strictly neutral** because $[\\text{H}^+] = [\\text{OH}^-]$. How do you explain this distinction?",
    tobyIntuition:
      "Aha! 💡 An acid is basically a **proton donor** (hands off an $\\text{H}^+$) and a base is a **proton acceptor** (takes the $\\text{H}^+$). When they meet, they form stable water!",
    leoSummary:
      "**Classroom Takeaways** 🎯:\n* **Acid** $\\rightarrow [\\text{H}^+] > [\\text{OH}^-]$ (pH 0-6)\n* **Neutral** $\\rightarrow [\\text{H}^+] = [\\text{OH}^-]$ (pH 7)\n* **Base** $\\rightarrow [\\text{OH}^-] > [\\text{H}^+]$ (pH 8-14)",
    samDirectAnswer:
      "**Direct Definition** 🎯:\n\n* **Arrhenius Model**: Acids increase $[\\text{H}^+]$ in water; Bases increase $[\\text{OH}^-]$.\n* **Brønsted-Lowry Model**: Acids donate protons ($H^+$); Bases accept protons.\n* **Formula**: $$\\text{pH} = -\\log_{10}[\\text{H}^+], \\quad \\text{pOH} = -\\log_{10}[\\text{OH}^-], \\quad \\text{pH} + \\text{pOH} = 14$$\n* **Neutralization**: $\\text{H}^+ + \\text{OH}^- \\rightarrow \\text{H}_2\\text{O}$",
    blackboardFormula: "pH = -log10[H⁺] | [H⁺][OH⁻] = 10⁻¹⁴ | Acid + Base → Salt + H₂O",
  },
  reaction: {
    tobyPeerTeach:
      "Here is my summary of **Chemical Reactions** 💥:\n\n1. **Law of Conservation of Mass**: Atoms are neither created nor destroyed.\n2. **Balancing**: We adjust stoichiometric coefficients so both sides have the exact same number of each atom.\n3. **Example**: $2\\text{H}_2 + \\text{O}_2 \\rightarrow 2\\text{H}_2\\text{O}$ (4 H's and 2 O's on both sides).\n\nHow does this look?",
    mayaClue:
      "💡 **Maya's Clue**: Keep an eye on **Redox States** (Oxidation Numbers):\n\n* **Oxidation**: Loss of electrons ($\\text{OIL}$)\n* **Reduction**: Gain of electrons ($\\text{RIG}$)",
    leoPopQuiz:
      "⚡ **Leo's Pop Quiz**:\n\nBalance this reaction: $$\\text{Fe} + \\text{O}_2 \\rightarrow \\text{Fe}_2\\text{O}_3$$\nWhat are the smallest whole-number coefficients?",
    mayaEdgeCase:
      "**Analytical Question** 🧐:\n\nWhy do some reactions occur spontaneously at room temperature (exothermic with $\\Delta H < 0$), while others require continuous energy input (endothermic)? How does **Gibbs Free Energy** ($\\Delta G = \\Delta H - T\\Delta S$) determine reaction favorability?",
    tobyIntuition:
      "Aha! 💡 Chemical reactions are like taking Lego models apart and rebuilding them into new shapes without losing a single brick!",
    leoSummary:
      "**Key Rules** 🎯:\n* Total mass is conserved.\n* Bonds break (requires energy), new bonds form (releases energy).\n* $\\Delta H = \\Sigma(\\text{Bonds Broken}) - \\Sigma(\\text{Bonds Formed})$",
    samDirectAnswer:
      "**Direct Summary** 🎯:\n\n* **Types**: Synthesis, Decomposition, Single Replacement, Double Replacement, Combustion.\n* **Stoichiometry**: Mole ratios govern reaction quantities.\n* **Enthalpy**: $\\Delta H < 0$ (Exothermic), $\\Delta H > 0$ (Endothermic).",
    blackboardFormula: "Reactants → Products | ΔH = Σ(Bonds Broken) - Σ(Bonds Formed) | ΔG = ΔH - TΔS",
  },
  atomic: {
    tobyPeerTeach:
      "Here is my summary of **Atomic Structure & Orbitals** ⚛️:\n\n* Electrons exist in **3D probability clouds** called **orbitals** (regions where finding an electron is $90\\%$ likely).\n* **s-orbitals**: Spherical shape.\n* **p-orbitals**: Dumbbell shape across $x, y, z$ axes.\n* **Capacity**: Each orbital holds maximum **2 electrons** with opposite spins.\n\nDid I get the key points?",
    mayaClue:
      "💡 **Maya's Clue**: Remember the three quantum filling rules:\n\n1. **Aufbau Principle**: Fill lowest energy orbitals first ($1s \\rightarrow 2s \\rightarrow 2p \\dots$).\n2. **Pauli Exclusion**: Maximum 2 electrons per orbital with opposite spins ($+\\frac{1}{2}, -\\frac{1}{2}$).\n3. **Hund's Rule**: Degenerate orbitals fill singly before pairing up.",
    leoPopQuiz:
      "⚡ **Leo's Pop Quiz**:\n\nWhat is the full electron configuration of Carbon ($Z = 6$)? How many unpaired valence electrons does it have?",
    mayaEdgeCase:
      "**Analytical Question** 🧐:\n\nAccording to Heisenberg's Uncertainty Principle ($\\Delta x \\cdot \\Delta p \\ge \\frac{\\hbar}{2}$), why is it impossible to define precise planetary orbits for electrons?",
    tobyIntuition:
      "Aha! 💡 An orbital is like a long-exposure photo of a hummingbird around a flower—a dense cloud showing where it spends its time rather than a fixed track!",
    leoSummary:
      "**Quantum Numbers Summary** 🎯:\n* $n$ (Principal): Shell/Energy level ($1, 2, 3\\dots$)\n* $l$ (Angular): Shape ($s=0, p=1, d=2, f=3$)\n* $m_l$ (Magnetic): 3D orientation\n* $m_s$ (Spin): $+\\frac{1}{2}, -\\frac{1}{2}$",
    samDirectAnswer:
      "**Direct Facts** 🎯:\n\n* Max electrons per energy level: $2n^2$.\n* Subshell capacities: $s=2, p=6, d=10, f=14$.\n* Valence electrons determine all chemical bonding behavior.",
    blackboardFormula: "max e⁻ = 2n² | s(2), p(6), d(10), f(14) | Δx·Δp ≥ ℏ/2",
  },
  bond: {
    tobyPeerTeach:
      "Here is my summary of **Chemical Bonding & VSEPR** 🎈:\n\n* **VSEPR Theory**: Valence electron pairs repel each other and spread out as far as possible in 3D space.\n* **Water ($H_2O$)**: 2 bonding pairs + 2 lone pairs on Oxygen form a **Bent geometry** ($104.5^\\circ$).\n* **Methane ($CH_4$)**: 4 bonding pairs form a **Tetrahedral geometry** ($109.5^\\circ$).\n\nIs this accurate?",
    mayaClue:
      "💡 **Maya's Clue**: Distinguish between **Electron Geometry** and **Molecular Shape**:\n\n* In $NH_3$ (Ammonia), electron geometry is **Tetrahedral** (4 pairs), but molecular shape is **Trigonal Pyramidal** (lone pair occupies one apex).",
    leoPopQuiz:
      "⚡ **Leo's Pop Quiz**:\n\nWhy is $CO_2$ linear ($180^\\circ$) and non-polar, while $SO_2$ is bent ($119^\\circ$) and polar?",
    mayaEdgeCase:
      "**Analytical Question** 🧐:\n\nWhy do lone pairs exert stronger electrostatic repulsion than bonded pairs? (Hint: Lone pairs are held by only one nucleus, spreading out wider in space).",
    tobyIntuition:
      "Aha! 💡 It's like tying 4 party balloons together at the knot—they automatically push into a 3D pyramid so every balloon gets maximum space!",
    leoSummary:
      "**VSEPR Shapes** 🎯:\n* 2 pairs $\\rightarrow$ Linear ($180^\\circ$)\n* 3 pairs $\\rightarrow$ Trigonal Planar ($120^\\circ$)\n* 4 pairs $\\rightarrow$ Tetrahedral ($109.5^\\circ$)",
    samDirectAnswer:
      "**Direct Specifications** 🎯:\n\n* **Hybridization**: $sp$ (Linear), $sp^2$ (Trigonal Planar), $sp^3$ (Tetrahedral).\n* **Polarity**: Determined by bond dipole vector sum ($\\Sigma \\vec{\\mu} \\neq 0$).",
    blackboardFormula: "Linear (180°) | Trigonal Planar (120°) | Tetrahedral (109.5°) | Bent (104.5°)",
  },

  // Physics
  vector: {
    tobyPeerTeach:
      "Here is my summary of **Vectors & Kinematics** 🧭:\n\n* **Scalar**: Magnitude only (e.g. Distance $= 7\\text{ m}$, Speed $= 20\\text{ m/s}$).\n* **Vector**: Magnitude + Direction (e.g. Displacement $= 5\\text{ m}$ at $53^\\circ$ North of East).\n* **Pythagoras**: Walking $3\\text{m}$ North and $4\\text{m}$ East gives: $$R = \\sqrt{3^2 + 4^2} = 5\\text{ m}$$\n\nHow is this explanation?",
    mayaClue:
      "💡 **Maya's Clue**: Always resolve vectors into perpendicular components before adding:\n\n* $V_x = V \\cos(\\theta)$\n* $V_y = V \\sin(\\theta)$\n* $\\vec{R} = (\\Sigma V_x)\\hat{i} + (\\Sigma V_y)\\hat{j}$",
    leoPopQuiz:
      "⚡ **Leo's Pop Quiz**:\n\nA projectile is launched at $30^\\circ$ with velocity $v_0$. At the very highest point of its trajectory, what is its vertical velocity $v_y$ and horizontal velocity $v_x$?",
    mayaEdgeCase:
      "**Analytical Question** 🧐:\n\nWhen is the dot product $\\vec{A} \\cdot \\vec{B} = 0$ (perpendicular vectors), and when is the cross product $\\vec{A} \\times \\vec{B} = \\vec{0}$ (parallel vectors)?",
    tobyIntuition:
      "Aha! 💡 Scalars are like the odometer reading on your dashboard; vectors are like the GPS arrow pointing directly to your destination!",
    leoSummary:
      "**Kinematics Formulas** 🎯:\n* $v = u + at$\n* $s = ut + \\frac{1}{2}at^2$\n* $v^2 = u^2 + 2as$",
    samDirectAnswer:
      "**Direct Formulation** 🎯:\n\n* Magnitude: $|\\vec{V}| = \\sqrt{V_x^2 + V_y^2}$\n* Direction: $\\theta = \\arctan(V_y / V_x)$\n* Dot Product: $\\vec{A} \\cdot \\vec{B} = |A||B|\\cos(\\theta)$\n* Cross Product: $|\\vec{A} \\times \\vec{B}| = |A||B|\\sin(\\theta)$",
    blackboardFormula: "R = √(Rx² + Ry²) | θ = arctan(Ry/Rx) | v = u + at | s = ut + ½at²",
  },
  newton: {
    tobyPeerTeach:
      "Here is my summary of **Newton's Laws of Motion** 🛹:\n\n1. **1st Law (Inertia)**: Objects keep moving at constant velocity unless acted upon by a net external force.\n2. **2nd Law**: $\\Sigma \\vec{F} = m \\cdot \\vec{a}$ (Acceleration is proportional to net force).\n3. **3rd Law**: For every action force, there is an equal and opposite reaction force acting on the **other** object.\n\nDid I get all 3 laws clear?",
    mayaClue:
      "💡 **Maya's Clue**: Draw a **Free Body Diagram (FBD)** before writing equations:\n\n* Identify all forces: Gravity ($mg$), Normal force ($N$), Tension ($T$), and Friction ($f_k = \\mu_k N$).",
    leoPopQuiz:
      "⚡ **Leo's Pop Quiz**:\n\nA $10\\text{ kg}$ block is pushed with $50\\text{ N}$ of horizontal force. If kinetic friction is $20\\text{ N}$, what is the acceleration of the block?",
    mayaEdgeCase:
      "**Analytical Question** 🧐:\n\nWhy does static friction have an inequality ($f_s \\le \\mu_s N$) while kinetic friction is constant ($f_k = \\mu_k N$)? How does static friction adjust to match the applied force up to its maximum threshold?",
    tobyIntuition:
      "Aha! 💡 If you push against a heavy wall, the wall pushes back on your hands with the exact same force. You only move because your feet push against the ground!",
    leoSummary:
      "**Summary** 🎯:\n* Net force causes acceleration ($a = F_{\\text{net}} / m$).\n* Friction opposes relative motion.\n* Action-reaction pairs act on different bodies.",
    samDirectAnswer:
      "**Direct Reference** 🎯:\n\n* **Newton 1**: $\\Sigma \\vec{F} = 0 \\implies \\vec{a} = 0, \\vec{v} = \\text{const}$.\n* **Newton 2**: $\\vec{F}_{\\text{net}} = m\\frac{d\\vec{v}}{dt} = m\\vec{a}$.\n* **Newton 3**: $\\vec{F}_{AB} = -\\vec{F}_{BA}$.\n* **Friction**: $f_s^{\\max} = \\mu_s N, \\quad f_k = \\mu_k N$.",
    blackboardFormula: "ΣF = m·a | F_friction ≤ μ·N | F_AB = -F_BA | W = F·d·cos(θ)",
  },
  light: {
    tobyPeerTeach:
      "Here is my summary of **Light Reflection & Refraction** 🌈:\n\n* **Reflection**: Angle of incidence $=$ Angle of reflection ($\\theta_i = \\theta_r$).\n* **Refraction (Snell's Law)**: Light bends when moving between media of different optical densities: $$n_1 \\sin(\\theta_1) = n_2 \\sin(\\theta_2)$$\n* Entering a denser medium ($n_2 > n_1$), light slows down and bends **towards the normal**.\n\nIs this accurate?",
    mayaClue:
      "💡 **Maya's Clue**: Remember **Total Internal Reflection (TIR)**:\n\n* Occurs when light travels from **denser to rarer** medium at $\\theta_i > \\theta_c$.\n* Critical angle formula: $\\sin(\\theta_c) = \\frac{n_2}{n_1}$.",
    leoPopQuiz:
      "⚡ **Leo's Pop Quiz**:\n\nIf light travels from air ($n=1.0$) into glass ($n=1.5$), what happens to its **frequency**, **wavelength**, and **speed**?",
    mayaEdgeCase:
      "**Analytical Question** 🧐:\n\nWhy does dispersion occur in a prism? (Because the refractive index $n$ varies slightly with wavelength $\\lambda$, so violet light bends more than red light).",
    tobyIntuition:
      "Aha! 💡 Light bending is like a car hitting a sand patch at an angle—the wheel that hits the sand first slows down, causing the car to pivot!",
    leoSummary:
      "**Optics Checklist** 🎯:\n* Mirror Formula: $\\frac{1}{f} = \\frac{1}{v} + \\frac{1}{u}$\n* Lens Formula: $\\frac{1}{f} = \\frac{1}{v} - \\frac{1}{u}$\n* Magnification: $m = -\\frac{v}{u}$ (mirrors), $m = \\frac{v}{u}$ (lenses)",
    samDirectAnswer:
      "**Direct Formulas** 🎯:\n\n* Index of Refraction: $n = \\frac{c}{v}$.\n* Snell's Law: $n_1 \\sin(\\theta_1) = n_2 \\sin(\\theta_2)$.\n* Lens Power: $P = \\frac{1}{f\\text{ (in meters)}}$ (Diopters).",
    blackboardFormula: "n₁·sin(θ₁) = n₂·sin(θ₂) | 1/f = 1/v - 1/u | P = 1/f | sin(θc) = 1/n",
  },
  electrostat: {
    tobyPeerTeach:
      "Here is my summary of **Electrostatics & Electric Field** ⚡:\n\n* **Coulomb's Law**: Like charges repel, opposite charges attract: $$F = k\\frac{|q_1 q_2|}{r^2}$$\n* **Electric Field ($\\vec{E}$)**: Vector force per unit positive test charge ($E = F / q_0$).\n* **Electric Potential ($V$)**: Scalar potential energy per unit charge ($V = k q / r$).\n\nHow does that sound?",
    mayaClue:
      "💡 **Maya's Clue**: Connect Field to Potential via gradient:\n\n* $\\vec{E} = -\\frac{dV}{dr}\\hat{r}$ (Electric field always points in direction of decreasing potential).",
    leoPopQuiz:
      "⚡ **Leo's Pop Quiz**:\n\nWhat is the electrostatic field $\\vec{E}$ inside a hollow conducting sphere with charge $Q$ on its outer surface?",
    mayaEdgeCase:
      "**Analytical Question** 🧐:\n\nInside a conductor in electrostatic equilibrium, $\\vec{E} = 0$. Does this mean the potential $V$ inside is zero or a non-zero constant?",
    tobyIntuition:
      "Aha! 💡 Potential is like height on a hill, and Electric Field is the slope—a positive charge naturally rolls downhill towards lower potential!",
    leoSummary:
      "**Electrostatics Summary** 🎯:\n* Force: $F = \\frac{k q_1 q_2}{r^2}$ (Vector)\n* Field: $E = \\frac{k q}{r^2}$ (Vector)\n* Potential: $V = \\frac{k q}{r}$ (Scalar)",
    samDirectAnswer:
      "**Direct Equations** 🎯:\n\n* Gauss's Law: $\\oint \\vec{E} \\cdot d\\vec{A} = \\frac{Q_{\\text{enclosed}}}{\\varepsilon_0}$.\n* Capacitance: $C = \\frac{Q}{V} = \\frac{\\varepsilon_0 A}{d}$.\n* Energy stored in capacitor: $U = \\frac{1}{2} C V^2$.",
    blackboardFormula: "F = k·q₁q₂/r² | E = -dV/dr | V = k·q/r | C = ε₀A/d | U = ½CV²",
  },

  // Mathematics
  derivative: {
    tobyPeerTeach:
      "Here is my summary of **Derivatives & Tangent Slopes** 📈:\n\n* **Derivative ($f'(x)$)**: Instantaneous rate of change of a function at a single instant.\n* **Geometry**: The slope of the tangent line touching the curve at that point.\n* **Power Rule**: If $f(x) = x^n$, then $f'(x) = n x^{n-1}$.\n* **Product Rule**: $(u \\cdot v)' = u' v + u v'$.\n\nIs this accurate?",
    mayaClue:
      "💡 **Maya's Clue**: Remember the formal definition using limits:\n\n$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$\nWe evaluate the limit as $h$ approaches 0 without dividing by zero!",
    leoPopQuiz:
      "⚡ **Leo's Pop Quiz**:\n\nFind the derivative of $f(x) = 3x^4 - 5x^2 + 7$. What is $f'(2)$?",
    mayaEdgeCase:
      "**Analytical Question** 🧐:\n\nWhy is $f(x) = |x|$ continuous at $x = 0$ but **not differentiable** at $x = 0$? (Because the left-hand slope is $-1$ while the right-hand slope is $+1$).",
    tobyIntuition:
      "Aha! 💡 If your odometer function is $s(t)$, your speedometer needle at this exact millisecond is the derivative $s'(t)$!",
    leoSummary:
      "**Differentiation Rules** 🎯:\n* Constant: $(c)' = 0$\n* Power: $(x^n)' = n x^{n-1}$\n* Chain Rule: $[f(g(x))]' = f'(g(x)) \\cdot g'(x)$",
    samDirectAnswer:
      "**Direct Formulas** 🎯:\n\n* Quotient Rule: $\\left(\\frac{u}{v}\\right)' = \\frac{u' v - u v'}{v^2}$\n* Exponential: $(e^x)' = e^x, \\quad (\\ln x)' = \\frac{1}{x}$\n* Trigonometric: $(\\sin x)' = \\cos x, \\quad (\\cos x)' = -\\sin x, \\quad (\\tan x)' = \\sec^2 x$",
    blackboardFormula: "f'(x) = lim_{h→0} [f(x+h) - f(x)]/h | (xⁿ)' = n·xⁿ⁻¹ | (fg)' = f'g + fg'",
  },
  limit: {
    tobyPeerTeach:
      "Here is my summary of **Limits & Continuity** 🎯:\n\n* **Limit ($\\lim_{x \\to a} f(x) = L$)**: The value $f(x)$ gets arbitrarily close to as $x$ approaches $a$.\n* **Two-Sided Condition**: The limit exists if and only if: $$\\lim_{x \\to a^-} f(x) = \\lim_{x \\to a^+} f(x) = L$$\n* **Indeterminate Form**: $\\frac{0}{0}$ means simplify/factor or apply L'Hôpital's rule.\n\nDid I get the definition right?",
    mayaClue:
      "💡 **Maya's Clue**: A function is continuous at $x = a$ if and only if:\n\n1. $f(a)$ is defined.\n2. $\\lim_{x \\to a} f(x)$ exists.\n3. $\\lim_{x \\to a} f(x) = f(a)$.",
    leoPopQuiz:
      "⚡ **Leo's Pop Quiz**:\n\nEvaluate: $$\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3}$$",
    mayaEdgeCase:
      "**Analytical Question** 🧐:\n\nWhy does $\\lim_{x \\to 0} \\sin(1/x)$ not exist, while $\\lim_{x \\to 0} x \\sin(1/x) = 0$ by the Squeeze Theorem?",
    tobyIntuition:
      "Aha! 💡 A limit is like looking at where a bridge was leading before it collapsed—you can see where the road meets even if there's a hole at that exact spot!",
    leoSummary:
      "**Limit Strategies** 🎯:\n1. Direct substitution\n2. Factor & cancel\n3. Rationalize conjugate\n4. L'Hôpital: $\\lim \\frac{f'(x)}{g'(x)}$ for $\\frac{0}{0}$ or $\\frac{\\infty}{\\infty}$",
    samDirectAnswer:
      "**Direct Rules** 🎯:\n\n* Standard Trig Limit: $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$.\n* Exponential: $\\lim_{x \\to 0} \\frac{e^x - 1}{x} = 1$.\n* Continuous function property: $\\lim_{x \\to a} f(g(x)) = f(\\lim_{x \\to a} g(x))$.",
    blackboardFormula: "lim_{x→a} f(x) = L ⇔ lim_{x→a⁻} = lim_{x→a⁺} = L | lim_{x→0} sin(x)/x = 1",
  },
  integral: {
    tobyPeerTeach:
      "Here is my summary of **Integrals & Antiderivatives** 📊:\n\n* **Definite Integral ($\\int_a^b f(x)dx$)**: Exact net area between $f(x)$ and the $x$-axis from $x=a$ to $x=b$.\n* **Fundamental Theorem of Calculus**: Differentiation and integration are inverse operations: $$\\int_a^b f(x)dx = F(b) - F(a), \\quad \\text{where } F'(x) = f(x)$$\n\nIs this clear?",
    mayaClue:
      "💡 **Maya's Clue**: Integration by Substitution ($u$-sub) reverses the Chain Rule:\n\n$$\\int f(g(x)) g'(x) dx = \\int f(u) du, \\quad u = g(x)$$",
    leoPopQuiz:
      "⚡ **Leo's Pop Quiz**:\n\nEvaluate: $$\\int (4x^3 - 6x + 2) dx$$",
    mayaEdgeCase:
      "**Analytical Question** 🧐:\n\nWhy does $\\int \\frac{1}{x} dx = \\ln|x| + C$ require absolute value bars? (Because the domain of $\\ln(x)$ is only $x > 0$, while $\\frac{1}{x}$ is defined for all $x \\neq 0$).",
    tobyIntuition:
      "Aha! 💡 If derivative is slicing a graph into instantaneous slope slivers, integral is adding all those slivers back together to calculate total accumulated amount!",
    leoSummary:
      "**Integral Essentials** 🎯:\n* Power Rule: $\\int x^n dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)$\n* Integration by Parts: $\\int u dv = uv - \\int v du$",
    samDirectAnswer:
      "**Direct Formulas** 🎯:\n\n* $\\int e^{kx} dx = \\frac{1}{k} e^{kx} + C$\n* $\\int \\cos(x) dx = \\sin(x) + C, \\quad \\int \\sin(x) dx = -\\cos(x) + C$\n* $\\int \\sec^2(x) dx = \\tan(x) + C$",
    blackboardFormula: "∫ xⁿ dx = xⁿ⁺¹/(n+1) + C | ∫ f(x)dx = F(b) - F(a) | ∫ u dv = uv - ∫ v du",
  },
};

function getConceptDialogue(conceptTitle: string): ConceptDialogueData {
  const t = conceptTitle.toLowerCase();
  for (const [key, data] of Object.entries(CONCEPT_DIALOGUES)) {
    if (t.includes(key)) return data;
  }
  return {
    tobyPeerTeach: `Here is my summary of **${conceptTitle}**:\n\n* **Core Principle**: Explains the relationship between inputs and outputs in the physical world.\n* **Key Takeaway**: Rules are derived from fundamental balance and conservation laws.\n\nDid I capture the main essence?`,
    mayaClue: `💡 **Maya's Clue**: Focus on the boundary conditions and governing equations of **${conceptTitle}**. Examine what happens as parameters approach zero or infinity.`,
    leoPopQuiz: `⚡ **Leo's Pop Quiz**: In 1-2 sentences, what is the #1 governing equation or real-world application of **${conceptTitle}**?`,
    mayaEdgeCase: `**Analytical Question** 🧐: Under what specific conditions does the standard model for **${conceptTitle}** apply, and where are its limitations?`,
    tobyIntuition: `Aha! 💡 So **${conceptTitle}** is all about balancing the system—when one variable changes, the others adjust predictably!`,
    leoSummary: `**Key Summary** 🎯: We connected the intuitive physical model directly to the formal rules for **${conceptTitle}**!`,
    samDirectAnswer: `**Direct Statement** 🎯:\n\n* **${conceptTitle}** is governed by standard conservation and equilibrium laws.\n* All variables must be evaluated with correct units and boundary limits.`,
    blackboardFormula: `Key Principle: Balance of inputs & outputs in ${conceptTitle}`,
  };
}

function generateMockClassroomResponse(
  conceptTitle: string,
  userMessage: string,
  turnCount: number,
  comprehensions: { toby: number; maya: number; leo: number; sam: number },
  mode: string = "teach",
  targetSpeaker: ClassmateSpeaker = "Toby"
) {
  const lower = userMessage.toLowerCase();
  const dialogue = getConceptDialogue(conceptTitle);

  let speaker: ClassmateSpeaker = targetSpeaker || "Toby";
  if (lower.includes("sam")) speaker = "Sam";
  else if (lower.includes("maya")) speaker = "Maya";
  else if (lower.includes("leo")) speaker = "Leo";
  else if (lower.includes("toby")) speaker = "Toby";

  const tobyScore = Math.min(100, comprehensions.toby + 20);
  const mayaScore = Math.min(100, comprehensions.maya + 18);
  const leoScore = Math.min(100, comprehensions.leo + 22);
  const samScore = Math.min(100, (comprehensions.sam || 20) + 25);

  // 1. PEER EXPLAIN MODE
  if (mode === "peer_explain" || lower.includes("your turn") || lower.includes("teach it back")) {
    let reply = dialogue.tobyPeerTeach;
    if (speaker === "Sam") {
      reply = dialogue.samDirectAnswer;
    } else if (speaker === "Maya") {
      reply = `**Maya's Rigorous Breakdown** 🧐:\n\nFor **${conceptTitle}**, all valid solutions must satisfy boundary conditions without logical contradictions. Here is the formal relationship:\n\n* ${dialogue.blackboardFormula}\n\nDoes this rigorous formulation match your explanation?`;
    }

    return {
      speaker,
      reply,
      mood: "lightbulb",
      thought: `${speaker} tested their understanding of ${conceptTitle} in structured Markdown.`,
      comprehensionDelta: 20,
      newComprehensions: { toby: tobyScore, maya: mayaScore, leo: leoScore, sam: samScore },
      xpAwarded: 70,
      comboMultiplier: 2.0,
      classmateChime: {
        speaker: speaker === "Sam" ? "Toby" : "Sam",
        emoji: speaker === "Sam" ? "🎨" : "🎯",
        reaction:
          speaker === "Sam"
            ? "Sam gave the exact facts! That makes it super clear."
            : "Clear explanation from the team.",
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
      thought: "Leo offered a quick structured quiz in Markdown.",
      comprehensionDelta: 12,
      newComprehensions: { toby: comprehensions.toby, maya: comprehensions.maya, leo: leoScore, sam: samScore },
      xpAwarded: 45,
      comboMultiplier: 1.5,
      classmateChime: {
        speaker: "Sam",
        emoji: "🎯",
        reaction: "Direct question. Look at the governing formula.",
      },
      blackboardTip: dialogue.blackboardFormula,
    };
  }

  // 3. HINT / CLUE MODE
  if (mode === "hint" || lower.includes("clue") || lower.includes("hint") || lower.includes("help")) {
    return {
      speaker: speaker === "Sam" ? "Sam" : "Maya",
      reply: speaker === "Sam" ? dialogue.samDirectAnswer : dialogue.mayaClue,
      mood: "curious",
      thought: `${speaker} provided structured guidance in Markdown.`,
      comprehensionDelta: 10,
      newComprehensions: {
        toby: Math.min(100, comprehensions.toby + 10),
        maya: Math.min(100, comprehensions.maya + 12),
        leo: Math.min(100, comprehensions.leo + 10),
        sam: Math.min(100, (comprehensions.sam || 20) + 15),
      },
      xpAwarded: 35,
      comboMultiplier: 1.0,
      classmateChime: {
        speaker: "Toby",
        emoji: "🎨",
        reaction: "That makes it so easy to follow step-by-step!",
      },
      blackboardTip: dialogue.blackboardFormula,
    };
  }

  // 4. SAM DIRECT SPEAKER
  if (speaker === "Sam") {
    return {
      speaker: "Sam",
      reply: dialogue.samDirectAnswer,
      mood: "mastered",
      thought: "Sam provided a straight-to-the-point factual breakdown in Markdown.",
      comprehensionDelta: 25,
      newComprehensions: { toby: tobyScore, maya: mayaScore, leo: leoScore, sam: samScore },
      xpAwarded: 75,
      comboMultiplier: 2.0,
      classmateChime: {
        speaker: "Leo",
        emoji: "⚡",
        reaction: "Short, sweet, and 100% accurate!",
      },
      blackboardTip: dialogue.blackboardFormula,
    };
  }

  // 5. MAYA SKEPTICAL SPEAKER
  if (speaker === "Maya") {
    return {
      speaker: "Maya",
      reply: dialogue.mayaEdgeCase,
      mood: "skeptical",
      thought: "Maya posed a structured analytical question in Markdown.",
      comprehensionDelta: 18,
      newComprehensions: { toby: tobyScore, maya: mayaScore, leo: leoScore, sam: samScore },
      xpAwarded: 60,
      comboMultiplier: 1.5,
      classmateChime: {
        speaker: "Sam",
        emoji: "🎯",
        reaction: "Good point on boundary conditions.",
      },
      blackboardTip: dialogue.blackboardFormula,
    };
  }

  // 6. LEO SUMMARY SPEAKER
  if (speaker === "Leo") {
    return {
      speaker: "Leo",
      reply: `${dialogue.leoSummary}\n\nWhat is the next key concept we should link with this?`,
      mood: "amazed",
      thought: "Leo synthesized key takeaways in clean Markdown.",
      comprehensionDelta: 22,
      newComprehensions: { toby: tobyScore, maya: mayaScore, leo: leoScore, sam: samScore },
      xpAwarded: 65,
      comboMultiplier: 1.5,
      classmateChime: {
        speaker: "Toby",
        emoji: "💡",
        reaction: "Everything is clicking into place!",
      },
      blackboardTip: dialogue.blackboardFormula,
    };
  }

  // 7. TOBY DEFAULT
  return {
    speaker: "Toby",
    reply: `${dialogue.tobyIntuition}\n\nCan you give us a quick $1$-sentence summary to lock this in?`,
    mood: tobyScore >= 80 ? "mastered" : "curious",
    thought: "Toby internalized the intuitive analogy.",
    comprehensionDelta: 20,
    newComprehensions: { toby: tobyScore, maya: mayaScore, leo: leoScore, sam: samScore },
    xpAwarded: 60,
    comboMultiplier: 1.5,
    classmateChime: {
      speaker: "Sam",
      emoji: "🎯",
      reaction: "Intuition aligns with the formal definition.",
    },
    blackboardTip: dialogue.blackboardFormula,
  };
}

export async function POST(request: Request) {
  try {
    // ── RATE LIMITING & PROTECTION ──
    const clientId = getClientIdentifier(request);
    const rateCheck = globalRateLimiter.check(clientId, RATE_LIMITS.TEACH_BACK_CHAT);
    if (!rateCheck.allowed) {
      const waitSeconds = Math.ceil(rateCheck.resetMs / 1000);
      return NextResponse.json(
        {
          error: "Rate limit exceeded. System protected against API credit exhaustion.",
          message: `Please wait ${waitSeconds}s before sending another message.`,
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
      currentComprehensions = { toby: 15, maya: 10, leo: 15, sam: 20 },
      mode = "teach",
      targetClassmate = "Toby",
      streakCount = 1,
    } = body;

    conceptTitle = sanitizeString(conceptTitle || "Concept", 100);
    conceptDescription = sanitizeString(conceptDescription || "", 300);

    // Sanitize user messages to neutralize prompt injections
    messages = (messages || []).map((m) => ({
      ...m,
      content: sanitizeAndGuardPrompt(m.content).safeText,
    }));

    const genAI = getGeminiClient();

    if (!genAI) {
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

    const systemPrompt = `You are a high-school study group of 4 distinct classmates learning together:
1. **Toby (Visual & Intuitive)** 🎨: Enthusiastic, relates concepts to everyday physical analogies (speedometer, balloons, water flow).
2. **Maya (Skeptical Challenger)** 🧐: Sharp, analytical, asks about boundary conditions, edge cases, and mathematical/chemical rigor without being confusing.
3. **Leo (Quick Quizzer)** ⚡: Energetic, gives bulleted takeaways, pop quizzes, and celebrates combos.
4. **Sam (Straightforward & Direct)** 🎯: Gives direct, concise, factual, no-nonsense answers, equations, and exact step-by-step definitions straight to the point.

TARGET CONCEPT: "${conceptTitle}"
CONCEPT SUMMARY: "${conceptDescription}"
CURRENT COMPREHENSIONS:
- Toby: ${currentComprehensions.toby}%
- Maya: ${currentComprehensions.maya}%
- Leo: ${currentComprehensions.leo}%
- Sam: ${currentComprehensions.sam ?? 20}%

CURRENT MODE: "${mode}" ("teach", "peer_explain" = student explains back in own words, "pop_quiz" = quick quiz, "hint" = helpful scaffold clue)
TARGET CLASSMATE: "${targetClassmate}"

CRITICAL PEDAGOGICAL & FORMATTING RULES:
1. **Always format your response with clean Markdown**: Use **bolding**, bullet lists (*), numbered steps (1., 2.), and clear math expressions ($[H^+]$, $f'(x)$, equations).
2. **Do NOT be confusing**: Ensure every explanation is proper, accurate, structured, and easy to understand.
3. If speaking as **Sam**: Be direct, factual, and straight to the point with zero fluff.
4. If speaking as **Toby**: Use a clear intuitive visual story.
5. If speaking as **Maya**: Ask a coherent edge-case question.
6. If speaking as **Leo**: Give a crisp quiz or bulleted summary.

OUTPUT FORMAT:
Respond with ONLY valid JSON:
{
  "speaker": "Toby" | "Maya" | "Leo" | "Sam",
  "reply": "Your clear, properly structured Markdown response",
  "mood": "confused" | "curious" | "skeptical" | "lightbulb" | "amazed" | "mastered",
  "thought": "Brief internal pod thought (1 sentence)",
  "comprehensionDelta": <number 5 to 30>,
  "newComprehensions": {
    "toby": <number 0-100>,
    "maya": <number 0-100>,
    "leo": <number 0-100>,
    "sam": <number 0-100>
  },
  "xpEarned": <number 20-100>,
  "comboMultiplier": <number 1.0, 1.5, 2.0, or 3.0>,
  "classmateChime": {
    "speaker": "Maya" | "Toby" | "Leo" | "Sam",
    "emoji": "🧐" | "💡" | "⚡" | "🎯",
    "reaction": "Quick 1-sentence supportive reaction"
  } | null,
  "blackboardTip": "<LaTeX equation or key visual formula, or null>"
}`;

    const conversationHistory = messages
      .map((m) => `${m.role === "user" ? "TUTOR (User)" : `${m.speaker || "CLASSMATE"}`}: ${m.content}`)
      .join("\n\n");

    const prompt = `${systemPrompt}\n\nCONVERSATION HISTORY:\n${conversationHistory}\n\nGenerate the next classroom response in exact JSON:`;

    const text = await generateWithGemini(genAI, prompt);
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
      reply: parsed.reply || "Could you summarize the key rule in one sentence?",
      mood: parsed.mood || "curious",
      thought: parsed.thought || "The study group is following your explanation...",
      comprehensionDelta: parsed.comprehensionDelta || 15,
      newComprehensions: {
        toby: Math.min(100, Math.max(0, parsed.newComprehensions?.toby ?? (currentComprehensions.toby + 15))),
        maya: Math.min(100, Math.max(0, parsed.newComprehensions?.maya ?? (currentComprehensions.maya + 12))),
        leo: Math.min(100, Math.max(0, parsed.newComprehensions?.leo ?? (currentComprehensions.leo + 18))),
        sam: Math.min(100, Math.max(0, parsed.newComprehensions?.sam ?? ((currentComprehensions.sam ?? 20) + 20))),
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
        body.conceptTitle || "Science",
        userLastMessage,
        body.messages ? body.messages.filter((m) => m.role === "user").length : 1,
        body.currentComprehensions || { toby: 15, maya: 10, leo: 15, sam: 20 },
        body.mode || "teach",
        body.targetClassmate || "Toby"
      )
    );
  }
}
