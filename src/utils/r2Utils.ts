/**
 * Cloudflare R2 URL Utility
 * 
 * Transforms local file paths to Cloudflare R2 URLs with proper URL encoding.
 * Implements fallback resolution for file serving.
 */

// Configuration for R2
const R2_BASE_URL = 'https://assets.learnmates.org';
const R2_BUCKET_URL = (import.meta as any).env?.VITE_R2_BUCKET_URL || 'https://learnmates-cdn.r2.cloudflarestorage.com';

// CORS proxy options - use one of these if R2 CORS is not configured
// Currently using direct R2 URL - configure these if needed:
const CORS_PROXIES = {
  'cors-anywhere': 'https://cors-anywhere.herokuapp.com/',
  'allorigins': 'https://api.allorigins.win/raw?url=',
  'corsfix': 'https://corsfix.com/?',
};

// Cache for R2 URL transformation results
const r2UrlCache = new Map<string, string>();

// Cache for fetched R2 blobs to avoid re-fetching
const r2BlobCache = new Map<string, Promise<Blob | null>>();

const isR2ManagedAssetPath = (localPath: string) => localPath.includes('/Questions/') || localPath.includes('/topicals/');

/**
 * Encode URL path according to specification:
 * - Ampersand (&) → %26
 * - Comma-space (, ) → %2C
 * - Other special characters encoded per RFC 3986
 * 
 * @param filePath - Original file path
 * @returns Properly encoded URL path
 */
export function encodeR2Path(filePath: string): string {
  // If already a full URL, don't encode it (shouldn't happen, but defensive check)
  if (filePath.startsWith('https://') || filePath.startsWith('http://')) {
    console.warn(`[R2 Utils] encodeR2Path received full URL, returning as-is: ${filePath}`);
    return filePath;
  }
  
  // Custom encoding for specific characters
  // IMPORTANT: Do NOT encode forward slashes (/) - they are part of the path structure
  return filePath
    .split('')
    .map((char) => {
      // Handle specific character mappings
      if (char === '&') return '%26';
      if (char === ' ') return '%20'; // Space in any context
      if (char === ',') return '%2C'; // Comma
      if (char === '/') return '/'; // Forward slash MUST NOT be encoded - it's part of path
      // Let URL encoding handle other special characters (but exclude forward slash)
      if (/[!*'();:@&=+$,?#\[\]]/.test(char)) {
        return encodeURIComponent(char);
      }
      return char;
    })
    .join('');
}

/**
 * Transform a local file path to an R2 URL
 * Only applies to /Questions/ directory
 * 
 * @param localPath - Local file path (e.g., '/Questions/alevel/cambridge/physics/MCQ/9702_p1 forces, density & pressure.pdf')
 * @returns R2 URL (e.g., 'https://learnmates.org/Questions/alevel/cambridge/physics/MCQ/9702_p1%20forces%2Cdensity%20%26%20pressure.pdf')
 */
export function getR2Url(localPath: string): string | null {
  // If already an R2 URL, return as-is (avoid double encoding)
  if (localPath.startsWith('https://assets.learnmates.org') || localPath.startsWith('http://assets.learnmates.org')) {
    return localPath;
  }

  let pathToTransform = localPath;

  // Normalize absolute LearnMates URLs to the R2 asset host
  if (localPath.startsWith('http://') || localPath.startsWith('https://')) {
    try {
      const url = new URL(localPath);
      if (url.hostname === 'www.learnmates.org' || url.hostname === 'learnmates.org') {
        pathToTransform = `${url.pathname}${url.search}${url.hash}`;
      } else {
        return localPath;
      }
    } catch (error) {
      console.error(`[R2 Utils] Error parsing URL for ${localPath}:`, error);
      return localPath;
    }
  }

  // Only handle Questions/topicals asset directories
  if (!isR2ManagedAssetPath(pathToTransform)) {
    return null;
  }

  // Check cache first
  if (r2UrlCache.has(localPath)) {
    return r2UrlCache.get(localPath)!;
  }

  try {
    // Remove leading slash if present
    const cleanPath = pathToTransform.startsWith('/') ? pathToTransform.substring(1) : pathToTransform;

    // Encode the path
    const encodedPath = encodeR2Path(cleanPath);

    // Construct R2 URL
    const r2Url = `${R2_BASE_URL}/${encodedPath}`;

    // Cache the result
    r2UrlCache.set(localPath, r2Url);

    return r2Url;
  } catch (error) {
    console.error(`[R2 Utils] Error transforming URL for ${localPath}:`, error);
    return null;
  }
}

/**
 * Attempt to resolve a file from R2 storage
 * Returns the R2 URL if it exists, null otherwise
 * 
 * @param localPath - Local file path
 * @returns R2 URL if file exists in R2, null otherwise
 */
export async function resolveFromR2(localPath: string): Promise<string | null> {
  // If already an R2 URL, return as-is (avoid double encoding)
  if (localPath.startsWith('https://assets.learnmates.org') || localPath.startsWith('http://assets.learnmates.org')) {
    return localPath;
  }

  // Resolve Questions/topicals assets from R2
  const normalizedPath = localPath.startsWith('http://') || localPath.startsWith('https://')
    ? (() => {
        try {
          const url = new URL(localPath);
          return (url.hostname === 'www.learnmates.org' || url.hostname === 'learnmates.org')
            ? `${url.pathname}${url.search}${url.hash}`
            : localPath;
        } catch {
          return localPath;
        }
      })()
    : localPath;

  if (!isR2ManagedAssetPath(normalizedPath)) {
    return null;
  }

  const r2Url = getR2Url(localPath);
  if (!r2Url) {
    return null;
  }

  try {
    // DISABLED: HEAD request checks cause CORS issues and aren't necessary
    // R2 will be used as fallback only if local file fetch fails
    // Just return the R2 URL without verification - actual fetch will fail safely if file doesn't exist
    console.log(`[R2 Utils] R2 URL available (CORS checks disabled): ${r2Url}`);
    return r2Url;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn(`[R2 Utils] Error checking R2 for ${localPath}:`, errorMsg);
    return null;
  }
}

/**
 * Dual-path file resolution:
 * For /Questions/ directory: Go directly to R2 (files are stored there, skip local check)
 * For other paths: Try local first, then R2 fallback
 * 
 * @param localPath - Local file path or already-resolved R2 URL
 * @returns Resolved URL (local path or R2 URL)
 */
export async function resolveFileUrl(localPath: string): Promise<string> {
  // If already an R2 URL, return as-is (avoid double encoding)
  if (localPath.startsWith('https://learnmates.org') || localPath.startsWith('http://')) {
    return localPath;
  }
  
  // For Questions/topicals assets, go directly to R2 (skip local check since files are stored in R2)
  if (isR2ManagedAssetPath(localPath)) {
    const r2Url = await resolveFromR2(localPath);
    if (r2Url) {
      console.log(`[R2 Utils] Using R2 URL directly for Questions path (skipped local check): ${r2Url}`);
      return r2Url;
    }
    // If R2 URL not available, return local path (will be handled by MediaViewer)
    console.warn(`[R2 Utils] R2 URL not available for Questions path, returning local: ${localPath}`);
    return localPath;
  }

  // For non-Questions paths, try local first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout for local check

    const response = await fetch(localPath, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const contentType = (response.headers.get('content-type') || '').toLowerCase();
      if (contentType.includes('application/pdf') || contentType.startsWith('image/')) {
        console.log(`[R2 Utils] Using local file: ${localPath}`);
        return localPath;
      }
    }
  } catch (error) {
    // Local file not available, continue to R2 check
    console.log(`[R2 Utils] Local file not available: ${localPath}`);
  }

  // Fallback to R2 for non-Questions paths
  const r2Url = await resolveFromR2(localPath);
  if (r2Url) {
    return r2Url;
  }

  // If R2 also not available, return local path as final fallback
  console.warn(`[R2 Utils] File not found anywhere, returning local path: ${localPath}`);
  return localPath;
}

