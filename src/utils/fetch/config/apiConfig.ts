// src/config/apiConfig.ts

// Types for the configuration
interface ProxyConfig {
  enabled: boolean;
  url: string;
  auth?: {
    username: string;
    password: string;
  };
  timeout?: number;
}

interface ApiConfig {
  host: string;
  port: number | string;
  protocol: 'http' | 'https';
  getFullUrl: () => string;
  getWsUrl: () => string;
  update: (newConfig: Partial<Omit<ApiConfig, 'getFullUrl' | 'update' | 'loadFromStorage' | 'saveToStorage'>>) => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
  proxy?: ProxyConfig;
}

// Storage key for localStorage
const STORAGE_KEY = 'api-config';

// Default configuration values
const defaultConfig = {
  host: import.meta.env.VITE_API_HOST || '127.0.0.1',
  port: import.meta.env.VITE_API_PORT || 3000,
  protocol: 'http' as const,
  proxy: import.meta.env.VITE_USE_PROXY === 'true' ? {
    enabled: true,
    url: import.meta.env.VITE_PROXY_URL || 'http://localhost:3001',
    auth: (import.meta.env.VITE_PROXY_USERNAME && import.meta.env.VITE_PROXY_PASSWORD) ? {
      username: import.meta.env.VITE_PROXY_USERNAME,
      password: import.meta.env.VITE_PROXY_PASSWORD
    } : undefined,
    timeout: 30000
  } : undefined
};

// Load configuration from localStorage
const loadConfigFromStorage = (): Partial<ApiConfig> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('Loaded config from localStorage:', parsed);
      return parsed;
    }
  } catch (error) {
    console.warn('Failed to load config from localStorage:', error);
  }
  return {};
};

// Save configuration to localStorage
const saveConfigToStorage = (config: Partial<ApiConfig>): void => {
  try {
    // Only save serializable properties
    const configToSave = {
      host: config.host,
      port: config.port,
      protocol: config.protocol,
      proxy: config.proxy
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configToSave));
    console.log('Config saved to localStorage:', configToSave);
  } catch (error) {
    console.error('Failed to save config to localStorage:', error);
  }
};

// Initialize configuration with localStorage data
const storedConfig = loadConfigFromStorage();

// Create the main API configuration object
const apiConfig: ApiConfig = {
  // Merge default config with stored config
  ...defaultConfig,
  ...storedConfig,
  
  getFullUrl(): string {
    return `${this.protocol}://${this.host}:${this.port}`;
  },
  getWsUrl(): string {
    return `${this.protocol === 'http' ? 'ws' : 'wss'}://${this.host}:${this.port}/ws`;
  },
  update(newConfig: Partial<Omit<ApiConfig, 'getFullUrl' | 'update' | 'loadFromStorage' | 'saveToStorage'>>) {
    // Update the current configuration
    Object.assign(this, newConfig);
    
    // Save to localStorage
    this.saveToStorage();
    
    console.log('API config updated:', this.getFullUrl());
  },
  
  loadFromStorage() {
    const stored = loadConfigFromStorage();
    Object.assign(this, { ...defaultConfig, ...stored });
    console.log('Config reloaded from storage:', this.getFullUrl());
  },
  
  saveToStorage() {
    saveConfigToStorage(this);
  }
};

// Initial save to ensure localStorage has the current config
apiConfig.saveToStorage();

export default apiConfig;
export type { ApiConfig, ProxyConfig };
export { apiConfig };