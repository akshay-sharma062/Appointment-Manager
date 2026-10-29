const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const { connectDB } = require('../src/config/db');
const Appointment = require('../src/models/Appointment');
const { seedInitialDataIfEmpty } = require('../src/utils/seed');

const TEST_DB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/appointment_manager_test';

describe('Appointment Manager API Tests', () => {
  before(async () => {
    await connectDB(TEST_DB_URI);
    await Appointment.deleteMany({});
    await seedInitialDataIfEmpty();
  });

  after(async () => {
    await Appointment.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/health', () => {
    it('should return 200 and healthy database status', async () => {
      const res = await request(app).get('/api/health');
      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'ok');
      assert.equal(res.body.database.connected, true);
    });
  });

  describe('GET /api/appointments', () => {
    it('should retrieve all initial sample appointments (3 seeded)', async () => {
      const res = await request(app).get('/api/appointments');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(Array.isArray(res.body.data), true);
      assert.equal(res.body.data.length, 3);

      const names = res.body.data.map((a) => a.customerName);
      assert.ok(names.includes('Alex Morgan'));
      assert.ok(names.includes('Jamie Lee'));
      assert.ok(names.includes('Taylor Smith'));
    });

    it('should filter appointments by status Confirmed', async () => {
      const res = await request(app).get('/api/appointments?status=Confirmed');
      assert.equal(res.status, 200);
      assert.equal(res.body.data.length, 1);
      assert.equal(res.body.data[0].customerName, 'Jamie Lee');
    });

    it('should search appointments by customer name (partial and case-insensitive)', async () => {
      const res = await request(app).get('/api/appointments?search=alex');
      assert.equal(res.status, 200);
      assert.equal(res.body.data.length, 1);
      assert.equal(res.body.data[0].customerName, 'Alex Morgan');
    });

    it('should combine status filter and customer search', async () => {
      // Alex Morgan is Pending, so search=alex & status=Confirmed should yield 0 results
      const res1 = await request(app).get('/api/appointments?search=alex&status=Confirmed');
      assert.equal(res1.status, 200);
      assert.equal(res1.body.data.length, 0);

      // Alex Morgan is Pending, so search=alex & status=Pending should yield 1 result
      const res2 = await request(app).get('/api/appointments?search=alex&status=Pending');
      assert.equal(res2.status, 200);
      assert.equal(res2.body.data.length, 1);
      assert.equal(res2.body.data[0].customerName, 'Alex Morgan');
    });
  });

  describe('POST /api/appointments - Validation', () => {
    it('should reject when customerName is missing or empty', async () => {
      const res = await request(app).post('/api/appointments').send({
        customerName: '   ',
        service: 'Consultation',
        dateTime: '2026-11-05T10:00:00',
        status: 'Pending',
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.errors.customerName);
    });

    it('should reject when service is missing or empty', async () => {
      const res = await request(app).post('/api/appointments').send({
        customerName: 'Jordan Casey',
        service: '',
        dateTime: '2026-11-05T10:00:00',
        status: 'Pending',
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.errors.service);
    });

    it('should reject when dateTime is invalid', async () => {
      const res = await request(app).post('/api/appointments').send({
        customerName: 'Jordan Casey',
        service: 'Dentistry',
        dateTime: 'not-a-valid-date',
        status: 'Pending',
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.errors.dateTime);
    });

    it('should reject when status is not Pending, Confirmed, or Cancelled', async () => {
      const res = await request(app).post('/api/appointments').send({
        customerName: 'Jordan Casey',
        service: 'Dentistry',
        dateTime: '2026-11-05T10:00:00',
        status: 'Finished',
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.errors.status);
    });

    it('should successfully create appointment with valid data', async () => {
      const res = await request(app).post('/api/appointments').send({
        customerName: 'Morgan Rivera',
        service: 'Dental Cleaning',
        dateTime: '2026-11-10T15:30:00',
        status: 'Pending',
      });
      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.customerName, 'Morgan Rivera');
      assert.equal(res.body.data.service, 'Dental Cleaning');
      assert.equal(res.body.data.status, 'Pending');
      assert.ok(res.body.data.id);
    });
  });

  describe('PATCH /api/appointments/:id/status', () => {
    it('should reject update with invalid status', async () => {
      const listRes = await request(app).get('/api/appointments');
      const appointment = listRes.body.data[0];

      const res = await request(app)
        .patch(`/api/appointments/${appointment.id}/status`)
        .send({ status: 'Archived' });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    it('should successfully update status from Pending to Confirmed', async () => {
      const listRes = await request(app).get('/api/appointments?search=Alex%20Morgan');
      const appointment = listRes.body.data[0];
      assert.equal(appointment.status, 'Pending');

      const res = await request(app)
        .patch(`/api/appointments/${appointment.id}/status`)
        .send({ status: 'Confirmed' });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, 'Confirmed');

      // Verify persistence on subsequent GET
      const verifyRes = await request(app).get('/api/appointments?search=Alex%20Morgan');
      assert.equal(verifyRes.body.data[0].status, 'Confirmed');
    });

    it('should return 404 for non-existent appointment ID', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .patch(`/api/appointments/${fakeId}/status`)
        .send({ status: 'Cancelled' });

      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });
  });
});

