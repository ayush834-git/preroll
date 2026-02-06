"use client";

export default function AppDashboard() {
  return (
    <main className="min-h-screen bg-black text-white px-10 py-10">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-3xl font-light">
          Welcome to <span className="text-[#E6A23C]">Preroll</span>
        </h1>
        <p className="text-white/60 mt-2">
          Your pre-production workspace.
        </p>
      </header>

      {/* Main Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Projects */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-6 backdrop-blur">
          <h2 className="text-lg mb-2">Projects</h2>
          <p className="text-sm text-white/60 mb-4">
            Scripts, films, or ideas you’re developing.
          </p>
          <button className="text-sm text-[#E6A23C] hover:underline">
            + Create new project
          </button>
        </div>

        {/* Scripts */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-6 backdrop-blur">
          <h2 className="text-lg mb-2">Scripts</h2>
          <p className="text-sm text-white/60 mb-4">
            Drafts, revisions, and screenplay versions.
          </p>
          <button className="text-sm text-[#E6A23C] hover:underline">
            View scripts
          </button>
        </div>

        {/* Storyboards */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-6 backdrop-blur">
          <h2 className="text-lg mb-2">Storyboards</h2>
          <p className="text-sm text-white/60 mb-4">
            Visual planning before production begins.
          </p>
          <button className="text-sm text-[#E6A23C] hover:underline">
            Open storyboard board
          </button>
        </div>
      </section>

      {/* Activity Section */}
      <section className="mt-12">
        <h2 className="text-xl mb-4">Recent Activity</h2>
        <div className="rounded-xl bg-white/5 border border-white/10 p-6 text-sm text-white/60">
          No recent activity yet. Start by creating a project.
        </div>
      </section>
    </main>
  );
}
