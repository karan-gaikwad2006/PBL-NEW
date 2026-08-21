const { AppError } = require('../utils/response');

const ALLOWED_URGENCIES = new Set(['critical', 'high', 'medium', 'low']);
const ALLOWED_UNITS = new Set(['kg', 'grams', 'packets', 'liters']);

function requireText(value, field, maxLength = 5000) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maxLength) {
    throw new AppError(`${field} is required and must be valid`, 422);
  }
  return value.trim();
}

function validateCreateRequirement(payload = {}) {
  const items = Array.isArray(payload.items) ? payload.items : [];
  if (items.length === 0 || items.length > 20) {
    throw new AppError('At least one and no more than 20 requirement items are required', 422);
  }

  const parsedItems = items.map((item) => {
    const name = requireText(item?.name, 'Item name', 255);
    const quantity = Number(item?.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new AppError('Each item quantity must be greater than zero', 422);
    }
    const unit = requireText(item?.unit, 'Item unit', 50).toLowerCase();
    if (!ALLOWED_UNITS.has(unit)) {
      throw new AppError('Each item unit must be kg, grams, packets, or liters', 422);
    }
    return { name, quantity, unit };
  });

  const beneficiaryCount = Number(payload.beneficiary_count);
  if (!Number.isInteger(beneficiaryCount) || beneficiaryCount <= 0) {
    throw new AppError('Beneficiary count must be a positive whole number', 422);
  }

  const urgency = requireText(payload.urgency, 'Urgency', 20).toLowerCase();
  if (!ALLOWED_URGENCIES.has(urgency)) {
    throw new AppError('Urgency must be critical, high, medium, or low', 422);
  }

  return {
    district: requireText(payload.district, 'District', 100),
    taluka: requireText(payload.city, 'City or village', 100),
    address: requireText(payload.address, 'Address', 2000),
    beneficiary_count: beneficiaryCount,
    beneficiary_description: requireText(payload.beneficiary_desc, 'Beneficiary description', 2000),
    urgency,
    description: requireText(payload.description, 'Requirement description', 5000),
    items: parsedItems,
  };
}

module.exports = {
  validateCreateRequirement,
};
