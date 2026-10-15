require('dotenv').config();

const { getEnv } = require('../config/env');
const { getPool, closePool } = require('../config/db');

const IDS = Object.freeze({
  users: {
    donorOne: '10000000-0000-4000-8000-000000000001',
    donorTwo: '10000000-0000-4000-8000-000000000002',
    requesterOne: '10000000-0000-4000-8000-000000000003',
    requesterTwo: '10000000-0000-4000-8000-000000000004',
    institutionUser: '10000000-0000-4000-8000-000000000005',
    admin: '10000000-0000-4000-8000-000000000006',
  },
  institution: '20000000-0000-4000-8000-000000000001',
  requirements: {
    activeNashik: '30000000-0000-4000-8000-000000000001',
    partialPune: '30000000-0000-4000-8000-000000000002',
    fulfilledSolapur: '30000000-0000-4000-8000-000000000003',
    reviewInstitution: '30000000-0000-4000-8000-000000000004',
    activeAmravati: '30000000-0000-4000-8000-000000000005',
  },
  items: [
    '40000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000002',
    '40000000-0000-4000-8000-000000000003',
    '40000000-0000-4000-8000-000000000004',
    '40000000-0000-4000-8000-000000000005',
    '40000000-0000-4000-8000-000000000006',
    '40000000-0000-4000-8000-000000000007',
  ],
  offers: [
    '50000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000002',
    '50000000-0000-4000-8000-000000000003',
    '50000000-0000-4000-8000-000000000004',
    '50000000-0000-4000-8000-000000000005',
    '50000000-0000-4000-8000-000000000006',
  ],
});

const USERS = [
  [IDS.users.donorOne, 'demo.donor.one@demo.poshansetu.invalid', 'DEMO - Aarav Kulkarni', 'donor'],
  [IDS.users.donorTwo, 'demo.donor.two@demo.poshansetu.invalid', 'DEMO - Meera Joshi', 'donor'],
  [IDS.users.requesterOne, 'demo.requester.one@demo.poshansetu.invalid', 'DEMO - Savita Patil', 'requester'],
  [IDS.users.requesterTwo, 'demo.requester.two@demo.poshansetu.invalid', 'DEMO - Nilesh Shinde', 'requester'],
  [IDS.users.institutionUser, 'demo.institution@demo.poshansetu.invalid', 'DEMO - Rohan Deshmukh', 'institution'],
  [IDS.users.admin, 'demo.admin@demo.poshansetu.invalid', 'DEMO - PoshanSetu Reviewer', 'admin'],
];

const REQUIREMENTS = [
  {
    id: IDS.requirements.activeNashik,
    requester: IDS.users.requesterOne,
    district: 'nashik',
    taluka: 'Dindori',
    beneficiaryCount: 24,
    urgency: 'high',
    status: 'active',
    description: 'DEMO DATA: Synthetic sample food requirement for previewing the district needs and donor support flows. This is not a real request.',
    daysAgo: 3,
  },
  {
    id: IDS.requirements.partialPune,
    requester: IDS.users.requesterTwo,
    district: 'pune',
    taluka: 'Baramati',
    beneficiaryCount: 18,
    urgency: 'medium',
    status: 'partially_supported',
    description: 'DEMO DATA: Synthetic partially supported requirement for interface preview only. This is not a real request.',
    daysAgo: 8,
  },
  {
    id: IDS.requirements.fulfilledSolapur,
    requester: IDS.users.requesterTwo,
    district: 'solapur',
    taluka: 'Pandharpur',
    beneficiaryCount: 12,
    urgency: 'low',
    status: 'fulfilled',
    description: 'DEMO DATA: Synthetic completed requirement for previewing confirmed support history. This is not a real request.',
    daysAgo: 14,
  },
  {
    id: IDS.requirements.reviewInstitution,
    requester: IDS.users.institutionUser,
    institution: IDS.institution,
    district: 'amravati',
    taluka: 'Dharni',
    beneficiaryCount: 32,
    urgency: 'high',
    status: 'under_review',
    description: 'DEMO DATA: Synthetic institution requirement awaiting review in the demo dataset. This is not a real request.',
    daysAgo: 1,
  },
  {
    id: IDS.requirements.activeAmravati,
    requester: IDS.users.requesterOne,
    district: 'amravati',
    taluka: 'Achalpur',
    beneficiaryCount: 20,
    urgency: 'medium',
    status: 'active',
    description: 'DEMO DATA: Synthetic active requirement for previewing support status and district browsing. This is not a real request.',
    daysAgo: 5,
  },
];

