"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  Camera,
  Clock,
  Copy,
  DollarSign,
  Film,
  FileText,
  Info,
  Loader2,
  RotateCcw,
  Save,
  ListChecks,
  Download,
  Mic,
  Users,
} from "lucide-react";
import { generateScript, type GenerationParams } from "@/lib/api";
import { EvervaultCard } from "@/components/ui/evervault-card";
import { Reveal } from "@/components/ui/reveal";

type CharacterRole = {
  name: string;
  role: string;
  notes: string;
};

type AIResult = {
  executiveSummary: string[];
  sceneOverview: string;
  keyActions: string[];
  charactersRoles: CharacterRole[];
  visualStyle: string[];
  soundDesign: string[];
  budgetConsiderations: string[];
  directorNotes: string[];
  assumptionsMade: string[];
  raw?: string;
};

type SectionKey = keyof Omit<AIResult, "raw">;

const SECTION_LABELS: Record<SectionKey, string> = {
  executiveSummary: "Executive Summary",
  sceneOverview: "Scene Overview",
  keyActions: "Key Actions",
  charactersRoles: "Characters & Roles",
  visualStyle: "Visual Style & Cinematography",
  soundDesign: "Sound & Mood Design",
  budgetConsiderations: "Budget Considerations",
  directorNotes: "Director / Production Notes",
  assumptionsMade: "Assumptions Made",
};

const SECTION_ORDER: SectionKey[] = [
  "sceneOverview",
  "keyActions",
  "charactersRoles",
  "visualStyle",
  "soundDesign",
  "budgetConsiderations",
  "directorNotes",
  "assumptionsMade",
];

const bulletRegex = /^[-*•]\s+/;
const numberedRegex = /^\d+[\).]\s+/;

const splitToBullets = (text: string) =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(bulletRegex, "").replace(numberedRegex, ""));

const normalizeList = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return splitToBullets(value);
  }
  return [];
};

const normalizeText = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const normalizeCharacters = (value: unknown): CharacterRole[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          return { name: item.trim(), role: "", notes: "" };
        }
        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          return {
            name: String(record.name ?? "").trim(),
            role: String(record.role ?? "").trim(),
            notes: String(record.notes ?? "").trim(),
          };
        }
        return null;
      })
      .filter(Boolean) as CharacterRole[];
  }

  if (typeof value === "string") {
    return splitToBullets(value).map((line) => {
      const parts = line.split(/\s[-–—:]\s|\s-\s|:\s/).filter(Boolean);
      return {
        name: parts[0] ?? line,
        role: parts[1] ?? "",
        notes: parts.slice(2).join(" ") ?? "",
      };
    });
  }

  return [];
};

const parseFromHeadings = (text: string): AIResult => {
  const headingMap: Record<string, SectionKey> = {
    "EXECUTIVE SUMMARY": "executiveSummary",
    "SCENE OVERVIEW": "sceneOverview",
    "KEY ACTIONS": "keyActions",
    "CHARACTERS & ROLES": "charactersRoles",
    "CHARACTERS AND ROLES": "charactersRoles",
    "CHARACTERS": "charactersRoles",
    "VISUAL STYLE & CINEMATOGRAPHY": "visualStyle",
    "VISUAL STYLE": "visualStyle",
    "SOUND & MOOD DESIGN": "soundDesign",
    "SOUND DESIGN": "soundDesign",
    "BUDGET CONSIDERATIONS": "budgetConsiderations",
    "DIRECTOR / PRODUCTION NOTES": "directorNotes",
    "DIRECTOR NOTES": "directorNotes",
    "ASSUMPTIONS MADE": "assumptionsMade",
    "ASSUMPTIONS": "assumptionsMade",
  };

  const buckets: Record<SectionKey, string[]> = {
    executiveSummary: [],
    sceneOverview: [],
    keyActions: [],
    charactersRoles: [],
    visualStyle: [],
    soundDesign: [],
    budgetConsiderations: [],
    directorNotes: [],
    assumptionsMade: [],
  };

  let currentKey: SectionKey = "sceneOverview";
  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const normalized = trimmed
      .replace(/\*+/g, "")
      .replace(/^\d+[\).]\s+/, "")
      .replace(/[:\-\s]+$/g, "")
      .toUpperCase();
    const mapped = headingMap[normalized];
    if (mapped) {
      currentKey = mapped;
      return;
    }
    buckets[currentKey].push(trimmed);
  });

  return {
    executiveSummary: normalizeList(buckets.executiveSummary.join("\n")),
    sceneOverview: buckets.sceneOverview.join("\n").trim(),
    keyActions: normalizeList(buckets.keyActions.join("\n")),
    charactersRoles: normalizeCharacters(buckets.charactersRoles.join("\n")),
    visualStyle: normalizeList(buckets.visualStyle.join("\n")),
    soundDesign: normalizeList(buckets.soundDesign.join("\n")),
    budgetConsiderations: normalizeList(buckets.budgetConsiderations.join("\n")),
    directorNotes: normalizeList(buckets.directorNotes.join("\n")),
    assumptionsMade: normalizeList(buckets.assumptionsMade.join("\n")),
    raw: text,
  };
};

