const { getPool, query } = require('../config/db');

async function hasActiveOffer(donorId, requirementId, itemName) {
  const { rows } = await query(
    `SELECT id, status FROM support_offers
     WHERE donor_user_id = $1
       AND requirement_id = $2
       AND lower(item_name) = lower($3)
       AND status IN ('pending', 'accepted')
     LIMIT 1`,
    [donorId, requirementId, itemName]
  );
  return rows[0] || null;
}

async function getItemRemaining(requirementId, itemName) {
  const { rows } = await query(
    `SELECT quantity_remaining, quantity_required, unit
     FROM requirement_items
     WHERE requirement_id = $1
       AND lower(item_name) = lower($2)
     LIMIT 1`,
    [requirementId, itemName]
  );
  if (!rows[0]) return null;
  return {
    quantityRemaining: Number(rows[0].quantity_remaining),
    quantityRequired: Number(rows[0].quantity_required),
    unit: rows[0].unit,
  };
}

async function createOffer(donorId, requirementId, item) {
  const { rows } = await query(
    `INSERT INTO support_offers
     (requirement_id, donor_user_id, item_name, quantity_offered, unit, donor_message, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending')
     RETURNING *`,
    [requirementId, donorId, item.name, item.quantity, item.unit, item.message]
  );
  const offer = rows[0];

  // 1. Audit Log
  try {
    const { logAudit } = require('../utils/auditLogger');
    await logAudit({
      userId: donorId,
      action: 'offer_created',
      entityType: 'offer',
      entityId: offer.id,
      details: { requirementId, item: item.name, quantity: item.quantity, unit: item.unit },
    });
  } catch (e) {
    console.error('[Safety] Offer audit logging failed', e.message);
  }

  // 2. Notify requester of new support offer
  try {
    const notificationRepository = require('./notificationRepository');
    const { rows: reqRows } = await query(`SELECT requester_user_id FROM requirements WHERE id = $1`, [requirementId]);
    if (reqRows[0]) {
      await notificationRepository.createNotification(reqRows[0].requester_user_id, {
        type: 'offer_received',
        title: 'New Support Offer Received',
        message: `A donor has offered ${item.quantity} ${item.unit} of ${item.name} for your requirement.`,
        relatedEntityType: 'offer',
        relatedEntityId: offer.id,
      });
    }
  } catch (e) {
    console.error('Failed to create notification for offer creation', e);
  }

  return offer;
}

/**
 * Create multiple offers for a single requirement in one transaction.
 *
 * @param {string} donorId - authenticated donor user id
 * @param {string} requirementId - requirement being supported
 * @param {Array<{name: string, quantity: number, unit: string}>} items - items being offered
 * @param {string} message - optional donor message
 */