const ITEMS = [
  [IDS.items[0], IDS.requirements.activeNashik, 'Rice', 'Grains & Cereals', 80, 80, 'kg'],
  [IDS.items[1], IDS.requirements.activeNashik, 'Tur Dal', 'Pulses & Legumes', 40, 40, 'kg'],
  [IDS.items[2], IDS.requirements.partialPune, 'Wheat Flour', 'Grains & Cereals', 100, 60, 'kg'],
  [IDS.items[3], IDS.requirements.fulfilledSolapur, 'Rice', 'Grains & Cereals', 50, 0, 'kg'],
  [IDS.items[4], IDS.requirements.reviewInstitution, 'Moong Dal', 'Pulses & Legumes', 60, 60, 'kg'],
  [IDS.items[5], IDS.requirements.activeAmravati, 'Groundnut Oil', 'Vegetables & Fruits', 24, 24, 'litres'],
  [IDS.items[6], IDS.requirements.activeAmravati, 'Rice', 'Grains & Cereals', 90, 90, 'kg'],
];

const OFFERS = [
  {
    id: IDS.offers[0],
    requirement: IDS.requirements.activeNashik,
    donor: IDS.users.donorOne,
    item: 'Rice',
    quantity: 20,
    unit: 'kg',
    status: 'pending',
    message: 'DEMO DATA: Pending offer example.',
    daysAgo: 1,
  },
  {
    id: IDS.offers[1],
    requirement: IDS.requirements.partialPune,
    donor: IDS.users.donorOne,
    item: 'Wheat Flour',
    quantity: 40,
    unit: 'kg',
    status: 'completed',
    message: 'DEMO DATA: Dual-confirmed historical support example.',
    daysAgo: 6,
  },
  {
    id: IDS.offers[2],
    requirement: IDS.requirements.fulfilledSolapur,
    donor: IDS.users.donorOne,
    item: 'Rice',
    quantity: 50,
    unit: 'kg',
    status: 'completed',
    message: 'DEMO DATA: Dual-confirmed completed support example.',
    daysAgo: 12,
  },
  {
    id: IDS.offers[3],
    requirement: IDS.requirements.activeAmravati,
    donor: IDS.users.donorTwo,
    item: 'Groundnut Oil',
    quantity: 6,
    unit: 'litres',
    status: 'handed_off',
    message: 'DEMO DATA: Handoff awaiting both confirmations.',
    daysAgo: 0,
  },
  {
    id: IDS.offers[4],
    requirement: IDS.requirements.activeAmravati,
    donor: IDS.users.donorOne,
    item: 'Rice',
    quantity: 15,
    unit: 'kg',
    status: 'in_progress',
    message: 'DEMO DATA: Accepted offer in progress.',
    daysAgo: 2,
  },
  {
    id: IDS.offers[5],
    requirement: IDS.requirements.activeNashik,
    donor: IDS.users.donorTwo,
    item: 'Tur Dal',
    quantity: 10,
    unit: 'kg',
    status: 'disputed',
    message: 'DEMO DATA: Synthetic dispute example; no real-world allegation.',
    daysAgo: 0,
    handedOff: true,
  },
];

function assertDevelopmentSeedInvocation() {
  const args = new Set(process.argv.slice(2));
  if (!args.has('--apply') || !args.has('--target=development')) {
    throw new Error(
      'Refusing to seed without explicit confirmation. Run with --apply --target=development.'
    );
  }
  if (getEnv('NODE_ENV', 'development') !== 'development') {
    throw new Error('Demo data may only be seeded when NODE_ENV is development.');
  }
}

