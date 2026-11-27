import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { getEnvConfig } from '../config/env.js';
import { signAuthToken } from '../middlewares/auth.js';
import {
  AppError,
  isValidEmail,
  isValidPersonName,
  throwValidationErrors,
} from '../middlewares/validate.js';

function mapUserRow(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
  };
}

export async function registerUser(db, payload) {
  const errors = [];
  const firstName = typeof payload?.firstName === 'string' ? payload.firstName.trim() : '';
  const lastName = typeof payload?.lastName === 'string' ? payload.lastName.trim() : '';
  const email = typeof payload?.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const password = typeof payload?.password === 'string' ? payload.password : '';
  const phone = typeof payload?.phone === 'string' ? payload.phone.trim() : null;

  if (!isValidPersonName(firstName)) {
    errors.push({
      field: 'firstName',
      message: 'Nombre inválido (solo letras y mínimo 2 caracteres)',
    });
  }
  if (!isValidPersonName(lastName)) {
    errors.push({
      field: 'lastName',
      message: 'Apellido inválido (solo letras y mínimo 2 caracteres)',
    });
  }
  if (!isValidEmail(email)) {
    errors.push({ field: 'email', message: 'Email inválido' });
  }
  if (password.length < 6) {
    errors.push({
      field: 'password',
      message: 'La contraseña debe tener al menos 6 caracteres',
    });
  }

  throwValidationErrors(errors);

  const [existing] = await db.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
  if (existing.length > 0) {
    throw new AppError(409, 'EMAIL_ALREADY_EXISTS', 'Ya existe una cuenta registrada con ese email');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [result] = await db.execute(
    `INSERT INTO users (first_name, last_name, email, password_hash, phone, role, is_active)
     VALUES (?, ?, ?, ?, ?, 'customer', 1)`,
    [firstName, lastName, email, passwordHash, phone]
  );

  const user = await getUserProfile(db, result.insertId);
  const token = signAuthToken(user);

  return { user, token };
}

export async function loginUser(db, payload) {
  const email = typeof payload?.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const password = typeof payload?.password === 'string' ? payload.password : '';

  if (!isValidEmail(email) || !password) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Email y contraseña válidos son obligatorios');
  }

  const [rows] = await db.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  if (rows.length === 0) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Credenciales inválidas');
  }

  const userRow = rows[0];
  if (!userRow.is_active) {
    throw new AppError(403, 'ACCOUNT_DISABLED', 'La cuenta se encuentra deshabilitada');
  }

  const matches = await bcrypt.compare(password, userRow.password_hash);
  if (!matches) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Credenciales inválidas');
  }

  const user = mapUserRow(userRow);
  const token = signAuthToken(user);

  return { user, token };
}

export async function verifyGoogleIdToken(credential) {
  const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new AppError(
      502,
      'GOOGLE_VERIFY_UNAVAILABLE',
      'No se pudo contactar a Google para validar el inicio de sesión'
    );
  }

  if (!response.ok) {
    throw new AppError(401, 'INVALID_GOOGLE_TOKEN', 'Token de Google inválido o expirado');
  }

  return response.json();
}

export async function loginWithGoogle(db, payload, { verifyTokenFn = verifyGoogleIdToken } = {}) {
  const { google } = getEnvConfig();
  if (!google.clientId) {
    throw new AppError(
      503,
      'GOOGLE_AUTH_NOT_CONFIGURED',
      'Google Sign-In no está configurado en el servidor (falta GOOGLE_CLIENT_ID en .env)'
    );
  }

  const credential = typeof payload?.credential === 'string' ? payload.credential.trim() : '';
  if (!credential) {
    throw new AppError(400, 'VALIDATION_ERROR', 'El token credential de Google es obligatorio');
  }

  const tokenInfo = await verifyTokenFn(credential);
  if (!tokenInfo || tokenInfo.aud !== google.clientId) {
    throw new AppError(
      401,
      'INVALID_GOOGLE_AUDIENCE',
      'El token de Google no corresponde a esta aplicación'
    );
  }

  const isVerified = tokenInfo.email_verified === true || tokenInfo.email_verified === 'true';
  const email = typeof tokenInfo.email === 'string' ? tokenInfo.email.trim().toLowerCase() : '';
  if (!isVerified || !isValidEmail(email)) {
    throw new AppError(401, 'GOOGLE_EMAIL_UNVERIFIED', 'La cuenta de Google no tiene un email verificado');
  }

  const [rows] = await db.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  if (rows.length > 0) {
    const userRow = rows[0];
    if (!userRow.is_active) {
      throw new AppError(403, 'ACCOUNT_DISABLED', 'La cuenta se encuentra deshabilitada');
    }
    const user = mapUserRow(userRow);
    const token = signAuthToken(user);
    return { user, token, isNewUser: false, provider: 'google' };
  }

  const rawGiven = typeof tokenInfo.given_name === 'string' ? tokenInfo.given_name.trim() : '';
  const rawFamily = typeof tokenInfo.family_name === 'string' ? tokenInfo.family_name.trim() : '';
  const rawFull = typeof tokenInfo.name === 'string' ? tokenInfo.name.trim() : '';
  const fallbackParts = rawFull ? rawFull.split(/\s+/) : [email.split('@')[0] || 'Usuario'];

  const firstName = (rawGiven || fallbackParts[0] || 'Usuario').slice(0, 80);
  const lastName = (rawFamily || fallbackParts.slice(1).join(' ') || 'Google').slice(0, 80);
  const randomPasswordHash = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10);

  const [result] = await db.execute(
    `INSERT INTO users (first_name, last_name, email, password_hash, phone, role, is_active)
     VALUES (?, ?, ?, ?, NULL, 'customer', 1)`,
    [firstName, lastName, email, randomPasswordHash]
  );

  const user = await getUserProfile(db, result.insertId);
  const token = signAuthToken(user);

  return { user, token, isNewUser: true, provider: 'google' };
}

export async function getUserProfile(db, userId) {
  const [rows] = await db.execute(
    `SELECT id, first_name, last_name, email, phone, role, is_active, created_at
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [Number(userId)]
  );

  if (rows.length === 0) {
    throw new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
  }

  return mapUserRow(rows[0]);
}
