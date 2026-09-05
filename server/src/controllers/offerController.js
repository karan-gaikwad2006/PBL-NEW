const { successResponse, AppError } = require('../utils/response');
const offerRepository = require('../repositories/offerRepository');
const requirementRepository = require('../repositories/requirementRepository');
const { logAudit } = require('../utils/auditLogger');

async function createOffer(req, res, next) {
  try {
    const { requirementId, item, items } = req.body;

    if (!requirementId) {
      throw new AppError('Missing requirementId', 400);
    }

    const requirement = await requirementRepository.findByIdUnrestricted(requirementId);
    if (!requirement) {
      throw new AppError('Requirement not found', 404);
    }

    if (requirement.status !== 'active' && requirement.status !== 'partially_supported') {
      throw new AppError(`Cannot support this requirement, it is currently ${requirement.status.replace('_', ' ')}`, 400);
    }

    if (requirement.expiresAt && new Date(requirement.expiresAt) <= new Date()) {
      throw new AppError('Cannot support this requirement, it has expired', 400);
    }

    const isOwner = await requirementRepository.isOwner(requirementId, req.user.id);
    if (isOwner) {
      throw new AppError('You cannot create a support offer for your own requirement', 400);
    }

    // Support both single item (legacy) and multi-item (new)
    const itemsToProcess = items || (item ? [item] : []);

    if (itemsToProcess.length === 0) {
      throw new AppError('At least one item must be selected', 400);
    }

    // Validate each item independently
    const validatedItems = [];
    const itemNames = new Set();

    for (const itm of itemsToProcess) {
      if (!itm.name || itm.quantity === undefined || !itm.unit) {
        throw new AppError('Each item must have a name, quantity, and unit', 400);
      }

      const offeredQty = Number(itm.quantity);
      if (isNaN(offeredQty) || offeredQty <= 0) {
        throw new AppError(`Offered quantity for ${itm.name} must be greater than 0`, 400);
      }

      if (itemNames.has(itm.name.toLowerCase())) {
        throw new AppError(`Duplicate item selection: ${itm.name}`, 400);
      }
      itemNames.add(itm.name.toLowerCase());

      // Check for existing active offer for THIS donor on THIS item
      const existingActiveOffer = await offerRepository.hasActiveOffer(req.user.id, requirementId, itm.name);
      if (existingActiveOffer) {
        throw new AppError(`You already have an active or pending offer for ${itm.name} on this requirement.`, 409);
      }

      // Validate against current database remaining quantity
      const itemRemainingInfo = await offerRepository.getItemRemaining(requirementId, itm.name);
      if (!itemRemainingInfo) {
        throw new AppError(`Item "${itm.name}" is not part of this requirement`, 400);
      }

      if (offeredQty > itemRemainingInfo.quantityRemaining) {
        throw new AppError(
          `Offered quantity for ${itm.name} (${offeredQty} ${itm.unit}) exceeds remaining requirement (${itemRemainingInfo.quantityRemaining} ${itemRemainingInfo.unit})`,
          400
        );
      }

      validatedItems.push({
        name: String(itm.name).trim(),
        quantity: offeredQty,
        unit: String(itm.unit).trim(),
      });
    }

    const donorMessage = req.body.message || (item?.message ? String(item.message).trim() : null);

    const result = await offerRepository.createMultiOffer(
      req.user.id,
      requirementId,
      validatedItems,
      donorMessage
    );

    return successResponse(
      res,
      itemsToProcess.length > 1 ? 'Support offers created successfully' : 'Offer created successfully',
      itemsToProcess.length > 1 ? result : result[0],
      201
    );
  } catch (error) {
    next(error);
  }
}

async function getMyOffers(req, res, next) {
  try {
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;
    const filter = req.query.filter || 'all';

    const offers = await offerRepository.findByDonorId(req.user.id, { limit, offset, filter });
    return successResponse(res, 'Your offers retrieved successfully', offers);
  } catch (error) {
    next(error);
  }
}

async function getMyStats(req, res, next) {
  try {
    const stats = await offerRepository.getDonorStats(req.user.id);
    return successResponse(res, 'Donor stats retrieved successfully', stats);
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

async function getMyImpact(req, res, next) {
  try {
    const impact = await offerRepository.getDonorImpact(req.user.id);
    return successResponse(res, 'Donor impact calculated successfully', impact);
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
  getMyImpact,
  getMyStats,
};


