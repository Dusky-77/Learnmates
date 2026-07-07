/**
 * Upload Files to Vercel Blob Storage
 * 
 * This script uploads all files from public/documents and public/Questions
 * to Vercel Blob storage and generates a mapping file for URL references.
 * 
 * Usage:
 *   node scripts/uploadToBlob.js
 * 
 * Environment Variables:
 *   BLOB_READ_WRITE_TOKEN - Your Vercel Blob read-write token
 */

import { put, list } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const token = process.env.BLOB_READ_WRITE_TOKEN;

if (!token) {
  console.error('❌ Error: BLOB_READ_WRITE_TOKEN not found in environment variables');
  console.error('Please set it in .env.local file');
  process.exit(1);
}

// Directories to upload
const UPLOAD_DIRS = [
  'public/documents',
  'public/Questions'
];

// Track uploaded files
const uploadedFiles = new Map();
let totalFiles = 0;
let uploadedCount = 0;
let skippedCount = 0;
let errorCount = 0;

/**
 * Recursively get all files in a directory
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

/**
 * Get all existing blobs to avoid re-uploading
 */
async function getExistingBlobs() {
  try {
    console.log('📋 Fetching existing blobs...');
    const existingBlobs = new Map();
    let cursor;
    let totalExisting = 0;

    do {
      const response = await list({
        token,
        cursor,
        limit: 1000
      });

      response.blobs.forEach(blob => {
        existingBlobs.set(blob.pathname, blob.url);
      });

      totalExisting += response.blobs.length;
      cursor = response.cursor;

      if (cursor) {
        console.log(`   Found ${totalExisting} existing blobs so far...`);
      }
    } while (cursor);

    console.log(`✅ Found ${existingBlobs.size} existing blobs\n`);
    return existingBlobs;
  } catch (error) {
    console.error('⚠️  Warning: Could not fetch existing blobs:', error.message);
    return new Map();
  }
}

/**
 * Normalize filename for cleaner Blob URLs
 * Replaces spaces with hyphens and handles special characters
 */
function normalizeBlobPathname(pathname) {
  return pathname
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/&/g, 'and')          // Replace & with 'and'
    .replace(/[()]/g, '')          // Remove parentheses
    .replace(/[%]/g, '')            // Remove percent signs
    .replace(/--+/g, '-')          // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');        // Remove leading/trailing hyphens
}

/**
 * Upload a single file to Vercel Blob
 */
async function uploadFile(filePath, existingBlobs) {
  try {
    // Convert local path to blob pathname (remove everything before 'public/' and the 'public/' prefix)
    const publicIndex = filePath.indexOf('public/');
    let blobPathname = publicIndex >= 0 
      ? filePath.substring(publicIndex + 'public/'.length)
      : filePath;
    
    // Normalize the pathname for cleaner URLs (spaces -> hyphens, & -> and, etc.)
    const normalizedPathname = normalizeBlobPathname(blobPathname);
    
    // Check if already uploaded (check normalized version first, then original)
    // We prefer normalized versions for cleaner URLs
    let existingUrl = existingBlobs.get(normalizedPathname);
    if (!existingUrl && normalizedPathname !== blobPathname) {
      existingUrl = existingBlobs.get(blobPathname);
    }
    
    if (existingUrl) {
      console.log(`⏭️  Skipping (already exists): ${normalizedPathname}`);
      uploadedFiles.set(filePath, existingUrl);
      skippedCount++;
      return existingUrl;
    }

    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Get content type based on extension
    const ext = path.extname(filePath).toLowerCase();
    const contentTypeMap = {
      '.pdf': 'application/pdf',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.json': 'application/json'
    };
    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    // Upload to Vercel Blob with normalized pathname for cleaner URLs
    // This avoids URL encoding issues (spaces become hyphens, & becomes 'and')
    const uploadPathname = normalizedPathname !== blobPathname ? normalizedPathname : blobPathname;
    console.log(`📤 Uploading: ${uploadPathname}${uploadPathname !== blobPathname ? ` (normalized from: ${blobPathname})` : ''}`);
    const blob = await put(uploadPathname, fileBuffer, {
      access: 'public',
      token,
      contentType,
      addRandomSuffix: false
    });

    uploadedFiles.set(filePath, blob.url);
    uploadedCount++;
    console.log(`✅ Uploaded: ${blob.url}`);
    
    return blob.url;
  } catch (error) {
    errorCount++;
    console.error(`❌ Error uploading ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Upload all files in batches
 */
async function uploadAllFiles() {
  console.log('🚀 Starting Vercel Blob upload...\n');

  // Get existing blobs first
  const existingBlobs = await getExistingBlobs();

  // Collect all files
  const allFiles = [];
  for (const dir of UPLOAD_DIRS) {
    const dirPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(dirPath)) {
      const files = getAllFiles(dirPath);
      allFiles.push(...files);
    } else {
      console.warn(`⚠️  Directory not found: ${dir}`);
    }
  }

  totalFiles = allFiles.length;
  console.log(`📊 Found ${totalFiles} files to process\n`);

  if (totalFiles === 0) {
    console.log('✅ No files to upload');
    return;
  }

  // Upload in batches of 10 to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < allFiles.length; i += batchSize) {
    const batch = allFiles.slice(i, i + batchSize);
    
    console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allFiles.length / batchSize)}:`);
    
    await Promise.all(
      batch.map(file => uploadFile(file, existingBlobs))
    );

    // Progress update
    const processed = Math.min(i + batchSize, allFiles.length);
    console.log(`\n📈 Progress: ${processed}/${totalFiles} files processed (${uploadedCount} uploaded, ${skippedCount} skipped, ${errorCount} errors)`);
  }

  // Generate URL mapping file
  console.log('\n📝 Generating URL mapping file...');
  const mapping = {};
  
  uploadedFiles.forEach((blobUrl, localPath) => {
    // Convert to frontend path format (e.g., /documents/... or /Questions/...)
    // Extract relative path from public/
    const publicIndex = localPath.indexOf('public/');
    const relativePath = publicIndex >= 0 
      ? localPath.substring(publicIndex + 'public/'.length)
      : localPath;
    const frontendPath = '/' + relativePath;
    // Also map the normalized version for lookup
    const normalizedFrontendPath = '/' + normalizeBlobPathname(relativePath);
    mapping[frontendPath] = blobUrl;
    // If normalized is different, also add that mapping
    if (normalizedFrontendPath !== frontendPath) {
      mapping[normalizedFrontendPath] = blobUrl;
    }
  });

  const mappingPath = path.join(__dirname, '..', 'public', 'blob-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
  console.log(`✅ Mapping file created: ${mappingPath}`);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Upload Summary:');
  console.log('='.repeat(60));
  console.log(`Total files processed: ${totalFiles}`);
  console.log(`✅ Successfully uploaded: ${uploadedCount}`);
  console.log(`⏭️  Skipped (existing): ${skippedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('='.repeat(60));
  
  if (errorCount > 0) {
    console.log('\n⚠️  Some files failed to upload. Check the errors above.');
    process.exit(1);
  } else {
    console.log('\n🎉 All files uploaded successfully!');
  }
}

// Run the upload
uploadAllFiles().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

