# Task: Build gornji-milanovac-new — Next.js + Directus portal

## Stack
- **Frontend**: Next.js 14 (App Router, SSR/SSG)
- **CMS/Backend**: Directus (headless CMS)
- **DB**: PostgreSQL
- **Deploy**: Docker Compose (for Coolify deployment)
- **Target**: new.gornji-milanovac.com

## What to build

### 1. docker-compose.yml (root)
Full stack for Coolify deployment:
```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: gornji_milanovac
      POSTGRES_USER: gm_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  directus:
    image: directus/directus:latest
    ports:
      - "8055:8055"
    environment:
      SECRET: ${DIRECTUS_SECRET}
      ADMIN_EMAIL: ${DIRECTUS_ADMIN_EMAIL}
      ADMIN_PASSWORD: ${DIRECTUS_ADMIN_PASSWORD}
      DB_CLIENT: pg
      DB_HOST: postgres
      DB_PORT: 5432
      DB_DATABASE: gornji_milanovac
      DB_USER: gm_user
      DB_PASSWORD: ${POSTGRES_PASSWORD}
      STORAGE_LOCATIONS: local
      STORAGE_LOCAL_ROOT: /directus/uploads
      PUBLIC_URL: https://api.new.gornji-milanovac.com
    volumes:
      - directus_uploads:/directus/uploads
      - directus_extensions:/directus/extensions
    depends_on:
      - postgres

  nextjs:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      DIRECTUS_URL: http://directus:8055
      DIRECTUS_TOKEN: ${DIRECTUS_TOKEN}
      NEXT_PUBLIC_SITE_URL: https://new.gornji-milanovac.com
    depends_on:
      - directus
```

### 2. directus/schema.json
Directus data model matching WordPress structure:
- **posts** collection:
  - id, title, slug, content (WYSIWYG), excerpt, status (published/draft/scheduled)
  - featured_image (M2O → directus_files)
  - author (M2O → directus_users)
  - published_at (datetime)
  - category (M2O → categories)
  - tags (M2M → tags)
  - source_url (string - original URL from crawler)
  - source_name (string - e.g. "GM Info", "Telegraf")
  - wp_id (integer - for migration tracking)

- **categories** collection:
  - id, name, slug, description, parent (M2O → categories), wp_id

- **tags** collection:
  - id, name, slug, wp_id

- **pages** collection:
  - id, title, slug, content, status

- **listings** collection (Oglasi):
  - id, title, slug, content, price, category, contact_email, contact_phone, location, status, images (O2M → directus_files), expires_at

- **listings_categories** collection:
  - id, name, slug

### 3. directus/snapshot.yaml
Directus schema snapshot for auto-apply on startup. Define all collections, fields, and relations as above.

### 4. frontend/ (Next.js app)

#### frontend/package.json
```json
{
  "name": "gornji-milanovac-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p 3000"
  },
  "dependencies": {
    "next": "14.2.0",
    "react": "18.3.0",
    "react-dom": "18.3.0",
    "@directus/sdk": "^17.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "typescript": "^5",
    "tailwindcss": "^3.4",
    "postcss": "^8",
    "autoprefixer": "^10"
  }
}
```

#### frontend/next.config.js
- Image domains: api.new.gornji-milanovac.com, localhost
- ISR revalidation: 60s for posts, 300s for pages

#### frontend/tailwind.config.js
Theme colors:
- primary: #1B5E20 (forest green)
- secondary: #F57F17 (gold)
- Keep it clean, Serbian portal aesthetic

#### frontend/src/lib/directus.ts
Directus SDK client setup. Export typed collections.

#### frontend/src/app/layout.tsx
Root layout with:
- Header: Logo "Gornji Milanovac", nav (Vesti, Blog, Oglasi, O Gradu, Kontakt), mobile menu
- Footer: 3 columns, links, copyright
- Google Fonts: Inter + local serif

#### frontend/src/app/page.tsx
Homepage:
- Breaking news slider (top 5 published posts, latest first)
- 2-column: latest news grid (12 posts) + sidebar (weather link, quick links, categories)
- Category sections: Sport, Kultura, Ekonomija (3 posts each)
- Listings preview: 3 featured active listings
- SEO: title, description, OG tags

#### frontend/src/app/vesti/page.tsx
News archive:
- Paginated grid (12 per page), sorted by published_at DESC
- Category filter sidebar
- SSR with ISR

#### frontend/src/app/vesti/[slug]/page.tsx
Post detail:
- Full content rendering
- Featured image header
- Category/tag breadcrumbs
- Related posts sidebar
- SEO: OG image from featured_image

#### frontend/src/app/oglasi/page.tsx
Listings page:
- Grid of active listings
- Category/price filter
- Search

#### frontend/src/app/oglasi/[slug]/page.tsx
Single listing detail

#### frontend/src/components/NewsCard.tsx
Post card component: thumbnail, category badge, title, excerpt, date, source

#### frontend/src/components/Header.tsx
Responsive header with mobile hamburger

#### frontend/src/components/Footer.tsx
3-column footer

#### frontend/src/components/BreakingNewsTicker.tsx
Auto-scrolling breaking news ticker

#### frontend/Dockerfile
Multi-stage Next.js production build:
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### 5. migration/wp-to-directus.js
Node.js migration script:
```
node wp-to-directus.js --wp-export ./export.xml --directus-url http://localhost:8055 --directus-token TOKEN
```
- Parse WordPress WXR XML export
- Import categories with parent relationships
- Import tags
- Import posts: title, content, excerpt, status, published_at, source_url, category, tags
- Download featured images to Directus files
- Track wp_id for deduplication
- Progress bar, error handling, resume support
- Estimated time: ~5552 posts

### 6. .env.example
```
POSTGRES_PASSWORD=changeme
DIRECTUS_SECRET=changeme-32-chars
DIRECTUS_ADMIN_EMAIL=admin@gornji-milanovac.com
DIRECTUS_ADMIN_PASSWORD=changeme
DIRECTUS_TOKEN=static-token-here
NEXT_PUBLIC_SITE_URL=https://new.gornji-milanovac.com
```

### 7. .github/workflows/deploy.yml
Deploy to Coolify on push to main:
- SSH to server
- Pull latest
- docker compose pull && docker compose up -d

### 8. README.md
Setup guide in Serbian:
- Local development
- Production deploy na Coolify
- Kako pokrenuti migraciju
- Kako dodati novi post
- Coolify env varijable

## Important notes
- ALL UI text in Serbian (Latin)
- ISR (Incremental Static Regeneration) za performance
- SEO-first: structured data, sitemap.xml, robots.txt
- Mobile-first design
- Serbian date formatting (30. mart 2026.)

## When done:
- git add all, commit "feat: initial Next.js + Directus portal", push to origin main
- Run: openclaw system event --text "Done: gornji-milanovac-new built - Next.js + Directus, pushed to github.com/magnetoid/gornji-milanovac-new. Ready for Coolify deploy." --mode now
