"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GlowCard } from "@/components/ui/spotlight-card";
import { Reveal } from "@/components/ui/reveal";

const genres = [
  "Drama",
  "Thriller",
  "Sci-Fi",
  "Comedy",
  "Horror",
  "Romance",
  "Documentary",
];

const roles = [
  "Director",
  "Producer",
  "Writer",
  "Cinematographer",
  "Editor",
  "Production Design",
  "Sound",
  "VFX",
  "Assistant",
];

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("Drama");
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("Director");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const slug = useMemo(() => {
    const cleaned = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    return cleaned || "new";
  }, [name]);

  const canAddMember = useMemo(() => {
    return (
      memberName.trim().length > 1 &&
      memberEmail.trim().includes("@") &&
      memberRole.length > 0
    );
  }, [memberName, memberEmail, memberRole]);

  const addMember = () => {
    if (!canAddMember) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setTeamMembers((prev) => [
      ...prev,
      {
        id,
        name: memberName.trim(),
        email: memberEmail.trim(),
        role: memberRole,
      },
    ]);
    setMemberName("");
    setMemberEmail("");
    setMemberRole("Director");
  };

  const removeMember = (id: string) => {
    setTeamMembers((prev) => prev.filter((member) => member.id !== id));
  };

  const proceedToGenerate = () => {
    if (!name.trim()) return;
    router.push(`/projects/${slug}`);
  };

  return (
    <main className="relative min-h-screen text-white px-6 md:px-10 py-10 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 mb-8 transition-colors"
        >
          {"<- Back"}
        </Link>

        <Reveal>
          <header className="mb-10">
          <p className="text-xs tracking-[0.3em] text-primary mb-3">
            PROJECT SETUP
          </p>
          <h1 className="text-3xl md:text-4xl font-light text-white">
            Define the project and your team
          </h1>
          <p className="text-white/60 mt-3 max-w-2xl">
            Keep it simple: name the project, choose the genre, then assign
            roles to your crew.
          </p>
          </header>
        </Reveal>

          <Reveal>
            <section className="glass-panel rounded-2xl p-6 md:p-8 mb-10">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm text-white/80 mb-2">
                  Project name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Midnight Signal"
                  className="w-full rounded-xl glass-input px-4 py-3 text-sm text-white placeholder:text-white/40"
                />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-2">
                  Genre
                </label>
                <div className="flex flex-wrap gap-2">
                  {genres.map((item) => (
                    <button
                      key={item}
                      onClick={() => setGenre(item)}
                      className={`glass-pill px-3 py-1.5 text-xs rounded-full transition-colors btn-animated ${
                        genre === item
                          ? "glass-amber text-white btn-amber"
                          : "text-white/70 btn-sky"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            </section>
          </Reveal>

          <Reveal>
            <section className="glass-panel rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-white/50 uppercase tracking-[0.3em]">
                  TEAM SETUP
                </p>
                <h2 className="text-xl md:text-2xl font-medium mt-2">
                  Assign roles to multiple people
                </h2>
              </div>
              <span className="glass-pill px-3 py-1 rounded-full text-xs text-white/60">
                {teamMembers.length} added
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.2fr_1.2fr_0.9fr_auto] items-end">
              <div>
                <label className="block text-sm text-white/80 mb-2">
                  Full name
                </label>
                <input
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full rounded-xl glass-input px-4 py-3 text-sm text-white placeholder:text-white/40"
                />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-2">
                  Email
                </label>
                <input
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="alex@studio.com"
                  className="w-full rounded-xl glass-input px-4 py-3 text-sm text-white placeholder:text-white/40"
                />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-2">Role</label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="w-full rounded-xl glass-input px-4 py-3 text-sm text-white"
                >
                  {roles.map((role) => (
                    <option key={role} value={role} className="text-black">
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            <button
              onClick={addMember}
              disabled={!canAddMember}
              className="glass-interactive text-white px-5 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-glow btn-animated btn-amber btn-cta"
            >
              Add
            </button>
            </div>

            <div className="mt-8 space-y-3">
              {teamMembers.length === 0 ? (
                <div className="glass-outline rounded-2xl p-5 text-sm text-white/60">
                  Add team members and assign roles to keep everyone aligned.
                </div>
              ) : (
              teamMembers.map((member, index) => (
                <GlowCard
                  key={member.id}
                  customSize
                  glowColor={index % 2 === 0 ? "purple" : "blue"}
                  className="w-full p-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="text-sm text-white/80">{member.name}</p>
                      <p className="text-xs text-white/50">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="glass-pill px-3 py-1 text-xs text-white/70 rounded-full">
                        {member.role}
                      </span>
                      <button
                        onClick={() => removeMember(member.id)}
                        className="text-xs text-white/70 hover:text-white transition-colors rounded-lg px-2.5 py-1 glass-outline btn-animated btn-rose"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </GlowCard>
              ))
            )}
          </div>

            <div className="mt-8 flex flex-wrap items-center justify-end gap-4">
            <button
              onClick={proceedToGenerate}
              disabled={!name.trim()}
              className="glass-interactive text-white px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-glow btn-animated btn-amber btn-cta"
            >
              Continue to Generate
            </button>
            </div>
            </section>
          </Reveal>
      </div>
    </main>
  );
}