async function createMultiOffer(donorId, requirementId, items, message) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const createdOffers = [];

    for (const item of items) {
      const { rows } = await client.query(
        `INSERT INTO support_offers
         (requirement_id, donor_user_id, item_name, quantity_offered, unit, donor_message, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending')
         RETURNING *`,
        [requirementId, donorId, item.name, item.quantity, item.unit, message]
      );
      createdOffers.push(rows[0]);
    }

    await client.query('COMMIT');

    // Asynchronous safety & notifications (outside transaction)
    try {
      // 1. Audit Log (log the entire batch)
      const { logAudit } = require('../utils/auditLogger');
      await logAudit({
        userId: donorId,
        action: 'multi_offer_created',
        entityType: 'requirement',
        entityId: requirementId,
        details: { itemsCount: items.length, offerIds: createdOffers.map(o => o.id) },
      });

      // 2. Notify requester with one aggregated message
      const notificationRepository = require('./notificationRepository');
      const { rows: reqRows } = await query(`SELECT requester_user_id FROM requirements WHERE id = $1`, [requirementId]);
      if (reqRows[0]) {
        const itemSummary = items.map(i => `${i.quantity} ${i.unit} of ${i.name}`).join(', ');
        await notificationRepository.createNotification(reqRows[0].requester_user_id, {
          type: 'offer_received',
          title: 'Multiple Support Offers Received',
          message: `A donor has offered ${items.length} items (${itemSummary}) for your requirement.`,
          relatedEntityType: 'requirement',
          relatedEntityId: requirementId,
        });
      }
    } catch (e) {
      console.error('Post-multi-offer actions failed', e);
    }

    return createdOffers;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function findByDonorId(donorId, { limit = 50, offset = 0 } = {}) {
  const values = [donorId, Math.min(Math.max(Number(limit) || 50, 1), 100), Math.max(Number(offset) || 0, 0)];
  
  const { rows } = await query(
    `SELECT so.id, so.requirement_id, 'Food support for ' || r.beneficiary_count || ' beneficiaries' AS requirement_title,
            so.item_name, so.quantity_offered, so.unit, so.donor_message, so.status, so.created_at,
            u.full_name AS requester_name, d.name AS district, r.taluka
     FROM support_offers so
     JOIN requirements r ON r.id = so.requirement_id
     JOIN users u ON u.id = r.requester_user_id
     LEFT JOIN districts d ON d.id = r.district_id
     WHERE so.donor_user_id = $1
     ORDER BY so.created_at DESC
     LIMIT $2 OFFSET $3`,
    values
  );
  
  return rows.map(row => ({
    id: row.id,
    requirementId: row.requirement_id,
    requirementTitle: row.requirement_title,
    institution: row.requester_name,
    location: [row.taluka, row.district].filter(Boolean).join(', '),
    item: row.item_name,
    quantityOffered: `${row.quantity_offered} ${row.unit}`,
    status: row.status,
    offeredOn: row.created_at,
    message: row.donor_message,
    actionRequired: row.status === 'pending'
  }));
}

async function findByIdWithDetails(id) {
  const { rows } = await query(
    `SELECT so.id, so.requirement_id, so.donor_user_id, so.item_name, so.quantity_offered, so.unit,
            so.donor_message, so.status, so.created_at,
            'Food support for ' || r.beneficiary_count || ' beneficiaries' AS requirement_title, r.requester_user_id,
            u_req.full_name AS requester_name, d.name AS district, r.taluka,
            u_donor.full_name AS donor_name,
            sc.confirmed_by_donor, sc.donor_confirmed_at,
            sc.confirmed_by_requester, sc.requester_confirmed_at
     FROM support_offers so
     JOIN requirements r ON r.id = so.requirement_id
     JOIN users u_req ON u_req.id = r.requester_user_id
     JOIN users u_donor ON u_donor.id = so.donor_user_id
     LEFT JOIN districts d ON d.id = r.district_id
     LEFT JOIN support_confirmations sc ON sc.support_offer_id = so.id
     WHERE so.id = $1
     LIMIT 1`,
    [id]
  );
  if (!rows[0]) return null;
  const row = rows[0];
  return {
    id: row.id,
    requirementId: row.requirement_id,
    requesterUserId: row.requester_user_id,
    donorUserId: row.donor_user_id,
    requirementTitle: row.requirement_title || `Food support for beneficiaries`,
    requesterName: row.requester_name,
    donorName: row.donor_name,
    location: [row.taluka, row.district].filter(Boolean).join(', '),
    item: row.item_name,
    quantityOffered: Number(row.quantity_offered),
    unit: row.unit,
    status: row.status,
    offeredOn: row.created_at,
    donorMessage: row.donor_message,
    confirmedByDonor: Boolean(row.confirmed_by_donor),
    donorConfirmedAt: row.donor_confirmed_at,
    confirmedByRequester: Boolean(row.confirmed_by_requester),
    requesterConfirmedAt: row.requester_confirmed_at,
  };
}

