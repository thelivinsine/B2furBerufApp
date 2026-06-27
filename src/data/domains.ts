import type { Domain } from "@/types";

export const domains: Domain[] = [
  {
    id: "beruf",
    title: "Working Life",
    titleDe: "Berufsleben",
    context: "work",
  },
  {
    id: "arbeitswelt",
    title: "Work Environment",
    titleDe: "Arbeitswelt & Umfeld",
    context: "work",
  },
  {
    id: "alltag",
    title: "Daily Life & Errands",
    titleDe: "Alltag & Erledigungen",
    context: "personal",
  },
  {
    id: "gesundheit",
    title: "Health & Social",
    titleDe: "Gesundheit & Soziales",
    context: "both",
  },
  {
    id: "bildung",
    title: "Education & Language",
    titleDe: "Bildung & Sprache",
    context: "both",
  },
  {
    id: "pruefung",
    title: "Exam Training",
    titleDe: "Prüfungstraining",
    context: "both",
  },
];

export const domainById = (id: string) => domains.find((d) => d.id === id);