/**
 * Synchronous URL resolution (uses cached R2 URLs)
 * For use in situations where async isn't available
 * 
 * @param localPath - Local file path
 * @returns Local path or cached R2 URL
 */
export function resolveFileUrlSync(localPath: string): string {
  // Check cache first
  if (r2UrlCache.has(localPath)) {
    return r2UrlCache.get(localPath)!;
  }

  // Return local path if not cached
  return localPath;
}

/**
 * Fetch a file from R2 as a Blob
 * Handles CORS issues by attempting direct fetch first, then CORS proxy as fallback
 * 
 * @param r2Url - R2 URL to fetch
 * @returns Blob data, or null if fetch fails
 */
export async function fetchR2AsBlob(r2Url: string): Promise<Blob | null> {
  // Check blob cache first
  if (r2BlobCache.has(r2Url)) {
    return r2BlobCache.get(r2Url)!;
  }

  const fetchPromise = (async () => {
    try {
      // Try direct fetch first (best performance)
      console.log(`[R2 Utils] Attempting direct R2 fetch: ${r2Url}`);
      try {
        const response = await fetch(r2Url, {
          method: 'GET',
          headers: {
            'Accept': '*/*'
          }
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          const blob = await response.blob();
          const blobType = blob.type || '';
          const finalContentType = contentType || blobType || '';
          
          console.log(`[R2 Utils] Successfully fetched R2 blob: ${r2Url.substring(0, 50)}..., content-type: ${finalContentType}, blob size: ${blob.size} bytes`);
          
          // Validate it's actually a PDF or image, not HTML (404 page)
          if (finalContentType.includes('text/html') || finalContentType.includes('application/json')) {
            console.warn(`[R2 Utils] R2 returned HTML/JSON instead of PDF/image, likely 404 or error page. Content-Type: ${finalContentType}, Size: ${blob.size} bytes`);
            // Try to read first few bytes to confirm it's HTML (without consuming the blob)
            if (blob.size < 10000) { // Small files might be error pages
              const firstChunk = blob.slice(0, Math.min(100, blob.size));
              const text = await firstChunk.text();
              if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html') || text.trim().startsWith('{')) {
                console.error(`[R2 Utils] Confirmed: R2 returned HTML/JSON error page instead of file`);
                // Don't return null here - try CORS proxy as fallback
              } else {
                return blob; // Not HTML, return it
              }
            } else {
              // Don't return null here - try CORS proxy as fallback
            }
          } else {
            // Additional validation: check blob size (PDFs should be > 0 bytes)
            if (blob.size === 0) {
              console.warn(`[R2 Utils] R2 returned empty blob`);
              // Don't return null here - try CORS proxy as fallback
            } else {
              return blob; // Valid blob, return it
            }
          }
        } else {
          console.warn(`[R2 Utils] Direct fetch returned status ${response.status}, trying CORS workaround`);
        }
      } catch (fetchErr: any) {
        // CORS error or network error - try CORS proxy
        const isCorsError = fetchErr?.message?.includes('CORS') || 
                          fetchErr?.message?.includes('Cross-Origin') ||
                          fetchErr?.name === 'TypeError';
        if (isCorsError) {
          console.warn(`[R2 Utils] CORS error on direct fetch, trying CORS proxy:`, fetchErr?.message);
        } else {
          console.warn(`[R2 Utils] Direct fetch failed, trying CORS proxy:`, fetchErr?.message);
        }
      }
      
      // If direct fetch fails or returns invalid content, try with a CORS proxy
      // Note: CORS proxies may not always be available, but they help when R2 CORS is not configured
      const corsProxies = [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
      ];
      
      for (const proxy of corsProxies) {
        try {
          const proxiedUrl = proxy + encodeURIComponent(r2Url);
          console.log(`[R2 Utils] Attempting fetch through CORS proxy: ${proxy.substring(0, 30)}...`);
          const proxyResponse = await fetch(proxiedUrl, {
            method: 'GET',
            headers: {
              'Accept': '*/*'
            }
          });

          if (proxyResponse.ok) {
            const contentType = proxyResponse.headers.get('content-type') || '';
            const blob = await proxyResponse.blob();
            const blobType = blob.type || '';
            const finalContentType = contentType || blobType || '';
            
            // Validate it's actually a PDF or image
            if (finalContentType.includes('text/html') || finalContentType.includes('application/json')) {
              console.warn(`[R2 Utils] CORS proxy returned HTML/JSON, trying next proxy`);
              continue;
            }
            
            if (blob.size === 0) {
              console.warn(`[R2 Utils] CORS proxy returned empty blob, trying next proxy`);
              continue;
            }
            
            console.log(`[R2 Utils] Successfully fetched R2 blob via CORS proxy: ${proxy.substring(0, 30)}...`);
            return blob;
          }
        } catch (proxyErr) {
          console.warn(`[R2 Utils] CORS proxy fetch failed:`, proxyErr);
          continue; // Try next proxy
        }
      }

      console.error(`[R2 Utils] All fetch attempts failed for: ${r2Url}`);
      return null;
    } catch (err) {
      console.error(`[R2 Utils] Error fetching R2 blob:`, err);
      return null;
    }
  })();

  // Cache the promise
  r2BlobCache.set(r2Url, fetchPromise);
  return fetchPromise;
}

/**
 * Fetch a file from R2 as a Blob URL (for PDF.js and similar)
 * This creates a blob URL that can be used without CORS issues
 * 
 * @param r2Url - R2 URL to fetch
 * @returns Blob URL (blob://...), or null if fetch fails
 */
export async function fetchR2AsBlobUrl(r2Url: string): Promise<string | null> {
  const blob = await fetchR2AsBlob(r2Url);
  if (blob) {
    const blobUrl = URL.createObjectURL(blob);
    console.log(`[R2 Utils] Created blob URL from R2 file`);
    return blobUrl;
  }
  return null;
}

/**
 * Clear the R2 blob cache
 * Useful for cleanup
 */
export function clearR2Cache(): void {
  r2UrlCache.clear();
  console.log('[R2 Utils] Cache cleared');
}

/**
 * Preload R2 URLs for a batch of files
 * Populates the cache with R2 URLs without checking existence
 * 
 * @param paths - Array of local file paths
 */
export function preloadR2Urls(paths: string[]): void {
  paths.forEach((path) => {
    const r2Url = getR2Url(path);
    // Just populating the cache with transformations, no existence checks
  });
  console.log(`[R2 Utils] Preloaded ${paths.length} R2 URLs`);
}

/**
 * Get diagnostic information about R2 configuration
 */
export function getR2Config(): {
  baseUrl: string;
  bucketUrl: string;
  enabled: boolean;
} {
  return {
    baseUrl: R2_BASE_URL,
    bucketUrl: R2_BUCKET_URL,
    enabled: !!(import.meta as any).env?.VITE_R2_BUCKET_URL,
  };
}
