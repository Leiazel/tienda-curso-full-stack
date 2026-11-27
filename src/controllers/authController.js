import { getEnvConfig } from '../config/env.js';
import * as authService from '../services/authService.js';

export function getAuthConfig(_req, res) {
  const { google } = getEnvConfig();
  res.status(200).json({
    googleEnabled: Boolean(google.clientId),
    googleClientId: google.clientId || null,
  });
}

export async function register(req, res) {
  const db = req.app.locals.db;
  const result = await authService.registerUser(db, req.body);
  res.status(201).json(result);
}

export async function login(req, res) {
  const db = req.app.locals.db;
  const result = await authService.loginUser(db, req.body);
  res.status(200).json(result);
}

export async function googleLogin(req, res) {
  const db = req.app.locals.db;
  const verifyTokenFn = req.app.locals.verifyGoogleToken || authService.verifyGoogleIdToken;
  const result = await authService.loginWithGoogle(db, req.body, { verifyTokenFn });
  res.status(result.isNewUser ? 201 : 200).json(result);
}

export async function getMe(req, res) {
  const db = req.app.locals.db;
  const user = await authService.getUserProfile(db, req.user.id);
  res.status(200).json({ user });
}
