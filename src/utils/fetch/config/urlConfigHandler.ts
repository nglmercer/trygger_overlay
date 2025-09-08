// src/config/urlConfigHandler.ts

import { apiConfig } from './apiConfig';

interface URLConfigParams {
  ws?: string;      // WebSocket URL
  host?: string;    // API host
  port?: string;    // API port
  protocol?: 'http' | 'https';
  reset?: string;   // Reset to defaults
}

/**
 * Parse and apply configuration from URL parameters
 * Supports query parameters like: ?ws=localhost:3001&protocol=https&host=127.0.0.1&port=8080
 */
export class URLConfigHandler {
  private urlParams: URLSearchParams;
  
  constructor() {
    this.urlParams = new URLSearchParams(window.location.search);
  }
  
  /**
   * Apply configuration from URL parameters
   */
  applyFromURL(): boolean {
    let configChanged = false;
    
    console.log('Checking URL parameters for configuration...');
    
    // Handle WebSocket parameter (ws)
    const wsParam = this.urlParams.get('ws');
    if (wsParam) {
      console.log("Found 'ws' parameter:", wsParam);
      configChanged = this.handleWebSocketParam(wsParam) || configChanged;
    }
    
    // Handle individual parameters
    const host = this.urlParams.get('host');
    const port = this.urlParams.get('port');
    const protocol = this.urlParams.get('protocol') as 'http' | 'https';
    
    if (host || port || protocol) {
      configChanged = this.handleIndividualParams({ host, port, protocol }) || configChanged;
    }
    
    // Handle reset parameter
    const reset = this.urlParams.get('reset');
    if (reset === 'true' || reset === '1') {
      console.log('Resetting configuration to defaults');
      this.resetToDefaults();
      configChanged = true;
    }
    
    // Save to localStorage if any changes were made
    if (configChanged) {
      apiConfig.saveToStorage();
      console.log('Configuration updated from URL parameters:', apiConfig.getFullUrl());
      
      // Optionally remove parameters from URL to clean it up
      if (this.urlParams.get('clean') === 'true') {
        this.cleanURL();
      }
    }
    
    return configChanged;
  }
  
  /**
   * Handle WebSocket parameter - can be in various formats:
   * - ws=localhost:3001
   * - ws=wss://example.com:8080
   * - ws=127.0.0.1:3000
   */
  private handleWebSocketParam(wsParam: string): boolean {
    try {
      let host = '';
      let port = 0;
      let protocol: 'http' | 'https' = 'http';
      
      // Remove protocol if present (ws:// or wss://)
      const cleanParam = wsParam.replace(/^wss?:\/\//, '');
      
      // Determine protocol from original ws parameter
      if (wsParam.startsWith('wss://')) {
        protocol = 'https';
      }
      
      // Parse host:port
      const parts = cleanParam.split(':');
      if (parts.length >= 2) {
        host = parts[0];
        port = parseInt(parts[1], 10);
      } else if (parts.length === 1) {
        host = parts[0];
        port = protocol === 'https' ? 443 : 80;
      }
      
      // Validate
      if (!host || isNaN(port) || port <= 0 || port > 65535) {
        console.warn('Invalid WebSocket parameter format:', wsParam);
        return false;
      }
      
      // Apply configuration
      apiConfig.update({
        host,
        port,
        protocol
      });
      
      console.log(`Applied WebSocket config: ${protocol}://${host}:${port}`);
      return true;
      
    } catch (error) {
      console.error('Error parsing WebSocket parameter:', error);
      return false;
    }
  }
  
  /**
   * Handle individual host, port, protocol parameters
   */
  private handleIndividualParams({ host, port, protocol }: {
    host?: string | null;
    port?: string | null;
    protocol?: 'http' | 'https' | null;
  }): boolean {
    const updates: Partial<typeof apiConfig> = {};
    
    if (host) {
      updates.host = host;
      console.log('Setting host from URL:', host);
    }
    
    if (port) {
      const portNum = parseInt(port, 10);
      if (!isNaN(portNum) && portNum > 0 && portNum <= 65535) {
        updates.port = portNum;
        console.log('Setting port from URL:', portNum);
      } else {
        console.warn('Invalid port parameter:', port);
      }
    }
    
    if (protocol && (protocol === 'http' || protocol === 'https')) {
      updates.protocol = protocol;
      console.log('Setting protocol from URL:', protocol);
    }
    
    if (Object.keys(updates).length > 0) {
      apiConfig.update(updates);
      return true;
    }
    
    return false;
  }
  
  /**
   * Reset configuration to defaults
   */
  private resetToDefaults(): void {
    apiConfig.update({
      host: '127.0.0.1',
      port: 3000,
      protocol: 'http'
    });
  }
  
  /**
   * Clean URL parameters after applying configuration
   */
  private cleanURL(): void {
    if (window.history && window.history.replaceState) {
      const url = new URL(window.location.href);
      // Remove config-related parameters
      ['ws', 'host', 'port', 'protocol', 'reset', 'clean'].forEach(param => {
        url.searchParams.delete(param);
      });
      
      window.history.replaceState({}, document.title, url.toString());
      console.log('URL cleaned of configuration parameters');
    }
  }
  
  /**
   * Get current configuration as URL parameters
   */
  getAsURLParams(): string {
    const params = new URLSearchParams();
    params.set('host', apiConfig.host.toString());
    params.set('port', apiConfig.port.toString());
    params.set('protocol', apiConfig.protocol);
    return params.toString();
  }
  
  /**
   * Generate a shareable URL with current configuration
   */
  getShareableURL(): string {
    const url = new URL(window.location.href);
    url.search = this.getAsURLParams();
    return url.toString();
  }
}

// Create and export a singleton instance
export const urlConfigHandler = new URLConfigHandler();

// Auto-apply configuration on module load
export const applyURLConfig = (): boolean => {
  return urlConfigHandler.applyFromURL();
};