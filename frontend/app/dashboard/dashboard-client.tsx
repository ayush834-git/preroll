"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useMemo, useState } from "react";
import { Clock, Film, PlusCircle } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

type DashboardProject = {
  id: string;
  title: string;
  updatedAt: string | Date;
};

type DashboardClientProps = {
  userEmail: string;
  projects: DashboardProject[];
};

export default function DashboardClient({
  userEmail,
  projects,
}: DashboardClientProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const hasProjects = projects.length > 0;

  const sortedProjects = useMemo(() => {
    return [...projects].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [projects]);

  const createProject = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Enter a project title.");
      return;
    }

    setCreating(true);
    setError("");

    try {
      // Server creates the project with authenticated userId ownership.
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: trimmedTitle,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        project?: { id: string };
      };

      if (!response.ok || !data.project?.id) {
        setError(data.error || "Unable to create project.");
        return;
      }

      router.push(`/projects/${data.project.id}`);
      router.refresh();
    } catch {
      setError("Unable to create project.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="relative min-h-screen text-white px-6 md:px-10 py-10 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            {"<- Back"}
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <span className="glass-pill px-3 py-1 text-xs text-white/70 rounded-full">
              {userEmail}
            </span>
            <button
              type="button"
              onClick={() => void signOut({ callbackUrl: "/auth" })}
              className="glass-outline text-white/80 hover:text-white px-4 py-2 rounded-lg transition-colors btn-animated btn-sky btn-ghost"
            >
              Logout
            </button>
          </div>
        </div>

        <Reveal>
          <header className="mb-10">
            <p className="text-xs tracking-[0.3em] text-primary mb-3">
              DASHBOARD
            </p>
            <h1 className="text-3xl md:text-4xl font-light text-white">
              Your Projects
            </h1>
            <p className="text-white/60 mt-3 max-w-2xl">
              Continue where you left off or start a new pre-production project.
            </p>
          </header>
        </Reveal>

        <Reveal>
          <section className="glass-panel rounded-2xl p-6 md:p-8 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-xl text-white/90">Create a project</h2>
              <span className="text-xs text-white/50 uppercase tracking-[0.2em]">
                New
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Midnight Signal"
                className="w-full rounded-xl glass-input px-4 py-3 text-sm text-white placeholder:text-white/40"
              />
              <button
                type="button"
                onClick={() => void createProject()}
                disabled={creating}
                className="glass-interactive text-white px-5 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-glow btn-animated btn-amber btn-cta inline-flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                {creating ? "Creating..." : "Start Project"}
              </button>
            </div>

            {error && (
              <p className="mt-3 text-xs text-red-300/80">{error}</p>
            )}
          </section>
        </Reveal>

        <Reveal>
          <section className="glass-panel rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl text-white/90">Recent projects</h2>
              <span className="glass-pill px-3 py-1 rounded-full text-xs text-white/60">
                {projects.length} total
              </span>
            </div>

            {!hasProjects ? (
              <div className="glass-outline rounded-2xl p-6 text-white/70">
                <p className="text-sm">Start your first project.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="glass-outline rounded-xl p-4 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm text-white/90 flex items-center gap-2">
                        <Film className="h-4 w-4 text-primary" />
                        {project.title}
                      </p>
                      <p className="text-xs text-white/50 mt-1 inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Updated{" "}
                        {new Intl.DateTimeFormat("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(project.updatedAt))}
                      </p>
                    </div>
                    <Link
                      href={`/projects/${project.id}`}
                      className="glass-interactive text-white px-4 py-2 rounded-lg transition-all shadow-glow btn-animated btn-amber btn-cta"
                    >
                      Continue
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        </Reveal>
      </div>
    </main>
  );
}
