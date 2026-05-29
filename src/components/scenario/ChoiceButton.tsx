/**
 * Pharmacquest — Choice button
 *
 * The "what do you do?" button. Full-width, generous padding, hover/active
 * states that feel weighty rather than fidgety.
 */

import { cn } from "@/lib/utils";

interface ChoiceButtonProps {
  label: string;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  detail?: string;
  /** Visual flag — used inside multi-select after a pick is locked. */
  locked?: boolean;
}

export function ChoiceButton({
  label,
  onClick,
  selected = false,
  disabled = false,
  detail,
  locked = false,
}: ChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full text-left rounded-lg border transition-all",
        "px-4 py-3.5 sm:px-5 sm:py-4",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        // Base
        !selected && !disabled &&
          "bg-surface border-border hover:border-primary-300 hover:bg-primary-50/40 active:translate-y-px",
        // Selected (after pick in multi-select)
        selected &&
          "bg-primary-50 border-primary-300",
        // Disabled but not selected — faded
        disabled && !selected &&
          "bg-surface border-border opacity-40 cursor-not-allowed",
        // Locked-but-selected — same as selected, but no interaction
        locked && "cursor-default"
      )}
    >
      <div className="flex items-start gap-3">
        {selected && (
          <span className="mt-0.5 text-primary-600 font-bold shrink-0">✓</span>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-base leading-relaxed">{label}</p>
          {detail && selected && (
            <p className="mt-2 text-sm text-foreground-muted italic leading-relaxed">
              {detail}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}