async function insertUsers(client) {
  for (const [id, email, fullName, role] of USERS) {
    await client.query(
      `INSERT INTO users (id, firebase_uid, email, full_name, role, status)
       VALUES ($1, NULL, $2, $3, $4, 'active')
       ON CONFLICT (id) DO NOTHING`,
      [id, email, fullName, role]
    );
  }
}

async function insertInstitution(client) {
  await client.query(
    `INSERT INTO institutions
       (id, name, organization_type, description, district_id, address,
        contact_email, verification_status, created_by_user_id)
     VALUES (
       $1, 'DEMO - Amravati Community Learning Centre', 'Community organization',
       'DEMO DATA: Synthetic institution profile for preview only; it is not a real organization.',
       (SELECT id FROM districts WHERE slug = 'amravati'),
       'DEMO address, Dharni, Amravati District',
       'demo.institution@demo.poshansetu.invalid', 'pending', $2
     )
     ON CONFLICT (id) DO NOTHING`,
    [IDS.institution, IDS.users.institutionUser]
  );
}

async function insertRequirements(client) {
  for (const requirement of REQUIREMENTS) {
    await client.query(
      `INSERT INTO requirements
         (id, requester_user_id, institution_id, district_id, taluka, address,
          landmark, contact_name, contact_phone, beneficiary_count,
          beneficiary_description, beneficiary_name, delivery_point, urgency,
          status, expires_at, description, submitted_at, visibility_status)
       VALUES (
         $1, $2, $3, (SELECT id FROM districts WHERE slug = $4::text), $5::text,
         'DEMO address, ' || $5::text || ', ' || initcap($4::text) || ' District',
         'DEMO landmark', 'DEMO contact', NULL, $6,
         'DEMO DATA: Synthetic beneficiary group for interface preview only.',
         'DEMO beneficiary contact', 'DEMO collection point', $7, $8,
         NOW() + INTERVAL '21 days', $9,
         NOW() - ($10 * INTERVAL '1 day'), 'normal'
       )
       ON CONFLICT (id) DO NOTHING`,
      [
        requirement.id,
        requirement.requester,
        requirement.institution || null,
        requirement.district,
        requirement.taluka,
        requirement.beneficiaryCount,
        requirement.urgency,
        requirement.status,
        requirement.description,
        requirement.daysAgo,
      ]
    );
  }
}

async function insertRequirementItems(client) {
  for (const [id, requirementId, itemName, category, required, remaining, unit] of ITEMS) {
    await client.query(
      `INSERT INTO requirement_items
         (id, requirement_id, item_name, category, quantity_required, quantity_remaining, unit)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING`,
      [id, requirementId, itemName, category, required, remaining, unit]
    );
  }
}

async function insertOffers(client) {
  for (const offer of OFFERS) {
    await client.query(
      `INSERT INTO support_offers
         (id, requirement_id, donor_user_id, item_name, quantity_offered, unit,
          donor_message, status, created_at, handoff_at)
       VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8,
         NOW() - ($9 * INTERVAL '1 day'),
         CASE WHEN $10 THEN NOW() - INTERVAL '2 hours' ELSE NULL END
       )
       ON CONFLICT (id) DO NOTHING`,
      [
        offer.id,
        offer.requirement,
        offer.donor,
        offer.item,
        offer.quantity,
        offer.unit,
        offer.message,
        offer.status,
        offer.daysAgo,
        Boolean(offer.handedOff || offer.status === 'handed_off' || offer.status === 'disputed'),
      ]
    );
  }

  for (const offerIndex of [1, 2]) {
    const offer = OFFERS[offerIndex];
    await client.query(
      `INSERT INTO support_confirmations
         (support_offer_id, confirmed_by_donor, donor_confirmed_at,
          confirmed_by_requester, requester_confirmed_at)
       VALUES (
         $1, TRUE, NOW() - INTERVAL '5 days',
         TRUE, NOW() - INTERVAL '5 days'
       )
       ON CONFLICT (support_offer_id) DO NOTHING`,
      [offer.id]
    );
  }
}

