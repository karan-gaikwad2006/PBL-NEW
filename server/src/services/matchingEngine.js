const fs = require('fs');
const path = require('path');
const { getEnv } = require('../config/env');

// DETERMINISTIC MATCHING ENGINE:
// This module must remain deterministic.
// Do not add AI/LLM calls here.
// AI is used only by a separate explanation/presentation layer and may only narrate facts already produced by this engine.

const DEFICIENCY_DATA_PATH = path.resolve(__dirname, '../../data reference/deficiency-seed-data-maharashtra.json');

const DEFAULT_MATCHING_CONFIG = Object.freeze({
  weights: Object.freeze({
    proximity: 0.30,
    foodMatch: 0.30,
    deficiencyRelevance: 0.20,
    urgency: 0.10,
    remainingNeed: 0.10,
  }),
  maxRadiusKm: 50,
});

const FOOD_FAMILIES = [
  ['moong dal', 'chana dal', 'toor dal', 'tur dal', 'mixed dal', 'dal', 'pulses', 'pulses & legumes'],
  ['rice', 'basmati rice', 'kolam rice'],
  ['wheat', 'wheat flour', 'atta'],
  ['jowar', 'sorghum'],
  ['bajra', 'pearl millet'],
  ['ragi', 'finger millet'],
  ['chana', 'chickpeas', 'gram'],
  ['green leafy vegetables', 'leafy vegetables', 'seasonal vegetables', 'vegetables'],
  ['jaggery'],
  ['peanuts', 'groundnuts'],
  ['milk powder', 'milk'],
  ['soya', 'soy'],
  ['groundnut oil', 'edible oil', 'fortified edible oil'],
];

const FOOD_ALIASES = new Map([
  ['ragi finger millet', 'ragi'],
  ['rice basmati kolam', 'rice'],
  ['wheat flour atta', 'wheat'],
  ['moong dal green gram', 'moong dal'],
  ['tur dal pigeon peas', 'toor dal'],
]);

