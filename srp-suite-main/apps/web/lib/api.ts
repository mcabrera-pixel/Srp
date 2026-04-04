/**
 * SRP Suite API Client
 * Connects to Cloudflare Worker API
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://srp-api.web24pro.workers.dev';

// ── Types ──

export interface User {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    org_id: string | null;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface Job {
    id: string;
    org_id: string | null;
    document_id: string | null;
    content_type: string;
    title: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    notebook_id: string | null;
    artifact_id: string | null;
    output_r2_key: string | null;
    metadata: string;
    error: string | null;
    requested_by: string | null;
    created_at: string;
    completed_at: string | null;
}

export interface Document {
    id: string;
    org_id: string | null;
    title: string;
    r2_key: string | null;
    version: number;
    status: string;
    expires_at: string | null;
    created_by: string | null;
    created_at: string;
}

export interface ApiError {
    error: string;
}

// ── Helpers ──

function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('srp_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error((body as ApiError).error || `HTTP ${res.status}`);
    }

    // Handle 204 No Content
    if (res.status === 204) {
        return null as T;
    }

    return res.json();
}

// ── Auth ──

export const api = {
    auth: {
        login(email: string, password: string) {
            return request<AuthResponse>('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
        },

        register(data: {
            email: string;
            password: string;
            full_name?: string;
            org_name?: string;
        }) {
            return request<AuthResponse>('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },

        me() {
            return request<{ status: string }>('/api/auth/me');
        },
    },

    // ── Jobs ──

    jobs: {
        list(params?: { status?: string; org_id?: string; limit?: number }) {
            const searchParams = new URLSearchParams();
            if (params?.status) searchParams.set('status', params.status);
            if (params?.org_id) searchParams.set('org_id', params.org_id);
            if (params?.limit) searchParams.set('limit', params.limit.toString());
            const qs = searchParams.toString();
            return request<{ jobs: Job[]; count: number }>(`/api/jobs${qs ? `?${qs}` : ''}`);
        },

        get(id: string) {
            return request<Job>(`/api/jobs/${id}`);
        },

        create(data: {
            content_type: string;
            title: string;
            org_id?: string;
            document_id?: string;
            metadata?: Record<string, unknown>;
            requested_by?: string;
        }) {
            return request<{ id: string; status: string }>('/api/jobs', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },
    },

    // ── Documents ──

    documents: {
        list(params?: { status?: string; org_id?: string; limit?: number }) {
            const searchParams = new URLSearchParams();
            if (params?.status) searchParams.set('status', params.status);
            if (params?.org_id) searchParams.set('org_id', params.org_id);
            if (params?.limit) searchParams.set('limit', params.limit.toString());
            const qs = searchParams.toString();
            return request<{ documents: Document[]; count: number }>(`/api/documents${qs ? `?${qs}` : ''}`);
        },

        get(id: string) {
            return request<Document>(`/api/documents/${id}`);
        },

        create(data: {
            title: string;
            org_id?: string;
            content_md?: string;
            created_by?: string;
            expires_at?: string;
        }) {
            return request<{ id: string; status: string }>('/api/documents', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },

        delete(id: string) {
            return request<{ id: string; status: string }>(`/api/documents/${id}`, {
                method: 'DELETE',
            });
        },

        async upload(id: string, file: File) {
            const token = getToken();
            const res = await fetch(`${API_BASE}/api/documents/${id}/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': file.type || 'application/pdf',
                    'X-File-Name': file.name,
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: await file.arrayBuffer(),
            });
            if (!res.ok) throw new Error('Upload failed');
            return res.json() as Promise<{ id: string; r2_key: string; status: string }>;
        },
    },
};
