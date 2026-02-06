import Link from "next/link";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";

export default function Home() {
  return (
    <div className="relative w-screen h-screen overflow-hidden text-white">
      <AnimatedShaderBackground />

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center">
        <h1 className="text-5xl font-bold mb-4">Preroll</h1>
        <p className="opacity-80 mb-8">Cinema, before the cinema.</p>

        <Link
          href="/auth"
          className="px-8 py-4 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 transition"
        >
          Enter Cinema
        </Link>
      </div>
    </div>
  );
}