async function insertModerationAndTrustData(client) {
  await client.query(
    `INSERT INTO requirement_reports (id, requirement_id, reporter_id, reason, note)
     VALUES (
       '80000000-0000-4000-8000-000000000001', $1, $2, 'other',
       'DEMO DATA: Synthetic report example; not a real-world allegation.'
     )
     ON CONFLICT (id) DO NOTHING`,
    [IDS.requirements.activeNashik, IDS.users.donorTwo]
  );

  await client.query(
    `INSERT INTO fraud_signals
       (id, entity_type, entity_id, signal_type, severity, description, status)
     VALUES (
       '90000000-0000-4000-8000-000000000001', 'requirement', $1,
       'demo_review_sample', 'low',
       'DEMO DATA: Synthetic moderation queue example; no real person or request is flagged.',
       'pending'
     )
     ON CONFLICT (id) DO NOTHING`,
    [IDS.requirements.reviewInstitution]
  );

  await client.query(
    `INSERT INTO admin_reviews (id, admin_user_id, entity_type, entity_id, decision, notes)
     VALUES (
       'a0000000-0000-4000-8000-000000000001', $1, 'requirement', $2,
       'demo_review_pending', 'DEMO DATA: Synthetic review queue item; no real-world decision.'
     )
     ON CONFLICT (id) DO NOTHING`,
    [IDS.users.admin, IDS.requirements.reviewInstitution]
  );

  const trustEvents = [
    ['c0000000-0000-4000-8000-000000000001', IDS.users.donorOne, 'fulfilled', 5, IDS.offers[1]],
    ['c0000000-0000-4000-8000-000000000002', IDS.users.donorOne, 'fulfilled', 5, IDS.offers[2]],
    ['c0000000-0000-4000-8000-000000000003', IDS.users.requesterTwo, 'fulfilled', 5, IDS.requirements.fulfilledSolapur],
    ['c0000000-0000-4000-8000-000000000004', IDS.users.donorTwo, 'disputed', -2, IDS.offers[5]],
  ];
  for (const [id, userId, eventType, scoreDelta, relatedId] of trustEvents) {
    await client.query(
      `INSERT INTO trust_score_events (id, user_id, event_type, score_delta, related_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`,
      [id, userId, eventType, scoreDelta, relatedId]
    );
  }
}

async function insertNotificationsAndAuditData(client) {
  const notifications = [
    [IDS.users.requesterOne, 'offer_received', 'DEMO - A donor offered food support', 'DEMO DATA: Synthetic pending offer notification.', 'offer', IDS.offers[0]],
    [IDS.users.requesterTwo, 'request_approved', 'DEMO - Requirement is active', 'DEMO DATA: Synthetic example notification for a demo requirement.', 'requirement', IDS.requirements.partialPune],
    [IDS.users.donorOne, 'requester_confirmed', 'DEMO - Receipt confirmed', 'DEMO DATA: Synthetic dual-confirmed support notification.', 'offer', IDS.offers[1]],
    [IDS.users.institutionUser, 'requirement_submitted', 'DEMO - Requirement submitted for review', 'DEMO DATA: Synthetic institution review notification.', 'requirement', IDS.requirements.reviewInstitution],
    [IDS.users.admin, 'report_received', 'DEMO - A requirement was reported', 'DEMO DATA: Synthetic moderation notification; no real-world allegation.', 'requirement', IDS.requirements.activeNashik],
  ];

  for (const [index, notification] of notifications.entries()) {
    await client.query(
      `INSERT INTO notifications
         (id, user_id, type, title, message, related_entity_type, related_entity_id, is_read)
       VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE)
       ON CONFLICT (id) DO NOTHING`,
      [`70000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, ...notification]
    );
  }

  const auditEvents = [
    [IDS.users.requesterOne, 'demo_requirement_created', 'requirement', IDS.requirements.activeNashik],
    [IDS.users.admin, 'demo_requirement_reviewed', 'requirement', IDS.requirements.reviewInstitution],
    [IDS.users.donorOne, 'demo_support_completed', 'offer', IDS.offers[1]],
  ];
  for (const [index, [userId, action, entityType, entityId]] of auditEvents.entries()) {
    await client.query(
      `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb)
       ON CONFLICT (id) DO NOTHING`,
      [
        `b0000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
        userId,
        action,
        entityType,
        entityId,
        JSON.stringify({ demo: true, notice: 'Synthetic development preview data only.' }),
      ]
    );
  }
}

