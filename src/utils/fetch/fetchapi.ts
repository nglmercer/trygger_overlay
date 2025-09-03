import BaseApi, { PrefixedApi } from './commons/BaseApi';
import type { FetchOptions } from './commons/httpservice';
import apiConfig from './config/apiConfig';

// Tipos para el API de medios
export type MediaType = 'image' | 'audio' | 'video';
export interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  name?: string;
  metadata?: Record<string, any>;
}

// API para subir/listar/eliminar medios
export class MediaApi extends PrefixedApi {
  constructor(config = apiConfig) {
    super(config, '/api/media');
  }

  // Subir archivo por tipo: image | audio | video
  async upload(
    type: MediaType,
    file: File | Blob,
    opts: { name?: string; metadata?: any; fileName?: string; extraFields?: Record<string, any> } = {},
    fetchOptions: FetchOptions = {}
  ): Promise<MediaItem> {
    const form = new FormData();

    const filename = opts.fileName || (file instanceof File ? file.name : 'upload');
    form.append('file', file, filename);

    if (opts.name) form.append('name', String(opts.name));
    if (typeof opts.metadata !== 'undefined') {
      try {
        const metaStr = typeof opts.metadata === 'string' ? opts.metadata : JSON.stringify(opts.metadata);
        form.append('metadata', metaStr);
      } catch (e) {
        console.warn('Metadata inválido, no se pudo serializar a JSON:', e);
      }
    }

    if (opts.extraFields) {
      for (const [k, v] of Object.entries(opts.extraFields)) {
        form.append(k, typeof v === 'string' ? v : JSON.stringify(v));
      }
    }

    return this.post<MediaItem>(`/upload/${type}`, form, fetchOptions);
  }

  // Listar todos los medios
  async list(fetchOptions: FetchOptions = {}): Promise<Record<string, MediaItem>> {
    return this.get<Record<string, MediaItem>>('/data', fetchOptions);
  }

  // Eliminar medio por id
  async remove(id: string, fetchOptions: FetchOptions = {}): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/${id}`, fetchOptions);
  }
  async getByType(type: MediaType, fetchOptions: FetchOptions = {}): Promise<MediaItem[]> {
    return this.get<MediaItem[]>(`/data/${type}`, fetchOptions);
  }
}

// Exportar todas las instancias y utilidades
export {
  BaseApi,
  apiConfig,
};

// Exportar una instancia lista para usar
export const mediaApi = new MediaApi(apiConfig);

