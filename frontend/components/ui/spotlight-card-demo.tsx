import { GlowCard } from "@/components/ui/spotlight-card";

export function SpotlightCardDemo() {
  return (
    <div className="w-screen h-screen flex flex-row items-center justify-center gap-10 custom-cursor">
      <GlowCard glowColor="caramel">
        <div className="flex flex-col gap-2 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">
            Spotlight
          </p>
          <p className="text-xl font-semibold">Creative Deck</p>
          <p className="text-sm text-white/70">
            Build vision boards with mood, tone, and palette.
          </p>
        </div>
      </GlowCard>
      <GlowCard glowColor="copper">
        <div className="flex flex-col gap-2 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">
            Spotlight
          </p>
          <p className="text-xl font-semibold">Casting</p>
          <p className="text-sm text-white/70">
            Align roles and track approvals in one place.
          </p>
        </div>
      </GlowCard>
      <GlowCard glowColor="olive">
        <div className="flex flex-col gap-2 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">
            Spotlight
          </p>
          <p className="text-xl font-semibold">Budget</p>
          <p className="text-sm text-white/70">
            Compare spend levels with instant estimates.
          </p>
        </div>
      </GlowCard>
    </div>
  );
}
