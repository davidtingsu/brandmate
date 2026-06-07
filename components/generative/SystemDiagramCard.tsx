"use client";

import type {
  DiagramFlow,
  DiagramPhase,
  DiagramPhaseColor,
  DiagramStep,
  SystemDiagram,
} from "@/lib/types";

const PHASE_STYLES: Record<
  DiagramPhaseColor,
  { bg: string; border: string; badge: string; text: string }
> = {
  purple: {
    bg: "bg-violet-50",
    border: "border-violet-200",
    badge: "bg-violet-600",
    text: "text-violet-900",
  },
  green: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-600",
    text: "text-emerald-900",
  },
  brown: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-700",
    text: "text-amber-950",
  },
  blue: {
    bg: "bg-sky-50",
    border: "border-sky-200",
    badge: "bg-sky-600",
    text: "text-sky-900",
  },
  yellow: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    badge: "bg-yellow-600",
    text: "text-yellow-950",
  },
  slate: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    badge: "bg-slate-600",
    text: "text-slate-900",
  },
};

const NODE_ICONS: Record<string, string> = {
  browser: "🌐",
  client: "💻",
  server: "🖥️",
  dns: "🔍",
  database: "🗄️",
  cache: "⚡",
};

function StepBlock({ step }: { step: DiagramStep }) {
  return (
    <div className="rounded-lg border border-white/60 bg-white/70 p-3 shadow-sm">
      <div className="flex items-start gap-2">
        {step.number != null && (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
            {step.number}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{step.title}</p>
          {step.description && (
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              {step.description}
            </p>
          )}
          {step.items && step.items.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-slate-700">
              {step.items.map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <span className="text-slate-400">•</span>
                  {item}
                </li>
              ))}
            </ul>
          )}
          {step.highlight && (
            <p className="mt-2 rounded-md bg-slate-900 px-2 py-1 font-mono text-xs text-white">
              {step.highlight}
            </p>
          )}
          {step.code && (
            <pre className="mt-2 overflow-x-auto rounded-md bg-yellow-100 p-2 font-mono text-[11px] leading-relaxed text-slate-800">
              {step.code}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

function PhasePanel({ phase }: { phase: DiagramPhase }) {
  const style = PHASE_STYLES[phase.color] ?? PHASE_STYLES.slate;

  return (
    <section
      className={`rounded-xl border-2 p-4 ${style.bg} ${style.border}`}
    >
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white ${style.badge}`}
        >
          Phase
        </span>
        <h4 className={`text-sm font-bold ${style.text}`}>{phase.label}</h4>
      </div>

      {phase.nodes && phase.nodes.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {phase.nodes.map((node) => (
            <span
              key={node.id}
              className="inline-flex items-center gap-1 rounded-lg bg-white/80 px-2 py-1 text-xs font-medium text-slate-700 shadow-sm"
            >
              {node.icon ? NODE_ICONS[node.icon] ?? "📦" : "📦"} {node.label}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {phase.steps.map((step, i) => (
          <StepBlock key={`${phase.id}-${i}`} step={step} />
        ))}
      </div>
    </section>
  );
}

function FlowArrows({ flows }: { flows: DiagramFlow[] }) {
  if (!flows.length) return null;

  return (
    <div className="my-3 space-y-2 rounded-lg border border-dashed border-slate-300 bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Flow
      </p>
      {flows.map((flow, i) => (
        <div
          key={`${flow.from}-${flow.to}-${i}`}
          className="flex flex-wrap items-center gap-2 text-xs text-slate-700"
        >
          <span className="rounded bg-slate-100 px-2 py-0.5 font-medium">
            {flow.from}
          </span>
          <span
            className={
              flow.style === "dashed"
                ? "border-b border-dashed border-slate-400 px-2"
                : "text-slate-500"
            }
          >
            {flow.label ? `— ${flow.label} →` : "→"}
          </span>
          <span className="rounded bg-slate-100 px-2 py-0.5 font-medium">
            {flow.to}
          </span>
        </div>
      ))}
    </div>
  );
}

interface SystemDiagramCardProps {
  diagram: SystemDiagram;
  agentLabel?: string;
}

export function SystemDiagramCard({
  diagram,
  agentLabel = "diagram_explainer",
}: SystemDiagramCardProps) {
  return (
    <div className="my-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              System diagram · {agentLabel}
            </p>
            <h3 className="mt-0.5 text-base font-bold text-slate-900">
              {diagram.title}
            </h3>
            {diagram.subtitle && (
              <p className="mt-1 text-xs text-slate-600">{diagram.subtitle}</p>
            )}
          </div>
        </div>
        {diagram.summary && (
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            {diagram.summary}
          </p>
        )}
      </div>

      <div className="space-y-3 p-4">
        {diagram.flows && diagram.flows.length > 0 && (
          <FlowArrows flows={diagram.flows} />
        )}
        {diagram.phases.map((phase) => (
          <PhasePanel key={phase.id} phase={phase} />
        ))}
      </div>
    </div>
  );
}
