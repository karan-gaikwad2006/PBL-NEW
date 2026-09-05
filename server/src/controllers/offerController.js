const { successResponse, AppError } = require('../utils/response');
const offerRepository = require('../repositories/offerRepository');
const requirementRepository = require('../repositories/requirementRepository');
const { logAudit } = require('../utils/auditLogger');

async function createOffer(req, res, next) {
  try {
    const { requirementId, item } = req.body;

    if (!requirementId || !item || !item.name || item.quantity === undefined || !item.unit) {
      throw new AppError('Missing required offer data (requirementId, item name, quantity, unit)', 400);
    }

    const offeredQty = Number(item.quantity);
    if (isNaN(offeredQty) || offeredQty <= 0) {
      throw new AppError('Offered quantity must be a positive number greater than 0', 400);
    }

    const requirement = await requirementRepository.findByIdUnrestricted(requirementId);
    if (!requirement) {
      throw new AppError('Requirement not found', 404);
    }

    // 1. Check status and expiry
    if (requirement.status !== 'active' && requirement.status !== 'partially_supported') {
      throw new AppError(`Cannot support this requirement, it is currently ${requirement.status.replace('_', ' ')}`, 400);
    }

    if (requirement.expiresAt && new Date(requirement.expiresAt) <= new Date()) {
      throw new AppError('Cannot support this requirement, it has expired', 400);
    }

    // 2. Prevent requester from offering to their own requirement
    const isOwner = await requirementRepository.isOwner(requirementId, req.user.id);
    if (isOwner) {
      throw new AppError('You cannot create a support offer for your own requirement', 400);
    }

    // 3. Prevent duplicate active offers by the same donor on the same item
    const existingActiveOffer = await offerRepository.hasActiveOffer(req.user.id, requirementId, item.name);
    if (existingActiveOffer) {
      throw new AppError('You already have an active or pending offer for this item on this requirement.', 409);
    }

    // 4. Validate quantity against remaining requirement quantity
    const itemRemainingInfo = await offerRepository.getItemRemaining(requirementId, item.name);
    if (itemRemainingInfo && offeredQty > itemRemainingInfo.quantityRemaining) {
      throw new AppError(
        `Offered quantity (${offeredQty} ${item.unit}) exceeds remaining requirement (${itemRemainingInfo.quantityRemaining} ${itemRemainingInfo.unit})`,
        400
      );
    }

    const offer = await offerRepository.createOffer(req.user.id, requirementId, {
      name: String(item.name).trim(),
      quantity: offeredQty,
      unit: String(item.unit).trim(),
      message: item.message ? String(item.message).trim() : null,
    });

    return successResponse(res, 'Offer created successfully', offer, 201);
  } catch (error) {
    next(error);
  }
}

async function getMyOffers(req, res, next) {
  try {
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;

    const offers = await offerRepository.findByDonorId(req.user.id, { limit, offset });
    return successResponse(res, 'Your offers retrieved successfully', offers);
  } catch (error) {
    next(error);
  }
}

async function getOfferById(req, res, next) {
  try {
    const offer = await offerRepository.findByIdWithDetails(req.params.id);
    if (!offer) {
      throw new AppError('Offer not found', 404);
    }

    // Only donor, requirement owner (requester), or admin can view
    const isDonor = offer.donorUserId === req.user.id;
    const isRequester = offer.requesterUserId === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isDonor && !isRequester && !isAdmin) {
      throw new AppError('Forbidden: Access denied to this offer', 403);
    }

    return successResponse(res, 'Offer retrieved successfully', offer);
  } catch (error) {
    next(error);
  }
}

async function confirmDonor(req, res, next) {
  try {
    const offer = await offerRepository.findByIdWithDetails(req.params.id);
    if (!offer) {
      throw new AppError('Offer not found', 404);
    }

    if (req.user.role !== 'admin' && offer.donorUserId !== req.user.id) {
      throw new AppError('Forbidden: Only the donor can confirm delivery', 403);
    }

    if (offer.status === 'cancelled' || offer.status === 'declined') {
      throw new AppError('Cannot confirm an invalid or cancelled offer', 400);
    }

    if (offer.confirmedByDonor) {
      throw new AppError('Donor confirmation already recorded', 400);
    }

    const result = await offerRepository.confirmByDonor(offer.id);
    const updated = await offerRepository.findByIdWithDetails(offer.id);

    await logAudit({
      userId: req.user.id,
      action: 'donor_delivery_confirmed',
      entityType: 'offer',
      entityId: offer.id,
      details: { requirementId: offer.requirementId, isFullyCompleted: result.isFullyCompleted },
    });

    return successResponse(res, 'Donor delivery confirmed successfully', updated);
  } catch (error) {
    next(error);
  }
}

async function confirmRequester(req, res, next) {
  try {
    const offer = await offerRepository.findByIdWithDetails(req.params.id);
    if (!offer) {
      throw new AppError('Offer not found', 404);
    }

    if (req.user.role !== 'admin' && offer.requesterUserId !== req.user.id) {
      throw new AppError('Forbidden: Only the requester can confirm receipt', 403);
    }

    if (offer.status === 'cancelled' || offer.status === 'declined') {
      throw new AppError('Cannot confirm receipt for an invalid or cancelled offer', 400);
    }

    if (offer.confirmedByRequester) {
      throw new AppError('Requester confirmation already recorded', 400);
    }

    const result = await offerRepository.confirmByRequester(offer.id);
    const updated = await offerRepository.findByIdWithDetails(offer.id);

    await logAudit({
      userId: req.user.id,
      action: 'requester_receipt_confirmed',
      entityType: 'offer',
      entityId: offer.id,
      details: { requirementId: offer.requirementId, isFullyCompleted: result.isFullyCompleted },
    });

    return successResponse(res, 'Requester receipt confirmed successfully', updated);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOffer,
  getMyOffers,
  getOfferById,
  confirmDonor,
  confirmRequester,
};


