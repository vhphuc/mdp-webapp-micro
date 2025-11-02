import { Injectable } from '@angular/core';
import { Observable, interval, Subscription } from 'rxjs';
import { appRoute } from 'src/app/app.const';

@Injectable({
  providedIn: 'root',
})
export class UpdateCheckService {
  private checkInterval = 300000; // Check every 5 minutes
  private intervalSubscription: Subscription | null = null;
  private activeCheckSubscription: Subscription | null = null;
  private isChecking = false; // Prevent concurrent checks
  private cachedCurrentVersion: string | null = null; // Cache current version from version.txt

  constructor() {}

  // Cache the current version from version.txt
  private cacheCurrentVersion(version: string): void {
    this.cachedCurrentVersion = version;
  }

  // Extract build ID from version text file (simple text file with just the build ID)
  private extractVersionFromText(text: string): string {
    try {
      // Version file contains just the build ID as plain text (trimmed)
      return text.trim() || 'unknown';
    } catch (error) {
      console.error('Failed to parse version:', error);
      return 'unknown';
    }
  }

  // Compare build IDs (numeric comparison)
  private compareBuildIds(current: string, server: string): boolean {
    return current !== server;
  }

  // Check for update by loading version.txt in an iframe (shows as "Doc" in Network tab)
  // This is much lighter than loading index.html - just a simple text file with the build ID
  checkForUpdate(): Observable<boolean> {
    // Prevent concurrent checks to avoid multiple iframes and performance issues
    if (this.isChecking) {
      return new Observable<boolean>((observer) => {
        observer.error(new Error('Update check already in progress'));
      });
    }
    
    // Use cache-busting query param to bypass browser cache
    const url = `${appRoute}/version.txt?v=${Date.now()}`;
    
    return new Observable<boolean>((observer) => {
      this.isChecking = true;
      
      // Create a hidden iframe to load the version file (will show as "Doc" type in Network tab)
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.visibility = 'hidden';
      
      let isCompleted = false;
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      
      const cleanup = () => {
        if (isCompleted) return;
        isCompleted = true;
        this.isChecking = false;
        
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        
        // Remove event listeners before removing iframe
        iframe.removeEventListener('load', handleLoad);
        iframe.removeEventListener('error', handleError);
        
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      };
      
      const handleLoad = () => {
        if (isCompleted) return;
        
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (!iframeDoc) {
            observer.error(new Error('Cannot access iframe document'));
            cleanup();
            return;
          }
          
          // Get the text content from the iframe (version.txt is plain text)
          const versionText = iframeDoc.body?.textContent || iframeDoc.body?.innerText || '';
          const serverVersion = this.extractVersionFromText(versionText);
          console.log('serverVersion', serverVersion);
          
          // Cache current version if not already cached (this is the current app version)
          if (this.cachedCurrentVersion === null) {
            this.cacheCurrentVersion(serverVersion);
            // On first load, there's no update (we're comparing current with current)
            observer.next(false);
            observer.complete();
            cleanup();
            return;
          }
          
          const hasUpdate = this.compareBuildIds(this.cachedCurrentVersion, serverVersion);
          console.log('hasUpdate', hasUpdate);
          
          observer.next(hasUpdate);
          observer.complete();
          cleanup();
        } catch (error) {
          console.error('Failed to check for update:', error);
          observer.error(error);
          cleanup();
        }
      };
      
      const handleError = () => {
        if (isCompleted) return;
        
        console.error('Failed to load version file for update check');
        observer.error(new Error('Failed to load version file'));
        cleanup();
      };
      
      iframe.addEventListener('load', handleLoad);
      iframe.addEventListener('error', handleError);
      
      // Set cache-busting and navigate
      iframe.src = url;
      
      // Add to document to trigger load
      document.body.appendChild(iframe);
      
      // Timeout fallback
      timeoutId = setTimeout(() => {
        if (!isCompleted) {
          observer.error(new Error('Timeout loading version file'));
          cleanup();
        }
      }, 5000); // 5 second timeout
    });
  }

  // Start periodic checking
  startPeriodicCheck(intervalMs: number = this.checkInterval): void {
    // Stop any existing check first
    this.stopPeriodicCheck();
    
    const handleNewUpdate = (hasUpdate: boolean) => {
      if (hasUpdate) {
        const confirm = window.confirm('An update is available. Would you like to refresh the app?');
        if (confirm) {
          window.location.reload();
        }
      }
    };
    
    const handleError = (error: any) => {
      // Silently handle errors - don't spam console for network issues
      console.warn('Update check failed:', error);
    };
    
    // Check immediately on start
    this.activeCheckSubscription = this.checkForUpdate().subscribe({
      next: handleNewUpdate,
      error: handleError
    });
    
    // Then check periodically
    this.intervalSubscription = interval(intervalMs).subscribe(() => {
      // Unsubscribe from previous check if still active
      if (this.activeCheckSubscription) {
        this.activeCheckSubscription.unsubscribe();
      }
      
      this.activeCheckSubscription = this.checkForUpdate().subscribe({
        next: handleNewUpdate,
        error: handleError
      });
    });
  }

  // Stop periodic checking
  stopPeriodicCheck(): void {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
      this.intervalSubscription = null;
    }
    
    if (this.activeCheckSubscription) {
      this.activeCheckSubscription.unsubscribe();
      this.activeCheckSubscription = null;
    }
    
    this.isChecking = false;
  }
}

