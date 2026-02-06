import AnimatedShaderBackground from "@/components/ui/animated-shader-background";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <AnimatedShaderBackground />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center text-center px-6">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          Preroll
        </h1>

        <p className="mt-4 text-lg text-white/70 max-w-xl">
          Cinema, before the cinema.
        </p>

        <button className="mt-8 rounded-full bg-white/10 px-8 py-3 text-sm font-medium backdrop-blur hover:bg-white/20 transition">
          Enter Cinema
        </button>
      </div>
    </main>
  );
}
