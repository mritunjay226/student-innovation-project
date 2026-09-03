import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedDatabase = mutation({
  args: {
    forceReseed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // If not force reseeding, check if already seeded with new subjects
    const existingConcepts = await ctx.db.query("concepts").collect();
    const hasPhysics = existingConcepts.some((c) => c.subject === "Physics");
    const hasChemistry = existingConcepts.some((c) => c.subject === "Chemistry");

    if (existingConcepts.length > 0 && hasPhysics && hasChemistry && !args.forceReseed) {
      return { status: "already_seeded", message: "Database already has multi-subject data" };
    }

    // Clean up old records if force reseed or upgrading to multi-subject
    if (existingConcepts.length > 0) {
      for (const c of existingConcepts) await ctx.db.delete(c._id);
      const edges = await ctx.db.query("prerequisiteEdges").collect();
      for (const e of edges) await ctx.db.delete(e._id);
      const items = await ctx.db.query("assessmentItems").collect();
      for (const i of items) await ctx.db.delete(i._id);
      const mastery = await ctx.db.query("mastery").collect();
      for (const m of mastery) await ctx.db.delete(m._id);
      const misconceptions = await ctx.db.query("misconceptions").collect();
      for (const m of misconceptions) await ctx.db.delete(m._id);
      const users = await ctx.db.query("users").collect();
      for (const u of users) await ctx.db.delete(u._id);
    }

    // ── Create Demo Users with High-Quality Real Avatars ──
    const studentId = await ctx.db.insert("users", {
      name: "Kristin Watson",
      email: "kristin.watson@axiora.edu",
      role: "student",
      grade: "Class 12 STEM",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces",
    });

    const student2Id = await ctx.db.insert("users", {
      name: "Maya Lin",
      email: "maya.lin@axiora.edu",
      role: "student",
      grade: "Class 12 STEM",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=faces",
    });

    const student3Id = await ctx.db.insert("users", {
      name: "Toby Vance",
      email: "toby.vance@axiora.edu",
      role: "student",
      grade: "Class 12 STEM",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=faces",
    });

    const student4Id = await ctx.db.insert("users", {
      name: "Leo Chen",
      email: "leo.chen@axiora.edu",
      role: "student",
      grade: "Class 12 STEM",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
    });

    const student5Id = await ctx.db.insert("users", {
      name: "Samantha Reed",
      email: "sam.reed@axiora.edu",
      role: "student",
      grade: "Class 12 STEM",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces",
    });

    const student6Id = await ctx.db.insert("users", {
      name: "Arjun Mehta",
      email: "arjun.mehta@axiora.edu",
      role: "student",
      grade: "Class 12 STEM",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces",
    });

    await ctx.db.insert("users", {
      name: "Dr. Priya Sharma",
      email: "priya.sharma@axiora.edu",
      role: "teacher",
      grade: "Senior STEM Faculty",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces",
    });

    // ══════════════════════════════════════════════════════════════
    // 1. MATHEMATICS CURRICULUM (Class 10, 11, 12)
    // ══════════════════════════════════════════════════════════════
    // Class 10
    const m_realNumbers = await ctx.db.insert("concepts", {
      subject: "Mathematics",
      grade: "Class 10",
      title: "Real Numbers & Polynomials",
      description: "Fundamental theorem of arithmetic, irrational numbers, zeroes of polynomials, and quadratic factoring.",
      difficulty: 1,
      order: 1,
    });

    const m_trigRatios = await ctx.db.insert("concepts", {
      subject: "Mathematics",
      grade: "Class 10",
      title: "Trigonometric Ratios",
      description: "Basic trigonometric ratios (sin, cos, tan), standard angle values, and Pythagorean identities.",
      difficulty: 2,
      order: 2,
    });

    // Class 11
    const m_algebra = await ctx.db.insert("concepts", {
      subject: "Mathematics",
      grade: "Class 11",
      title: "Algebra Fundamentals",
      description: "Quadratic equations, sequences & series, binomial theorem, and algebraic manipulations.",
      difficulty: 2,
      order: 3,
    });

    const m_functions = await ctx.db.insert("concepts", {
      subject: "Mathematics",
      grade: "Class 11",
      title: "Functions & Relations",
      description: "Domain, range, injective/surjective mappings, composite functions, and curve transformations.",
      difficulty: 2,
      order: 4,
    });

    const m_trigFunctions = await ctx.db.insert("concepts", {
      subject: "Mathematics",
      grade: "Class 11",
      title: "Trigonometric Functions",
      description: "Radian measures, unit circle definitions, compound angle formulas, and inverse trig basics.",
      difficulty: 3,
      order: 5,
    });

    const m_limits = await ctx.db.insert("concepts", {
      subject: "Mathematics",
      grade: "Class 11",
      title: "Limits & Continuity",
      description: "Concept of approaching a point, epsilon-delta intuition, indeterminate forms (0/0), and continuous graphs.",
      difficulty: 3,
      order: 6,
    });

    // Class 12
    const m_derivatives = await ctx.db.insert("concepts", {
      subject: "Mathematics",
      grade: "Class 12",
      title: "Derivatives & Chain Rule",
      description: "Instantaneous rate of change, geometric tangent slope, product rule, quotient rule, and composite chain rule.",
      difficulty: 4,
      order: 7,
    });

    const m_appDerivatives = await ctx.db.insert("concepts", {
      subject: "Mathematics",
      grade: "Class 12",
      title: "Applications of Derivatives",
      description: "Monotonicity, maxima/minima optimization, tangents and normals, and related rates.",
      difficulty: 4,
      order: 8,
    });

    const m_integrals = await ctx.db.insert("concepts", {
      subject: "Mathematics",
      grade: "Class 12",
      title: "Integrals & Antiderivatives",
      description: "Definite and indefinite integrals, Fundamental Theorem of Calculus, and area accumulation.",
      difficulty: 5,
      order: 9,
    });

    const m_diffEq = await ctx.db.insert("concepts", {
      subject: "Mathematics",
      grade: "Class 12",
      title: "Differential Equations",
      description: "Formation and solution of first-order differential equations, variable separable, and integrating factors.",
      difficulty: 5,
      order: 10,
    });

    // ══════════════════════════════════════════════════════════════
    // 2. PHYSICS CURRICULUM (Class 10, 11, 12)
    // ══════════════════════════════════════════════════════════════
    // Class 10
    const p_light = await ctx.db.insert("concepts", {
      subject: "Physics",
      grade: "Class 10",
      title: "Light: Reflection & Refraction",
      description: "Laws of reflection, spherical mirrors, Snell's law of refraction, lens formula, and magnification.",
      difficulty: 2,
      order: 1,
    });

    const p_electricity10 = await ctx.db.insert("concepts", {
      subject: "Physics",
      grade: "Class 10",
      title: "Electricity Fundamentals",
      description: "Electric charge, potential difference, Ohm's law, resistance factors, and series/parallel resistor circuits.",
      difficulty: 2,
      order: 2,
    });

    // Class 11
    const p_vectors = await ctx.db.insert("concepts", {
      subject: "Physics",
      grade: "Class 11",
      title: "Vectors & Kinematics",
      description: "Scalar vs vector products, 1D/2D motion equations, relative velocity, and projectile trajectory.",
      difficulty: 2,
      order: 3,
    });

    const p_newtonsLaws = await ctx.db.insert("concepts", {
      subject: "Physics",
      grade: "Class 11",
      title: "Newton's Laws & Friction",
      description: "Inertia, momentum conservation, F=ma free-body diagrams, static vs kinetic friction, and circular motion.",
      difficulty: 3,
      order: 4,
    });

    const p_workEnergy = await ctx.db.insert("concepts", {
      subject: "Physics",
      grade: "Class 11",
      title: "Work, Energy & Power",
      description: "Work-energy theorem, conservative forces, potential energy curves, and elastic/inelastic collisions.",
      difficulty: 3,
      order: 5,
    });

    const p_gravitation = await ctx.db.insert("concepts", {
      subject: "Physics",
      grade: "Class 11",
      title: "Gravitation & Planetary Motion",
      description: "Newton's universal law, gravitational potential, escape velocity, and Kepler's planetary laws.",
      difficulty: 3,
      order: 6,
    });

    // Class 12
    const p_electrostatics = await ctx.db.insert("concepts", {
      subject: "Physics",
      grade: "Class 12",
      title: "Electrostatics & Gauss's Law",
      description: "Coulomb's inverse square law, electric field lines, electric potential, Gauss's flux theorem, and capacitance.",
      difficulty: 4,
      order: 7,
    });

    const p_currentElec = await ctx.db.insert("concepts", {
      subject: "Physics",
      grade: "Class 12",
      title: "Current Electricity & Circuits",
      description: "Electron drift velocity, resistivity, Kirchhoff's voltage and current junction laws, and Wheatstone bridge.",
      difficulty: 4,
      order: 8,
    });

    const p_magnetism = await ctx.db.insert("concepts", {
      subject: "Physics",
      grade: "Class 12",
      title: "Magnetic Effects of Current",
      description: "Biot-Savart law, Ampere's circuital law, Lorentz magnetic force, and moving charge in magnetic fields.",
      difficulty: 4,
      order: 9,
    });

    const p_emi = await ctx.db.insert("concepts", {
      subject: "Physics",
      grade: "Class 12",
      title: "Electromagnetic Induction & AC",
      description: "Faraday's flux laws, Lenz's law, self/mutual inductance, alternating current phasor diagrams, and resonance.",
      difficulty: 5,
      order: 10,
    });

    const p_waveOptics = await ctx.db.insert("concepts", {
      subject: "Physics",
      grade: "Class 12",
      title: "Wave Optics & Quantum Photons",
      description: "Huygens wave principle, Young's double-slit interference, diffraction, and Einstein's photoelectric effect.",
      difficulty: 5,
      order: 11,
    });

    // ══════════════════════════════════════════════════════════════
    // 3. CHEMISTRY CURRICULUM (Class 10, 11, 12)
    // ══════════════════════════════════════════════════════════════
    // Class 10
    const c_reactions = await ctx.db.insert("concepts", {
      subject: "Chemistry",
      grade: "Class 10",
      title: "Chemical Reactions & Equations",
      description: "Balancing stoichiometric equations, combination/decomposition, oxidation-reduction, and corrosion.",
      difficulty: 1,
      order: 1,
    });

    const c_acidsBases = await ctx.db.insert("concepts", {
      subject: "Chemistry",
      grade: "Class 10",
      title: "Acids, Bases & pH Scale",
      description: "Arrhenius acid-base theory, pH logarithmic scale, neutralization reactions, and salt hydrolysis.",
      difficulty: 2,
      order: 2,
    });

    const c_carbon10 = await ctx.db.insert("concepts", {
      subject: "Chemistry",
      grade: "Class 10",
      title: "Carbon & Homologous Series",
      description: "Tetravalency of carbon, covalent bonds, saturated vs unsaturated hydrocarbons, and functional groups.",
      difficulty: 2,
      order: 3,
    });

    // Class 11
    const c_atomicStructure = await ctx.db.insert("concepts", {
      subject: "Chemistry",
      grade: "Class 11",
      title: "Atomic Structure & Orbitals",
      description: "Bohr model, de Broglie duality, Heisenberg uncertainty, quantum numbers, Pauli exclusion, and Hund's rule.",
      difficulty: 3,
      order: 4,
    });

    const c_periodicTrends = await ctx.db.insert("concepts", {
      subject: "Chemistry",
      grade: "Class 11",
      title: "Periodic Trends & Bonding",
      description: "Periodic variation in atomic radius, ionization energy, electron affinity, and electronegativity.",
      difficulty: 2,
      order: 5,
    });

    const c_bonding = await ctx.db.insert("concepts", {
      subject: "Chemistry",
      grade: "Class 11",
      title: "Chemical Bonding & VSEPR",
      description: "Lewis structures, VSEPR molecular geometry, sp/sp2/sp3 hybridization, and molecular orbital theory.",
      difficulty: 3,
      order: 6,
    });

    const c_thermo = await ctx.db.insert("concepts", {
      subject: "Chemistry",
      grade: "Class 11",
      title: "Chemical Thermodynamics",
      description: "First and second laws of thermodynamics, internal energy, enthalpy (ΔH), entropy (ΔS), and Gibbs free energy (ΔG).",
      difficulty: 4,
      order: 7,
    });

    const c_equilibrium = await ctx.db.insert("concepts", {
      subject: "Chemistry",
      grade: "Class 11",
      title: "Chemical & Ionic Equilibrium",
      description: "Law of chemical equilibrium, equilibrium constant (Kc, Kp), Le Chatelier's principle, and buffer solutions.",
      difficulty: 4,
      order: 8,
    });

    // Class 12
    const c_solutions = await ctx.db.insert("concepts", {
      subject: "Chemistry",
      grade: "Class 12",
      title: "Solutions & Colligative Properties",
      description: "Raoult's law for volatile solutes, osmotic pressure, freezing point depression, and van 't Hoff factor (i).",
      difficulty: 4,
      order: 9,
    });

    const c_electrochem = await ctx.db.insert("concepts", {
      subject: "Chemistry",
      grade: "Class 12",
      title: "Electrochemistry & Nernst Equation",
      description: "Galvanic cells, standard electrode potentials, Nernst equation, electrolytic conductance, and Faraday's laws.",
      difficulty: 4,
      order: 10,
    });

    const c_kinetics = await ctx.db.insert("concepts", {
      subject: "Chemistry",
      grade: "Class 12",
      title: "Chemical Kinetics & Rate Laws",
      description: "Rate of reaction, zero/first order kinetics, half-life equations, Arrhenius temperature dependence, and activation energy.",
      difficulty: 4,
      order: 11,
    });

    const c_organicMechanisms = await ctx.db.insert("concepts", {
      subject: "Chemistry",
      grade: "Class 12",
      title: "Organic Reaction Mechanisms",
      description: "Nucleophilic substitution (SN1 vs SN2), elimination (E1/E2), Markovnikov addition, and carbocation stability.",
      difficulty: 5,
      order: 12,
    });

    // ══════════════════════════════════════════════════════════════
    // PREREQUISITE EDGES (Across all 3 subjects)
    // ══════════════════════════════════════════════════════════════
    const edges = [
      // Mathematics Prerequisite Graph
      { from: m_realNumbers, to: m_algebra },
      { from: m_algebra, to: m_functions },
      { from: m_trigRatios, to: m_trigFunctions },
      { from: m_functions, to: m_limits },
      { from: m_trigFunctions, to: m_limits },
      { from: m_limits, to: m_derivatives },
      { from: m_derivatives, to: m_appDerivatives },
      { from: m_derivatives, to: m_integrals },
      { from: m_integrals, to: m_diffEq },

      // Physics Prerequisite Graph
      { from: p_light, to: p_waveOptics },
      { from: p_electricity10, to: p_currentElec },
      { from: p_vectors, to: p_newtonsLaws },
      { from: p_newtonsLaws, to: p_workEnergy },
      { from: p_newtonsLaws, to: p_gravitation },
      { from: p_vectors, to: p_electrostatics },
      { from: p_electrostatics, to: p_currentElec },
      { from: p_currentElec, to: p_magnetism },
      { from: p_magnetism, to: p_emi },

      // Chemistry Prerequisite Graph
      { from: c_reactions, to: c_atomicStructure },
      { from: c_atomicStructure, to: c_periodicTrends },
      { from: c_periodicTrends, to: c_bonding },
      { from: c_carbon10, to: c_bonding },
      { from: c_reactions, to: c_thermo },
      { from: c_thermo, to: c_equilibrium },
      { from: c_equilibrium, to: c_electrochem },
      { from: c_kinetics, to: c_electrochem },
      { from: c_bonding, to: c_organicMechanisms },
    ];

    for (const edge of edges) {
      await ctx.db.insert("prerequisiteEdges", {
        fromConceptId: edge.from,
        toConceptId: edge.to,
        confidence: 0.95,
        teacherVerified: true,
      });
    }

    // ══════════════════════════════════════════════════════════════
    // ASSESSMENT ITEMS (Multi-Subject Diagnostic Questions)
    // ══════════════════════════════════════════════════════════════
    const questions = [
      // ── Physics Diagnostic Questions ──
      {
        conceptId: p_vectors,
        question: "If two vectors A and B are perpendicular, what is their dot product A · B?",
        type: "mcq" as const,
        options: ["0", "1", "|A||B|", "-1"],
        correctAnswer: "0",
        difficulty: 2,
        explanation: "Since cos(90°) = 0, the scalar dot product of perpendicular vectors is always zero.",
      },
      {
        conceptId: p_newtonsLaws,
        question: "A rocket moves in space by ejecting gas backwards. Which principle directly explains its forward propulsion?",
        type: "mcq" as const,
        options: ["Conservation of linear momentum (Newton's 3rd Law)", "Conservation of energy", "Gravitational attraction", "Centripetal acceleration"],
        correctAnswer: "Conservation of linear momentum (Newton's 3rd Law)",
        difficulty: 2,
        explanation: "Every action has an equal and opposite reaction: backward momentum of gas equals forward momentum of rocket.",
      },
      {
        conceptId: p_electrostatics,
        question: "According to Gauss's Law, the total electric flux through a closed surface enclosing net charge Q is:",
        type: "mcq" as const,
        options: ["Q / ε₀", "Q · ε₀", "Zero", "Q² / (4πε₀)"],
        correctAnswer: "Q / ε₀",
        difficulty: 3,
        explanation: "Gauss's law states that electric flux Φ = ∮ E · dA = Q_enclosed / ε₀.",
      },
      {
        conceptId: p_currentElec,
        question: "Kirchhoff's Junction Rule (Current Law) is a direct consequence of the conservation of:",
        type: "mcq" as const,
        options: ["Electric charge", "Energy", "Momentum", "Potential difference"],
        correctAnswer: "Electric charge",
        difficulty: 3,
        explanation: "Charge cannot accumulate at an electrical junction: current entering equals current leaving.",
      },
      {
        conceptId: p_emi,
        question: "Lenz's Law ensures that the induced current always opposes the change in magnetic flux. This enforces conservation of:",
        type: "mcq" as const,
        options: ["Energy", "Charge", "Magnetic field", "Mass"],
        correctAnswer: "Energy",
        difficulty: 4,
        explanation: "If induced current assisted the change, infinite energy could be generated from nothing.",
      },

      // ── Chemistry Diagnostic Questions ──
      {
        conceptId: c_atomicStructure,
        question: "Which quantum number specifies the 3D shape of an atomic orbital (s, p, d, f)?",
        type: "mcq" as const,
        options: ["Azimuthal / Angular momentum (l)", "Principal quantum number (n)", "Magnetic quantum number (m)", "Spin quantum number (s)"],
        correctAnswer: "Azimuthal / Angular momentum (l)",
        difficulty: 2,
        explanation: "The principal number n gives shell size/energy, while l gives orbital shape (l=0 is s, l=1 is p, l=2 is d).",
      },
      {
        conceptId: c_bonding,
        question: "According to VSEPR theory, what is the molecular geometry of methane (CH4) with sp³ hybridization?",
        type: "mcq" as const,
        options: ["Tetrahedral (109.5°)", "Trigonal planar (120°)", "Linear (180°)", "Square planar (90°)"],
        correctAnswer: "Tetrahedral (109.5°)",
        difficulty: 2,
        explanation: "4 bonding pairs with 0 lone pairs form a symmetric tetrahedral arrangement with bond angle 109.5°.",
      },
      {
        conceptId: c_thermo,
        question: "For a chemical reaction to be thermodynamically spontaneous at constant temperature and pressure, ΔG must be:",
        type: "mcq" as const,
        options: ["Negative (ΔG < 0)", "Positive (ΔG > 0)", "Zero (ΔG = 0)", "Greater than ΔH"],
        correctAnswer: "Negative (ΔG < 0)",
        difficulty: 3,
        explanation: "A spontaneous process always results in a decrease in Gibbs free energy (ΔG = ΔH - TΔS < 0).",
      },
      {
        conceptId: c_electrochem,
        question: "In a standard galvanic cell, oxidation occurs at the:",
        type: "mcq" as const,
        options: ["Anode (negative terminal)", "Cathode (positive terminal)", "Salt bridge", "Voltmeter"],
        correctAnswer: "Anode (negative terminal)",
        difficulty: 3,
        explanation: "Remember AN OX & RED CAT: Oxidation occurs at the Anode, Reduction occurs at the Cathode.",
      },
      {
        conceptId: c_organicMechanisms,
        question: "In an SN2 nucleophilic substitution reaction, the stereochemical outcome is:",
        type: "mcq" as const,
        options: ["Complete inversion of configuration (Walden inversion)", "Racemization (50% retention, 50% inversion)", "Complete retention of configuration", "Formation of free carbocation"],
        correctAnswer: "Complete inversion of configuration (Walden inversion)",
        difficulty: 4,
        explanation: "Backside attack by the nucleophile flips the spatial geometry like an umbrella in a storm.",
      },

      // ── Mathematics Diagnostic Questions ──
      {
        conceptId: m_limits,
        question: "What is lim(x→2) of (x² - 4)/(x - 2)?",
        type: "mcq" as const,
        options: ["4", "0", "2", "Undefined"],
        correctAnswer: "4",
        difficulty: 3,
        explanation: "Factor numerator: (x+2)(x-2)/(x-2) = x+2. As x approaches 2, value approaches 4.",
      },
      {
        conceptId: m_derivatives,
        question: "Geometrically, what does the derivative f'(a) represent on the curve y = f(x)?",
        type: "mcq" as const,
        options: ["Slope of the tangent line touching at x = a", "Area under the curve up to x = a", "Maximum y-value of the curve", "Y-intercept of the function"],
        correctAnswer: "Slope of the tangent line touching at x = a",
        difficulty: 2,
        explanation: "The derivative at a point is the instantaneous rate of change and the slope of the tangent line at that exact instant.",
      },
      {
        conceptId: m_integrals,
        question: "What is the definite integral ∫₀³ 2x dx?",
        type: "mcq" as const,
        options: ["9", "6", "18", "3"],
        correctAnswer: "9",
        difficulty: 3,
        explanation: "Antiderivative of 2x is x². Evaluated from 0 to 3: 3² - 0² = 9.",
      },
    ];

    for (const q of questions) {
      await ctx.db.insert("assessmentItems", q);
    }

    // ══════════════════════════════════════════════════════════════
    // MASTERY RECORDS FOR ARJUN (Class 12 student)
    // ══════════════════════════════════════════════════════════════
    const now = Date.now();
    const studentMasteries = [
      // Mathematics Mastery
      { conceptId: m_realNumbers, score: 96, risk: "low" as const, attempts: 15 },
      { conceptId: m_trigRatios, score: 92, risk: "low" as const, attempts: 12 },
      { conceptId: m_algebra, score: 94, risk: "low" as const, attempts: 14 },
      { conceptId: m_functions, score: 88, risk: "low" as const, attempts: 10 },
      { conceptId: m_trigFunctions, score: 82, risk: "low" as const, attempts: 8 },
      { conceptId: m_limits, score: 68, risk: "medium" as const, attempts: 7 },
      { conceptId: m_derivatives, score: 42, risk: "high" as const, attempts: 5 },
      { conceptId: m_appDerivatives, score: 25, risk: "high" as const, attempts: 2 },
      { conceptId: m_integrals, score: 34, risk: "high" as const, attempts: 3 },
      { conceptId: m_diffEq, score: 18, risk: "high" as const, attempts: 1 },

      // Physics Mastery
      { conceptId: p_light, score: 95, risk: "low" as const, attempts: 11 },
      { conceptId: p_electricity10, score: 90, risk: "low" as const, attempts: 9 },
      { conceptId: p_vectors, score: 86, risk: "low" as const, attempts: 8 },
      { conceptId: p_newtonsLaws, score: 80, risk: "low" as const, attempts: 6 },
      { conceptId: p_workEnergy, score: 74, risk: "medium" as const, attempts: 5 },
      { conceptId: p_gravitation, score: 82, risk: "low" as const, attempts: 6 },
      { conceptId: p_electrostatics, score: 45, risk: "high" as const, attempts: 4 },
      { conceptId: p_currentElec, score: 58, risk: "medium" as const, attempts: 5 },
      { conceptId: p_magnetism, score: 35, risk: "high" as const, attempts: 3 },
      { conceptId: p_emi, score: 28, risk: "high" as const, attempts: 2 },
      { conceptId: p_waveOptics, score: 40, risk: "high" as const, attempts: 3 },

      // Chemistry Mastery
      { conceptId: c_reactions, score: 98, risk: "low" as const, attempts: 12 },
      { conceptId: c_acidsBases, score: 92, risk: "low" as const, attempts: 10 },
      { conceptId: c_carbon10, score: 89, risk: "low" as const, attempts: 9 },
      { conceptId: c_atomicStructure, score: 84, risk: "low" as const, attempts: 7 },
      { conceptId: c_periodicTrends, score: 88, risk: "low" as const, attempts: 8 },
      { conceptId: c_bonding, score: 76, risk: "medium" as const, attempts: 6 },
      { conceptId: c_thermo, score: 62, risk: "medium" as const, attempts: 5 },
      { conceptId: c_equilibrium, score: 48, risk: "high" as const, attempts: 4 },
      { conceptId: c_solutions, score: 70, risk: "medium" as const, attempts: 6 },
      { conceptId: c_electrochem, score: 36, risk: "high" as const, attempts: 3 },
      { conceptId: c_kinetics, score: 65, risk: "medium" as const, attempts: 5 },
      { conceptId: c_organicMechanisms, score: 32, risk: "high" as const, attempts: 2 },
    ];

    for (const m of studentMasteries) {
      await ctx.db.insert("mastery", {
        studentId,
        conceptId: m.conceptId,
        score: m.score,
        lastSeen: now - Math.random() * 5 * 24 * 60 * 60 * 1000,
        retentionRisk: m.risk,
        attemptCount: m.attempts,
      });
    }

    // ══════════════════════════════════════════════════════════════
    // DETECTED MISCONCEPTIONS (Physics, Chemistry, Math)
    // ══════════════════════════════════════════════════════════════
    await ctx.db.insert("misconceptions", {
      studentId,
      conceptId: m_derivatives,
      pattern: "concept_reversal",
      description: "Treats derivative as a static magnitude instead of a dynamic instantaneous rate of change.",
      evidence: "In 3 out of 5 attempts, confused slope of tangent line with absolute height of the function f(x).",
      confidence: 0.88,
      resolved: false,
    });

    await ctx.db.insert("misconceptions", {
      studentId,
      conceptId: p_electrostatics,
      pattern: "formula_confusion",
      description: "Confuses electric potential (scalar V) with electric field (vector E) when applying superposition.",
      evidence: "Added potential values as vector arrows in 2 diagnostic assessments.",
      confidence: 0.82,
      resolved: false,
    });

    await ctx.db.insert("misconceptions", {
      studentId,
      conceptId: c_electrochem,
      pattern: "prerequisite_confusion",
      description: "Struggles with Nernst equation due to weak chemical equilibrium Q/K quotient foundation.",
      evidence: "Substituted reaction quotient terms inversely in galvanic cell potential calculations.",
      confidence: 0.79,
      resolved: false,
    });

    return {
      status: "seeded_multi_subject",
      message: "Successfully seeded Mathematics, Physics, and Chemistry across Class 10, 11, and 12 with full prerequisite graphs!",
    };
  },
});
