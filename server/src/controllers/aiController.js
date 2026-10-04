/**
 * AI Controller — thin transport/presentation layer for the optional AI features.
 *
 * Contains no business logic: it validates input, assembles the facts from the
 * EXISTING repositories, delegates to the AI services, and shapes the response.
 *
 * The matching engine's scoring is never recomputed or second-guessed here. Its output
 * (`matchMetadata`) is treated as the already-decided match, and `POST /api/v1/matching`
 * itself is untouched.
 */

const { successResponse, AppError } = require('../utils/response');
const { requireUUID } = require('../validators/commonValidators');
const requirementRepository = require('../repositories/requirementRepository');
const districtRepository = require('../repositories/districtRepository');
const aiExplanationService = require('../services/aiExplanationService');
const aiParserService = require('../services/aiParserService');
const { canonicalIndicatorName } = require('../services/nutritionAttention');

const MAX_DONATION_TEXT_LENGTH = 2000;
const MAX_TEXT_FIELD_LENGTH = 200;

// Neutral label taken from the static deficiency_food_map ('general-diversity' entry).
const DEFAULT_NUTRIENT_CATEGORY = 'General dietary diversity';

function requireObject(value, fieldName) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new AppError(`${fieldName} must be an object`, 422);
  }
  return value;
}

function requireShortString(value, fieldName) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(`${fieldName} is required and must be a non-empty string`, 422);
  }
  const text = value.trim();
  if (text.length > MAX_TEXT_FIELD_LENGTH) {
    throw new AppError(`${fieldName} must be ${MAX_TEXT_FIELD_LENGTH} characters or fewer`, 422);
  }
  return text;
}

/**
 * Pull the narration inputs out of a match result produced by POST /api/v1/matching.
 *
 * `matchedDeficiencyEntries` identifies WHICH indicator and nutrient category the
 * deterministic engine used. `matchedItems` identifies the food and quantity.
 *
 * Note: `matchedDeficiencyEntries` is currently empty for every match, because
 * `requirementRepository` does not select `nutritionIndicators`, so the engine's
 * deficiency-relevance component always scores 0. Populating it would change the
 * matching engine's scoring output, which this layer must not do. The indicator and
 * nutrient category are therefore also accepted directly on `matchMetadata`; the
 * indicator VALUE is still re-read from the database rather than trusted, and the
 * state-vs-district flag is still resolved server-side.
 *
 * @returns {{indicatorName:string, nutrientCategory:string, foodItem:string, quantity:number, unit:string, hasDeficiencyRationale:boolean}}
 */
function extractMatchContext(matchMetadata) {
  const metadata = requireObject(matchMetadata, 'matchMetadata');

  const entries = Array.isArray(metadata.matchedDeficiencyEntries) ? metadata.matchedDeficiencyEntries : [];
  const entry = entries.length > 0 ? requireObject(entries[0], 'matchMetadata.matchedDeficiencyEntries[0]') : {};

  const matchedItems = Array.isArray(metadata.matchedItems) ? metadata.matchedItems : [];
  if (matchedItems.length === 0) {
    throw new AppError('matchMetadata.matchedItems is required to explain a match', 422);
  }
  const matched = requireObject(matchedItems[0], 'matchMetadata.matchedItems[0]');
  const requirementItem = requireObject(
    matched.requirementItem ?? matched.requirement_item,
    'matchMetadata.matchedItems[0].requirementItem',
  );

  const indicatorName = entry.indicator ?? entry.indicatorName ?? metadata.indicatorName ?? metadata.indicator;
  if (typeof indicatorName !== 'string' || !indicatorName.trim()) {
    throw new AppError(
      'An indicator name is required to explain a match (matchMetadata.matchedDeficiencyEntries[0].indicator)',
      422,
    );
  }

  // 'General dietary diversity' is a real entry in the static deficiency_food_map and is
  // the honest neutral label when the engine supplied no deficiency rationale. It is a
  // fallback label, not a nutrition recommendation.
  const nutrientCategory =
    entry.nutrientCategory ?? entry.nutrient_category ?? metadata.nutrientCategory ?? DEFAULT_NUTRIENT_CATEGORY;

  const quantityRemaining = Number(requirementItem.quantityRemaining ?? requirementItem.quantity_remaining);
  const quantityRequired = Number(requirementItem.quantityRequired ?? requirementItem.quantity_required);
  const quantity = Number.isFinite(quantityRemaining) && quantityRemaining >= 0
    ? quantityRemaining
    : quantityRequired;

  if (!Number.isFinite(quantity)) {
    throw new AppError('matchMetadata.matchedItems[0].requirementItem must carry a usable quantity', 422);
  }

  return {
    indicatorName: requireShortString(indicatorName, 'indicatorName'),
    nutrientCategory: requireShortString(nutrientCategory, 'nutrientCategory'),
    foodItem: requireShortString(
      requirementItem.name ?? requirementItem.item_name ?? requirementItem.item,
      'matchMetadata.matchedItems[0].requirementItem.name',
    ),
    quantity,
    unit: typeof requirementItem.unit === 'string' ? requirementItem.unit.trim() : '',
    hasDeficiencyRationale: entries.length > 0,
  };
}

