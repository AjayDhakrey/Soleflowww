import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { app } from '../../../backend/src/app.js';

let server: http.Server;
let baseUrl: string;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const address = server.address();
      if (address && typeof address === 'object') {
        baseUrl = `http://localhost:${address.port}`;
      }
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

describe('Sales Team & Related Express Routes', () => {
  it('GET /api/health returns status ok', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('soleflow-backend');
  });

  it('GET /api/sales-team returns salesTeam list in dev/mock environment', async () => {
    const res = await fetch(`${baseUrl}/api/sales-team`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('salesTeam');
    expect(Array.isArray(body.salesTeam)).toBe(true);
  });

  it('POST /api/sales-team validates required name and email', async () => {
    const res = await fetch(`${baseUrl}/api/sales-team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '' }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/required/i);
  });

  it('POST /api/sales-team handles local creation fallback gracefully', async () => {
    const res = await fetch(`${baseUrl}/api/sales-team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Arjun Verma',
        email: 'arjun.sales@soleflow.test',
        password: 'Password123',
        phone: '9876543210',
        zone: 'Agra Hub',
      }),
    });
    expect([200, 201]).toContain(res.status);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it('POST /api/admin/users/create validates minimum password length', async () => {
    const res = await fetch(`${baseUrl}/api/admin/users/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'short@soleflow.test',
        password: '123',
        name: 'Short Pass',
      }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/at least 6 characters/i);
  });

  it('POST /api/admin/users/create creates a sales rep account', async () => {
    const res = await fetch(`${baseUrl}/api/admin/users/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'newrep@soleflow.test',
        password: 'ValidPassword123!',
        name: 'New Representative',
        role: 'salesperson',
        zone: 'Agra West',
      }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.user.email).toBe('newrep@soleflow.test');
  });

  it('GET /api/reports/sales/csv responds or handles unconfigured service key cleanly', async () => {
    const res = await fetch(`${baseUrl}/api/reports/sales/csv`);
    // Returns 200 (CSV stream) or 503 (service key missing) without crashing
    expect([200, 503]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers.get('content-type')).toContain('text/csv');
      const text = await res.text();
      expect(text).toContain('Order ID');
    }
  });

  it('GET /api/reports/receivables/csv responds or handles unconfigured service key cleanly', async () => {
    const res = await fetch(`${baseUrl}/api/reports/receivables/csv`);
    expect([200, 503]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers.get('content-type')).toContain('text/csv');
      const text = await res.text();
      expect(text).toContain('Client Name');
    }
  });
});
