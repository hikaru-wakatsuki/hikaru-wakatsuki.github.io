// src/types/portfolio.ts
export type Theme = 'dark' | 'light';
export type Language = 'ja' | 'en';

// 技術タグの共通定義
export interface ProjectTag {
  id: string;
  name: string;
}

export interface ProjectTechnicalDetails {
  challenge?: string;
  design?: string[];
  verification: string[];
  limitations?: string[];
  caseStudies?: ProjectTechnicalCaseStudy[];
}

export interface ProjectTechnicalCaseStudy {
  title: string;
  challenge: string;
  solution: string;
  solutionSteps?: Array<{
    title: string;
    text: string;
  }>;
  diagram?: 'function-selection' | 'json-generation' | 'recursive-schema' | 'precomputation';
  challengeDiagram?: 'codexion-circular-wait' | 'codexion-partial-ownership' | 'codexion-log-interleaving';
  solutionDiagram?: 'codexion-lock-order' | 'codexion-atomic-pair' | 'codexion-priority-heap' | 'codexion-log-mutex';
}

export interface ProjectDemoGuide {
  overview?: string;
  cues: string[];
}

// ポートフォリオカードのデータ構造
export interface PortfolioProject {
  id: string;
  title: string;
  description: { ja: string; en: string };
  technicalDetails?: { ja: ProjectTechnicalDetails; en: ProjectTechnicalDetails };
  projectType?: { ja: string; en: string };
  demoGuide?: { ja: ProjectDemoGuide; en: ProjectDemoGuide };
  tags: string[]; // ['React', 'Docker' など]
  githubUrl: string;
  videoUrl?: string;
  imageUrl?: string;
  compact?: boolean;
}
