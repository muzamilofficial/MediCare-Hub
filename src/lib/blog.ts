import fs from 'fs';
import path from 'path';

export interface HealthTipArticle {
  slug: string;
  title: string;
  titleUr: string;
  titleSd: string;
  excerpt: string;
  excerptUr: string;
  excerptSd: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: number;
  category: string;
  image: string;
  serviceSlug: string;
  content: string;
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'health-tips');

function parseFrontmatter(raw: string): { data: Record<string, string>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { data: {}, content: raw };
  }
  const frontmatterBlock = match[1];
  const content = match[2].trim();
  const data: Record<string, string> = {};

  for (const line of frontmatterBlock.split(/\r?\n/)) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    data[key] = val;
  }

  return { data, content };
}

export function getAllHealthTips(): HealthTipArticle[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));

  const articles: HealthTipArticle[] = files.map((filename) => {
    const fullPath = path.join(BLOG_DIR, filename);
    const raw = fs.readFileSync(fullPath, 'utf-8');
    const { data, content } = parseFrontmatter(raw);
    const slug = data.slug || filename.replace(/\.mdx?$/, '');

    return {
      slug,
      title: data.title || slug,
      titleUr: data.titleUr || data.title || slug,
      titleSd: data.titleSd || data.title || slug,
      excerpt: data.excerpt || '',
      excerptUr: data.excerptUr || data.excerpt || '',
      excerptSd: data.excerptSd || data.excerpt || '',
      author: data.author || 'MediCare Hub Medical Team',
      authorRole: data.authorRole || 'Consultant Physician',
      date: data.date || '2026-06-01',
      readTime: Number(data.readTime) || 4,
      category: data.category || 'Family Health',
      image: data.image || '/images/gallery-1.svg',
      serviceSlug: data.serviceSlug || 'general-physician',
      content,
    };
  });

  return articles.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getHealthTipBySlug(slug: string): HealthTipArticle | null {
  const all = getAllHealthTips();
  return all.find((a) => a.slug === slug) || null;
}
