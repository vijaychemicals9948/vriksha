import {
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

let app: App | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function getAdminApp() {
  if (app) return app;

  app = getApps().length
    ? getApp()
    : initializeApp({
        credential: cert({
          projectId: getRequiredEnv("FIREBASE_PROJECT_ID"),
          clientEmail: getRequiredEnv("FIREBASE_CLIENT_EMAIL"),
          privateKey: getRequiredEnv("FIREBASE_PRIVATE_KEY").replace(
            /\\n/g,
            "\n",
          ),
        }),
      });

  return app;
}

function getAdminAuth() {
  auth ??= getAuth(getAdminApp());
  return auth;
}

function getAdminDb() {
  db ??= getFirestore(getAdminApp());
  return db;
}

function lazyProxy<T extends object>(getTarget: () => T) {
  return new Proxy({} as T, {
    get(_target, prop, receiver) {
      const target = getTarget();
      const value = Reflect.get(target, prop, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

export const adminAuth = lazyProxy(getAdminAuth);
export const adminDb = lazyProxy(getAdminDb);
