#!/usr/bin/env node

/**
 * Directus Marketplace Seed Script
 *
 * Creates marketplace collections schema and seeds sample data.
 *
 * Usage:
 *   node wp-config/seed-directus.js --url https://api.new.gornji-milanovac.com --email admin@gornji-milanovac.com --password GmPortal2026!
 *
 * Options:
 *   --url       Directus URL (required)
 *   --email     Admin email (required)
 *   --password  Admin password (required)
 *   --skip-schema  Skip schema creation (only seed data)
 */

const https = require('https');
const http = require('http');

// Parse command line arguments
function parseArgs() {
  const args = {};
  for (let i = 2; i < process.argv.length; i += 2) {
    const key = process.argv[i].replace('--', '');
    const value = process.argv[i + 1];
    args[key] = value;
  }
  return args;
}

const args = parseArgs();
const DIRECTUS_URL = args.url;
const ADMIN_EMAIL = args.email;
const ADMIN_PASSWORD = args.password;
const SKIP_SCHEMA = args['skip-schema'] === 'true';

if (!DIRECTUS_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Usage: node seed-directus.js --url <directus-url> --email <admin-email> --password <admin-password>');
  process.exit(1);
}

// HTTP request helper
function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, DIRECTUS_URL);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = lib.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : {};
          if (res.statusCode >= 400) {
            reject({ status: res.statusCode, ...json });
          } else {
            resolve(json);
          }
        } catch (e) {
          resolve({ raw: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Authenticate with Directus
async function authenticate() {
  console.log('Authenticating with Directus...');
  const response = await request('POST', '/auth/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  if (!response.data?.access_token) {
    throw new Error('Authentication failed: ' + JSON.stringify(response));
  }

  console.log('Authentication successful!');
  return response.data.access_token;
}

// Check if collection exists
async function collectionExists(token, collectionName) {
  try {
    await request('GET', `/collections/${collectionName}`, null, token);
    return true;
  } catch (e) {
    return false;
  }
}

// Create collections schema
async function createSchema(token) {
  console.log('\nCreating marketplace collections schema...');

  // Vendors collection
  if (!(await collectionExists(token, 'vendors'))) {
    console.log('Creating vendors collection...');
    await request('POST', '/collections', {
      collection: 'vendors',
      meta: {
        icon: 'storefront',
        note: 'Local marketplace vendors',
        display_template: '{{name}}',
        archive_field: 'status',
        archive_value: 'archived',
        unarchive_value: 'draft',
        sort_field: 'sort',
      },
      schema: {},
      fields: [
        { field: 'id', type: 'uuid', meta: { hidden: true }, schema: { is_primary_key: true } },
        { field: 'status', type: 'string', meta: { width: 'half', options: { choices: [{ text: 'Published', value: 'published' }, { text: 'Draft', value: 'draft' }, { text: 'Pending', value: 'pending' }] }, interface: 'select-dropdown' }, schema: { default_value: 'draft' } },
        { field: 'date_created', type: 'timestamp', meta: { special: ['date-created'], interface: 'datetime', readonly: true, hidden: true, width: 'half' }, schema: {} },
        { field: 'name', type: 'string', meta: { interface: 'input', required: true }, schema: { is_nullable: false } },
        { field: 'slug', type: 'string', meta: { interface: 'input', options: { slug: true } }, schema: {} },
        { field: 'description', type: 'text', meta: { interface: 'input-rich-text-html' }, schema: {} },
        { field: 'logo', type: 'uuid', meta: { interface: 'file-image', special: ['file'] }, schema: {} },
        { field: 'cover_image', type: 'uuid', meta: { interface: 'file-image', special: ['file'] }, schema: {} },
        { field: 'category', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [{ text: 'Farma', value: 'farma' }, { text: 'Zanatstvo', value: 'zanatstvo' }, { text: 'Usluge', value: 'usluge' }, { text: 'Trgovina', value: 'trgovina' }, { text: 'Turizam', value: 'turizam' }, { text: 'Lepota', value: 'lepota' }, { text: 'Popravke', value: 'popravke' }, { text: 'Ostalo', value: 'ostalo' }] } }, schema: {} },
        { field: 'location', type: 'string', meta: { interface: 'input' }, schema: {} },
        { field: 'phone', type: 'string', meta: { interface: 'input' }, schema: {} },
        { field: 'email', type: 'string', meta: { interface: 'input' }, schema: {} },
        { field: 'website', type: 'string', meta: { interface: 'input' }, schema: {} },
        { field: 'facebook', type: 'string', meta: { interface: 'input' }, schema: {} },
        { field: 'instagram', type: 'string', meta: { interface: 'input' }, schema: {} },
        { field: 'working_hours', type: 'string', meta: { interface: 'input' }, schema: {} },
        { field: 'featured', type: 'boolean', meta: { interface: 'boolean', special: ['cast-boolean'] }, schema: { default_value: false } },
        { field: 'sort', type: 'integer', meta: { interface: 'input', hidden: true }, schema: {} },
      ],
    }, token);
    console.log('  ✓ vendors collection created');
  } else {
    console.log('  → vendors collection already exists');
  }

  // Products collection
  if (!(await collectionExists(token, 'products'))) {
    console.log('Creating products collection...');
    await request('POST', '/collections', {
      collection: 'products',
      meta: {
        icon: 'inventory_2',
        note: 'Products from vendors',
        display_template: '{{title}}',
      },
      schema: {},
      fields: [
        { field: 'id', type: 'uuid', meta: { hidden: true }, schema: { is_primary_key: true } },
        { field: 'status', type: 'string', meta: { width: 'half', options: { choices: [{ text: 'Published', value: 'published' }, { text: 'Draft', value: 'draft' }] }, interface: 'select-dropdown' }, schema: { default_value: 'draft' } },
        { field: 'date_created', type: 'timestamp', meta: { special: ['date-created'], interface: 'datetime', readonly: true, hidden: true }, schema: {} },
        { field: 'vendor_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'], options: { template: '{{name}}' } }, schema: {} },
        { field: 'title', type: 'string', meta: { interface: 'input', required: true }, schema: { is_nullable: false } },
        { field: 'slug', type: 'string', meta: { interface: 'input', options: { slug: true } }, schema: {} },
        { field: 'description', type: 'text', meta: { interface: 'input-rich-text-html' }, schema: {} },
        { field: 'price', type: 'float', meta: { interface: 'input' }, schema: {} },
        { field: 'price_unit', type: 'string', meta: { interface: 'input', note: 'e.g., kg, kom, litar' }, schema: {} },
        { field: 'category', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [{ text: 'Hrana', value: 'hrana' }, { text: 'Piće', value: 'pice' }, { text: 'Meso', value: 'meso' }, { text: 'Voće i povrće', value: 'voce_povrce' }, { text: 'Mlečni proizvodi', value: 'mlecni' }, { text: 'Med', value: 'med' }, { text: 'Prerađevine', value: 'preradjevine' }, { text: 'Zanatski proizvodi', value: 'zanatski' }, { text: 'Ostalo', value: 'ostalo' }] } }, schema: {} },
        { field: 'available', type: 'boolean', meta: { interface: 'boolean', special: ['cast-boolean'] }, schema: { default_value: true } },
        { field: 'contact_phone', type: 'string', meta: { interface: 'input' }, schema: {} },
        { field: 'contact_email', type: 'string', meta: { interface: 'input' }, schema: {} },
        { field: 'featured', type: 'boolean', meta: { interface: 'boolean', special: ['cast-boolean'] }, schema: { default_value: false } },
      ],
    }, token);
    console.log('  ✓ products collection created');

    // Add M2O relation
    await request('POST', '/relations', {
      collection: 'products',
      field: 'vendor_id',
      related_collection: 'vendors',
    }, token);
    console.log('  ✓ products -> vendors relation created');
  } else {
    console.log('  → products collection already exists');
  }

  // Services collection
  if (!(await collectionExists(token, 'services'))) {
    console.log('Creating services collection...');
    await request('POST', '/collections', {
      collection: 'services',
      meta: {
        icon: 'home_repair_service',
        note: 'Services from vendors',
        display_template: '{{title}}',
      },
      schema: {},
      fields: [
        { field: 'id', type: 'uuid', meta: { hidden: true }, schema: { is_primary_key: true } },
        { field: 'status', type: 'string', meta: { width: 'half', options: { choices: [{ text: 'Published', value: 'published' }, { text: 'Draft', value: 'draft' }] }, interface: 'select-dropdown' }, schema: { default_value: 'draft' } },
        { field: 'date_created', type: 'timestamp', meta: { special: ['date-created'], interface: 'datetime', readonly: true, hidden: true }, schema: {} },
        { field: 'vendor_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'], options: { template: '{{name}}' } }, schema: {} },
        { field: 'title', type: 'string', meta: { interface: 'input', required: true }, schema: { is_nullable: false } },
        { field: 'slug', type: 'string', meta: { interface: 'input', options: { slug: true } }, schema: {} },
        { field: 'description', type: 'text', meta: { interface: 'input-rich-text-html' }, schema: {} },
        { field: 'price_from', type: 'float', meta: { interface: 'input' }, schema: {} },
        { field: 'price_label', type: 'string', meta: { interface: 'input', note: 'Custom price display e.g., "od 2000 RSD"' }, schema: {} },
        { field: 'category', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [{ text: 'Popravke', value: 'popravke' }, { text: 'Građevina', value: 'gradjevina' }, { text: 'Lepota', value: 'lepota' }, { text: 'Zdravlje', value: 'zdravlje' }, { text: 'Edukacija', value: 'edukacija' }, { text: 'Prevoz', value: 'prevoz' }, { text: 'Ugostiteljstvo', value: 'ugostitelstvo' }, { text: 'Ostalo', value: 'ostalo' }] } }, schema: {} },
        { field: 'duration_minutes', type: 'integer', meta: { interface: 'input' }, schema: {} },
        { field: 'booking_enabled', type: 'boolean', meta: { interface: 'boolean', special: ['cast-boolean'] }, schema: { default_value: false } },
        { field: 'available_days', type: 'string', meta: { interface: 'input', note: 'e.g., "Pon-Pet 9-17"' }, schema: {} },
        { field: 'contact_phone', type: 'string', meta: { interface: 'input' }, schema: {} },
        { field: 'contact_email', type: 'string', meta: { interface: 'input' }, schema: {} },
      ],
    }, token);
    console.log('  ✓ services collection created');

    // Add M2O relation
    await request('POST', '/relations', {
      collection: 'services',
      field: 'vendor_id',
      related_collection: 'vendors',
    }, token);
    console.log('  ✓ services -> vendors relation created');
  } else {
    console.log('  → services collection already exists');
  }

  // Bookings collection
  if (!(await collectionExists(token, 'bookings'))) {
    console.log('Creating bookings collection...');
    await request('POST', '/collections', {
      collection: 'bookings',
      meta: {
        icon: 'event',
        note: 'Service booking requests',
        display_template: '{{customer_name}} - {{requested_date}}',
      },
      schema: {},
      fields: [
        { field: 'id', type: 'uuid', meta: { hidden: true }, schema: { is_primary_key: true } },
        { field: 'status', type: 'string', meta: { width: 'half', options: { choices: [{ text: 'Pending', value: 'pending' }, { text: 'Confirmed', value: 'confirmed' }, { text: 'Cancelled', value: 'cancelled' }] }, interface: 'select-dropdown' }, schema: { default_value: 'pending' } },
        { field: 'date_created', type: 'timestamp', meta: { special: ['date-created'], interface: 'datetime', readonly: true, hidden: true }, schema: {} },
        { field: 'service_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'], options: { template: '{{title}}' } }, schema: {} },
        { field: 'vendor_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'], options: { template: '{{name}}' } }, schema: {} },
        { field: 'customer_name', type: 'string', meta: { interface: 'input', required: true }, schema: { is_nullable: false } },
        { field: 'customer_email', type: 'string', meta: { interface: 'input', required: true }, schema: { is_nullable: false } },
        { field: 'customer_phone', type: 'string', meta: { interface: 'input' }, schema: {} },
        { field: 'requested_date', type: 'date', meta: { interface: 'datetime', required: true }, schema: { is_nullable: false } },
        { field: 'requested_time', type: 'string', meta: { interface: 'input' }, schema: {} },
        { field: 'message', type: 'text', meta: { interface: 'input-multiline' }, schema: {} },
        { field: 'notes', type: 'text', meta: { interface: 'input-multiline', note: 'Internal notes' }, schema: {} },
      ],
    }, token);
    console.log('  ✓ bookings collection created');

    // Add M2O relations
    await request('POST', '/relations', {
      collection: 'bookings',
      field: 'service_id',
      related_collection: 'services',
    }, token);
    await request('POST', '/relations', {
      collection: 'bookings',
      field: 'vendor_id',
      related_collection: 'vendors',
    }, token);
    console.log('  ✓ bookings relations created');
  } else {
    console.log('  → bookings collection already exists');
  }

  console.log('\nSchema creation complete!');
}

