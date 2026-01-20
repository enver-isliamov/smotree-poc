import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface SmoTreeDB extends DBSchema {
  videos: {
    key: string;
    value: {
      id: string;
      blob: Blob;
      fileName: string;
      uploadedAt: string;
    };
  };
  projects: {
    key: string;
    value: any;
  };
}

let db: IDBPDatabase<SmoTreeDB> | null = null;

async function getDB() {
  if (db) return db;
  db = await openDB<SmoTreeDB>('smotree', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('videos')) {
        db.createObjectStore('videos', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' });
      }
    },
  });
  return db;
}

export const indexedDB = {
  async saveVideo(id: string, blob: Blob, fileName: string) {
    const db = await getDB();
    await db.put('videos', {
      id,
      blob,
      fileName,
      uploadedAt: new Date().toISOString(),
    });
  },

  async getVideo(id: string): Promise<Blob | null> {
    const db = await getDB();
    const video = await db.get('videos', id);
    return video?.blob || null;
  },

  async deleteVideo(id: string) {
    const db = await getDB();
    await db.delete('videos', id);
  },

  async saveProject(project: any) {
    const db = await getDB();
    await db.put('projects', project);
  },

  async getProject(id: string) {
    const db = await getDB();
    return await db.get('projects', id);
  },

  async getAllProjects() {
    const db = await getDB();
    return await db.getAll('projects');
  },

  async deleteProject(id: string) {
    const db = await getDB();
    await db.delete('projects', id);
  },
};
