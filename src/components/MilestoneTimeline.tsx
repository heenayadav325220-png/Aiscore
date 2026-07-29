import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PrototypeMilestone, MilestoneStatus, GuidanceStep } from "../types";
import {
  CheckCircle2,
  Clock,
  PlayCircle,
  Circle,
  Plus,
  GripVertical,
  Trash2,
  Sparkles,
  Calendar,
  Kanban,
  GitCommit,
  Check,
  ChevronRight,
  ArrowRight,
  Edit2,
  X,
} from "lucide-react";

interface MilestoneTimelineProps {
  steps: GuidanceStep[];
  completedStepNumbers?: number[];
  onStepToggle?: (stepNumber: number) => void;
  className?: string;
}

export function MilestoneSummaryStats({ milestones }: { milestones: PrototypeMilestone[] }) {
  const totalCount = milestones.length;
  const completedCount = milestones.filter((m) => m.status === "completed").length;
  const inProgressCount = milestones.filter((m) => m.status === "in_progress").length;
  const todoCount = milestones.filter((m) => m.status === "todo").length;

  const completedPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const inProgressPercent = totalCount > 0 ? Math.round((inProgressCount / totalCount) * 100) : 0;
  const todoPercent = totalCount > 0 ? Math.max(0, 100 - completedPercent - inProgressPercent) : 0;

  const totalHours = milestones.reduce((sum, m) => sum + m.estimatedHours, 0);
  const completedHours = milestones
    .filter((m) => m.status === "completed")
    .reduce((sum, m) => sum + m.estimatedHours, 0);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Banner Title & Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
              PROTOTYPE PROGRESSION ANALYTICS
              <span className="text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                LIVE METRICS
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              High-level breakdown of completed vs in-progress milestones
            </p>
          </div>
        </div>

        {/* Total Time Estimate Badge */}
        <div className="flex items-center gap-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-500 dark:text-slate-400">Time Expended:</span>
          <strong className="text-slate-900 dark:text-slate-100">
            {completedHours} / {totalHours} hrs
          </strong>
        </div>
      </div>

      {/* Grid of Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Completed Stat Card */}
        <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/25 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-300">
                {completedPercent}%
              </span>
              <span className="text-xs text-slate-500 font-mono">({completedCount}/{totalCount})</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Check className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        {/* In Progress Stat Card */}
        <div className="p-3.5 rounded-xl bg-cyan-500/5 border border-cyan-500/25 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
              <PlayCircle className="w-3.5 h-3.5 animate-pulse" />
              In Progress
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold font-mono text-cyan-600 dark:text-cyan-300">
                {inProgressPercent}%
              </span>
              <span className="text-xs text-slate-500 font-mono">({inProgressCount}/{totalCount})</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <PlayCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Remaining / To Do Stat Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Circle className="w-3.5 h-3.5" />
              Pending / To Do
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold font-mono text-slate-800 dark:text-slate-200">
                {todoPercent}%
              </span>
              <span className="text-xs text-slate-500 font-mono">({todoCount}/{totalCount})</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
            <Circle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Stacked Comparative Progression Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span>Ratio Distribution:</span>
            <span className="text-emerald-500 font-bold">{completedPercent}% Done</span>
            <span>•</span>
            <span className="text-cyan-400 font-bold">{inProgressPercent}% Active</span>
            <span>•</span>
            <span className="text-slate-400">{todoPercent}% Pending</span>
          </span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            Total Velocity: {completedCount + inProgressCount}/{totalCount} Active
          </span>
        </div>

        {/* Segmented Bar */}
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex p-0.5 border border-slate-200/60 dark:border-slate-800">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-l-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"
            initial={{ width: 0 }}
            animate={{ width: `${completedPercent}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            title={`Completed: ${completedPercent}%`}
          />
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 shadow-[0_0_8px_rgba(0,229,255,0.4)]"
            initial={{ width: 0 }}
            animate={{ width: `${inProgressPercent}%` }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            title={`In Progress: ${inProgressPercent}%`}
          />
          <motion.div
            className="h-full bg-slate-300 dark:bg-slate-700/60 rounded-r-full"
            initial={{ width: 0 }}
            animate={{ width: `${todoPercent}%` }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            title={`To Do: ${todoPercent}%`}
          />
        </div>
      </div>
    </div>
  );
}

export function MilestoneTimeline({
  steps,
  completedStepNumbers = [],
  onStepToggle,
  className = "",
}: MilestoneTimelineProps) {
  // Initialize milestones from guidance steps or user updates
  const [milestones, setMilestones] = useState<PrototypeMilestone[]>(() => {
    return steps.map((s, idx) => {
      const isDone = completedStepNumbers.includes(s.stepNumber);
      return {
        id: `ms-${s.stepNumber}-${idx}`,
        stepNumber: s.stepNumber,
        title: s.title,
        description: s.actionItem,
        estimatedHours: s.estimatedHours,
        status: isDone ? "completed" : idx === 0 ? "in_progress" : "todo",
        order: idx + 1,
        dueDate: `Phase ${s.stepNumber}`,
      };
    });
  });

  const [viewMode, setViewMode] = useState<"kanban" | "timeline">("kanban");
  const [draggedMilestoneId, setDraggedMilestoneId] = useState<string | null>(null);
  const [dragOverLane, setDragOverLane] = useState<MilestoneStatus | null>(null);

  // New Milestone inline form state
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newHours, setNewHours] = useState<number>(2);

  // Synchronize status updates
  const updateMilestoneStatus = (id: string, newStatus: MilestoneStatus) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          // If syncing back to step numbers
          if (onStepToggle) {
            if (newStatus === "completed" && !completedStepNumbers.includes(m.stepNumber)) {
              onStepToggle(m.stepNumber);
            } else if (newStatus !== "completed" && completedStepNumbers.includes(m.stepNumber)) {
              onStepToggle(m.stepNumber);
            }
          }
          return { ...m, status: newStatus };
        }
        return m;
      })
    );
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newMs: PrototypeMilestone = {
      id: `ms-custom-${Date.now()}`,
      stepNumber: milestones.length + 1,
      title: newTitle.trim(),
      description: newDesc.trim() || "Custom project milestone step",
      estimatedHours: newHours || 2,
      status: "todo",
      order: milestones.length + 1,
      dueDate: `Phase ${milestones.length + 1}`,
    };

    setMilestones([...milestones, newMs]);
    setNewTitle("");
    setNewDesc("");
    setNewHours(2);
    setIsAddingMilestone(false);
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDraggedMilestoneId(id);
  };

  const handleDragOver = (e: React.DragEvent, status: MilestoneStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverLane !== status) {
      setDragOverLane(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverLane(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: MilestoneStatus) => {
    e.preventDefault();
    setDragOverLane(null);
    const id = e.dataTransfer.getData("text/plain") || draggedMilestoneId;
    if (id) {
      updateMilestoneStatus(id, targetStatus);
    }
    setDraggedMilestoneId(null);
  };

  // Metrics
  const totalCount = milestones.length;
  const completedCount = milestones.filter((m) => m.status === "completed").length;
  const inProgressCount = milestones.filter((m) => m.status === "in_progress").length;
  const todoCount = milestones.filter((m) => m.status === "todo").length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const totalHours = milestones.reduce((sum, m) => sum + m.estimatedHours, 0);

  const statusLanes: { status: MilestoneStatus; title: string; color: string; badgeBg: string; icon: any }[] = [
    {
      status: "todo",
      title: "To Do",
      color: "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400",
      badgeBg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
      icon: Circle,
    },
    {
      status: "in_progress",
      title: "In Progress",
      color: "border-cyan-500/50 text-cyan-500",
      badgeBg: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30",
      icon: PlayCircle,
    },
    {
      status: "completed",
      title: "Completed",
      color: "border-emerald-500/50 text-emerald-500",
      badgeBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* SUMMARY STATS COMPONENT */}
      <MilestoneSummaryStats milestones={milestones} />

      {/* Header & Interactive Control Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00e5ff]" />
              <h3 className="text-sm sm:text-base font-bold font-display text-slate-900 dark:text-slate-100">
                Interactive Milestone Engine
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Drag-and-drop milestones to transition stages between In Progress & Completed.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto text-xs font-mono font-bold">
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "kanban"
                  ? "bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Kanban className="w-3.5 h-3.5 text-cyan-500" />
              <span>Drag & Drop Board</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("timeline")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "timeline"
                  ? "bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <GitCommit className="w-3.5 h-3.5 text-cyan-500" />
              <span>Timeline Path</span>
            </button>
          </div>
        </div>

        {/* Progress Metrics & Add Button */}
        <div className="pt-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-[240px]">
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
                {progressPercent}%
              </span>
              <span className="text-xs text-slate-400 font-mono">Completed</span>
            </div>
            <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden max-w-[180px]">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(0,229,255,0.4)]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                To Do: <strong className="text-slate-700 dark:text-slate-200">{todoCount}</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                In Progress: <strong>{inProgressCount}</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Completed: <strong>{completedCount}</strong>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingMilestone(!isAddingMilestone)}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            {isAddingMilestone ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isAddingMilestone ? "Cancel" : "Add Milestone"}</span>
          </button>
        </div>

        {/* Add Milestone Inline Form */}
        <AnimatePresence>
          {isAddingMilestone && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleAddMilestone}
              className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">
                    Milestone Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Set up OAuth authentication backend"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">
                    Est. Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newHours}
                    onChange={(e) => setNewHours(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">
                  Description / Deliverable Goal
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Key criteria for completion..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Save Milestone
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* VIEW 1: DRAG & DROP KANBAN BOARD */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statusLanes.map((lane) => {
            const laneMilestones = milestones.filter((m) => m.status === lane.status);
            const isTarget = dragOverLane === lane.status;
            const Icon = lane.icon;

            return (
              <div
                key={lane.status}
                onDragOver={(e) => handleDragOver(e, lane.status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, lane.status)}
                className={`bg-slate-50/80 dark:bg-slate-900/60 border rounded-2xl p-3.5 space-y-3 transition-all min-h-[320px] flex flex-col ${
                  isTarget
                    ? "border-cyan-400 bg-cyan-500/5 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                    : "border-slate-200/80 dark:border-slate-800"
                }`}
              >
                {/* Lane Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${lane.color}`} />
                    <h4 className="text-xs font-bold font-display tracking-wider uppercase text-slate-800 dark:text-slate-200">
                      {lane.title}
                    </h4>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${lane.badgeBg}`}>
                    {laneMilestones.length}
                  </span>
                </div>

                {/* Milestone Cards in Lane */}
                <div className="space-y-2.5 flex-1">
                  {laneMilestones.length === 0 ? (
                    <div className="h-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                      <p className="text-[11px] text-slate-400 font-mono">
                        Drag milestone here to set to <strong className="lowercase">{lane.title}</strong>
                      </p>
                    </div>
                  ) : (
                    laneMilestones.map((ms) => (
                      <motion.div
                        key={ms.id}
                        layout
                        draggable
                        onDragStart={(e: any) => handleDragStart(e, ms.id)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-xs cursor-grab active:cursor-grabbing transition-all space-y-2 relative group ${
                          ms.status === "completed"
                            ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10"
                            : ms.status === "in_progress"
                            ? "border-cyan-500/40 shadow-[0_0_10px_rgba(0,229,255,0.1)]"
                            : "border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <GripVertical className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 shrink-0" />
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                              PHASE 0{ms.stepNumber}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteMilestone(ms.id)}
                            className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                            title="Delete Milestone"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <h5
                            className={`text-xs font-bold leading-tight ${
                              ms.status === "completed"
                                ? "line-through text-slate-400 dark:text-slate-500"
                                : "text-slate-900 dark:text-slate-100"
                            }`}
                          >
                            {ms.title}
                          </h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-snug">
                            {ms.description}
                          </p>
                        </div>

                        {/* Card Footer & Quick Status Switcher Buttons */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {ms.estimatedHours}h
                          </span>

                          <div className="flex items-center gap-1">
                            {ms.status !== "todo" && (
                              <button
                                type="button"
                                onClick={() => updateMilestoneStatus(ms.id, "todo")}
                                className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                              >
                                To Do
                              </button>
                            )}
                            {ms.status !== "in_progress" && (
                              <button
                                type="button"
                                onClick={() => updateMilestoneStatus(ms.id, "in_progress")}
                                className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-colors cursor-pointer"
                              >
                                In Progress
                              </button>
                            )}
                            {ms.status !== "completed" && (
                              <button
                                type="button"
                                onClick={() => updateMilestoneStatus(ms.id, "completed")}
                                className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VIEW 2: CHRONOLOGICAL TIMELINE PATH */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-6">
          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {milestones.map((ms, idx) => {
              const isCompleted = ms.status === "completed";
              const isInProgress = ms.status === "in_progress";

              return (
                <div key={ms.id} className="relative group">
                  {/* Timeline Circle Node */}
                  <div
                    className={`absolute -left-[27px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? "bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                        : isInProgress
                        ? "bg-[#00e5ff] text-slate-950 shadow-[0_0_12px_rgba(0,229,255,0.6)] animate-pulse"
                        : "bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-400"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : isInProgress ? (
                      <PlayCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : (
                      <span className="text-[10px] font-mono font-bold">{idx + 1}</span>
                    )}
                  </div>

                  {/* Milestone Content Box */}
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      isInProgress
                        ? "bg-cyan-500/5 border-cyan-500/40 shadow-sm"
                        : isCompleted
                        ? "bg-emerald-500/5 border-emerald-500/30"
                        : "bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            PHASE 0{ms.stepNumber}
                          </span>
                          <span
                            className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                              isCompleted
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : isInProgress
                                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                            }`}
                          >
                            {ms.status.replace("_", " ")}
                          </span>
                        </div>
                        <h4
                          className={`text-sm font-bold font-display mt-0.5 ${
                            isCompleted
                              ? "line-through text-slate-400 dark:text-slate-500"
                              : "text-slate-900 dark:text-slate-100"
                          }`}
                        >
                          {ms.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                          {ms.estimatedHours} Hours
                        </span>
                        <div className="flex items-center gap-1">
                          {ms.status !== "todo" && (
                            <button
                              type="button"
                              onClick={() => updateMilestoneStatus(ms.id, "todo")}
                              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                            >
                              To Do
                            </button>
                          )}
                          {ms.status !== "in_progress" && (
                            <button
                              type="button"
                              onClick={() => updateMilestoneStatus(ms.id, "in_progress")}
                              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 cursor-pointer"
                            >
                              In Progress
                            </button>
                          )}
                          {ms.status !== "completed" && (
                            <button
                              type="button"
                              onClick={() => updateMilestoneStatus(ms.id, "completed")}
                              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-xs"
                            >
                              Mark Done
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                      {ms.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
export default MilestoneTimeline;
