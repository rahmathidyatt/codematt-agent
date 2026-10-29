"use client";

import React from "react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { Roadmap } from "@/components/Roadmap";
import { useAgentStore } from "@/lib/store";

export default function RoadmapPage() {
  const { locale } = useAgentStore();

  return (
    <WorkspaceShell
      title={locale === "id" ? "Peta Jalan Pengembangan" : "Engineering Roadmap"}
      subtitle={locale === "id" ? "Visualisasi target rilis, arsitektur modul, dan kriteria gerbang kualitas" : "Target release dates, modular architecture, and quality gate criteria"}
    >
      <div className="max-w-6xl mx-auto">
        <Roadmap />
      </div>
    </WorkspaceShell>
  );
}
