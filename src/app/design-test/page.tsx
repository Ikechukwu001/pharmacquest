/**
 * Temporary design system smoke test.
 * Visit /design-test to verify tokens, fonts, and shadcn components render correctly.
 * DELETE this folder before deploying.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function DesignTest() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Pharmacquest Design System</h1>
        <p className="text-foreground-muted mt-2">
          Quick visual smoke test. If everything below looks right, the foundation is good.
        </p>
      </header>

      <Separator />

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Typography</h2>
        <p className="text-base">
          This is body text in Inter at 16px. Comfortable, legible, neutral.
        </p>
        <p className="text-sm text-foreground-muted">
          This is muted secondary text in Inter at 14px.
        </p>
        <p className="font-mono text-sm">
          Lisinopril 10mg · Amlodipine 5mg · Metformin 500mg BD
        </p>
        <p className="text-xs text-foreground-subtle">
          The line above should appear in JetBrains Mono.
        </p>
      </section>

      <Separator />

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Form inputs</h2>
        <div className="space-y-2 max-w-sm">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="amaka@uniabuja.edu.ng" />
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Card</h2>
        <Card>
          <CardHeader>
            <CardTitle>Strong Drugs</CardTitle>
            <CardDescription>Community pharmacy · 7 min · Intermediate</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-sm text-foreground-muted">
              Recognize the NSAID + ACE inhibitor interaction.
            </span>
            <Badge>New</Badge>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Color tokens</h2>
        <div className="grid grid-cols-5 gap-3">
          <ColorChip name="primary-500" className="bg-primary-500" />
          <ColorChip name="primary-700" className="bg-primary-700" />
          <ColorChip name="accent-500" className="bg-accent-500" />
          <ColorChip name="success" className="bg-success" />
          <ColorChip name="danger" className="bg-danger" />
        </div>
      </section>
    </div>
  );
}

function ColorChip({ name, className }: { name: string; className: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`h-16 w-full rounded-md ${className}`} />
      <span className="text-xs font-mono">{name}</span>
    </div>
  );
}