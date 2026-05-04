export type ExternalBlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  url: string;
  publishedAt: string;
};

type WordPressPost = {
  slug?: string;
  link?: string;
  date?: string;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  content?: { rendered?: string };
};

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeEntities(value: string): string {
  return value
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "-")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8230;/g, "...")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function normalizePost(post: WordPressPost): ExternalBlogPost | null {
  const slug = typeof post.slug === "string" ? post.slug : "";
  const titleRaw = typeof post.title?.rendered === "string" ? post.title.rendered : "";
  const excerptRaw = typeof post.excerpt?.rendered === "string" ? post.excerpt.rendered : "";
  const url = typeof post.link === "string" ? post.link : "";
  const publishedAt = typeof post.date === "string" ? post.date : "";

  if (!slug || !titleRaw || !url || !publishedAt) return null;

  return {
    slug,
    title: decodeEntities(stripHtml(titleRaw)),
    excerpt: decodeEntities(stripHtml(excerptRaw)),
    url,
    publishedAt,
  };
}

export type ExternalBlogPostDetail = ExternalBlogPost & {
  contentHtml: string;
};

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "");
}

function normalizePostDetail(post: WordPressPost): ExternalBlogPostDetail | null {
  const normalized = normalizePost(post);
  if (!normalized) return null;
  const contentRaw = typeof post.content?.rendered === "string" ? post.content.rendered : "";
  return {
    ...normalized,
    contentHtml: sanitizeHtml(contentRaw),
  };
}

export async function fetchFillerSuppliesPosts(limit = 8): Promise<ExternalBlogPost[]> {
  const endpoint = `https://fillersupplies.com/wp-json/wp/v2/posts?per_page=${Math.max(1, Math.min(limit, 20))}&_fields=slug,link,date,title,excerpt`;

  try {
    const res = await fetch(endpoint, {
      next: { revalidate: 60 * 60 * 6 },
      headers: {
        Accept: "application/json",
        "User-Agent": "MedicaPlanetBot/1.0 (+https://medicaplanet.app)",
      },
    });

    if (!res.ok) return [];
    const raw = (await res.json()) as unknown;
    if (!Array.isArray(raw)) return [];

    return raw
      .map((item) => normalizePost(item as WordPressPost))
      .filter((item): item is ExternalBlogPost => item !== null);
  } catch {
    return [];
  }
}

export async function fetchFillerSuppliesPostBySlug(slug: string): Promise<ExternalBlogPostDetail | null> {
  const params = new URLSearchParams({
    slug,
    _fields: "slug,link,date,title,excerpt,content",
  });
  const endpoint = `https://fillersupplies.com/wp-json/wp/v2/posts?${params.toString()}`;

  try {
    const res = await fetch(endpoint, {
      next: { revalidate: 60 * 60 * 6 },
      headers: {
        Accept: "application/json",
        "User-Agent": "MedicaPlanetBot/1.0 (+https://medicaplanet.app)",
      },
    });
    if (!res.ok) return null;

    const raw = (await res.json()) as unknown;
    if (!Array.isArray(raw) || raw.length === 0) return null;

    return normalizePostDetail(raw[0] as WordPressPost);
  } catch {
    return null;
  }
}
