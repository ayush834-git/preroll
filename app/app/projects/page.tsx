"use client";

import { useState } from "react";

type Project = {
  id: number;
  title: string;
  description: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const addProject = () => {
    if (!title.trim()) return;

    setProjects([
      ...projects,
      {
        id: Date.now(),
        title,
        description,
      },
    ]);

    setTitle("");
    setDescription("");
  };

  return (
    <main className="min-h-screen bg-black text-white px-10 py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-light">
          Projects
        </h1>
        <p className="text-white/60 mt-2">
          Films, scripts, or ideas in development.
        </p>
      </header>

      {/* Create Project */}
      <div className="mb-10 rounded-xl bg-white/5 border border-white/10 p-6 max-w-xl">
        <h2 className="mb-4 text-lg">Create New Project</h2>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Project title"
          className="w-full mb-3 rounded-md bg-black/40 border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#E6A23C]"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description (optional)"
          className="w-full mb-4 rounded-md bg-black/40 border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#E6A23C]"
        />

        <button
          onClick={addProject}
          className="bg-[#E6A23C] text-black px-6 py-3 rounded-md font-medium hover:bg-[#f0b44d]"
        >
          Create Project
        </button>
      </div>

      {/* Project List */}
      <section>
        <h2 className="mb-4 text-xl">Your Projects</h2>

        {projects.length === 0 ? (
          <p className="text-white/50">
            No projects yet. Create your first one.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="rounded-xl bg-white/5 border border-white/10 p-6"
              >
                <h3 className="text-lg mb-2">{project.title}</h3>
                <p className="text-sm text-white/60">
                  {project.description || "No description"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
