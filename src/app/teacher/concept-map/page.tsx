"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo, useCallback, useState } from "react";
import { CheckCircle2, AlertTriangle, GitBranch, Sparkles, ShieldCheck, Trash2, Layers, GraduationCap, BookOpen } from "lucide-react";

const SUBJECTS = ["All Subjects", "Mathematics", "Physics", "Chemistry"] as const;
const GRADES = ["All Grades", "Class 10", "Class 11", "Class 12"] as const;

export default function ConceptMapPage() {
  const [selectedSubject, setSelectedSubject] = useState<string>("Mathematics");
  const [selectedGrade, setSelectedGrade] = useState<string>("All Grades");

  const conceptMap = useQuery(api.concepts.getConceptMap, {
    subject: selectedSubject !== "All Subjects" ? selectedSubject : undefined,
    grade: selectedGrade !== "All Grades" ? selectedGrade : undefined,
  });

  const verifyEdge = useMutation(api.learning.verifyEdge);
  const deleteEdge = useMutation(api.learning.deleteEdge);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);

  const { nodes, edges } = useMemo(() => {
    if (!conceptMap) return { nodes: [], edges: [] };

    const nodes: Node[] = conceptMap.concepts.map((c, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const x = 100 + col * 270;
      const y = 40 + row * 160;

      return {
        id: c._id,
        position: { x, y },
        data: {
          label: (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E2E6F0] min-w-[210px] text-left hover:border-[#2F65F6] transition-colors">
              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#F4F6FB] text-[#7E8494] border border-[#E2E6F0] mb-1 inline-block">
                {c.grade} • {c.subject}
              </span>
              <div className="font-extrabold text-xs text-[#18181B] mb-1">{c.title}</div>
              <div className="text-[10px] text-[#8C93A4] font-medium">
                Difficulty: {"⭐".repeat(c.difficulty)}
              </div>
            </div>
          ),
        },
        type: "default",
        style: { background: "transparent", border: "none", padding: 0 },
      };
    });

    const edges: Edge[] = conceptMap.edges.map((e) => ({
      id: e._id,
      source: e.fromConceptId,
      target: e.toConceptId,
      animated: !e.teacherVerified,
      style: {
        stroke: e.teacherVerified ? "#2F65F6" : "#f59e0b",
        strokeWidth: 2.5,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: e.teacherVerified ? "#2F65F6" : "#f59e0b",
      },
      label: e.teacherVerified ? "✓ Verified" : "⚡ AI Proposed",
      labelStyle: {
        fill: e.teacherVerified ? "#2F65F6" : "#f59e0b",
        fontSize: 10,
        fontWeight: 800,
      },
      labelBgStyle: {
        fill: "#ffffff",
        stroke: e.teacherVerified ? "#D1E2FB" : "#fde68a",
      },
    }));

    return { nodes, edges };
  }, [conceptMap]);

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      setSelectedEdge(edge.id);
    },
    []
  );

  const handleVerify = async (edgeId: string) => {
    const convexEdge = conceptMap?.edges.find((e) => e._id === edgeId);
    if (!convexEdge) return;
    await verifyEdge({
      edgeId: convexEdge._id,
      teacherVerified: !convexEdge.teacherVerified,
    });
    setSelectedEdge(null);
  };

  const handleDelete = async (edgeId: string) => {
    const convexEdge = conceptMap?.edges.find((e) => e._id === edgeId);
    if (!convexEdge) return;
    await deleteEdge({ edgeId: convexEdge._id });
    setSelectedEdge(null);
  };

  if (!conceptMap) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full mx-auto mb-3 animate-spin border-2 border-[#2F65F6] border-t-transparent" />
          <p className="text-xs font-bold text-[#8C93A4]">Rendering curriculum dependency graph…</p>
        </div>
      </div>
    );
  }

  const selectedEdgeData = conceptMap.edges.find((e) => e._id === selectedEdge);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 text-[#1C1E23] font-sans antialiased">
      {/* ── 1. Header Bar ── */}
      <div className="bg-white rounded-[28px] p-6 sm:p-7 shadow-xs border border-[#E6EAF2]">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3FE] text-[#2F65F6] text-xs font-bold mb-2">
          <GitBranch className="w-3.5 h-3.5" />
          <span>Interactive Prerequisite Map</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight m-0">
          Editable Knowledge Graph & Curriculum Topology
        </h1>
        <p className="text-xs sm:text-sm text-[#7E8494] font-medium mt-1 mb-0">
          Teachers retain full pedagogical oversight: approve, prune, or edit AI-suggested prerequisite dependencies.
        </p>
      </div>

      {/* ── 2. Filters & Legend ── */}
      <div className="bg-white rounded-2xl p-4 border border-[#E6EAF2] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Subject Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#7E8494] mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Subject:
          </span>
          {SUBJECTS.map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`text-xs font-bold px-3 py-1 rounded-full transition-all cursor-pointer ${
                selectedSubject === subj
                  ? "bg-[#2F65F6] text-white shadow-sm shadow-[#2F65F6]/25"
                  : "bg-[#F4F6FB] text-[#555C6E] hover:text-[#181A20] border border-[#E2E6F0]"
              }`}
            >
              {subj}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-bold text-[#555C6E]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2F65F6]" />
            <span>Verified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span>AI Proposed</span>
          </div>
        </div>
      </div>

      {/* ── 3. React Flow Canvas ── */}
      <div
        className="bg-white rounded-[28px] overflow-hidden shadow-xs border border-[#E6EAF2] relative"
        style={{ height: "600px" }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onEdgeClick={onEdgeClick}
          fitView
          attributionPosition="bottom-left"
          style={{ background: "#F8FAFD" }}
        >
          <Background color="rgba(47, 101, 246, 0.08)" gap={28} />
          <Controls
            style={{
              background: "#ffffff",
              border: "1px solid #E2E6F0",
              borderRadius: 12,
              color: "#18181B",
            }}
          />
          <MiniMap
            style={{
              background: "#ffffff",
              border: "1px solid #E2E6F0",
              borderRadius: 12,
            }}
            maskColor="rgba(248, 250, 253, 0.7)"
          />
        </ReactFlow>
      </div>

      {/* ── 4. Selected Edge Verification Modal ── */}
      {selectedEdgeData && (
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-[#D1E2FB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-[#2F65F6]" />
              <h4 className="font-extrabold text-sm text-[#18181B] m-0">
                Prerequisite Dependency Link
              </h4>
            </div>
            <p className="text-xs text-[#555C6E] font-medium m-0">
              <strong className="text-[#2F65F6]">
                {conceptMap.concepts.find((c) => c._id === selectedEdgeData.fromConceptId)?.title}
              </strong>
              {" ➔ "}
              <strong className="text-[#18181B]">
                {conceptMap.concepts.find((c) => c._id === selectedEdgeData.toConceptId)?.title}
              </strong>
              {" • "}
              Confidence: {Math.round(selectedEdgeData.confidence * 100)}%
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVerify(selectedEdge!)}
              className="bg-[#2F65F6] hover:bg-[#2554D4] text-white text-xs font-bold py-2 px-4 rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{selectedEdgeData.teacherVerified ? "Revoke Verification" : "Approve Dependency"}</span>
            </button>
            <button
              onClick={() => handleDelete(selectedEdge!)}
              className="bg-[#F4F6FB] hover:bg-rose-50 hover:text-rose-600 text-[#555C6E] text-xs font-bold py-2 px-3 rounded-full border border-[#E2E6F0] flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