function normalizeFood(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[()\-/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function canonicalFood(value) {
  const normalized = normalizeFood(value);
  return FOOD_ALIASES.get(normalized) || normalized;
}

function getFoodFamily(value) {
  const normalized = normalizeFood(value);
  return FOOD_FAMILIES.find((family) => family.includes(normalized) || family.some((item) => normalized.includes(item))) || null;
}

function foodMatchScore(donorItem, requirementItem) {
  const donorName = typeof donorItem === 'object' ? donorItem.item || donorItem.name : donorItem;
  const requirementName = typeof requirementItem === 'object' ? requirementItem.item || requirementItem.name : requirementItem;
  const donor = canonicalFood(donorName);
  const requirement = canonicalFood(requirementName);
  if (!donor || !requirement) return 0;
  if (donor === requirement) return 1;
  if (getFoodFamily(donor)?.some((item) => getFoodFamily(requirement)?.includes(item))) return 0.5;
  return 0;
}

function validCoordinate(value, min, max) {
  return Number.isFinite(Number(value)) && Number(value) >= min && Number(value) <= max;
}

function haversineDistanceKm(first, second) {
  if (!first || !second || !validCoordinate(first.lat, -90, 90) || !validCoordinate(second.lat, -90, 90) ||
      !validCoordinate(first.lng, -180, 180) || !validCoordinate(second.lng, -180, 180)) return null;
  const earthRadiusKm = 6371;
  const latitudeDelta = (Number(second.lat) - Number(first.lat)) * Math.PI / 180;
  const longitudeDelta = (Number(second.lng) - Number(first.lng)) * Math.PI / 180;
  const latitudeOne = Number(first.lat) * Math.PI / 180;
  const latitudeTwo = Number(second.lat) * Math.PI / 180;
  const a = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(latitudeOne) * Math.cos(latitudeTwo) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function proximityScore(donorLocation, requirementLocation, maxRadiusKm) {
  const radius = Number(maxRadiusKm);
  const distance = haversineDistanceKm(donorLocation, requirementLocation);
  if (!Number.isFinite(radius) || radius <= 0 || distance === null) return 0;
  return Math.max(0, 1 - distance / radius);
}

function urgencyScore(urgency, expiresAt, now = new Date()) {
  const baseScores = { critical: 1, high: 1, medium: 0.6, low: 0.3 };
  const base = baseScores[String(urgency || '').toLowerCase()] || 0;
  if (!expiresAt) return base;
  const expiry = new Date(expiresAt);
  if (Number.isNaN(expiry.getTime()) || expiry <= now) return 0;
  const hoursRemaining = (expiry.getTime() - now.getTime()) / 3600000;
  if (hoursRemaining >= 48) return base;
  return Math.min(1, base + Math.max(0, (48 - Math.max(0, hoursRemaining)) / 48) * 0.2);
}

function remainingNeedScore(items) {
  const validItems = (Array.isArray(items) ? items : []).filter((item) => Number(item.quantityRequired) > 0 && Number(item.quantityRemaining) >= 0);
  const required = validItems.reduce((total, item) => total + Number(item.quantityRequired), 0);
  const remaining = validItems.reduce((total, item) => total + Number(item.quantityRemaining), 0);
  if (required <= 0) return 0;
  return remaining > 0 ? Math.max(0.1, Math.min(1, remaining / required)) : 0;
}

function loadDeficiencyMappings() {
  const raw = fs.readFileSync(DEFICIENCY_DATA_PATH, 'utf8');
  return JSON.parse(raw).deficiency_food_map || [];
}

function deficiencyRelevance(requirement, matchedItems, mappings = loadDeficiencyMappings()) {
  const indicators = Array.isArray(requirement.nutritionIndicators) ? requirement.nutritionIndicators : [];
  const matches = [];
  let bestScore = 0;
  for (const mapping of mappings) {
    const triggered = mapping.trigger_indicators
      .map((name) => indicators.find((indicator) => normalizeFood(indicator.name || indicator.indicatorName) === normalizeFood(name)))
      .filter((indicator) => indicator && Number(indicator.value) >= Number(mapping.threshold_pct));
    if (triggered.length === 0) continue;
    const matchedCategory = matchedItems.find((match) => mapping.recommended_food_categories.some((category) => foodMatchScore(match.requirementItem, category) > 0));
    if (matchedCategory) {
      bestScore = Math.max(bestScore, mapping.id === 'general-diversity' ? 0.5 : 1);
      const recommendedFoodCategory = mapping.recommended_food_categories.find((category) => foodMatchScore(matchedCategory.requirementItem, category) > 0);
      for (const indicator of triggered) {
        matches.push({
          indicator: indicator.name || indicator.indicatorName,
          districtValue: Number(indicator.value),
          threshold: Number(mapping.threshold_pct),
          nutrientCategory: mapping.nutrient_category,
          recommendedFoodCategory,
          citation: mapping.citation,
          reportingPeriod: indicator.reportingPeriod || indicator.reporting_period,
        });
      }
    }
  }
  return { score: bestScore, entries: matches };
}

function getConfig(overrides = {}) {
  const envWeights = {
    proximity: Number(getEnv('MATCHING_WEIGHT_PROXIMITY', DEFAULT_MATCHING_CONFIG.weights.proximity)),
    foodMatch: Number(getEnv('MATCHING_WEIGHT_FOOD_MATCH', DEFAULT_MATCHING_CONFIG.weights.foodMatch)),
    deficiencyRelevance: Number(getEnv('MATCHING_WEIGHT_DEFICIENCY', DEFAULT_MATCHING_CONFIG.weights.deficiencyRelevance)),
    urgency: Number(getEnv('MATCHING_WEIGHT_URGENCY', DEFAULT_MATCHING_CONFIG.weights.urgency)),
    remainingNeed: Number(getEnv('MATCHING_WEIGHT_REMAINING_NEED', DEFAULT_MATCHING_CONFIG.weights.remainingNeed)),
  };
  return {
    maxRadiusKm: Number(overrides.maxRadiusKm || getEnv('MATCHING_MAX_RADIUS_KM', DEFAULT_MATCHING_CONFIG.maxRadiusKm)),
    weights: { ...envWeights, ...(overrides.weights || {}) },
  };
}

function matchRequirement(donorInput, requirement, config, mappings) {
  const expiresAt = requirement.expiresAt || requirement.expires_at;
  const expiry = expiresAt ? new Date(expiresAt) : null;
  if (!['active', 'partially_supported'].includes(requirement.status) || (expiry && (!Number.isFinite(expiry.getTime()) || expiry <= new Date()))) return null;

  const donorItems = Array.isArray(donorInput.foodItems) ? donorInput.foodItems : [];
  const requirementItems = Array.isArray(requirement.items) ? requirement.items : [];
  const matchedItems = [];
  for (const donorItem of donorItems) {
    for (const requirementItem of requirementItems) {
      const score = foodMatchScore(donorItem, requirementItem);
      if (score > 0) matchedItems.push({ donorItem, requirementItem, matchType: score === 1 ? 'exact' : 'related', foodMatchScore: score });
    }
  }
  if (donorItems.length > 0 && matchedItems.length === 0) return null;

  const proximity = proximityScore(donorInput.location, requirement.location, config.maxRadiusKm);
  const bestFoodMatch = matchedItems.reduce((best, match) => Math.max(best, match.foodMatchScore), 0);
  const deficiency = deficiencyRelevance(requirement, matchedItems, mappings);
  const breakdown = {
    proximity,
    foodMatch: donorItems.length === 0 ? 0 : bestFoodMatch,
    deficiencyRelevance: deficiency.score,
    urgency: urgencyScore(requirement.urgency, expiresAt),
    remainingNeed: remainingNeedScore(requirementItems),
  };
  const score = Object.entries(breakdown).reduce((total, [key, value]) => total + config.weights[key] * value, 0);
  return {
    requirementId: requirement.id,
    matchScore: Number(score.toFixed(6)),
    scoreBreakdown: breakdown,
    matchedItems,
    matchedDeficiencyEntries: deficiency.entries,
    requirement,
  };
}

async function matchRequirements(donorInput, options = {}) {
  const config = getConfig(options);
  const requirements = options.requirements || await options.requirementRepository.findAllForMatching();
  const mappings = options.deficiencyMappings || loadDeficiencyMappings();
  const results = requirements
    .map((requirement) => matchRequirement(donorInput || {}, requirement, config, mappings))
    .filter(Boolean)
    .filter((result) => !donorInput?.location || result.scoreBreakdown.proximity > 0)
    .sort((first, second) => second.matchScore - first.matchScore);
  return results.slice(0, Math.min(Math.max(Number(options.maxResults) || 50, 1), 100));
}

module.exports = {
  DEFAULT_MATCHING_CONFIG,
  deficiencyRelevance,
  foodMatchScore,
  haversineDistanceKm,
  matchRequirements,
  normalizeFood,
  proximityScore,
  remainingNeedScore,
  urgencyScore,
};