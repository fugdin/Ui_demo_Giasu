// ─── Field (Ngành) ──────────────────────────────────────

export interface Field {
  id: string;
  name: string;
  hasAssessment: boolean;
  courseCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFieldRequest {
  name: string;
  hasAssessment: boolean;
}

export interface UpdateFieldRequest {
  name?: string;
  hasAssessment?: boolean;
}
