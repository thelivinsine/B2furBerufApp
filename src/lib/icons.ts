import {
  Users,
  CalendarClock,
  Truck,
  Headset,
  Handshake,
  KanbanSquare,
  Laptop,
  Leaf,
  ShieldCheck,
  Plane,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Scale,
  HelpCircle,
  MessageSquare,
  ListChecks,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  Users,
  CalendarClock,
  Truck,
  Headset,
  Handshake,
  KanbanSquare,
  Laptop,
  Leaf,
  ShieldCheck,
  Plane,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Scale,
  HelpCircle,
  MessageSquare,
  ListChecks,
  Sparkles,
};

export function iconByName(name: string): LucideIcon {
  return map[name] ?? Sparkles;
}