/** Look up the authoritative indicator value for this district, straight from the DB. */
async function findDistrictIndicatorValue(districtName, indicatorName) {
  const districtId = await requirementRepository.findDistrictId(districtName);
  if (!districtId) return null;

  const district = await districtRepository.findById(districtId);
  if (!district) return null;

  const indicators = Array.isArray(district.nutritionIndicators) ? district.nutritionIndicators : [];
  const target = canonicalIndicatorName(indicatorName);
  const match = indicators.find((indicator) => canonicalIndicatorName(indicator?.name) === target);
  if (!match) return null;

  const value = Number(match.value);
  return Number.isFinite(value) ? value : null;
}

/**
 * POST /api/v1/ai/explain
 * Body: { requirementId, matchMetadata }
 * Returns: { explanation, source, dataSource, ... }
 */
async function explainMatch(req, res, next) {
  try {
    const requirementId = requireUUID(req.body?.requirementId, 'requirementId');
    const context = extractMatchContext(req.body?.matchMetadata);

    const requirement = await requirementRepository.findById(requirementId);
    if (!requirement) {
      throw new AppError('Requirement not found', 404);
    }

    // The indicator VALUE is re-read from the database rather than trusted from the
    // request body, so the narrated percentage is always official reference data.
    const indicatorValue = await findDistrictIndicatorValue(requirement.district, context.indicatorName);
    if (indicatorValue === null) {
      throw new AppError(
        `No nutrition indicator "${context.indicatorName}" is available for ${requirement.district}`,
        422,
      );
    }

    // Server-resolved, never client-supplied: this is what stops a state-average figure
    // from ever being worded as a district-specific one.
    const dataSource = aiExplanationService.resolveDataSource(requirement.district);

    const quantityLabel = context.unit ? `${context.quantity} ${context.unit}` : String(context.quantity);

    const { explanation, source } = await aiExplanationService.explainMatch({
      district: requirement.district,
      indicatorName: context.indicatorName,
      indicatorValue,
      dataSource,
      nutrientCategory: context.nutrientCategory,
      institutionName: requirement.institutionName,
      foodItem: context.foodItem,
      quantity: quantityLabel,
    });

    return successResponse(res, 'Match explanation generated', {
      requirementId,
      explanation,
      source,
      // Surfaced so the client can label fallback districts, as the reference
      // dataset's data_quality_note requires.
      dataSource,
      // False when the deterministic engine supplied no deficiency rationale, so the UI
      // does not imply one.
      hasDeficiencyRationale: context.hasDeficiencyRationale,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/ai/parse-donation
 * Body: { text }
 * Returns: { items: [] } — an empty array means "could not parse, use the manual fields".
 */
async function parseDonationText(req, res, next) {
  try {
    const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    if (!text) {
      throw new AppError('text is required and must be a non-empty string', 422);
    }
    if (text.length > MAX_DONATION_TEXT_LENGTH) {
      throw new AppError(`text must be ${MAX_DONATION_TEXT_LENGTH} characters or fewer`, 422);
    }

    const items = await aiParserService.parseFoodText(text);

    return successResponse(res, 'Donation text parsed', {
      items,
      parsed: items.length > 0,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  explainMatch,
  parseDonationText,
  extractMatchContext,
  findDistrictIndicatorValue,
};
