/**
 * File URL Resolution Utility
 * 
 * Resolves file URLs with dual-path strategy:
 * 1. Try local file system
 * 2. Fallback to Cloudflare R2 for /Questions/ directory
 */

import { resolveFileUrl, resolveFileUrlSync } from './r2Utils';

/**
 * Convert a local file path to a resolved URL
 * Implements dual-path resolution: local → R2
 * 
 * @param localPath - Local file path (e.g., '/Questions/alevel/...') or already-resolved R2 URL
 * @returns Resolved URL (local or R2)
 */
export async function getBlobUrl(localPath: string): Promise<string> {
  // If already an R2 URL, return as-is (avoid double encoding)
  if (localPath.startsWith('https://learnmates.org') || localPath.startsWith('http://')) {
    return localPath;
  }
  
  // Use R2 resolution for Questions directory
  if (localPath.includes('/Questions/')) {
    return await resolveFileUrl(localPath);
  }

  // For non-Questions paths, use local path directly
  return localPath;
}

/**
 * Convert a local file path to a resolved URL synchronously
 * Note: Returns cached R2 URLs or local path
 * 
 * @param localPath - Local file path
 * @returns Resolved URL or local path
 */
export function getBlobUrlSync(localPath: string): string {
  // Use R2 resolution for Questions directory
  if (localPath.includes('/Questions/')) {
    return resolveFileUrlSync(localPath);
  }

  // For non-Questions paths, use local path directly
  return localPath;
}

/**
 * Preload file URL mappings (call this early in app initialization)
 * For R2, this preloads URL transformations without checking existence
 */
export function preloadBlobMapping(): void {
  // R2 preloading is done on-demand
  console.log('[File URL] Preload called - R2 uses lazy loading');
}

/**
 * Check if blob mapping is loaded (deprecated, kept for compatibility)
 */
export function isBlobMappingLoaded(): boolean {
  // Always return true since R2 uses lazy loading
  return true;
}

