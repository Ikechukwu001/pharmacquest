/**
 * Pharmacquest — Patient card
 *
 * Persistent at the top of the scenario player. Like a chart in a real
 * consultation, you can always glance at who you're treating.
 */

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Patient } from "@/types/scenario";

interface PatientCardProps {
  patient: Patient;
}

export function PatientCard({ patient }: PatientCardProps) {
  const initial = patient.display_name.charAt(0).toUpperCase();
  const sexLabel = patient.sex === "male" ? "M" : "F";

  return (
    <Card className="shadow-none border-border">
      <CardContent className="py-3 px-4 flex items-start gap-3">
        <Avatar className="h-10 w-10 mt-0.5 shrink-0">
          <AvatarFallback className="bg-primary-100 text-primary-700 text-base font-medium">
            {initial}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className="font-semibold leading-tight truncate">
              {patient.display_name}
            </p>
            <p className="text-xs font-mono text-foreground-muted whitespace-nowrap">
              {patient.age}{sexLabel}
            </p>
          </div>
          <p className="text-sm text-foreground-muted leading-snug mt-1 line-clamp-2">
            {patient.appearance}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}