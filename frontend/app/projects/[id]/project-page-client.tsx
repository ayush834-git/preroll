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
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { EvervaultCard } from "@/components/ui/evervault-card";
import { Reveal } from "@/components/ui/reveal";

type CharacterRole = {
  name: string;
  role: string;
  notes: string;
};

type LegacyAIResult = {
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

type SectionBlock = {
  id: string;
  title: string;
  bullets: string[];
};

type AIResult = LegacyAIResult & {
  generationType?: string;
  sections?: SectionBlock[];
};

type LegacySectionKey = keyof Omit<LegacyAIResult, "raw">;
type SectionKey = string;

const SECTION_LABELS: Record<LegacySectionKey, string> = {
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

const SECTION_ORDER: LegacySectionKey[] = [
  "sceneOverview",
  "keyActions",
  "charactersRoles",
  "visualStyle",
  "soundDesign",
  "budgetConsiderations",
  "directorNotes",
  "assumptionsMade",
];

const bulletRegex = /^[-*\u2022]\s+/;
const numberedRegex = /^\d+[\).]\s+/;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const buildSectionId = (title: string, index: number) =>
  `${slugify(title) || "section"}-${index}`;

const stripMarkdown = (text: string) =>
  text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\s{2,}/g, " ")
    .trim();

const cleanLine = (line: string) =>
  stripMarkdown(line)
    .replace(bulletRegex, "")
    .replace(numberedRegex, "")
    .trim();

const splitToBullets = (text: string) =>
  text
    .split(/\r?\n/)
    .map(cleanLine)
    .filter(Boolean);

const normalizeList = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => stripMarkdown(String(item)))
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return splitToBullets(value);
  }
  return [];
};

const normalizeText = (value: unknown) =>
  typeof value === "string" ? stripMarkdown(value) : "";

const normalizeCharacters = (value: unknown): CharacterRole[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          return { name: stripMarkdown(item), role: "", notes: "" };
        }
        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          return {
            name: stripMarkdown(String(record.name ?? "")),
            role: stripMarkdown(String(record.role ?? "")),
            notes: stripMarkdown(String(record.notes ?? "")),
          };
        }
        return null;
      })
      .filter(Boolean) as CharacterRole[];
  }

  if (typeof value === "string") {
    return splitToBullets(value).map((line) => {
      const parts = line.split(/\s[-:]\s|:\s/).filter(Boolean);
      return {
        name: parts[0] ?? line,
        role: parts[1] ?? "",
        notes: parts.slice(2).join(" ") ?? "",
      };
    });
  }

  return [];
};

