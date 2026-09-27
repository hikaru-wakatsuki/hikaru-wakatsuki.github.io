// src/types/portfolio.ts
export type Theme = 'dark' | 'light';
export type Language = 'ja' | 'en';

// 技術タグの共通定義
export interface ProjectTag {
  id: string;
  name: string;
}

export interface ProjectTechnicalDetails {
  challenge: string;
  design: string[];
  verification: string[];
  limitations: string[];
}

export interface ProjectDemoGuide {
  overview: string;
  cues: string[];
}

// ポートフォリオカードのデータ構造
export interface PortfolioProject {
  id: string;
  title: string;
  description: { ja: string; en: string };
  technicalDetails?: { ja: ProjectTechnicalDetails; en: ProjectTechnicalDetails };
  projectType?: { ja: string; en: string };
  resultBadge?: { ja: string; en: string };
  demoGuide?: { ja: ProjectDemoGuide; en: ProjectDemoGuide };
  collaboration?: { ja: string[]; en: string[] };
  tags: string[]; // ['React', 'Docker' など]
  githubUrl: string;
  videoUrl?: string;
  imageUrl?: string;
  compact?: boolean;
}
