import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

// Database path
const dbPath = path.join(process.cwd(), 'data', 'users.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Interface for User
export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  isAdmin: boolean;
  membershipType: 'free' | 'premium';
  membershipExpiry?: Date;
  createdAt: Date;
  gumroadSubscription?: string;
}

let dbInstance: Database | null = null;

// Get database connection
async function getDatabase(): Promise<Database> {
  if (!dbInstance) {
    dbInstance = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    await initDatabase();
  }
  return dbInstance;
}

// Initialize database
async function initDatabase() {
  const db = await getDatabase();

  // Create users table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      isAdmin INTEGER DEFAULT 0,
      membershipType TEXT DEFAULT 'free',
      membershipExpiry TEXT,
      createdAt TEXT NOT NULL,
      gumroadSubscription TEXT
    )
  `);

  // Create admin user if it doesn't exist
  const adminExists = await db.get('SELECT id FROM users WHERE email = ?', ['admin@esenglobal.com']);
  if (!adminExists) {
    await db.run(`
      INSERT INTO users (id, email, username, password_hash, isAdmin, membershipType, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'admin',
      'admin@esenglobal.com', 
      'admin',
      'admin123', // In production, this should be properly hashed
      1,
      'premium',
      new Date().toISOString()
    ]);
  }

  // Create some sample users if they don't exist
  const sampleUsers = [
    {
      id: 'user1',
      email: 'john@example.com',
      username: 'john_doe',
      password_hash: 'hashed_password',
      membershipType: 'premium',
      membershipExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'user2',
      email: 'jane@example.com',
      username: 'jane_smith',
      password_hash: 'hashed_password',
      membershipType: 'free'
    },
    {
      id: 'user3',
      email: 'mike@example.com',
      username: 'mike_johnson',
      password_hash: 'hashed_password',
      membershipType: 'premium',
      membershipExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  for (const user of sampleUsers) {
    const exists = await db.get('SELECT id FROM users WHERE email = ?', [user.email]);
    if (!exists) {
      await db.run(`
        INSERT INTO users (id, email, username, password_hash, isAdmin, membershipType, membershipExpiry, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        user.id,
        user.email,
        user.username,
        user.password_hash,
        0,
        user.membershipType,
        user.membershipExpiry || null,
        new Date().toISOString()
      ]);
    }
  }

  return db;
}

// Get all users
export async function getAllUsers() {
  const db = await initDatabase();
  const users = await db.all(`
    SELECT id, email, username, isAdmin, membershipType, membershipExpiry, createdAt, gumroadSubscription
    FROM users
    ORDER BY createdAt DESC
  `);
  
  return users.map(user => ({
    ...user,
    isAdmin: Boolean(user.isAdmin),
    createdAt: new Date(user.createdAt),
    membershipExpiry: user.membershipExpiry ? new Date(user.membershipExpiry) : undefined,
    gumroadSubscription: user.gumroadSubscription ? JSON.parse(user.gumroadSubscription) : undefined
  }));
}

// Get user by email
export async function getUserByEmail(email: string) {
  const db = await initDatabase();
  const user = await db.get(`
    SELECT * FROM users WHERE email = ?
  `, [email]);
  
  if (!user) return null;
  
  return {
    ...user,
    isAdmin: Boolean(user.isAdmin),
    createdAt: new Date(user.createdAt),
    membershipExpiry: user.membershipExpiry ? new Date(user.membershipExpiry) : undefined,
    gumroadSubscription: user.gumroadSubscription ? JSON.parse(user.gumroadSubscription) : undefined
  };
}

// Update user membership
export async function updateUserMembership(userId: string, membershipType: 'free' | 'premium', membershipExpiry?: Date) {
  const db = await initDatabase();
  
  await db.run(`
    UPDATE users 
    SET membershipType = ?, membershipExpiry = ?
    WHERE id = ?
  `, [membershipType, membershipExpiry?.toISOString() || null, userId]);
  
  return true;
}

// Create new user
export async function createUser(userData: Omit<User, 'createdAt'>) {
  const db = await initDatabase();
  
  await db.run(`
    INSERT INTO users (id, email, username, password_hash, isAdmin, membershipType, membershipExpiry, createdAt, gumroadSubscription)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    userData.id,
    userData.email,
    userData.username,
    userData.password_hash,
    userData.isAdmin ? 1 : 0,
    userData.membershipType,
    userData.membershipExpiry?.toISOString() || null,
    new Date().toISOString(),
    userData.gumroadSubscription ? JSON.stringify(userData.gumroadSubscription) : null
  ]);
  
  return true;
}

// Delete user
export async function deleteUser(userId: string) {
  const db = await initDatabase();
  await db.run('DELETE FROM users WHERE id = ?', [userId]);
  return true;
}
