# Gornji Milanovac — portal

Next.js 14 (App Router) + PostgreSQL + Redis, za Docker Compose / Coolify. Kod je u `frontend/`, šema baze u `frontend/db/init.sql`, a migracije za postojeću bazu u `frontend/migrations/`. Oboje aplikacija primenjuje sama pri startu.

## Lokalni razvoj

```bash
cd frontend
cp .env.example .env.local   # DATABASE_URL, REDIS_URL, NEXTAUTH_SECRET...
npm ci
npm run dev                  # http://localhost:3000
```

Baza: dovoljna je prazna PostgreSQL baza. Pri startu aplikacija u nju učita `frontend/db/init.sql` (ako nema tabele `users`), pa primeni migracije iz `frontend/migrations/` (tabela `schema_migrations`).

## Produkcija (docker compose / Coolify)

Promenljive okruženja: `POSTGRES_PASSWORD`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`, `ADMIN_PASSWORD` (i opciono `ADMIN_EMAIL`), opciono `RSS_IMPORT_INTERVAL_MINUTES` (podrazumevano 30, `0` gasi automatski uvoz) i `BACKUP_KEEP` (broj dnevnih rezervnih kopija baze, podrazumevano 14).

Pri svakom startu aplikacija sama:
- učita šemu iz `frontend/db/init.sql` ako je baza prazna;
- primeni nove SQL migracije iz `frontend/migrations/`, svaku samo jednom;
- napravi admin nalog ili mu postavi lozinku iz `ADMIN_PASSWORD` ako se razlikuje (najmanje 12 znakova);
- pokrene zakazane zadatke (`frontend/src/lib/jobs.ts`).

## Zakazani zadaci

Aplikacija sama pokreće poslove po rasporedu (kao WP-Cron); stanje i dugme „Pokreni sada“ su na `/admin/zadaci`. Dnevni zadaci rade po vremenu u Srbiji.

| Zadatak | Raspored |
|---|---|
| Objava zakazanih vesti (status „Zakazano“) | svakog minuta |
| Uvoz vesti iz RSS izvora (preskače vest koja već postoji pod istim naslovom) | na `RSS_IMPORT_INTERVAL_MINUTES` minuta |
| Rezervna kopija baze (`pg_dump` u volume `backups`) | svaki dan u 03:00 |
| Isticanje oglasa kojima je prošao `expires_at` | svaki dan u 04:00 |

Kopije baze su na istom serveru; za kopiju van servera preuzmite ih povremeno. Vraćanje kopije (briše trenutni sadržaj baze):

```bash
docker compose cp nextjs:/app/backups/gm-2026-10-28-02-00.dump ./backup.dump
docker compose cp ./backup.dump postgres:/tmp/backup.dump
docker compose exec postgres pg_restore --clean --if-exists --no-owner -U gm_user -d gornji_milanovac /tmp/backup.dump
```

Posle deploy-a nema ručnih koraka. Admin panel: `/admin`. Lozinka može da se postavi i ručno:

```bash
docker compose exec -e ADMIN_PASSWORD='nova-duga-lozinka' nextjs \
  node scripts/set-admin-password.js admin@gornji-milanovac.com
```

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
