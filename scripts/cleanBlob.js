/**
 * Clean up incorrectly uploaded files from Vercel Blob
 * This will delete files that have absolute paths (starting with /home/)
 */

import { list, del } from '@vercel/blob';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const token = process.env.BLOB_READ_WRITE_TOKEN;

if (!token) {
  console.error('❌ Error: BLOB_READ_WRITE_TOKEN not found');
  process.exit(1);
}

async function cleanBlobs() {
  console.log('🧹 Cleaning up incorrectly uploaded blobs...\n');
  
  let totalDeleted = 0;
  let cursor;
  
  do {
    const response = await list({
      token,
      cursor,
      limit: 1000
    });

    // Filter blobs with absolute paths
    const toDelete = response.blobs.filter(blob => 
      blob.pathname.startsWith('home/') || 
      blob.pathname.includes('/home/')
    );

    if (toDelete.length > 0) {
      console.log(`Found ${toDelete.length} blobs to delete in this batch...`);
      
      for (const blob of toDelete) {
        try {
          await del(blob.url, { token });
          console.log(`✅ Deleted: ${blob.pathname}`);
          totalDeleted++;
        } catch (error) {
          console.error(`❌ Error deleting ${blob.pathname}:`, error.message);
        }
      }
    }

    cursor = response.cursor;
  } while (cursor);

  console.log(`\n🎉 Cleanup complete! Deleted ${totalDeleted} blobs`);
}

cleanBlobs().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

