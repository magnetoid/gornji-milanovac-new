// Serbian text helpers: Cyrillic to Latin, slugs and accent-free matching

const cyrillicToLatin: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ђ: 'đ', е: 'e', ж: 'ž', з: 'z', и: 'i',
  ј: 'j', к: 'k', л: 'l', љ: 'lj', м: 'm', н: 'n', њ: 'nj', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', ћ: 'ć', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'č', џ: 'dž', ш: 'š',
};

// "Горњи Милановац" -> "Gornji Milanovac"; Latin text passes through unchanged
export function toLatin(text: string): string {
  let out = '';
  const chars = Array.from(text);
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const lower = ch.toLowerCase();
    const latin = cyrillicToLatin[lower];
    if (latin === undefined) {
      out += ch;
    } else if (ch === lower) {
      out += latin;
    } else {
      // Љ before a capital stays "LJ", before lowercase becomes "Lj"
      const next = chars[i + 1];
      const nextIsUpper = next !== undefined && next !== next.toLowerCase();
      out += latin.length > 1 && !nextIsUpper ? latin[0].toUpperCase() + latin.slice(1) : latin.toUpperCase();
    }
  }
  return out;
}

// Lowercase Latin without diacritics: "Gornjem Milanovcu, Čačak" -> "gornjem milanovcu, cacak"
export function normalizeForMatch(text: string): string {
  return toLatin(text)
    .toLowerCase()
    .replace(/đ/g, 'dj')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function slugify(text: string): string {
  return normalizeForMatch(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
    .replace(/-+$/g, '');
}

// Comma-separated keywords; "*" matches the rest of a word, so
// "gornj* milanov*" catches Gornji Milanovac, Gornjem Milanovcu, Gornjeg Milanovca...
export function keywordMatcher(keywords: string | null): (text: string) => boolean {
  const patterns = (keywords || '')
    .split(',')
    .map((k) => normalizeForMatch(k.trim()))
    .filter(Boolean)
    .map((k) => {
      const source = k
        .split(/\s+/)
        .map((word) => word.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[a-z0-9]*'))
        .join('\\s+');
      return new RegExp(`(^|[^a-z0-9])${source}($|[^a-z0-9])`);
    });
  if (patterns.length === 0) return () => true;
  return (text: string) => {
    const normalized = normalizeForMatch(text);
    return patterns.some((pattern) => pattern.test(normalized));
  };
}

export function stripHtml(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/[ \t\r\f\v]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim();
}

// Cut at a word boundary and add an ellipsis
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:–-]+$/, '')}…`;
}