async function confirmByDonor(offerId) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Ensure row exists in support_confirmations
    await client.query(
      `INSERT INTO support_confirmations (support_offer_id, confirmed_by_donor, donor_confirmed_at)
       VALUES ($1, TRUE, CURRENT_TIMESTAMP)
       ON CONFLICT (support_offer_id)
       DO UPDATE SET confirmed_by_donor = TRUE, donor_confirmed_at = CURRENT_TIMESTAMP`,
      [offerId]
    );

    // Update status to in_progress if pending
    await client.query(
      `UPDATE support_offers
       SET status = CASE WHEN status = 'pending' THEN 'accepted' ELSE status END
       WHERE id = $1`,
      [offerId]
    );

    // Check if both confirmed
    const { rows: confRows } = await client.query(
      `SELECT confirmed_by_donor, confirmed_by_requester FROM support_confirmations WHERE support_offer_id = $1`,
      [offerId]
    );
    
    let isFullyCompleted = false;
    if (confRows[0] && confRows[0].confirmed_by_donor && confRows[0].confirmed_by_requester) {
      await finalizeOfferCompletion(client, offerId);
      isFullyCompleted = true;
    }

    await client.query('COMMIT');

    // Notify requester that donor confirmed delivery
    try {
      const notificationRepository = require('./notificationRepository');
      const details = await findByIdWithDetails(offerId);
      if (details) {
        await notificationRepository.createNotification(details.requesterUserId, {
          type: 'donor_confirmed',
          title: 'Donor Confirmed Delivery',
          message: `${details.donorName} has confirmed delivery of ${details.quantityOffered} ${details.unit} of ${details.item}.`,
          relatedEntityType: 'offer',
          relatedEntityId: offerId,
        });
      }
    } catch (e) {
      console.error('Failed to create notification for donor confirmation', e);
    }

    return { isFullyCompleted };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function confirmByRequester(offerId) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Ensure row exists in support_confirmations
    await client.query(
      `INSERT INTO support_confirmations (support_offer_id, confirmed_by_requester, requester_confirmed_at)
       VALUES ($1, TRUE, CURRENT_TIMESTAMP)
       ON CONFLICT (support_offer_id)
       DO UPDATE SET confirmed_by_requester = TRUE, requester_confirmed_at = CURRENT_TIMESTAMP`,
      [offerId]
    );

    // Check if both confirmed
    const { rows: confRows } = await client.query(
      `SELECT confirmed_by_donor, confirmed_by_requester FROM support_confirmations WHERE support_offer_id = $1`,
      [offerId]
    );
    
    let isFullyCompleted = false;
    if (confRows[0] && confRows[0].confirmed_by_donor && confRows[0].confirmed_by_requester) {
      await finalizeOfferCompletion(client, offerId);
      isFullyCompleted = true;
    }

    await client.query('COMMIT');

    // Notify donor that requester confirmed receipt
    try {
      const notificationRepository = require('./notificationRepository');
      const details = await findByIdWithDetails(offerId);
      if (details) {
        await notificationRepository.createNotification(details.donorUserId, {
          type: 'requester_confirmed',
          title: 'Requester Confirmed Receipt',
          message: `${details.requesterName} has confirmed receipt of ${details.quantityOffered} ${details.unit} of ${details.item}.`,
          relatedEntityType: 'offer',
          relatedEntityId: offerId,
        });
      }
    } catch (e) {
      console.error('Failed to create notification for requester confirmation', e);
    }

    return { isFullyCompleted };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function finalizeOfferCompletion(client, offerId) {
  // 1. Mark offer as completed
  const { rows: offerRows } = await client.query(
    `UPDATE support_offers SET status = 'completed' WHERE id = $1 RETURNING requirement_id, donor_user_id, item_name, quantity_offered`,
    [offerId]
  );
  if (!offerRows[0]) return;
  const { requirement_id: reqId, donor_user_id: donorUserId, item_name: itemName, quantity_offered: qty } = offerRows[0];

  // 2. Deduct remaining quantity on requirement_items matching item_name
  await client.query(
    `UPDATE requirement_items
     SET quantity_remaining = GREATEST(0, quantity_remaining - $1)
     WHERE requirement_id = $2 AND lower(item_name) = lower($3)`,
    [qty, reqId, itemName]
  );

  // 3. Check overall requirement status
  const { rows: remRows } = await client.query(
    `SELECT SUM(quantity_remaining) AS total_remaining, SUM(quantity_required) AS total_required
     FROM requirement_items
     WHERE requirement_id = $1`,
    [reqId]
  );
  
  if (remRows[0]) {
    const totalRemaining = Number(remRows[0].total_remaining || 0);
    const totalRequired = Number(remRows[0].total_required || 0);

    if (totalRemaining <= 0 && totalRequired > 0) {
      await client.query(`UPDATE requirements SET status = 'fulfilled' WHERE id = $1`, [reqId]);
      
      // Notify requester and donor of fulfillment
      try {
        const notificationRepository = require('./notificationRepository');
        const { rows: reqOwnerRows } = await client.query(`SELECT requester_user_id FROM requirements WHERE id = $1`, [reqId]);
        if (reqOwnerRows[0]) {
          await notificationRepository.createNotification(reqOwnerRows[0].requester_user_id, {
            type: 'requirement_fulfilled',
            title: 'Requirement Fulfilled!',
            message: `All items for your requirement have been confirmed and completed.`,
            relatedEntityType: 'requirement',
            relatedEntityId: reqId,
          });
        }
      } catch (e) {
        console.error('Failed to send fulfillment notification', e);
      }
    } else if (totalRemaining < totalRequired) {
      await client.query(`UPDATE requirements SET status = 'partially_supported' WHERE id = $1 AND status = 'active'`, [reqId]);
    }
  }
}


