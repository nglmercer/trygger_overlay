import { PrefixedApi } from './commons/BaseApi';
import apiConfig, { type ApiConfig } from '../../config/apiConfig';

export interface Draft {
    id: string;
    content: string;
    mediaIds: string[];
    createdAt: number;
    updatedAt: number;
}
/*
    content: z.string().optional(),
    mediaIds: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    status: statusSchema.optional()
*/
export enum DraftStatus {
  DRAFT = 0,
  IN_REVIEW = 1,
  SCHEDULED = 2,
  PUBLISHED = 3,
  ARCHIVED = 4
}
export interface CreateDraftDto {
    content?: string;
    mediaIds?: string[];
    tags?: string[];
    status?: DraftStatus;
}

export interface UpdateDraftDto {
    content?: string;
    mediaIds?: string[];
}

class DraftsApi extends PrefixedApi {
    constructor(config: typeof apiConfig) {
        super(config, '/api/drafts');
    }

    async getAllDrafts(): Promise<Draft[]> {
        return this.get<Draft[]>('');
    }

    async getDraftById(id: string): Promise<Draft> {
        return this.get<Draft>(`/${id}`);
    }

    async createDraft(data: CreateDraftDto): Promise<Draft> {
        return this.post<Draft>('', data);
    }

    async updateDraft(id: string, data: UpdateDraftDto): Promise<Draft> {
        return this.put<Draft>(`/${id}`, data);
    }

    async deleteDraft(id: string): Promise<{ message: string }> {
        return this.delete<{ message: string }>(`/${id}`);
    }
}

export default DraftsApi;
