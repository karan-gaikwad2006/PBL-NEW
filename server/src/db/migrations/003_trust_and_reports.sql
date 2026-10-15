ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ;

ALTER TABLE institutions
  ADD COLUMN IF NOT EXISTS darpan_id TEXT,
  ADD COLUMN IF NOT EXISTS section_80g BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS section_12a BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS fcra_status TEXT,
  ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS phone_verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verification_renewal_due DATE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'institutions_fcra_status_check'
      AND conrelid = 'institutions'::regclass
  ) THEN
    ALTER TABLE institutions
      ADD CONSTRAINT institutions_fcra_status_check
      CHECK (fcra_status IS NULL OR fcra_status IN ('not_applicable', 'registered', 'none'));
  END IF;
END $$;

ALTER TABLE institutions DROP CONSTRAINT IF EXISTS institutions_verification_status_check;
ALTER TABLE institutions
  ADD CONSTRAINT institutions_verification_status_check
  CHECK (verification_status IN ('pending', 'verified', 'rejected', 'under_review', 'renewal_required'));

ALTER TABLE requirements
  ADD COLUMN IF NOT EXISTS beneficiary_name TEXT,
  ADD COLUMN IF NOT EXISTS delivery_point TEXT,
  ADD COLUMN IF NOT EXISTS beneficiary_ack_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS visibility_status TEXT NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS extended_once BOOLEAN NOT NULL DEFAULT FALSE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'requirements_visibility_status_check'
      AND conrelid = 'requirements'::regclass
  ) THEN
    ALTER TABLE requirements
      ADD CONSTRAINT requirements_visibility_status_check
      CHECK (visibility_status IN ('normal', 'reduced'));
  END IF;
END $$;

ALTER TABLE support_offers
  ADD COLUMN IF NOT EXISTS handoff_at TIMESTAMPTZ;

ALTER TABLE support_offers DROP CONSTRAINT IF EXISTS support_offers_status_check;
ALTER TABLE support_offers
  ADD CONSTRAINT support_offers_status_check
  CHECK (status IN ('pending', 'accepted', 'declined', 'in_progress', 'completed', 'cancelled', 'handed_off', 'disputed'));

CREATE TABLE IF NOT EXISTS requirement_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requirement_id UUID NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN (
    'asks_money_outside_platform',
    'wrong_beneficiary',
    'fake_urgency',
    'other'
  )),
  note TEXT CHECK (note IS NULL OR char_length(note) <= 300),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (requirement_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS idx_requirement_reports_requirement_id ON requirement_reports(requirement_id);

CREATE TABLE IF NOT EXISTS trust_score_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'fulfilled',
    'expired_unfulfilled',
    'disputed',
    'non_response',
    'vouch',
    'vouch_received'
  )),
  score_delta INTEGER NOT NULL,
  related_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trust_score_events_user_id ON trust_score_events(user_id);

CREATE TABLE IF NOT EXISTS vouches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES support_offers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (donor_id, institution_id)
);

CREATE INDEX IF NOT EXISTS idx_vouches_institution_id ON vouches(institution_id);

CREATE TABLE IF NOT EXISTS user_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('aadhaar', 'pan')),
  file_name VARCHAR(255) NOT NULL,
  storage_provider VARCHAR(50) NOT NULL DEFAULT 'cloudinary',
  storage_public_id TEXT NOT NULL,
  resource_type VARCHAR(20) NOT NULL DEFAULT 'image' CHECK (resource_type IN ('image', 'raw')),
  file_format VARCHAR(20) NOT NULL,
  mime_type VARCHAR(100),
  file_size INTEGER,
  review_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'verified', 'rejected')),
  reviewed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_documents_user_id ON user_documents(user_id);
