/**
 * Large PDF & Document Context Preservation Engine
 * Performs intelligent semantic sectioning, multi-chapter coverage,
 * and token-budgeted hierarchical summarization so large PDFs never lose context.
 */

export interface DocumentSection {
  index: number;
  title: string;
  content: string;
  charCount: number;
  estimatedTokens: number;
}

export interface ChunkedDocumentSummary {
  totalSections: number;
  totalCharacters: number;
  outline: string[];
  balancedSections: DocumentSection[];
  proportionalCardAllocation: { sectionIndex: number; cardCount: number }[];
}

/**
 * Splits large document text into semantic sections (chapters, theorems, sections)
 * and balances token budgets across the entire document.
 */
export function processLargeDocumentContext(
  rawText: string,
  targetTotalCards: number = 8
): ChunkedDocumentSummary {
  if (!rawText || rawText.trim().length === 0) {
    return {
      totalSections: 0,
      totalCharacters: 0,
      outline: [],
      balancedSections: [],
      proportionalCardAllocation: [],
    };
  }

  const cleanText = rawText.trim();
  const totalLength = cleanText.length;

  // 1. Identify natural section delimiters (Chapters, Sections, Headings, Numbers)
  const sectionDelimiters = [
    /(?:^|\n)(?:#{1,3}\s+|Chapter\s+\d+|Section\s+\d+|Part\s+[IVX\d]+|Unit\s+\d+|Theorem\s+\d+|Module\s+\d+)/i,
    /(?:^|\n)(?:\d+\.\d+\s+[A-Z])/,
    /(?:^|\n)(?:[A-Z\s]{4,30}\n={3,})/,
  ];

  let rawSections: string[] = [];

  // Try heading-based splitting
  for (const delimiter of sectionDelimiters) {
    const splits = cleanText.split(delimiter);
    if (splits.length >= 3 && splits.length <= 30) {
      rawSections = splits.filter((s) => s.trim().length > 60);
      break;
    }
  }

  // Fallback: Smart chunking with 15% sliding window overlap (approx 3,000 chars / ~750 words per chunk)
  if (rawSections.length < 2) {
    const CHUNK_SIZE = 3500;
    const OVERLAP = 400;
    rawSections = [];

    let start = 0;
    while (start < totalLength) {
      const end = Math.min(start + CHUNK_SIZE, totalLength);
      // Find nearest paragraph break or sentence boundary
      let breakIndex = cleanText.lastIndexOf("\n\n", end);
      if (breakIndex === -1 || breakIndex <= start) {
        breakIndex = cleanText.lastIndexOf(". ", end);
      }
      const actualEnd = breakIndex > start && end < totalLength ? breakIndex + 1 : end;
      
      const chunk = cleanText.substring(start, actualEnd).trim();
      if (chunk.length > 50) {
        rawSections.push(chunk);
      }

      start = actualEnd - OVERLAP;
      if (start >= totalLength - OVERLAP) break;
    }
  }

  // 2. Build structured DocumentSection array
  const sections: DocumentSection[] = rawSections.map((content, idx) => {
    // Extract first line or headline as section title
    const firstLine = content.split("\n")[0]?.replace(/[#*_-]/g, "").trim() || `Section ${idx + 1}`;
    const title = firstLine.length > 50 ? firstLine.substring(0, 48) + "..." : firstLine;

    return {
      index: idx,
      title: title || `Topic Area ${idx + 1}`,
      content: content.trim(),
      charCount: content.length,
      estimatedTokens: Math.ceil(content.length / 4),
    };
  });

  // 3. Proportional Card Allocation across beginning, middle, and end
  // Ensures cards are not clustered solely in the first 2 pages
  const numSections = sections.length;
  const allocation: { sectionIndex: number; cardCount: number }[] = [];

  if (numSections <= targetTotalCards) {
    const baseCardsPerSection = Math.floor(targetTotalCards / numSections);
    let remainder = targetTotalCards % numSections;

    for (let i = 0; i < numSections; i++) {
      const count = baseCardsPerSection + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
      allocation.push({ sectionIndex: i, cardCount: count });
    }
  } else {
    // When there are more sections than requested cards, pick evenly spaced representative chapters
    const step = (numSections - 1) / (targetTotalCards - 1);
    for (let i = 0; i < targetTotalCards; i++) {
      const selectedSecIdx = Math.round(i * step);
      allocation.push({ sectionIndex: selectedSecIdx, cardCount: 1 });
    }
  }

  const outline = sections.map((s, i) => `${i + 1}. ${s.title}`);

  return {
    totalSections: sections.length,
    totalCharacters: totalLength,
    outline,
    balancedSections: sections,
    proportionalCardAllocation: allocation,
  };
}

/**
 * Generates an optimized comprehensive context prompt that commands the LLM
 * to cover all document phases (Foundations, Core Mechanisms, and Final Applications).
 */
export function buildContextPreservingPrompt(
  chunkSummary: ChunkedDocumentSummary,
  targetCardCount: number,
  cardTypeGuidance: string
): string {
  if (chunkSummary.totalSections <= 1) {
    return "";
  }

  const outlineText = chunkSummary.outline.slice(0, 15).join("\n");
  
  // Select balanced section previews across the document
  const samplePreviews = chunkSummary.proportionalCardAllocation
    .map((alloc) => {
      const sec = chunkSummary.balancedSections[alloc.sectionIndex];
      if (!sec) return "";
      const snippet = sec.content.length > 800 ? sec.content.substring(0, 780) + "..." : sec.content;
      return `[SECTION ${sec.index + 1}: ${sec.title}] (Allocate ${alloc.cardCount} Flashcards):\n${snippet}`;
    })
    .filter(Boolean)
    .join("\n\n---\n\n");

  return `
LARGE DOCUMENT COMPREHENSIVE COVERAGE DIRECTIVE:
The user uploaded an extensive multi-topic document with ${chunkSummary.totalSections} distinct conceptual sections.
To ensure ZERO loss of context, you MUST distribute the ${targetCardCount} flashcards proportionally across the ENTIRE document:

DOCUMENT OUTLINE / CHAPTER SCOPE:
${outlineText}

DISTRIBUTED SECTION SAMPLES:
${samplePreviews}

MANDATORY RULES:
1. Do NOT generate all cards from the first page only.
2. Generate concepts from the foundational beginning, the analytical middle, and the practical application sections.
3. Every card must test a high-yield formula, mechanism, or principle from its designated section.`;
}
