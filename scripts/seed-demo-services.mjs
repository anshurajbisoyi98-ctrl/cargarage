import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { 
  User, 
  Vehicle, 
  ServiceCenter, 
  ServiceRequest, 
  ServiceRecord, 
  Reminder, 
  ProblemReport, 
  Notification 
} from '../backend/models/index.js';

const mongoUri = process.env.MONGO_URI || process.env.db;
const dbName = process.env.DB_NAME || 'caranimation_service';

if (!mongoUri) {
  console.error('MONGO_URI or db environment variable is required.');
  process.exit(1);
}

async function seed() {
  console.log('Connecting to MongoDB Atlas at database:', dbName);
  await mongoose.connect(mongoUri, { dbName, serverSelectionTimeoutMS: 20000 });
  console.log('Connected.');

  // 1. Ensure or create Admin User
  let admin = await User.findOne({ email: 'staff@test.example' });
  if (!admin) {
    admin = await User.create({
      username: 'Dave Miller (Master Tech)',
      email: 'staff@test.example',
      password: await bcrypt.hash('MasterTech1968!', 12),
      isAdmin: true,
      phone: '+1 (555) 019-1968'
    });
    console.log('Created Admin User:', admin.email);
  } else {
    admin.isAdmin = true;
    await admin.save();
    console.log('Found Admin User:', admin.email);
  }

  // 2. Ensure or create Customer User
  let customer = await User.findOne({ email: 'carroll@shelby.example' });
  if (!customer) {
    customer = await User.create({
      username: 'Carroll Shelby',
      email: 'carroll@shelby.example',
      password: await bcrypt.hash('ShelbyGT1968!', 12),
      isAdmin: false,
      phone: '+1 (555) 928-1968'
    });
    console.log('Created Customer User:', customer.email);
  } else {
    console.log('Found Customer User:', customer.email);
  }

  // 3. Ensure Service Centers
  let centers = await ServiceCenter.find();
  if (centers.length === 0) {
    centers = await ServiceCenter.insertMany([
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
    ]);
    console.log('Seeded 3 Service Centers.');
  }

  const center1 = centers[0]._id;
  const center2 = centers[1] ? centers[1]._id : centers[0]._id;
  const center3 = centers[2] ? centers[2]._id : centers[0]._id;

  // 4. Ensure Classic Vehicles for the Customer
  async function ensureVehicle(reg, model, make, year, color, mileage, engine, trans) {
    let v = await Vehicle.findOne({ registrationNumber: reg });
    if (!v) {
      v = await Vehicle.create({
        owner: customer._id,
        registrationNumber: reg,
        model,
        make: make || 'Ford',
        year: year || 1968,
        color: color || 'Highland Green',
        mileage: mileage || 42000,
        purchaseDate: new Date('2021-04-15'),
        engineSize: engine || '6.4L 390 cu in V8',
        transmission: trans || '4-Speed Toploader Manual',
        fuelType: 'Petrol V8',
        nickname: model.includes('Bullitt') ? 'Bullitt' : 'Icon 68'
      });
      console.log(`Created vehicle: ${model} (${reg})`);
    }
    return v;
  }

  const v1 = await ensureVehicle('DL-01-AB-1968', '1968 Ford Mustang Fastback GT 390', 'Ford', 1968, 'Highland Green', 42150, '390 FE V8', '4-Speed Manual');
  const v2 = await ensureVehicle('MH-02-GT-1968', '1968 Shelby GT500 Fastback', 'Shelby / Ford', 1968, 'Wimbledon White / Blue', 38400, '428 Cobra Jet V8', 'Heavy-Duty 4-Speed');
  const v3 = await ensureVehicle('KA-05-CS-1968', '1968 Mustang California Special (GT/CS)', 'Ford', 1968, 'Candyapple Red', 51200, '302 cu in Small Block V8', 'C4 Cruise-O-Matic');
  const v4 = await ensureVehicle('DL-04-FB-1968', '1968 Ford Mustang Fastback 289', 'Ford', 1968, 'Acapulco Blue', 64800, '289 Challenger V8', '3-Speed Manual');

  // 5. Clear old demo active requests to avoid duplication
  await ServiceRequest.deleteMany({
    owner: customer._id,
    status: { $in: ['accepted', 'in_progress', 'pending'] }
  });

  // 6. Create 4 Active Services across all 4 Kanban Stepper Stages
  console.log('Seeding 4 Active Stage Workflow Jobs...');

  // Active Job 1: In Progress stage
  const jobInProgress = await ServiceRequest.create({
    vehicle: v1._id,
    owner: customer._id,
    serviceCenter: center1,
    serviceType: 'Holley 4-Barrel Carburetor Tuning & Dyno Run',
    problemDescription: 'Hesitation under wide-open throttle above 4,200 RPM. Teardown Holley carburetor, ultrasonic clean jets, install high-flow needle and seats, and calibrate timing curve.',
    preferredDate: new Date(),
    preferredTime: '10:00 AM',
    status: 'in_progress',
    currentStage: 'in_progress', // Stage 03 in Kanban stepper
    assignedTechnician: 'Dave Miller (Master Tech)'
  });

  // Active Job 2: Inspection stage
  const jobInspection = await ServiceRequest.create({
    vehicle: v2._id,
    owner: customer._id,
    serviceCenter: center2,
    serviceType: 'Brake Hydraulics & Dual-Circuit Cylinder Overhaul',
    problemDescription: 'Excessive pedal travel under hard stops and minor fluid weep near distribution block. Bench test master cylinder, flush DOT 4 fluid, and inspect front Wilwood discs.',
    preferredDate: new Date(Date.now() + 86400000),
    preferredTime: '02:30 PM',
    status: 'in_progress',
    currentStage: 'inspection', // Stage 02 in Kanban stepper
    assignedTechnician: 'Marcus Vance (Chassis Specialist)'
  });

  // Active Job 3: Ready for Pickup stage
  const jobReady = await ServiceRequest.create({
    vehicle: v3._id,
    owner: customer._id,
    serviceCenter: center3,
    serviceType: 'Lucas Fog Lamp Rewiring & Ceramic Detailing',
    problemDescription: 'Intermittent fog lamp circuit on California Special grille. Rewire harness, replace high-beam toggle relay, followed by 3-stage exterior paint correction.',
    preferredDate: new Date(Date.now() - 86400000),
    preferredTime: '11:00 AM',
    status: 'in_progress',
    currentStage: 'ready', // Stage 04 in Kanban stepper
    assignedTechnician: 'Elena Rostova (Electrical & Detailing)'
  });

  // Active Job 4: Vehicle Intake stage
  const jobIntake = await ServiceRequest.create({
    vehicle: v4._id,
    owner: customer._id,
    serviceCenter: center1,
    serviceType: 'Toploader 4-Speed Gearbox Fluid & Clutch Adjust',
    problemDescription: 'Stiff engagement into second gear during cold morning starts. Drain old oil, inspect brass synchro rings, and fill with vintage synthetic hypoid gear lubricant.',
    preferredDate: new Date(),
    preferredTime: '04:00 PM',
    status: 'accepted',
    currentStage: 'vehicle_received', // Stage 01 in Kanban stepper
    assignedTechnician: 'Samir Patel (Drivetrain Tech)'
  });

  // 7. Create a Pending Request (to demonstrate Accept / Reject flow)
  const pendingBooking = await ServiceRequest.create({
    vehicle: v1._id,
    owner: customer._id,
    serviceCenter: center1,
    serviceType: 'Distributor Vacuum Advance & Ignition Recalibration',
    problemDescription: 'Mild pinging under uphill load. Test distributor mechanical weights, adjust breaker points gap, and verify dwell angle.',
    preferredDate: new Date(Date.now() + 172800000), // +2 days
    preferredTime: '09:30 AM',
    status: 'pending',
    currentStage: 'booked'
  });

  console.log('Seeded Active Jobs:');
  console.log(' - [Stage 01: Vehicle Intake]:', jobIntake._id);
  console.log(' - [Stage 02: Inspection]:', jobInspection._id);
  console.log(' - [Stage 03: In Progress]:', jobInProgress._id);
  console.log(' - [Stage 04: Ready for Pickup]:', jobReady._id);
  console.log(' - [Pending Review Queue]:', pendingBooking._id);

  // 8. Ensure Completed Invoices exist in Records & History
  const existingRecord = await ServiceRecord.findOne({ vehicle: v1._id });
  if (!existingRecord) {
    // Create completed request and record
    const compReq = await ServiceRequest.create({
      vehicle: v1._id,
      owner: customer._id,
      serviceCenter: center1,
      serviceType: 'Annual Heritage Fluid & Spark Service',
      problemDescription: 'Scheduled 40,000 km certified heritage preservation service.',
      preferredDate: new Date(Date.now() - 30 * 86400000),
      status: 'completed',
      currentStage: 'completed',
      assignedTechnician: 'Dave Miller (Master Tech)'
    });

    await ServiceRecord.create({
      serviceRequest: compReq._id,
      vehicle: v1._id,
      invoiceNumber: `INV-${new Date().getFullYear()}-4821`,
      serviceType: 'Annual Heritage Fluid & Spark Service',
      serviceDate: new Date(Date.now() - 30 * 86400000),
      mileage: 41800,
      partsReplaced: [
        { name: 'Autolite Platinum Spark Plugs (8-Pack)', cost: 3800 },
        { name: 'Brad Penn 20W-50 High-Zinc Classic Engine Oil (6 Quarts)', cost: 4200 },
        { name: 'Motorcraft Oil Filter & Copper Crush Washer', cost: 1100 }
      ],
      laborCost: 4500,
      totalCost: 13600,
      recommendedNextMileage: 46800,
      recommendedNextDate: new Date(Date.now() + 150 * 86400000),
      notes: 'Compression test verified at 165–170 PSI across all 8 cylinders. Timing set to 12° BTDC.'
    });
    console.log('Seeded historical service record: INV-2026-4821');
  }

  // 9. Ensure Demo Problem Reports
  await ProblemReport.deleteMany({ user: customer._id });
  await ProblemReport.create([
    {
      user: customer._id,
      vehicle: v1._id,
      title: 'Power steering ram seal slight fluid weep',
      description: 'Noticed small drop of Type F transmission fluid on garage floor below steering assist cylinder after highway cruise.',
      severity: 'high',
      status: 'pending'
    },
    {
      user: customer._id,
      vehicle: v2._id,
      title: 'Heater core valve cable sticking',
      description: 'Temperature slider on dashboard requires excessive force to move between cool and warm.',
      severity: 'medium',
      status: 'investigating'
    }
  ]);
  console.log('Seeded demo problem reports.');

  // 10. Ensure Demo Reminders
  await Reminder.deleteMany({ user: customer._id });
  await Reminder.create([
    {
      user: customer._id,
      vehicle: v1._id,
      title: 'Holley Carburetor Secondary Diaphragm Check',
      dueMileage: 44000,
      dueDate: new Date(Date.now() + 25 * 86400000),
      priority: 'high',
      status: 'pending'
    },
    {
      user: customer._id,
      vehicle: v2._id,
      title: 'Cobra Jet 428 Valve Lash Clearance Inspection',
      dueMileage: 40000,
      dueDate: new Date(Date.now() + 45 * 86400000),
      priority: 'medium',
      status: 'snoozed',
      snoozedUntil: new Date(Date.now() + 7 * 86400000)
    }
  ]);
  console.log('Seeded demo maintenance reminders.');

  // 11. Create Notifications for customer and admin
  await Notification.deleteMany({ user: { $in: [customer._id, admin._id] } });
  await Notification.create([
    {
      user: customer._id,
      title: 'Work in Progress — Bay 4',
      message: 'Your 1968 Ford Mustang Fastback GT 390 is currently on the dyno bay with Dave Miller.',
      type: 'status_update',
      read: false
    },
    {
      user: customer._id,
      title: 'Ready for Collection',
      message: 'Your 1968 Mustang California Special has passed inspection and detailing. Ready for pickup at Harbor Classic Concierge.',
      type: 'status_update',
      read: false
    },
    {
      user: admin._id,
      title: 'URGENT DEFECT: 1968 Fastback GT 390',
      message: 'Power steering ram seal slight fluid weep reported with HIGH severity by Carroll Shelby.',
      type: 'urgent_problem',
      read: false
    }
  ]);
  console.log('Seeded live notifications.');

  console.log('\n🎉 DEMO SEEDING COMPLETE!');
  console.log('----------------------------------------------------');
  console.log('Customer Account: carroll@shelby.example / ShelbyGT1968!');
  console.log('Admin Account:    staff@test.example / MasterTech1968!');
  console.log('Active Jobs in Pipeline: 4 jobs (across Stages 01 to 04)');
  console.log('Pending Jobs in Queue:   1 booking (ready to accept)');
  console.log('----------------------------------------------------');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