const parseAIResult = (text: string): AIResult => {
  try {
    const trimmed = text.trim();
    const jsonCandidate = (() => {
      const start = trimmed.indexOf("{");
      const end = trimmed.lastIndexOf("}");
      if (start >= 0 && end > start) {
        return trimmed.slice(start, end + 1);
      }
      return trimmed;
    })();
    const parsed = JSON.parse(jsonCandidate) as Record<string, unknown>;
    return {
      executiveSummary: normalizeList(parsed.executive_summary),
      sceneOverview: normalizeText(parsed.scene_overview),
      keyActions: normalizeList(parsed.key_actions),
      charactersRoles: normalizeCharacters(parsed.characters_roles),
      visualStyle: normalizeList(parsed.visual_style),
      soundDesign: normalizeList(parsed.sound_design),
      budgetConsiderations: normalizeList(parsed.budget_considerations),
      directorNotes: normalizeList(parsed.director_notes),
      assumptionsMade: normalizeList(parsed.assumptions_made),
      raw: text,
    };
  } catch {
    return parseFromHeadings(text);
  }
};

const formatBullets = (items: string[]) =>
  items.map((item) => `- ${item}`).join("\n");

const formatResultForCopy = (result: AIResult) => {
  const sections: Array<{ label: string; content: string }> = [
    {
      label: SECTION_LABELS.executiveSummary,
      content: formatBullets(result.executiveSummary),
    },
    {
      label: SECTION_LABELS.sceneOverview,
      content: result.sceneOverview,
    },
    {
      label: SECTION_LABELS.keyActions,
      content: formatBullets(result.keyActions),
    },
    {
      label: SECTION_LABELS.charactersRoles,
      content: formatBullets(
        result.charactersRoles.map((character) =>
          [character.name, character.role, character.notes]
            .filter(Boolean)
            .join(" - ")
        )
      ),
    },
    {
      label: SECTION_LABELS.visualStyle,
      content: formatBullets(result.visualStyle),
    },
    {
      label: SECTION_LABELS.soundDesign,
      content: formatBullets(result.soundDesign),
    },
    {
      label: SECTION_LABELS.budgetConsiderations,
      content: formatBullets(result.budgetConsiderations),
    },
    {
      label: SECTION_LABELS.directorNotes,
      content: formatBullets(result.directorNotes),
    },
    {
      label: SECTION_LABELS.assumptionsMade,
      content: formatBullets(result.assumptionsMade),
    },
  ];

  return sections
    .map((section) => `${section.label}
${section.content}`.trim())
    .join("

");
};

export default function ProjectPageClient({ id }: { id: string }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState("");
  const [result, setResult] = useState<AIResult | null>(null);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [version, setVersion] = useState(0);
  const [lastPrompt, setLastPrompt] = useState("");
  const [lastParams, setLastParams] = useState<GenerationParams | null>(null);
  const [selectedSection, setSelectedSection] =
    useState<SectionKey>("executiveSummary");
  const [params, setParams] = useState<GenerationParams>({
    genre: "",
    budgetTier: "Medium",
    runtimeEstimate: "",
    locationCount: "",
    sceneComplexity: "Medium",
    generationType: "Scene Breakdown",
  });

  const navSections: Array<{ key: SectionKey; label: string }> = [
    { key: "executiveSummary", label: "Summary" },
    { key: "sceneOverview", label: "Overview" },
    { key: "keyActions", label: "Actions" },
    { key: "charactersRoles", label: "Characters" },
    { key: "visualStyle", label: "Visual" },
    { key: "soundDesign", label: "Sound" },
    { key: "budgetConsiderations", label: "Budget" },
    { key: "directorNotes", label: "Director" },
    { key: "assumptionsMade", label: "Assumptions" },
  ];
  const navColors = [
    "glass-amber",
    "glass-emerald",
    "glass-sky",
    "glass-rose",
    "glass-violet",
  ];
  const navGlowClasses = [
    "btn-amber",
    "btn-emerald",
    "btn-sky",
    "btn-rose",
    "btn-violet",
  ];
  const copySectionOptions: SectionKey[] = [
    "executiveSummary",
    ...SECTION_ORDER,
  ];
  const sectionRefs = useRef(new Map<SectionKey, HTMLDivElement>());
  const sectionsConfig: Array<{
    key: SectionKey;
    label: string;
    icon: ReactNode;
    hint: string;
  }> = [
    {
      key: "sceneOverview",
      label: SECTION_LABELS.sceneOverview,
      icon: <Film className="h-4 w-4" />,
      hint: "Purpose, narrative function, and scene intent.",
    },
    {
      key: "keyActions",
      label: SECTION_LABELS.keyActions,
      icon: <ListChecks className="h-4 w-4" />,
      hint: "Major beats and actions in bullet form.",
    },
    {
      key: "charactersRoles",
      label: SECTION_LABELS.charactersRoles,
      icon: <Users className="h-4 w-4" />,
      hint: "Who is on screen and why they matter.",
    },
    {
      key: "visualStyle",
      label: SECTION_LABELS.visualStyle,
      icon: <Camera className="h-4 w-4" />,
      hint: "Lighting, lensing, and composition notes.",
    },
    {
      key: "soundDesign",
      label: SECTION_LABELS.soundDesign,
      icon: <Mic className="h-4 w-4" />,
      hint: "Ambience, music cues, and silence beats.",
    },
    {
      key: "budgetConsiderations",
      label: SECTION_LABELS.budgetConsiderations,
      icon: <DollarSign className="h-4 w-4" />,
      hint: "Cost drivers and practical constraints.",
    },
    {
      key: "directorNotes",
      label: SECTION_LABELS.directorNotes,
      icon: <FileText className="h-4 w-4" />,
      hint: "Blocking, pacing, and continuity notes.",
    },
    {
      key: "assumptionsMade",
      label: SECTION_LABELS.assumptionsMade,
      icon: <Info className="h-4 w-4" />,
      hint: "Explicit assumptions used for generation.",
    },
  ];

  const formatTimestamp = (value: Date | null) =>
    value
      ? new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(value)
      : "—";

  const summarizePrompt = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return "—";
    if (trimmed.length <= 140) return trimmed;
    return `${trimmed.slice(0, 140)}...`;
  };

  const getSectionText = (key: SectionKey, data: AIResult) => {
    switch (key) {
      case "executiveSummary":
        return formatBullets(data.executiveSummary);
      case "sceneOverview":
        return data.sceneOverview;
      case "keyActions":
        return formatBullets(data.keyActions);
      case "charactersRoles":
        return formatBullets(
          data.charactersRoles.map((character) =>
            [character.name, character.role, character.notes]
              .filter(Boolean)
              .join(" - ")
          )
        );
      case "visualStyle":
        return formatBullets(data.visualStyle);
      case "soundDesign":
        return formatBullets(data.soundDesign);
      case "budgetConsiderations":
        return formatBullets(data.budgetConsiderations);
      case "directorNotes":
        return formatBullets(data.directorNotes);
      case "assumptionsMade":
        return formatBullets(data.assumptionsMade);
      default:
        return "";
    }
  };

  const downloadText = (filename: string, text: string) => {
    setDownloadError("");
    if (!text.trim()) {
      setDownloadError("Nothing to download yet.");
      return;
    }
    try {
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError("Download failed. Please try again.");
    }
  };

  const formattedOutput = useMemo(
    () => (result ? formatResultForCopy(result) : ""),
    [result]
  );
  const promptSummary = useMemo(
    () => summarizePrompt(lastPrompt || prompt),
    [lastPrompt, prompt]
  );
  const generationType = lastParams?.generationType || params.generationType;

  const renderBullets = (items: string[], emptyText: string) => {
    if (!items.length) {
      return <p className="text-sm text-white/50">{emptyText}</p>;
    }
    return (
      <ul className="space-y-2 text-sm text-white/75 list-disc list-inside">
        {items.map((item, index) => (
          <li key={`${item.slice(0, 12)}-${index}`}>{item}</li>
        ))}
      </ul>
    );
  };

  const renderParagraph = (text: string, emptyText: string) => {
    if (!text.trim()) {
      return <p className="text-sm text-white/50">{emptyText}</p>;
    }
    return (
      <p className="text-sm text-white/75 leading-relaxed whitespace-pre-line">
        {text.trim()}
      </p>
    );
  };

  const renderCharacters = (items: CharacterRole[]) => {
    if (!items.length) {
      return (
        <p className="text-sm text-white/50">
          No character details were provided.
        </p>
      );
    }
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((character, index) => (
          <div
            key={`${character.name}-${index}`}
            className="rounded-xl border border-white/10 bg-white/5 p-3"
          >
            <p className="text-sm text-white font-medium">
              {character.name || "Unnamed Character"}
            </p>
            {character.role && (
              <p className="text-xs text-white/60 mt-1">{character.role}</p>
            )}
            {character.notes && (
              <p className="text-xs text-white/50 mt-2">
                {character.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderSectionContent = (key: SectionKey, data: AIResult) => {
    switch (key) {
      case "sceneOverview":
        return renderParagraph(
          data.sceneOverview,
          "Scene overview was not provided."
        );
      case "keyActions":
        return renderBullets(
          data.keyActions,
          "Key actions were not provided."
        );
      case "charactersRoles":
        return renderCharacters(data.charactersRoles);
      case "visualStyle":
        return renderBullets(
          data.visualStyle,
          "Visual style notes were not provided."
        );
      case "soundDesign":
        return renderBullets(
          data.soundDesign,
          "Sound design notes were not provided."
        );
      case "budgetConsiderations":
        return renderBullets(
          data.budgetConsiderations,
          "Budget considerations were not provided."
        );
      case "directorNotes":
        return renderBullets(
          data.directorNotes,
          "Director notes were not provided."
        );
      case "assumptionsMade":
        return renderBullets(
          data.assumptionsMade,
          "No explicit assumptions were listed."
        );
      case "executiveSummary":
        return renderBullets(
          data.executiveSummary,
          "Executive summary will appear here."
        );
      default:
        return null;
    }
  };

  const handleCopy = async (text: string, scope?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (scope) {
        setCopiedSection(scope);
        setTimeout(() => setCopiedSection(null), 1500);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      if (scope) {
        setCopiedSection(null);
      } else {
        setCopied(false);
      }
    }
  };

  const selectedSectionText = useMemo(
    () => (result ? getSectionText(selectedSection, result) : ""),
    [result, selectedSection]
  );

  const scrollToSection = (key: SectionKey) => {
    const target = sectionRefs.current.get(key);
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top, behavior: "smooth" });
      return;
    }
    const fallback =
      document.getElementById(`section-${key}`) ??
      document.getElementById("sections-top");
    if (fallback) {
      const top = fallback.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const generate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);
    setDownloadError("");
    setCopiedSection(null);

    try {
      const data = await generateScript(prompt, params);
      const parsed = parseAIResult(data.output || "");
      setResult(parsed);
      setCopied(false);
      setGeneratedAt(new Date());
      setVersion((prev) => prev + 1);
      setLastPrompt(prompt.trim());
      setLastParams({ ...params });
      setSelectedSection("executiveSummary");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to reach the server. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen text-white px-6 md:px-10 py-10 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="glass-panel rounded-2xl p-5 h-fit lg:sticky lg:top-8">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs tracking-[0.2em] text-white/60">
                  WORKSPACE
                </span>
                <span className="glass-pill px-2.5 py-1 text-[10px] text-white/70 rounded-full">
                  LIVE
                </span>
              </div>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-6"
              >
                {"<- Back to dashboard"}
              </Link>

              <div className="mb-6">
                <p className="text-xs text-white/50 uppercase tracking-widest mb-2">
                  Project
                </p>
                <p className="text-lg font-light text-white">{id}</p>
              </div>

              {result && (
                <div className="mt-6">
                  <p className="text-xs text-white/50 uppercase tracking-widest mb-2">
                    Jump to
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {navSections.map((section, index) => (
                      <button
                        key={section.key}
                        onClick={() => {
                          scrollToSection(section.key);
                        }}
                        className={`glass-pill ${navColors[index % navColors.length]} ${navGlowClasses[index % navGlowClasses.length]} text-[11px] text-white/90 px-3 py-1.5 rounded-full transition-colors hover:text-white btn-animated`}
                      >
                        {section.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            <div>
              <header className="mb-8">
                <h1 className="text-3xl font-light text-white">
                  Project <span className="text-primary">{id}</span>
                </h1>
                <p className="text-white/60 mt-2">
                  Describe your scene, script, or idea and generate with AI.
                </p>
              </header>

              <div className="rounded-2xl p-6 mb-6 glass-panel">
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Creative prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. A noir detective walks into a rainy diner at 2am. The jukebox plays something slow. He orders coffee."
                  className="w-full min-h-[160px] rounded-xl glass-input px-4 py-3.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors resize-y disabled:opacity-60"
                  disabled={loading}
                />
                <div className="mt-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                    Production Parameters
                  </p>
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                        Generation Type
                      </label>
                      <select
                        value={params.generationType}
                        onChange={(e) =>
                          setParams((prev) => ({
                            ...prev,
                            generationType: e.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-lg glass-input px-3 py-2 text-sm text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors disabled:opacity-60"
                        disabled={loading}
                      >
                        <option value="Scene Breakdown">Scene Breakdown</option>
                        <option value="Sound Design">Sound Design</option>
                        <option value="Budget Plan">Budget Plan</option>
                        <option value="Visual Direction">Visual Direction</option>
                        <option value="Production Notes">Production Notes</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                        Genre
                      </label>
                      <input
                        value={params.genre}
                        onChange={(e) =>
                          setParams((prev) => ({
                            ...prev,
                            genre: e.target.value,
                          }))
                        }
                        placeholder="e.g. Neo-noir thriller"
                        className="mt-2 w-full rounded-lg glass-input px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors disabled:opacity-60"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                        Budget Tier
                      </label>
                      <select
                        value={params.budgetTier}
                        onChange={(e) =>
                          setParams((prev) => ({
                            ...prev,
                            budgetTier: e.target.value as GenerationParams["budgetTier"],
                          }))
                        }
                        className="mt-2 w-full rounded-lg glass-input px-3 py-2 text-sm text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors disabled:opacity-60"
                        disabled={loading}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                        Runtime Estimate
                      </label>
                      <input
                        value={params.runtimeEstimate}
                        onChange={(e) =>
                          setParams((prev) => ({
                            ...prev,
                            runtimeEstimate: e.target.value,
                          }))
                        }
                        placeholder="e.g. 3-5 minutes"
                        className="mt-2 w-full rounded-lg glass-input px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors disabled:opacity-60"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                        Location Count
                      </label>
                      <input
                        value={params.locationCount}
                        onChange={(e) =>
                          setParams((prev) => ({
                            ...prev,
                            locationCount: e.target.value,
                          }))
                        }
                        placeholder="e.g. 2 locations"
                        className="mt-2 w-full rounded-lg glass-input px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors disabled:opacity-60"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                        Scene Complexity
                      </label>
                      <select
                        value={params.sceneComplexity}
                        onChange={(e) =>
                          setParams((prev) => ({
                            ...prev,
                            sceneComplexity: e.target.value as GenerationParams["sceneComplexity"],
                          }))
                        }
                        className="mt-2 w-full rounded-lg glass-input px-3 py-2 text-sm text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors disabled:opacity-60"
                        disabled={loading}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button
                  onClick={generate}
                  disabled={loading || !prompt.trim()}
                  className="mt-4 bg-primary text-bg px-6 py-3.5 rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-glow btn-animated btn-amber btn-cta"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </span>
                  ) : (
                    "Generate with AI"
                  )}
                </button>
              </div>

              {result && (
                <div className="rounded-2xl p-6 mb-6 glass-panel">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                        Results Report
                      </p>
                      <h2 className="text-2xl font-light text-white mt-2">
                        Project <span className="text-primary">{id}</span>
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-white/60">
                      <span className="glass-pill px-2.5 py-1 rounded-full">
                        v{version || 1}
                      </span>
                      <span className="glass-pill px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(generatedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                        Prompt Summary
                      </p>
                      <p className="text-sm text-white/75 mt-2">
                        {promptSummary}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                        Generation Details
                      </p>
                      <div className="mt-2 space-y-1 text-sm text-white/70">
                        <p>
                          <span className="text-white/50">Type:</span>{" "}
                          {generationType || "Scene Breakdown"}
                        </p>
                        <p>
                          <span className="text-white/50">Genre:</span>{" "}
                          {lastParams?.genre || params.genre || "Unspecified"}
                        </p>
                        <p>
                          <span className="text-white/50">Budget tier:</span>{" "}
                          {lastParams?.budgetTier || params.budgetTier}
                        </p>
                        <p>
                          <span className="text-white/50">Runtime:</span>{" "}
                          {lastParams?.runtimeEstimate || params.runtimeEstimate || "Unspecified"}
                        </p>
                        <p>
                          <span className="text-white/50">Locations:</span>{" "}
                          {lastParams?.locationCount || params.locationCount || "Unspecified"}
                        </p>
                        <p>
                          <span className="text-white/50">Complexity:</span>{" "}
                          {lastParams?.sceneComplexity || params.sceneComplexity}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {loading && (
                <div className="rounded-2xl p-6 mb-6 glass-panel">
                  <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)] items-center">
                    <div className="w-full h-56">
                      <EvervaultCard text="AI" className="w-full h-full" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                        Generating
                      </p>
                      <h3 className="text-xl font-medium text-white mt-2">
                        Building your production pack
                      </h3>
                      <p className="text-sm text-white/60 mt-2">
                        We're structuring scenes, character beats, and budget
                        tiers. Hover the card to watch the cipher react.
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-sm text-white/70">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span>Drafting sections</span>
                      </div>
                      <div className="mt-3 loading-dots" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 backdrop-blur-sm text-red-400/90 text-sm">
                  {error}
                </div>
              )}
              {downloadError && (
                <div className="mb-6 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 backdrop-blur-sm text-amber-300/90 text-sm">
                  {downloadError}
                </div>
              )}

              {result && (
                <>
                  <div
                    className="rounded-2xl p-6 mb-6 glass-panel"
                    id="section-executiveSummary"
                    ref={(node) => {
                      if (node) {
                        sectionRefs.current.set("executiveSummary", node);
                      } else {
                        sectionRefs.current.delete("executiveSummary");
                      }
                    }}
                  >
                    <div id="sections-top" className="scroll-mt-24" />
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <h2 className="text-lg font-medium text-white/90 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        Executive Summary
                      </h2>
                      <button
                        onClick={() =>
                          handleCopy(
                            formatBullets(result.executiveSummary),
                            SECTION_LABELS.executiveSummary
                          )
                        }
                        className="text-xs text-white/60 hover:text-white px-3 py-1.5 rounded-lg glass-outline transition-colors btn-animated btn-sky"
                      >
                        {copiedSection === SECTION_LABELS.executiveSummary
                          ? "Copied"
                          : "Copy summary"}
                      </button>
                    </div>
                    {renderSectionContent("executiveSummary", result)}
                  </div>

                  <div className="rounded-2xl p-6 glass-panel">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                      <h2 className="text-lg font-medium text-white/90 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        Production Breakdown
                      </h2>
                      <span className="text-xs text-white/50 uppercase tracking-[0.3em]">
                        Structured Sections
                      </span>
                    </div>

                    <div className="grid gap-4">
                      {sectionsConfig.map((section) => (
                        <details
                          key={section.key}
                          id={`section-${section.key}`}
                          ref={(node) => {
                            if (node) {
                              sectionRefs.current.set(section.key, node);
                            } else {
                              sectionRefs.current.delete(section.key);
                            }
                          }}
                          className="glass-outline rounded-2xl p-5"
                          open={section.key === "sceneOverview"}
                        >
                          <summary className="flex flex-wrap items-center justify-between gap-3 cursor-pointer list-none">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-primary">
                                {section.icon}
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                                  {section.label}
                                </p>
                                <p className="text-xs text-white/60 mt-1">
                                  {section.hint}
                                </p>
                              </div>
                            </div>
                            <span className="text-[11px] text-white/40">
                              Click to expand
                            </span>
                          </summary>
                          <div className="mt-4 space-y-3">
                            {renderSectionContent(section.key, result)}
                          </div>
                        </details>
                      ))}
                    </div>

                    <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleCopy(formattedOutput)}
                            className="text-xs text-white/70 hover:text-white px-3 py-2 rounded-lg glass-outline transition-colors btn-animated btn-sky inline-flex items-center gap-2"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            {copied ? "Copied" : "Copy all"}
                          </button>
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedSection}
                              onChange={(e) =>
                                setSelectedSection(e.target.value as SectionKey)
                              }
                              className="rounded-lg glass-input px-2.5 py-2 text-xs text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                            >
                              {copySectionOptions.map((key) => (
                                <option key={key} value={key}>
                                  {SECTION_LABELS[key]}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() =>
                                handleCopy(
                                  selectedSectionText,
                                  SECTION_LABELS[selectedSection]
                                )
                              }
                              disabled={!selectedSectionText}
                              className="text-xs text-white/70 hover:text-white px-3 py-2 rounded-lg glass-outline transition-colors btn-animated btn-emerald disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              {copiedSection === SECTION_LABELS[selectedSection]
                                ? "Copied"
                                : "Copy section"}
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() =>
                              downloadText("preroll-report.txt", formattedOutput)
                            }
                            className="text-xs text-white/70 hover:text-white px-3 py-2 rounded-lg glass-outline transition-colors btn-animated btn-violet inline-flex items-center gap-2"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </button>
                          <button
                            disabled
                            className="text-xs text-white/50 px-3 py-2 rounded-lg glass-outline transition-colors btn-animated btn-amber disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                            title="Coming soon"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Regenerate section
                          </button>
                          <button
                            disabled
                            className="text-xs text-white/50 px-3 py-2 rounded-lg glass-outline transition-colors btn-animated btn-amber disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                            title="Coming soon"
                          >
                            <Save className="h-3.5 w-3.5" />
                            Save version
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            </div>
          </Reveal>
      </div>
    </main>
  );
}
