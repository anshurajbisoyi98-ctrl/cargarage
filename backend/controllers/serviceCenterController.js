import { ServiceCenter } from '../models/index.js';
import { asyncHandler, fail, validateText, validateNumber } from '../middleware/index.js';

const SEED_CENTERS = [
  {
    name: 'Downtown Heritage Works',
    address: '420 Industrial Blvd, Suite 100, Motor City',
    phone: '+1 (555) 019-1968',
    capacity: 12,
    isActive: true,
    specialties: ['Classic Mustang Restoration', 'Engine Tuning', 'Brake Systems']
  },
  {
    name: 'Westside Performance Bay',
    address: '88 Speedwell Ave, West District',
    phone: '+1 (555) 024-8800',
    capacity: 8,
    isActive: true,
    specialties: ['Dyno Tuning', 'Suspension & Chassis', 'Track Prep']
  },
  {
    name: 'Harbor Classic Concierge',
    address: '15 Marine Way, Bay Pier 4',
    phone: '+1 (555) 033-4411',
    capacity: 6,
    isActive: true,
    specialties: ['Detailing & Paint Protection', 'Electrical & Wiring', 'Routine Concierge']
  }
];

export const getServiceCenters = asyncHandler(async (req, res) => {
  let centers = await ServiceCenter.find().sort({ createdAt: -1 });
  if (centers.length === 0) {
    centers = await ServiceCenter.insertMany(SEED_CENTERS);
  }
  res.json(centers);
});

export const createServiceCenter = asyncHandler(async (req, res) => {
  const name = validateText(req.body.name, 'Center name', 100);
  const address = validateText(req.body.address, 'Address', 300);
  const phone = req.body.phone ? validateText(req.body.phone, 'Phone', 30) : '';
  const capacity = req.body.capacity ? validateNumber(req.body.capacity, 'Capacity', 1) : 10;
  const specialties = Array.isArray(req.body.specialties) ? req.body.specialties : [];

  const center = await ServiceCenter.create({
    name,
    address,
    phone,
    capacity,
    isActive: req.body.isActive !== false,
    specialties
  });
  res.status(201).json(center);
});

export const updateServiceCenter = asyncHandler(async (req, res) => {
  const center = await ServiceCenter.findById(req.params.id);
  if (!center) fail(404, 'Service center not found.');

  if (req.body.name) center.name = validateText(req.body.name, 'Center name', 100);
  if (req.body.address) center.address = validateText(req.body.address, 'Address', 300);
  if (req.body.phone !== undefined) center.phone = validateText(req.body.phone, 'Phone', 30);
  if (req.body.capacity !== undefined) center.capacity = validateNumber(req.body.capacity, 'Capacity', 1);
  if (req.body.isActive !== undefined) center.isActive = Boolean(req.body.isActive);
  if (req.body.specialties !== undefined && Array.isArray(req.body.specialties)) {
    center.specialties = req.body.specialties;
  }

  await center.save();
  res.json(center);
});

export const deleteServiceCenter = asyncHandler(async (req, res) => {
  const center = await ServiceCenter.findById(req.params.id);
  if (!center) fail(404, 'Service center not found.');
  await center.deleteOne();
  res.json({ message: 'Service center deleted.' });
});