async function findById(id) {
  const { rows } = await query(`SELECT * FROM support_offers WHERE id = $1 LIMIT 1`, [id]);
  return rows[0] || null;
}

/**
 * Calculate impact statistics for a specific donor.
 * Only counts offers with status='completed' (dual confirmation lifecycle).
 * Ownership is enforced by donor_user_id filter.
 *
 * @param {string} donorId - authenticated donor user id (from backend auth context)
 * @returns {{ totalFoodDonatedKg: number, beneficiariesReached: number, districtsSupported: number, districtNames: string[] }}
 */
async function getDonorImpact(donorId) {
  // 1. Total food donated: sum of quantity_offered from completed offers by this donor
  const { rows: foodRows } = await query(
    `SELECT COALESCE(SUM(so.quantity_offered), 0)::numeric AS total_food
     FROM support_offers so
     WHERE so.donor_user_id = $1
       AND so.status = 'completed'`,
    [donorId]
  );

  // 2. Beneficiaries reached: SUM of beneficiary_count from DISTINCT requirements
  //    that this donor has at least one completed offer for.
  //    Prevents double-counting when donor has multiple completed offers on same requirement.
  const { rows: benRows } = await query(
    `SELECT COALESCE(SUM(r.beneficiary_count), 0)::bigint AS beneficiaries
     FROM requirements r
     WHERE r.id IN (
       SELECT DISTINCT so.requirement_id
       FROM support_offers so
       WHERE so.donor_user_id = $1
         AND so.status = 'completed'
     )`,
    [donorId]
  );

  // 3. Districts supported: distinct districts from requirements with completed offers
  const { rows: districtRows } = await query(
    `SELECT DISTINCT d.name AS district
     FROM support_offers so
     JOIN requirements r ON r.id = so.requirement_id
     LEFT JOIN districts d ON d.id = r.district_id
     WHERE so.donor_user_id = $1
       AND so.status = 'completed'
       AND d.name IS NOT NULL
     ORDER BY d.name ASC`,
    [donorId]
  );

  const districtNames = districtRows.map(r => r.district);

  return {
    totalFoodDonatedKg: Number(foodRows[0]?.total_food || 0),
    beneficiariesReached: Number(benRows[0]?.beneficiaries || 0),
    districtsSupported: districtNames.length,
    districtNames,
  };
}

module.exports = {
  createOffer,
  createMultiOffer,
  findByDonorId,
  findById,
  findByIdWithDetails,
  confirmByDonor,
  confirmByRequester,
  hasActiveOffer,
  getItemRemaining,
  getDonorImpact,
};


