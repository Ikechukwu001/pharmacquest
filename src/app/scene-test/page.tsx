/**
 * Temporary 3D scene test page.
 * Visit /scene-test to verify the pill bottle scene renders correctly.
 * DELETE this folder before deploying.
 */

import { PillBottleSceneLazy } from "@/components/scene/PillBottleSceneLazy";

export const metadata = {
  title: "Scene test",
};

export default function SceneTestPage() {
  return (
    <main className="min-h-screen p-6 sm:p-10 bg-neutral-50">
      <div className="max-w-2xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">3D Scene Test</h1>
          <p className="text-foreground-muted mt-2">
            Pill bottle with orbiting capsules. If you see the bottle rotating
            with pills circling it, the 3D pipeline works.
          </p>
        </header>

        {/* The 3D scene in a fixed-size container */}
        <div className="w-full h-80 sm:h-96 bg-gradient-to-br from-primary-700 to-primary-900 rounded-xl overflow-hidden">
          <PillBottleSceneLazy />
        </div>

        <div className="text-sm text-foreground-muted space-y-2">
          <p><strong>What to check:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>The bottle should be visible in the center</li>
            <li>It should rotate slowly</li>
            <li>4 capsules should orbit around it</li>
            <li>No console errors</li>
            <li>Loads in under 3 seconds on a normal connection</li>
          </ul>
        </div>
      </div>
    </main>
  );
}