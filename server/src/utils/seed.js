const Appointment = require('../models/Appointment');

const SAMPLE_APPOINTMENTS = [
  {
    customerName: 'Alex Morgan',
    service: 'Consultation',
    dateTime: new Date('2026-11-02T10:00:00'),
    status: 'Pending',
  },
  {
    customerName: 'Jamie Lee',
    service: 'Follow-up',
    dateTime: new Date('2026-11-02T11:30:00'),
    status: 'Confirmed',
  },
  {
    customerName: 'Taylor Smith',
    service: 'Review',
    dateTime: new Date('2026-11-03T14:00:00'),
    status: 'Cancelled',
  },
];

async function seedInitialDataIfEmpty() {
  try {
    const count = await Appointment.countDocuments();
    if (count === 0) {
      console.log('[Seed] Database is empty. Seeding initial 3 sample appointments...');
      await Appointment.insertMany(SAMPLE_APPOINTMENTS);
      console.log('[Seed] Sample appointments successfully inserted.');
    } else {
      console.log(`[Seed] Database already has ${count} appointments. Skipping seed.`);
    }
  } catch (err) {
    console.error('[Seed] Error during seeding:', err.message);
  }
}

module.exports = {
  SAMPLE_APPOINTMENTS,
  seedInitialDataIfEmpty,
};

