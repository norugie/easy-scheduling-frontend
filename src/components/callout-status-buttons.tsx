import type { CalloutStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const labels: Array<{ value: CalloutStatus; label: string }> = [
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
  { value: "no_answer", label: "No answer" },
  { value: "pending", label: "Pending" },
];

export function CalloutStatusButtons({
  value,
  onChange,
}: {
  value: CalloutStatus;
  onChange: (value: CalloutStatus) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((item) => (
        <Button
          key={item.value}
          type="button"
          size="sm"
          variant={value === item.value ? "default" : "outline"}
          className={cn(
            item.value === "accepted" && value !== item.value && "border-emerald-300",
            item.value === "declined" && value !== item.value && "border-rose-300",
            item.value === "no_answer" && value !== item.value && "border-amber-300",
          )}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
}
