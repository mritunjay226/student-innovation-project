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
import { CheckCircle, AlertTriangle, GitBranch, Sparkles, ShieldCheck, Trash2, Layers, GraduationCap } from "lucide-react";

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

    const getMasteryClass = (difficulty: number) => {
      if (difficulty <= 2) return "mastery-high";
      if (difficulty <= 3) return "mastery-mid";
      return "mastery-low";
    };

    const nodes: Node[] = conceptMap.concepts.map((c, idx) => {
      // Dynamic grid/column layout
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const x = 120 + col * 260;
      const y = 50 + row * 160;

      return {
        id: c._id,
        position: { x, y },
        data: {
          label: (
            <div className={`concept-node ${getMasteryClass(c.difficulty)}`}>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 mb-1 inline-block">
                {c.grade} • {c.subject}
              </span>
              <div className="font-extrabold text-xs text-slate-900 mb-1">{c.title}</div>
              <div className="text-[10px] text-slate-500 font-semibold">
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
        stroke: e.teacherVerified ? "#7c3aed" : "#f59e0b",
        strokeWidth: 2.5,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: e.teacherVerified ? "#7c3aed" : "#f59e0b",
      },
      label: e.teacherVerified ? "✓ Verified" : "⚡ AI Proposed",
      labelStyle: {
        fill: e.teacherVerified ? "#7c3aed" : "#f59e0b",
        fontSize: 10,
        fontWeight: 800,
      },
      labelBgStyle: {
        fill: "#ffffff",
        stroke: e.teacherVerified ? "#e9d5ff" : "#fde68a",
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

  const getSubjectEmoji = (subject?: string) => {
    if (subject === "Mathematics") return "📐";
    if (subject === "Physics") return "⚡";
    if (subject === "Chemistry") return "🧪";
    return "📚";
  };

  if (!conceptMap) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 rounded-2xl mx-auto mb-3 animate-spin border-3 border-purple-600 border-t-transparent" />
          <p className="text-sm text-slate-500 font-bold">Rendering curriculum dependency graph...</p>
        </div>
      </div>
    );
  }

  const selectedEdgeData = conceptMap.edges.find((e) => e._id === selectedEdge);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 animate-fade-in-up">
        <div className="announcement-badge mb-2 text-xs">
          <span>✨ Multi-Subject Interactive Knowledge Graph</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
          Editable Prerequisite Map
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Teachers retain full oversight: approve, reject, or edit AI-suggested concept dependencies across subjects
        </p>
      </div>

      {/* Subject & Standard Filters */}
      <div className="glass-card p-4 rounded-3xl mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in-up delay-1">
        {/* Subject Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Subject:
          </span>
          {SUBJECTS.map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedSubject === subj
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-200"
                  : "bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700"
              }`}
            >
              {getSubjectEmoji(subj)} {subj}
            </button>
          ))}
        </div>

        {/* Standard Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5" /> Standard:
          </span>
          {GRADES.map((grd) => (
            <button
              key={grd}
              onClick={() => setSelectedGrade(grd)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedGrade === grd
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {grd}
            </button>
          ))}
        </div>
      </div>

      {/* Legend Badges */}
      <div className="flex flex-wrap gap-4 mb-4 animate-fade-in-up delay-1">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <span className="w-3 h-3 rounded-full bg-purple-600 shadow-sm" />
          <span>Teacher Verified Dependency</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
          <span>AI Proposed (Click edge to approve / remove)</span>
        </div>
      </div>

      {/* React Flow Container */}
      <div
        className="glass-card rounded-3xl animate-fade-in-up delay-2 overflow-hidden shadow-lg relative bg-white"
        style={{ height: "620px" }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onEdgeClick={onEdgeClick}
          fitView
          attributionPosition="bottom-left"
          style={{ background: "#f8f9fe" }}
        >
          <Background color="rgba(112, 71, 235, 0.08)" gap={28} />
          <Controls
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              color: "#0f172a",
            }}
          />
          <MiniMap
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
            }}
            maskColor="rgba(248, 249, 254, 0.7)"
          />
        </ReactFlow>
      </div>

      {/* Interactive Selected Edge Approval Modal */}
      {selectedEdgeData && (
        <div
          className="glass-card p-5 rounded-3xl mt-4 animate-fade-in-up flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-purple-50/70 border-purple-200"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <h4 className="font-extrabold text-sm text-slate-900">
                Prerequisite Dependency Link
              </h4>
            </div>
            <p className="text-xs text-slate-600 font-semibold">
              <strong className="text-purple-700">
                {conceptMap.concepts.find((c) => c._id === selectedEdgeData.fromConceptId)?.title}
              </strong>
              {" ➔ "}
              <strong className="text-slate-900">
                {conceptMap.concepts.find((c) => c._id === selectedEdgeData.toConceptId)?.title}
              </strong>
              {" • "}
              Confidence: {Math.round(selectedEdgeData.confidence * 100)}%
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVerify(selectedEdge!)}
              className="btn-pill-primary text-xs py-2 px-4"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {selectedEdgeData.teacherVerified ? "Revoke Verification" : "Approve Prerequisite Edge"}
            </button>
            <button
              onClick={() => handleDelete(selectedEdge!)}
              className="btn-pill-secondary text-xs py-2 px-3 hover:border-rose-300 hover:text-rose-600"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
