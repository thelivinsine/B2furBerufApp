import { Progress } from "@/components/ui/progress";

interface SessionProgressProps {
  value: number;
  label?: React.ReactNode;
  right?: React.ReactNode;
  below?: React.ReactNode;
}

export function SessionProgress({ value, label, right, below }: SessionProgressProps) {
  return (
    <div className="space-y-1.5">
      {(label !== undefined || right !== undefined) && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {label}
          {right}
        </div>
      )}
      <Progress value={value} />
      {below}
    </div>
  );
}
