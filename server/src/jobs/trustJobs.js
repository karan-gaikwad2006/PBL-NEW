const { getPool } = require('../config/db');
const TRUST_CONFIG = require('../config/trust');

let renewalInterval;
let reminderInterval;

async function runRenewalJob() {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE institutions
       SET verification_status = 'renewal_required', updated_at = NOW()
       WHERE verification_status = 'verified'
         AND verification_renewal_due <= CURRENT_DATE + ($1 || ' days')::INTERVAL
       RETURNING id, name, created_by_user_id, verification_renewal_due`,
      [TRUST_CONFIG.RENEWAL_WARNING_DAYS]
    );
    for (const institution of rows) {
      if (!institution.created_by_user_id) continue;
      await client.query(
        `INSERT INTO audit_logs (action, entity_type, entity_id, details)
         VALUES ('verification_renewal_required', 'institution', $1, $2::jsonb)`,
        [institution.id, JSON.stringify({ dueDate: institution.verification_renewal_due })]
      );
      await client.query(
        `INSERT INTO notifications (user_id, type, title, message, related_entity_type, related_entity_id)
         VALUES ($1, 'verification_renewal_due', 'Institution verification renewal due',
           $2, 'institution', $3)`,
        [
          institution.created_by_user_id,
          `Please resubmit verification documents for ${institution.name}.`,
          institution.id,
        ]
      );
    }
    await client.query('COMMIT');
    return rows.length;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function runConfirmationReminderJob() {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `SELECT so.id, so.donor_user_id
       FROM support_offers so
       WHERE so.status = 'handed_off'
         AND so.handoff_at <= NOW() - ($1 || ' hours')::INTERVAL
         AND so.handoff_at >= NOW() - ($2 || ' hours')::INTERVAL
         AND NOT EXISTS (
           SELECT 1 FROM notifications n
           WHERE n.user_id = so.donor_user_id
             AND n.type = 'confirmation_window_closing'
             AND n.related_entity_type = 'offer'
             AND n.related_entity_id = so.id
         )`,
      [TRUST_CONFIG.REMINDER_AFTER_HOURS, TRUST_CONFIG.CONFIRMATION_WINDOW_HOURS]
    );
    for (const offer of rows) {
      await client.query(
        `INSERT INTO notifications (user_id, type, title, message, related_entity_type, related_entity_id)
         VALUES ($1, 'confirmation_window_closing', 'Please confirm your handoff',
           'Please confirm whether the handoff was completed or report an issue before the confirmation window closes.',
           'offer', $2)`,
        [offer.donor_user_id, offer.id]
      );
    }
    await client.query('COMMIT');
    return rows.length;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

function runSafely(job, name) {
  job().catch((error) => {
    console.error(`[TrustJobs] ${name} failed:`, error.message);
  });
}

function startTrustJobs() {
  if (renewalInterval || reminderInterval) return;
  runSafely(runRenewalJob, 'verification renewal');
  runSafely(runConfirmationReminderJob, 'confirmation reminder');
  renewalInterval = setInterval(
    () => runSafely(runRenewalJob, 'verification renewal'),
    24 * 60 * 60 * 1000
  );
  reminderInterval = setInterval(
    () => runSafely(runConfirmationReminderJob, 'confirmation reminder'),
    60 * 60 * 1000
  );
}

function stopTrustJobs() {
  if (renewalInterval) clearInterval(renewalInterval);
  if (reminderInterval) clearInterval(reminderInterval);
  renewalInterval = null;
  reminderInterval = null;
}

module.exports = {
  runConfirmationReminderJob,
  runRenewalJob,
  startTrustJobs,
  stopTrustJobs,
};
