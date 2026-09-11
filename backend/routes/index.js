import { Router } from 'express';
import { authenticate as auth, authorizeAdmin as admin, checkId } from '../middleware/index.js';
import * as users from '../controllers/userController.js';
import * as vehicles from '../controllers/vehicleController.js';
import * as services from '../controllers/serviceController.js';
import * as notifications from '../controllers/notificationController.js';
import * as reminders from '../controllers/reminderController.js';
import * as problems from '../controllers/problemController.js';
import * as centers from '../controllers/serviceCenterController.js';
export const router=Router();
const attempts=new Map();
const limiter=(req,res,next)=>{const now=Date.now();for(const [ip,v]of attempts)if(v.reset<now)attempts.delete(ip);const key=req.ip;const entry=attempts.get(key)||{count:0,reset:now+900000};entry.count++;attempts.set(key,entry);if(entry.count>30)return res.status(429).json({message:'Too many attempts. Try again in 15 minutes.'});next();};
router.post('/users/register',limiter,users.register);router.post('/users/login',limiter,users.login);router.post('/users/logout',users.logout);router.get('/users/me',auth,users.me);
router.put('/users/profile',auth,users.updateProfile);router.post('/users/toggle-role',auth,admin,users.toggleRole);router.get('/users',auth,admin,users.getAllUsers);

router.route('/vehicles').get(auth,vehicles.getMyVehicles).post(auth,vehicles.registerVehicle);
router.route('/vehicles/:id').get(auth,checkId,vehicles.getVehicleById).put(auth,checkId,vehicles.updateVehicle).delete(auth,checkId,vehicles.deleteVehicle);
router.get('/vehicles/:id/history',auth,checkId,vehicles.getVehicleServiceHistory);router.get('/vehicles/:id/reminder',auth,checkId,vehicles.getReminder);

router.route('/service-requests').get(auth,admin,services.getAllRequests).post(auth,services.createServiceRequest);
router.get('/service-requests/my',auth,services.getMyServiceRequests);
router.put('/service-requests/:id/cancel',auth,checkId,services.cancelServiceRequest);
router.put('/service-requests/:id/accept',auth,admin,checkId,services.transitionRequest('accepted'));router.put('/service-requests/:id/reject',auth,admin,checkId,services.transitionRequest('rejected'));
router.put('/service-requests/:id/stage',auth,admin,checkId,services.updateStage);

router.route('/service-records').get(auth,services.getAllRecords).post(auth,admin,services.createServiceRecord);
router.delete('/service-records/:id',auth,admin,checkId,services.deleteServiceRecord);
router.get('/service-records/vehicle/:id',auth,checkId,vehicles.getVehicleServiceHistory);

router.route('/reminders').get(auth,reminders.getReminders).post(auth,reminders.createReminder);
router.route('/reminders/:id').put(auth,checkId,reminders.updateReminder).delete(auth,checkId,reminders.deleteReminder);

router.route('/problem-reports').get(auth,problems.getProblemReports).post(auth,problems.createProblemReport);
router.put('/problem-reports/:id/resolve',auth,admin,checkId,problems.resolveProblemReport);
router.delete('/problem-reports/:id',auth,admin,checkId,problems.deleteProblemReport);

router.route('/service-centers').get(auth,centers.getServiceCenters).post(auth,admin,centers.createServiceCenter);
router.route('/service-centers/:id').put(auth,admin,checkId,centers.updateServiceCenter).delete(auth,admin,checkId,centers.deleteServiceCenter);

router.get('/dashboard/owner',auth,services.dashboard(false));router.get('/dashboard/service-center',auth,admin,services.dashboard(true));
router.route('/notifications').get(auth,notifications.getMyNotifications).delete(auth,notifications.clearAllNotifications);
router.put('/notifications/:id/read',auth,checkId,notifications.markAsRead);router.put('/notifications/read-all',auth,notifications.markAllAsRead);router.delete('/notifications/:id',auth,checkId,notifications.deleteNotification);

