export interface ProxyConfig {
    enabled: boolean;
    url: string;
    auth?: {
        username: string;
        password: string;
    };
    timeout?: number;
}

export interface ApiConfig {
    host: string;
    port?: number | string;
    protocol: 'http' | 'https';
    apiPrefix?: string;

    // Methods
    getFullUrl: () => string;
    getWsUrl: () => string;
    update: (newConfig: Partial<Omit<ApiConfig, 'getFullUrl' | 'getWsUrl' | 'update'>>) => void;
    proxy?: ProxyConfig;
}

// 2. Adapters Interface
interface EnvironmentAdapter {
    getConfig: () => Partial<Omit<ApiConfig, 'getFullUrl' | 'getWsUrl' | 'update'>>;
}

// Helper para limpiar valores de entorno
const cleanEnvVar = (value: string | undefined): string | undefined => {
    if (!value || value === 'undefined' || value === 'null') return undefined;
    return value;
};

// 3. Concrete Adapters

// Adapter for Development
const DevelopmentAdapter: EnvironmentAdapter = {
    getConfig: () => {
        const envHost = cleanEnvVar(import.meta.env.VITE_API_HOST);
        return {
            host: envHost || '127.0.0.1',
            port: import.meta.env.VITE_API_PORT || 3000,
            protocol: 'http',
            apiPrefix: import.meta.env.VITE_API_PREFIX || '/',
            proxy: import.meta.env.VITE_USE_PROXY === 'true' ? {
                enabled: false,
                url: import.meta.env.VITE_PROXY_URL || 'http://localhost:3001',
                auth: (import.meta.env.VITE_PROXY_USERNAME && import.meta.env.VITE_PROXY_PASSWORD) ? {
                    username: import.meta.env.VITE_PROXY_USERNAME,
                    password: import.meta.env.VITE_PROXY_PASSWORD
                } : undefined,
                timeout: 30000
            } : undefined
        };
    }
};

// Adapter for Production
const ProductionAdapter: EnvironmentAdapter = {
    getConfig: () => {
        const isBrowser = typeof window !== 'undefined';
        const defaultHost = isBrowser ? window.location.hostname : 'localhost';
        const defaultProtocol = isBrowser && window.location.protocol.includes('https') ? 'https' : 'https';

        const envHost = cleanEnvVar(import.meta.env.VITE_API_HOST);

        return {
            host: envHost || defaultHost,
            port: import.meta.env.VITE_API_PORT ? Number(import.meta.env.VITE_API_PORT) : undefined,
            protocol: (import.meta.env.VITE_API_PROTOCOL as 'http' | 'https') || defaultProtocol,
            apiPrefix: import.meta.env.VITE_API_PREFIX || '/',
            proxy: undefined
        };
    }
};

// 4. Factory
const getConfigAdapter = (): EnvironmentAdapter => {
    if (import.meta.env.MODE === 'production') {
        return ProductionAdapter;
    }
    return DevelopmentAdapter;
};

// 5. Implementation
const createApiConfig = (): ApiConfig => {
    const adapter = getConfigAdapter();
    const initialConfig = adapter.getConfig();

    // Verificación final de seguridad para el host
    const finalHost = (initialConfig.host && initialConfig.host !== 'undefined')
        ? initialConfig.host
        : 'localhost';

    return {
        host: finalHost,
        port: initialConfig.port,
        protocol: initialConfig.protocol || 'http',
        proxy: initialConfig.proxy,
        apiPrefix: initialConfig.apiPrefix,

        getFullUrl: function () {
            const protocol = this.protocol;
            const host = this.host;
            const port = this.port;

            // Lógica para puertos estándar
            const isStandardPort =
                (!port) ||
                (protocol === 'http' && Number(port) === 80) ||
                (protocol === 'https' && Number(port) === 443);

            const portSuffix = isStandardPort ? '' : `:${port}`;

            // --- LÓGICA CORREGIDA DEL PREFIJO ---
            let prefix = '';

            // 1. Verificamos que exista y no sea solo espacios
            if (this.apiPrefix && this.apiPrefix.trim() !== '') {
                // 2. Quitamos todos los slashes iniciales y finales
                const cleanPath = this.apiPrefix.replace(/^\/+|\/+$/g, '');

                // 3. Solo agregamos el slash inicial si queda texto
                // Si apiPrefix era "/", cleanPath será "" y no entra al if.
                if (cleanPath.length > 0) {
                    prefix = `/${cleanPath}`;
                }
            }
            // Resultado final limpio sin slash al final
            return `${protocol}://${host}${portSuffix}${prefix}`;
        },

        getWsUrl: function () {
            const isSecure = this.protocol === 'https';
            const wsProtocol = isSecure ? 'wss' : 'ws';
            const host = this.host;
            const port = this.port;

            const isStandardPort =
                (!port) ||
                (this.protocol === 'http' && Number(port) === 80) ||
                (this.protocol === 'https' && Number(port) === 443);

            const portSuffix = isStandardPort ? '' : `:${port}`;

            return `${wsProtocol}://${host}${portSuffix}`;
        },

        update(newConfig) {
            Object.assign(this, newConfig);
        }
    };
};

export const apiConfig = createApiConfig();

export default apiConfig;