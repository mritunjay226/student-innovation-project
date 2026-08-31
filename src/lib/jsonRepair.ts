/**
 * Robust JSON Parser & LaTeX-Safe Repair Utility
 * Handles complex STEM documents, unescaped LaTeX backslashes,
 * unclosed quotes, and truncated responses without crashing.
 */

export interface ExtractedCardRaw {
  front?: string;
  back?: string;
  keyTakeaway?: string;
  commonPitfall?: string;
  cardType?: string;
  options?: string[];
  correctOption?: string;
  difficulty?: "easy" | "medium" | "hard";
  tags?: string[];
  classmateHint?: string;
}

/**
 * Robustly cleans, escapes, and parses JSON from LLM output.
 */
export function robustJsonParse<T = any>(rawText: string): T | null {
  if (!rawText || rawText.trim().length === 0) return null;

  let text = rawText.trim();

  // 1. Strip Markdown Code Fences (e.g. ```json ... ``` or ``` ... ```)
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  // 2. Extract outermost JSON structure
  const firstBrace = text.indexOf("{");
  const firstBracket = text.indexOf("[");

  let startIndex = -1;
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIndex = firstBrace;
  } else if (firstBracket !== -1) {
    startIndex = firstBracket;
  }

  if (startIndex !== -1) {
    text = text.substring(startIndex);
  }

  // 3. First attempt: Direct standard JSON.parse
  try {
    return JSON.parse(text);
  } catch {
    // Proceed to LaTeX and string sanitization
  }

  // 4. Transform unescaped LaTeX backslashes and raw unescaped newlines in JSON strings
  const sanitized = sanitizeJsonStringLiterals(text);
  try {
    return JSON.parse(sanitized);
  } catch {
    // Proceed to truncation repair
  }

  // 5. Repair truncated JSON (close unclosed quotes, arrays, objects)
  const repaired = repairTruncatedJsonString(sanitized);
  try {
    return JSON.parse(repaired);
  } catch {
    // Proceed to robust structural reconstruction
  }

  // 6. Structural State-Machine Reconstruction
  try {
    const reconstructed = reconstructJsonStructure(text);
    if (reconstructed) return reconstructed as T;
  } catch {
    // Proceed to regex card extractor fallback
  }

  return null;
}

/**
 * Normalizes all string literals in a JSON text:
 * - Converts raw unescaped newlines to \n
 * - Converts LaTeX and invalid single backslashes (e.g. \rightarrow, \beta, \frac, \unit) to double backslashes \\
 * - Preserves legitimate JSON escapes (\", \\, \/)
 */
function sanitizeJsonStringLiterals(jsonStr: string): string {
  let output = "";
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i];

    if (inString) {
      if (isEscaped) {
        // We are looking at the character right after a backslash
        // Only legitimate JSON escapes are: ", \, /
        // And standard single-letter escapes: b, f, n, r, t (if genuinely intended as whitespace, but in STEM LaTeX like \frac, \text, \beta, \nu, \right, we should double-escape)
        const nextTwo = jsonStr.substring(i, i + 3);
        const isHexUnicode = char === "u" && /^[0-9a-fA-F]{4}$/.test(jsonStr.substring(i + 1, i + 5));

        if (char === '"' || char === "\\" || char === "/") {
          output += char;
        } else if (isHexUnicode) {
          output += char;
        } else if (char === "n" && (jsonStr[i + 1] === '"' || jsonStr[i + 1] === " " || jsonStr[i + 1] === "\n")) {
          // Standard \n newline at end of sentence or word
          output += char;
        } else {
          // It's a LaTeX command like \rightarrow, \frac, \text, \beta, \nu, \tau, \unit, \Delta, etc.
          // Prepend an extra backslash so it becomes \\rightarrow
          output += "\\" + char;
        }
        isEscaped = false;
        continue;
      }

      if (char === "\\") {
        output += "\\";
        isEscaped = true;
        continue;
      }

      if (char === '"') {
        inString = false;
        output += '"';
        continue;
      }

      // Handle raw unescaped newlines inside strings
      if (char === "\n") {
        output += "\\n";
        continue;
      }
      if (char === "\r") {
        continue;
      }
      if (char === "\t") {
        output += "  ";
        continue;
      }

      output += char;
    } else {
      if (char === '"') {
        inString = true;
      }
      output += char;
    }
  }

  return output;
}

/**
 * Closes unclosed quotes, brackets, and braces if the LLM output was truncated mid-stream.
 */