// Seed sample data
async function seedData(token) {
  console.log('\nSeeding sample marketplace data...');

  // Create vendors
  console.log('Creating vendors...');

  const vendor1 = await request('POST', '/items/vendors', {
    status: 'published',
    name: 'Farma Simić',
    slug: 'farma-simic',
    description: '<p>Porodična farma na obroncima Rudnika. Uzgajamo organski paradajz, papriku, krompir i ostalo sezonsko povrće. Držimo krave i koze za proizvodnju mleka i domaćeg kajmaka.</p>',
    category: 'farma',
    location: 'Rudnik',
    phone: '+381 64 123 4567',
    email: 'farma.simic@example.com',
    working_hours: 'Pon-Sub 7:00-18:00',
    featured: true,
  }, token);
  console.log('  ✓ Farma Simić created');

  const vendor2 = await request('POST', '/items/vendors', {
    status: 'published',
    name: 'Auto-elektrika Petrović',
    slug: 'auto-elektrika-petrovic',
    description: '<p>Profesionalna dijagnostika i popravka auto-elektrike. Preko 20 godina iskustva. Radimo sa svim markama vozila.</p>',
    category: 'popravke',
    location: 'Gornji Milanovac',
    phone: '+381 63 987 6543',
    email: 'autoelektrika.petrovic@example.com',
    working_hours: 'Pon-Pet 8:00-17:00, Sub 8:00-13:00',
    featured: true,
  }, token);
  console.log('  ✓ Auto-elektrika Petrović created');

  const vendor3 = await request('POST', '/items/vendors', {
    status: 'published',
    name: 'Kozmetički salon Jelena',
    slug: 'kozmeticki-salon-jelena',
    description: '<p>Moderni kozmetički salon u centru grada. Nudimo širok spektar tretmana za lice i telo, manikir, pedikir i profesionalnu šminku.</p>',
    category: 'lepota',
    location: 'Gornji Milanovac',
    phone: '+381 65 111 2222',
    email: 'salon.jelena@example.com',
    instagram: '@salonjelena_gm',
    working_hours: 'Pon-Sub 9:00-20:00',
    featured: false,
  }, token);
  console.log('  ✓ Kozmetički salon Jelena created');

  // Create products (linked to Farma Simić)
  console.log('\nCreating products...');

  await request('POST', '/items/products', {
    status: 'published',
    vendor_id: vendor1.data.id,
    title: 'Domaći med',
    slug: 'domaci-med',
    description: '<p>Čist lipov med sa naših pčelinjaka na Rudniku. Bez dodataka i primesa. Pakovanje 1kg.</p>',
    price: 800,
    price_unit: 'kg',
    category: 'med',
    available: true,
    featured: true,
  }, token);
  console.log('  ✓ Domaći med created');

  await request('POST', '/items/products', {
    status: 'published',
    vendor_id: vendor1.data.id,
    title: 'Svež kajmak',
    slug: 'svez-kajmak',
    description: '<p>Domaći kajmak od kravljeg mleka. Tradicionalna receptura, svež i kremast.</p>',
    price: 600,
    price_unit: 'kg',
    category: 'mlecni',
    available: true,
    featured: false,
  }, token);
  console.log('  ✓ Svež kajmak created');

  await request('POST', '/items/products', {
    status: 'published',
    vendor_id: vendor1.data.id,
    title: 'Organski paradajz',
    slug: 'organski-paradajz',
    description: '<p>Paradajz uzgojen bez pesticida i veštačkih đubriva. Sočan i ukusan, idealan za salate i sosove.</p>',
    price: 150,
    price_unit: 'kg',
    category: 'voce_povrce',
    available: true,
    featured: false,
  }, token);
  console.log('  ✓ Organski paradajz created');

  // Create services
  console.log('\nCreating services...');

  await request('POST', '/items/services', {
    status: 'published',
    vendor_id: vendor2.data.id,
    title: 'Dijagnostika automobila',
    slug: 'dijagnostika-automobila',
    description: '<p>Kompletna kompjuterska dijagnostika vozila. Očitavanje i brisanje grešaka, provera svih sistema.</p>',
    price_from: 2000,
    price_label: '2000 RSD',
    category: 'popravke',
    duration_minutes: 60,
    booking_enabled: true,
    available_days: 'Pon-Pet 8:00-17:00',
  }, token);
  console.log('  ✓ Dijagnostika automobila created');

  await request('POST', '/items/services', {
    status: 'published',
    vendor_id: vendor3.data.id,
    title: 'Manikir i pedikir',
    slug: 'manikir-i-pedikir',
    description: '<p>Kompletna nega ruku i nogu. Uključuje kupku, piliranje, oblikovanje noktiju i lakiranje.</p>',
    price_from: 1500,
    price_label: '1500 RSD',
    category: 'lepota',
    duration_minutes: 90,
    booking_enabled: true,
    available_days: 'Pon-Sub 9:00-20:00',
  }, token);
  console.log('  ✓ Manikir i pedikir created');

  console.log('\nSample data seeding complete!');
}

// Main execution
async function main() {
  try {
    console.log('='.repeat(50));
    console.log('Directus Marketplace Seed Script');
    console.log('='.repeat(50));
    console.log(`\nTarget: ${DIRECTUS_URL}`);
    console.log(`Admin: ${ADMIN_EMAIL}\n`);

    const token = await authenticate();

    if (!SKIP_SCHEMA) {
      await createSchema(token);
    }

    await seedData(token);

    console.log('\n' + '='.repeat(50));
    console.log('All done! Marketplace is ready.');
    console.log('='.repeat(50));
  } catch (error) {
    console.error('\nError:', error.message || error);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
    process.exit(1);
  }
}

main();
