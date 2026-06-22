import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prismaClientSingleton = () => {
  let dbUrl = process.env.DATABASE_URL;

  // Check if running on Vercel or in a serverless production environment
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    const bundledDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    const writableDbPath = '/tmp/dev.db';

    try {
      if (!fs.existsSync(writableDbPath)) {
        console.log('Production serverless mode detected. Preparing database...');
        
        // Ensure /tmp directory exists
        const tempDir = path.dirname(writableDbPath);
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        
        // Copy the pre-seeded SQLite database file to /tmp
        if (fs.existsSync(bundledDbPath)) {
          fs.copyFileSync(bundledDbPath, writableDbPath);
          fs.chmodSync(writableDbPath, 0o666);
          console.log('Database successfully copied to /tmp/dev.db');
        } else {
          console.error('Seeded database dev.db not found at:', bundledDbPath);
        }
      } else {
        console.log('Writable database already exists in /tmp/dev.db');
      }
      
      // Override connection URL to use /tmp/dev.db
      dbUrl = `file:${writableDbPath}`;
    } catch (err) {
      console.error('Failed to configure writable SQLite database in /tmp:', err);
    }
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const db = globalThis.prismaGlobal ?? prismaClientSingleton();

export default db;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = db;