const parseFromHeadings = (text: string): LegacyAIResult => {
  const headingMap: Record<string, LegacySectionKey> = {
    "EXECUTIVE SUMMARY": "executiveSummary",
    "SCENE OVERVIEW": "sceneOverview",
    "KEY ACTIONS": "keyActions",
    "SCREENPLAY": "sceneOverview",
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

  const buckets: Record<LegacySectionKey, string[]> = {
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

  let currentKey: LegacySectionKey = "sceneOverview";
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
    sceneOverview: normalizeText(buckets.sceneOverview.join("\n")),
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

const parseSectionsFromJson = (
  parsed: Record<string, unknown>
): { sections: SectionBlock[]; generationType?: string } | null => {
  const rawSections = parsed.sections;
  if (!Array.isArray(rawSections)) return null;
  const sections = rawSections
    .map((section, index) => {
      if (!section || typeof section !== "object") return null;
      const record = section as Record<string, unknown>;
      const rawTitle =
        record.title || record.heading || record.name || record.section;
      if (!rawTitle) return null;
      const title = stripMarkdown(String(rawTitle)).trim();
      if (!title) return null;
      const bullets = normalizeList(
        record.bullets ??
          record.items ??
          record.points ??
          record.content ??
          record.lines ??
          []
      );
      return {
        id: buildSectionId(title, index),
        title,
        bullets: bullets.length ? bullets : ["Not specified"],
      };
    })
    .filter(Boolean) as SectionBlock[];

  if (!sections.length) return null;

  const generationType = String(
    parsed.generation_type ?? parsed.generationType ?? ""
  ).trim();

  return { sections, generationType: generationType || undefined };
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
    const structured = parseSectionsFromJson(parsed);
    if (structured) {
      return {
        executiveSummary: [],
        sceneOverview: "",
        keyActions: [],
        charactersRoles: [],
        visualStyle: [],
        soundDesign: [],
        budgetConsiderations: [],
        directorNotes: [],
        assumptionsMade: [],
        raw: text,
        ...structured,
      };
    }
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
    const legacy = parseFromHeadings(text);
    return { ...legacy };
  }
};

const formatBullets = (items: string[]) =>
  items.map((item) => `- ${item}`).join("\n");

const formatResultForCopy = (result: AIResult) => {
  if (result.sections?.length) {
    return result.sections
      .map((section) =>
        `${section.title}\n${formatBullets(section.bullets)}`.trim()
      )
      .join("\n\n");
  }

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
    .map((section) => `${section.label}\n${section.content}`.trim())
    .join("\n\n");
};

const iconForTitle = (title: string): ReactNode => {
  const normalized = title.toLowerCase();
  if (normalized.includes("sound")) return <Mic className="h-4 w-4" />;
  if (normalized.includes("budget") || normalized.includes("cost")) {
    return <DollarSign className="h-4 w-4" />;
  }
  if (
    normalized.includes("cast") ||
    normalized.includes("character") ||
    normalized.includes("performance")
  ) {
    return <Users className="h-4 w-4" />;
  }
  if (
    normalized.includes("visual") ||
    normalized.includes("camera") ||
    normalized.includes("lighting")
  ) {
    return <Camera className="h-4 w-4" />;
  }
  if (
    normalized.includes("director") ||
    normalized.includes("production") ||
    normalized.includes("continuity") ||
    normalized.includes("logistics")
  ) {
    return <FileText className="h-4 w-4" />;
  }
  if (normalized.includes("scene") || normalized.includes("location")) {
    return <Film className="h-4 w-4" />;
  }
  return <ListChecks className="h-4 w-4" />;
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

  const navSections: Array<{ key: SectionKey; label: string }> = useMemo(() => {
    if (result?.sections?.length) {
      return result.sections.map((section) => ({
        key: section.id,
        label: section.title,
      }));
    }
    return [
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
  }, [result]);
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
  const copySectionOptions: SectionKey[] = useMemo(() => {
    if (result?.sections?.length) {
      return result.sections.map((section) => section.id);
    }
    return ["executiveSummary", ...SECTION_ORDER];
  }, [result]);
  const optionStyle = {
    backgroundColor: "#131316",
    color: "#F5F5F7",
  } as const;
  const sectionRefs = useRef(new Map<SectionKey, HTMLElement>());
  const legacySectionsConfig: Array<{
    key: LegacySectionKey;
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

  const activeSectionsConfig: Array<{
    key: SectionKey;
    label: string;
    icon: ReactNode;
    hint: string;
  }> = useMemo(() => {
    if (result?.sections?.length) {
      return result.sections.map((section) => ({
        key: section.id,
        label: section.title,
        icon: iconForTitle(section.title),
        hint: "",
      }));
    }
    return legacySectionsConfig;
  }, [legacySectionsConfig, result]);

  const sectionLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    if (result?.sections?.length) {
      result.sections.forEach((section) => {
        map.set(section.id, section.title);
      });
      return map;
    }
    map.set("executiveSummary", SECTION_LABELS.executiveSummary);
    legacySectionsConfig.forEach((section) => {
      map.set(section.key, section.label);
    });
    return map;
  }, [legacySectionsConfig, result]);

  const formatTimestamp = (value: Date | null) =>
    value
      ? new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(value)
      : "-";

  const summarizePrompt = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return "-";
    if (trimmed.length <= 140) return trimmed;
    return `${trimmed.slice(0, 140)}...`;
  };

  const getSectionText = (key: LegacySectionKey, data: LegacyAIResult) => {
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

  const downloadPdf = async (filename: string, text: string) => {
    setDownloadError("");
    if (!text.trim()) {
      setDownloadError("Nothing to download yet.");
      return;
    }
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 11;
      const lineHeight = fontSize * 1.45;
      const margin = 48;
      const pageSize: [number, number] = [612, 792];
      let page = pdfDoc.addPage(pageSize);
      let y = pageSize[1] - margin;

      const wrapLine = (line: string) => {
        if (!line.trim()) return [""];
        const words = line.split(/\s+/).filter(Boolean);
        const wrapped: string[] = [];
        let current = "";
        words.forEach((word) => {
          const candidate = current ? `${current} ${word}` : word;
          const width = font.widthOfTextAtSize(candidate, fontSize);
          if (width > pageSize[0] - margin * 2 && current) {
            wrapped.push(current);
            current = word;
          } else {
            current = candidate;
          }
        });
        if (current) wrapped.push(current);
        return wrapped;
      };

      const lines = text.split(/\r?\n/);
      lines.forEach((line) => {
        const wrapped = wrapLine(line);
        wrapped.forEach((chunk) => {
          if (y < margin) {
            page = pdfDoc.addPage(pageSize);
            y = pageSize[1] - margin;
          }
          page.drawText(chunk, {
            x: margin,
            y,
            size: fontSize,
            font,
            color: rgb(0.05, 0.05, 0.08),
          });
          y -= lineHeight;
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
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
  const hasStructuredSections = Boolean(result?.sections?.length);
  const defaultOpenSection = hasStructuredSections
    ? result?.sections?.[0]?.id
    : "sceneOverview";
  const generationType =
    result?.generationType || lastParams?.generationType || params.generationType;

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

  type SceneBlock = {
    heading: string;
    meta: Array<{ label: string; value: string }>;
    body: string[];
  };

  const parseSceneOverview = (text: string) => {
    const lines = text
      .split(/\r?\n/)
      .map(cleanLine)
      .filter(Boolean);

    const kvPairs: Array<{ label: string; value: string }> = [];
    const blocks: SceneBlock[] = [];
    let current: SceneBlock | null = null;

    const isSceneHeading = /^(INT\.|EXT\.|INT\/EXT\.|EXT\/INT\.)/i;
    const isMetaLine =
      /^(LOCATION|BG|TIME|SFX|FX|CAMERA|SHOT|WEATHER|VFX)\s*:/i;
    const isKeyValue = /^([A-Za-z][A-Za-z /&-]{1,24}):\s*(.+)$/;

    lines.forEach((line) => {
      if (isSceneHeading.test(line)) {
        if (current) blocks.push(current);
        current = { heading: line, meta: [], body: [] };
        return;
      }

      const kvMatch = line.match(isKeyValue);
      if (!current && kvMatch) {
        kvPairs.push({ label: kvMatch[1], value: kvMatch[2] });
        return;
      }

      if (!current) {
        current = { heading: "Scene Notes", meta: [], body: [] };
      }

      if (isMetaLine.test(line)) {
        const [label, ...rest] = line.split(":");
        current.meta.push({
          label: label.trim().toUpperCase(),
          value: rest.join(":").trim(),
        });
        return;
      }

      current.body.push(line);
    });

    if (current) blocks.push(current);

    const paragraphs =
      blocks.length === 0 && kvPairs.length === 0
        ? text
            .split(/\n\s*\n/)
            .map((paragraph) => stripMarkdown(paragraph))
            .map((paragraph) => paragraph.trim())
            .filter(Boolean)
        : [];

    return { kvPairs, blocks, paragraphs };
  };

  const renderSceneOverview = (text: string) => {
    if (!text.trim()) {
      return (
        <p className="text-sm text-white/50">
          Scene overview was not provided.
        </p>
      );
    }

    const { kvPairs, blocks, paragraphs } = parseSceneOverview(text);

    return (
      <div className="space-y-4">
        {kvPairs.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2">
            {kvPairs.map((pair) => (
              <div
                key={`${pair.label}-${pair.value}`}
                className="rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                  {pair.label}
                </p>
                <p className="text-sm text-white/80 mt-1">{pair.value}</p>
              </div>
            ))}
          </div>
        )}

        {blocks.length > 0 &&
          blocks.map((block, index) => {
            const headingMatch = block.heading.match(
              /^(INT\.|EXT\.|INT\/EXT\.|EXT\/INT\.)\s*(.*)$/i
            );
            const prefix = headingMatch?.[1] ?? "";
            const rest = headingMatch?.[2] ?? block.heading;
            return (
              <div
                key={`${block.heading}-${index}`}
                className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {prefix && (
                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/60 border border-white/20 rounded-full px-2 py-1">
                      {prefix.replace(".", "")}
                    </span>
                  )}
                  <p className="text-sm text-white/85 uppercase tracking-[0.2em]">
                    {rest}
                  </p>
                </div>

                {block.meta.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {block.meta.map((meta, metaIndex) => (
                      <span
                        key={`${meta.label}-${metaIndex}`}
                        className="glass-pill px-2.5 py-1 text-[11px] text-white/70 rounded-full"
                      >
                        {meta.label}: {meta.value || "-"}
                      </span>
                    ))}
                  </div>
                )}

                <div className="space-y-2 text-sm text-white/75 leading-relaxed">
                  {block.body.map((line, lineIndex) => (
                    <p key={`${block.heading}-${lineIndex}`}>{line}</p>
                  ))}
                </div>
              </div>
            );
          })}

        {paragraphs.length > 0 && (
          <div className="space-y-3">
            {paragraphs.map((paragraph, index) => (
              <p
                key={`${paragraph.slice(0, 16)}-${index}`}
                className="text-sm text-white/75 leading-relaxed whitespace-pre-line"
              >
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderLegacySectionContent = (
    key: LegacySectionKey,
    data: LegacyAIResult
  ) => {
    switch (key) {
      case "sceneOverview":
        return renderSceneOverview(data.sceneOverview);
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

  const selectedSectionText = useMemo(() => {
    if (!result) return "";
    if (result.sections?.length) {
      const section = result.sections.find(
        (item) => item.id === selectedSection
      );
      return section ? formatBullets(section.bullets) : "";
    }
    return getSectionText(selectedSection as LegacySectionKey, result);
  }, [result, selectedSection]);

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
      setSelectedSection(parsed.sections?.[0]?.id ?? "executiveSummary");
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
                        <option value="Scene Breakdown" style={optionStyle}>
                          Scene Breakdown
                        </option>
                        <option value="Sound Design" style={optionStyle}>
                          Sound Design
                        </option>
                        <option value="Budget Plan" style={optionStyle}>
                          Budget Plan
                        </option>
                        <option value="Visual Direction" style={optionStyle}>
                          Visual Direction
                        </option>
                        <option value="Production Notes" style={optionStyle}>
                          Production Notes
                        </option>
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
                        <option value="Low" style={optionStyle}>
                          Low
                        </option>
                        <option value="Medium" style={optionStyle}>
                          Medium
                        </option>
                        <option value="High" style={optionStyle}>
                          High
                        </option>
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
                        <option value="Low" style={optionStyle}>
                          Low
                        </option>
                        <option value="Medium" style={optionStyle}>
                          Medium
                        </option>
                        <option value="High" style={optionStyle}>
                          High
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
                <button
                  onClick={generate}
                  disabled={loading || !prompt.trim()}
                  className="mt-4 glass-interactive text-white px-6 py-3.5 rounded-xl disabled:opacity-50 disabled:pointer-events-none transition-all shadow-glow btn-animated btn-amber btn-cta"
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
                        We&apos;re structuring scenes, character beats, and budget
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
                  {!hasStructuredSections && (
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
                      {renderLegacySectionContent("executiveSummary", result)}
                    </div>
                  )}

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
                      {activeSectionsConfig.map((section) => (
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
                          open={section.key === defaultOpenSection}
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
                                {section.hint && (
                                  <p className="text-xs text-white/60 mt-1">
                                    {section.hint}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="text-[11px] text-white/40">
                              Click to expand
                            </span>
                          </summary>
                          <div className="mt-4 space-y-3">
                            {hasStructuredSections
                              ? renderBullets(
                                  result.sections?.find(
                                    (item) => item.id === section.key
                                  )?.bullets ?? [],
                                  "No details were provided."
                                )
                              : renderLegacySectionContent(
                                  section.key as LegacySectionKey,
                                  result
                                )}
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
                                <option key={key} value={key} style={optionStyle}>
                                  {sectionLabelMap.get(key) || key}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() =>
                                handleCopy(
                                  selectedSectionText,
                                  sectionLabelMap.get(selectedSection) ||
                                    selectedSection
                                )
                              }
                              disabled={!selectedSectionText}
                              className="text-xs text-white/70 hover:text-white px-3 py-2 rounded-lg glass-outline transition-colors btn-animated btn-emerald disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              {copiedSection ===
                              (sectionLabelMap.get(selectedSection) ||
                                selectedSection)
                                ? "Copied"
                                : "Copy section"}
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() =>
                              void downloadPdf(
                                "preroll-report.pdf",
                                formattedOutput
                              )
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
