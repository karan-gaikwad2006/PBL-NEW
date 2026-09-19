const fs = require('fs');
const path = require('path');

const REFERENCE_PATH = path.resolve(__dirname, '../../data reference/deficiency-seed-data-maharashtra.json');

function loadNutritionMappings() {
  const reference = JSON.parse(fs.readFileSync(REFERENCE_PATH, 'utf8'));
  return reference.deficiency_food_map || [];
}

function normalizeIndicatorName(value) {
  return String(value || '').trim().toLocaleLowerCase();
}

const INDICATOR_ALIASES = Object.freeze({
  stunting: 'children_under5_stunted_pct',
  wasting: 'children_under5_wasted_pct',
  'severe wasting': 'children_under5_severely_wasted_pct',
  underweight: 'children_under5_underweight_pct',
  'children under 5 years who are stunted': 'children_under5_stunted_pct',
  'children under 5 years who are wasted': 'children_under5_wasted_pct',
  'children under 5 years who are severely wasted': 'children_under5_severely_wasted_pct',
  'children under 5 years who are underweight': 'children_under5_underweight_pct',
  children_6to59m_anaemic_pct: 'children_6to59m_anaemic_pct',
  women_nonpregnant_anaemic_pct: 'women_nonpregnant_anaemic_pct',
  women_pregnant_anaemic_pct: 'women_pregnant_anaemic_pct',
});

function canonicalIndicatorName(value) {
  const normalized = normalizeIndicatorName(value);
  return INDICATOR_ALIASES[normalized] || normalized;
}

function calculateNutritionAttention(indicators = [], mappings = loadNutritionMappings()) {
  const validIndicators = indicators
    .map((indicator) => ({ ...indicator, value: Number(indicator.value) }))
    .filter((indicator) => Number.isFinite(indicator.value));

  if (validIndicators.length === 0) {
    return {
      level: 'UNAVAILABLE',
      label: 'Data Unavailable',
      score: null,
      recommendedFoodCategories: [],
    };
  }

  const relevantIndicatorNames = new Set(
    mappings.flatMap((mapping) => mapping.trigger_indicators.map(canonicalIndicatorName))
  );
  const relevantIndicators = validIndicators.filter((indicator) => relevantIndicatorNames.has(canonicalIndicatorName(indicator.name)));
  const scoredIndicators = relevantIndicators.length > 0 ? relevantIndicators : validIndicators;
  const score = scoredIndicators.reduce((total, indicator) => total + Math.max(0, Math.min(100, indicator.value)), 0) / scoredIndicators.length / 100;
  const triggeredMappings = mappings.filter((mapping) => mapping.trigger_indicators.some((indicatorName) => (
    validIndicators.some((indicator) => canonicalIndicatorName(indicator.name) === canonicalIndicatorName(indicatorName) && indicator.value >= Number(mapping.threshold_pct))
  )));
  const recommendedFoodCategories = [...new Set(triggeredMappings.flatMap((mapping) => mapping.recommended_food_categories))];

  let level = 'LOWER';
  let label = 'Lower Nutrition Attention';
  if (score >= 0.31) {
    level = 'VERY_HIGH';
    label = 'Very High Nutrition Attention';
  } else if (score >= 0.27) {
    level = 'HIGH';
    label = 'High Nutrition Attention';
  } else if (score >= 0.245) {
    level = 'MODERATE';
    label = 'Moderate Nutrition Attention';
  }

  return {
    level,
    label,
    score: Number(score.toFixed(4)),
    recommendedFoodCategories,
  };
}

module.exports = {
  canonicalIndicatorName,
  calculateNutritionAttention,
  loadNutritionMappings,
};