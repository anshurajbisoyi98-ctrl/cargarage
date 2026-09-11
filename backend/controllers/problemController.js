import { ProblemReport, Vehicle, User } from '../models/index.js';
import { createNotification } from './notificationController.js';
import { asyncHandler, fail, validateText } from '../middleware/index.js';

export const getProblemReports = asyncHandler(async (req, res) => {
  const query = req.user.isAdmin ? {} : { user: req.user._id };
  const reports = await ProblemReport.find(query)
    .populate('vehicle')
    .populate('user', 'username email')
    .sort({ createdAt: -1 });
  res.json(reports);
});

export const createProblemReport = asyncHandler(async (req, res) => {
  const { vehicle: vehicleId, title, description, severity } = req.body;
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) fail(404, 'Vehicle not found.');
  if (!req.user.isAdmin && String(vehicle.owner) !== String(req.user._id)) {
    fail(403, 'You can only report problems for your own vehicles.');
  }

  const cleanTitle = validateText(title, 'Problem title', 200);
  const cleanDesc = validateText(description, 'Description', 2000);
  const cleanSeverity = ['low', 'medium', 'high', 'critical'].includes(severity) ? severity : 'medium';

  const report = await ProblemReport.create({
    user: req.user._id,
    vehicle: vehicle._id,
    title: cleanTitle,
    description: cleanDesc,
    severity: cleanSeverity,
    status: 'pending'
  });

  // Create notifications
  const notifType = cleanSeverity === 'critical' || cleanSeverity === 'high' ? 'urgent_problem' : 'status_update';
  await createNotification(req.user._id, {
    title: `Issue Logged: ${cleanTitle}`,
    message: `Your report for ${vehicle.model} (${cleanSeverity.toUpperCase()} priority) has been received. Our technicians are notified.`,
    type: notifType,
    relatedId: String(report._id)
  });

  // If urgent, notify all admins
  if (cleanSeverity === 'critical' || cleanSeverity === 'high') {
    const admins = await User.find({ isAdmin: true });
    for (const admin of admins) {
      await createNotification(admin._id, {
        title: `URGENT ISSUE: ${vehicle.model}`,
        message: `${cleanTitle} — reported with ${cleanSeverity.toUpperCase()} severity.`,
        type: 'urgent_problem',
        relatedId: String(report._id)
      });
    }
  }

  const populated = await report.populate(['vehicle', 'user']);
  res.status(201).json(populated);
});

export const resolveProblemReport = asyncHandler(async (req, res) => {
  const report = await ProblemReport.findById(req.params.id).populate('vehicle');
  if (!report) fail(404, 'Report not found.');

  report.status = 'resolved';
  report.resolvedAt = new Date();
  await report.save();

  await createNotification(report.user, {
    title: 'Issue Resolved',
    message: `The reported issue "${report.title}" for your ${report.vehicle?.model || 'vehicle'} has been marked resolved by the service team.`,
    type: 'status_update',
    relatedId: String(report._id)
  });

  res.json(report);
});

export const deleteProblemReport = asyncHandler(async (req, res) => {
  const report = await ProblemReport.findById(req.params.id);
  if (!report) fail(404, 'Report not found.');
  await report.deleteOne();
  res.json({ message: 'Problem report deleted.' });
});
