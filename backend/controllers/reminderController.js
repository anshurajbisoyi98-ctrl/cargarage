import { Reminder, Vehicle } from '../models/index.js';
import { asyncHandler, fail, validateText, validateNumber, validateDate } from '../middleware/index.js';

export const getReminders = asyncHandler(async (req, res) => {
  const query = req.user.isAdmin ? {} : { user: req.user._id };
  const reminders = await Reminder.find(query).populate('vehicle').sort({ dueDate: 1, createdAt: -1 });
  res.json(reminders);
});

export const createReminder = asyncHandler(async (req, res) => {
  const { vehicle: vehicleId, title, dueMileage, dueDate, priority } = req.body;
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) fail(404, 'Vehicle not found.');
  if (!req.user.isAdmin && String(vehicle.owner) !== String(req.user._id)) {
    fail(403, 'You can only add reminders for your own vehicles.');
  }
  const cleanTitle = validateText(title, 'Reminder title', 100);
  const cleanPriority = ['low', 'medium', 'high'].includes(priority) ? priority : 'medium';
  
  const reminder = await Reminder.create({
    user: req.user._id,
    vehicle: vehicle._id,
    title: cleanTitle,
    dueMileage: dueMileage ? validateNumber(dueMileage, 'Due mileage', 0) : undefined,
    dueDate: dueDate ? validateDate(dueDate, 'Due date') : undefined,
    priority: cleanPriority,
    status: 'pending'
  });
  
  const populated = await reminder.populate('vehicle');
  res.status(201).json(populated);
});

export const updateReminder = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findById(req.params.id);
  if (!reminder) fail(404, 'Reminder not found.');
  if (!req.user.isAdmin && String(reminder.user) !== String(req.user._id)) {
    fail(403, 'Access denied.');
  }

  const { title, dueMileage, dueDate, priority, status, snoozeDays } = req.body;
  if (title) reminder.title = validateText(title, 'Reminder title', 100);
  if (dueMileage !== undefined) reminder.dueMileage = validateNumber(dueMileage, 'Due mileage', 0);
  if (dueDate) reminder.dueDate = validateDate(dueDate, 'Due date');
  if (priority && ['low', 'medium', 'high'].includes(priority)) reminder.priority = priority;
  if (status && ['pending', 'snoozed', 'dismissed'].includes(status)) reminder.status = status;
  
  if (snoozeDays) {
    const days = validateNumber(snoozeDays, 'Snooze days', 1);
    const baseDate = reminder.dueDate ? new Date(reminder.dueDate) : new Date();
    baseDate.setDate(baseDate.getDate() + days);
    reminder.dueDate = baseDate;
    reminder.status = 'snoozed';
    reminder.snoozedUntil = baseDate;
  }

  await reminder.save();
  const populated = await reminder.populate('vehicle');
  res.json(populated);
});

export const deleteReminder = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findById(req.params.id);
  if (!reminder) fail(404, 'Reminder not found.');
  if (!req.user.isAdmin && String(reminder.user) !== String(req.user._id)) {
    fail(403, 'Access denied.');
  }
  await reminder.deleteOne();
  res.json({ message: 'Reminder deleted.' });
});