async function verifySeed(client) {
  const { rows } = await client.query(
    `SELECT
       (SELECT COUNT(*)::int FROM users WHERE id = ANY($1::uuid[])) AS users,
       (SELECT COUNT(*)::int FROM requirements WHERE id = ANY($2::uuid[])) AS requirements,
       (SELECT COUNT(*)::int FROM requirement_items WHERE id = ANY($3::uuid[])) AS items,
       (SELECT COUNT(*)::int FROM support_offers WHERE id = ANY($4::uuid[])) AS offers,
       (SELECT COUNT(*)::int FROM support_confirmations WHERE support_offer_id = ANY($4::uuid[])) AS confirmations,
       (SELECT COUNT(*)::int FROM notifications WHERE id::text LIKE '70000000-0000-4000-8000-%') AS notifications,
       (SELECT COUNT(*)::int FROM requirement_reports WHERE id = '80000000-0000-4000-8000-000000000001') AS reports,
       (SELECT COUNT(*)::int FROM fraud_signals WHERE id = '90000000-0000-4000-8000-000000000001') AS fraud_signals,
       (SELECT COUNT(*)::int FROM audit_logs WHERE id::text LIKE 'b0000000-0000-4000-8000-%') AS audit_events,
       (SELECT COUNT(*)::int FROM trust_score_events WHERE id::text LIKE 'c0000000-0000-4000-8000-%') AS trust_events`,
    [
      USERS.map(([id]) => id),
      REQUIREMENTS.map(({ id }) => id),
      IDS.items,
      IDS.offers,
    ]
  );
  return rows[0];
}

async function seedDemoData() {
  assertDevelopmentSeedInvocation();
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL is required to seed development demo data.');

  const client = await pool.connect();
  try {
    const { rows: targetRows } = await client.query(
      `SELECT current_database() AS database_name, current_setting('server_version') AS server_version`
    );
    console.log(`[DEMO SEED] Target confirmed by caller: development; database: ${targetRows[0].database_name}`);
    console.log(`[DEMO SEED] PostgreSQL ${targetRows[0].server_version}`);
    const { rows: districtRows } = await client.query(
      `SELECT slug FROM districts WHERE slug = ANY($1::text[])`,
      [['nashik', 'pune', 'solapur', 'amravati']]
    );
    const existingDistricts = new Set(districtRows.map(({ slug }) => slug));
    const missingDistricts = ['nashik', 'pune', 'solapur', 'amravati']
      .filter((slug) => !existingDistricts.has(slug));
    if (missingDistricts.length > 0) {
      throw new Error(`Required reference districts are missing: ${missingDistricts.join(', ')}.`);
    }

    await client.query('BEGIN');
    await insertUsers(client);
    await insertInstitution(client);
    await insertRequirements(client);
    await insertRequirementItems(client);
    await insertOffers(client);
    await insertModerationAndTrustData(client);
    await insertNotificationsAndAuditData(client);
    const counts = await verifySeed(client);
    await client.query('COMMIT');

    console.log('[DEMO SEED] Synthetic records are clearly labeled and cannot authenticate with Firebase.');
    console.log('[DEMO SEED] Uploaded identity files and official nutrition indicators were not created or changed.');
    console.log(`[DEMO SEED] Verified records: ${JSON.stringify(counts)}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await closePool();
  }
}

if (require.main === module) {
  seedDemoData().catch(async (error) => {
    console.error('[DEMO SEED] Failed:', error.message);
    await closePool();
    process.exitCode = 1;
  });
}

module.exports = { seedDemoData };