function repairTruncatedJsonString(text: string): string {
  let str = text.trim();

  // Find the last complete closing brace of a card object if possible
  const lastCardBrace = str.lastIndexOf("}");
  if (lastCardBrace > str.length * 0.6) {
    const trailingSlice = str.substring(lastCardBrace + 1);
    if (!trailingSlice.includes("]")) {
      str = str.substring(0, lastCardBrace + 1) + "]}";
      return str;
    }
  }

  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '"' && !isEscaped) {
      inString = !inString;
    } else if (!inString) {
      if (char === "{") openBraces++;
      else if (char === "}") openBraces = Math.max(0, openBraces - 1);
      else if (char === "[") openBrackets++;
      else if (char === "]") openBrackets = Math.max(0, openBrackets - 1);
    }
    isEscaped = char === "\\" && !isEscaped;
  }

  if (inString) {
    str += '"';
  }

  while (openBrackets > 0) {
    str += "]";
    openBrackets--;
  }

  while (openBraces > 0) {
    str += "}";
    openBraces--;
  }

  return str;
}

/**
 * Reconstructs a clean JSON object using state-machine card extraction.
 */
function reconstructJsonStructure(text: string): any | null {
  const cards = extractCardsFromRawText(text);
  if (cards.length === 0) return null;

  // Extract deckTitle and subject with regex if present
  const titleMatch = text.match(/"deckTitle"\s*:\s*"([^"]+)"/);
  const subjectMatch = text.match(/"subject"\s*:\s*"([^"]+)"/);
  const descMatch = text.match(/"description"\s*:\s*"([^"]+)"/);

  return {
    deckTitle: titleMatch ? titleMatch[1] : undefined,
    subject: subjectMatch ? subjectMatch[1] : undefined,
    description: descMatch ? descMatch[1] : undefined,
    cards,
  };
}

/**
 * Fallback regex card extractor that pulls any valid card blocks from raw text.
 */
export function extractCardsFromRawText(rawText: string): ExtractedCardRaw[] {
  const cards: ExtractedCardRaw[] = [];
  if (!rawText) return cards;

  // 1. Match complete JSON card blocks
  const cardBlockRegex = /\{\s*"front"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"back"\s*:\s*"((?:[^"\\]|\\.)*)"([\s\S]*?)\}/g;
  let match;

  while ((match = cardBlockRegex.exec(rawText)) !== null) {
    try {
      const sanitizedBlock = sanitizeJsonStringLiterals(match[0]);
      const parsed = JSON.parse(sanitizedBlock);
      if (parsed.front && parsed.back) {
        cards.push(parsed);
        continue;
      }
    } catch {
      // Direct field extraction
    }

    const front = cleanRawString(match[1]);
    const back = cleanRawString(match[2]);
    const rest = match[3] || "";

    const takeawayMatch = rest.match(/"keyTakeaway"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    const pitfallMatch = rest.match(/"commonPitfall"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    const hintMatch = rest.match(/"classmateHint"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    const diffMatch = rest.match(/"difficulty"\s*:\s*"([^"]+)"/);
    const typeMatch = rest.match(/"cardType"\s*:\s*"([^"]+)"/);

    // Extract options array if present
    const optionsMatch = rest.match(/"options"\s*:\s*\[([\s\S]*?)\]/);
    let options: string[] | undefined;
    if (optionsMatch) {
      options = optionsMatch[1]
        .split(",")
        .map((s) => s.replace(/"/g, "").trim())
        .filter(Boolean);
    }

    const correctMatch = rest.match(/"correctOption"\s*:\s*"((?:[^"\\]|\\.)*)"/);

    if (front && back) {
      cards.push({
        front,
        back,
        keyTakeaway: takeawayMatch ? cleanRawString(takeawayMatch[1]) : "High-yield concept rule.",
        commonPitfall: pitfallMatch ? cleanRawString(pitfallMatch[1]) : undefined,
        classmateHint: hintMatch ? cleanRawString(hintMatch[1]) : "Toby says: Review this card carefully!",
        difficulty: (diffMatch ? diffMatch[1] : "medium") as any,
        cardType: typeMatch ? typeMatch[1] : options ? "mcq" : "explanatory",
        options: options && options.length > 0 ? options : undefined,
        correctOption: correctMatch ? cleanRawString(correctMatch[1]) : undefined,
        tags: ["STEM Curriculum"],
      });
    }
  }

  return cards;
}

function cleanRawString(str: string): string {
  if (!str) return "";
  return str
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, " ")
    .replace(/\\\\/g, "\\");
}
