// src/types/portfolio.ts
export type Theme = 'dark' | 'light';
export type Language = 'ja' | 'en';

// 技術タグの共通定義
export interface ProjectTag {
  id: string;
  name: string;
}

// ポートフォリオカードのデータ構造
export interface PortfolioProject {
  id: string;
  title: string;
  description: { ja: string; en: string };
  tags: string[]; // ['React', 'Docker' など]
  githubUrl: string;
  videoUrl?: string;
  imageUrl?: string;
}
