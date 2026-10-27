# Gornji Milanovac — portal

Next.js 14 (App Router) + PostgreSQL + Redis, za Docker Compose / Coolify. Kod je u `frontend/`, šema baze u `database/init.sql`, a migracije za postojeću bazu u `migration/`.

## Lokalni razvoj

```bash
cd frontend
cp .env.example .env.local   # DATABASE_URL, REDIS_URL, NEXTAUTH_SECRET...
npm ci
npm run dev                  # http://localhost:3000
```

Baza: `psql "$DATABASE_URL" -f database/init.sql`, pa sve datoteke iz `migration/` redom.

## Produkcija (docker compose / Coolify)

Promenljive okruženja: `POSTGRES_PASSWORD`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`, opciono `RSS_IMPORT_INTERVAL_MINUTES` (podrazumevano 30, `0` gasi automatski uvoz).

Posle prvog deploy-a ili kad se doda nova migracija:

```bash
docker compose exec -T postgres psql -U gm_user -d gornji_milanovac < migration/2026-10-events-and-alert.sql
docker compose exec -T postgres psql -U gm_user -d gornji_milanovac < migration/2026-10-news-sources.sql
```

Admin nalog (seed nalog nema lozinku dok se ne postavi):

```bash
docker compose exec -e ADMIN_PASSWORD='nova-duga-lozinka' nextjs \
  node scripts/set-admin-password.js admin@gornji-milanovac.com
```

Admin panel: `/admin`.

## Prelazak sa starog WordPress sajta

1. Na starom sajtu: **Alati → Izvoz → Sav sadržaj** (WXR `.xml`).
2. Uvoz kategorija, vesti, stranica i RSS izvora (WP RSS Aggregator, Feedzy, WPeMatico):

   ```bash
   docker compose cp export.xml nextjs:/tmp/export.xml
   docker compose exec nextjs node scripts/wp-to-postgres.js --wp-export /tmp/export.xml --dry-run
   docker compose exec nextjs node scripts/wp-to-postgres.js --wp-export /tmp/export.xml
   ```

   Ponovno pokretanje je bezbedno; postojeći slugovi se preskaču.
3. Slike: sadržaj `wp-content/uploads/` kopirati u volumen `uploads` (`/app/uploads`), sa istom strukturom godina/mesec. Stari linkovi `/wp-content/uploads/...` rade i dalje.
4. Keš: `docker compose exec redis redis-cli FLUSHALL`.
5. Stare adrese se same preusmeravaju: `/<slug>/` i `/2024/03/<slug>/` → `/vesti/<slug>`, `/kategorija/.../<kat>/` → `/vesti?kategorija=<kat>`; WordPress stranice (npr. `/poslovi-gornji-milanovac/`) prikazuju se iz tabele `pages`.
6. Tek onda prebaciti DNS domena na novi server.

## Agregator vesti

Izvori se uređuju u **Admin → Izvori vesti**. Feed se preuzima na svakih 30 minuta (i dugmetom „Preuzmi vesti sada"); objavljuju se naslov, kratak izvod, slika i link na original, uz automatski prelaz ćirilice u latinicu. Ključne reči se odvajaju zarezom, `*` zamenjuje ostatak reči — `gornj* milanov*` hvata sve padeže „Gornji Milanovac". Prazno polje uvozi sve vesti iz feed-a.
