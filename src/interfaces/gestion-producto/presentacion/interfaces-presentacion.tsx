export interface Presentacion {
  id: number;
  denominacion: string;
  observacion: string | null;
  sistema: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  usuarioCreatedId: number;
  usuarioUpdatedId: number;
  usuarioDeletedId: number | null;
}

export interface DtoConsultarPresentacion {
  data: Presentacion[];
  total: number;
}

export interface ConsultarPresentacion {
  id: number;
  denominacion: string;
  deletedAt?: string | null;
}

export interface SelectPresentacion {
  id: number;
  denominacion: string;
}

export interface SelectEnvase {
  id: number;
  denominacion: string;
}

export interface SelectUnidad {
  id: number;
  denominacion: string;
}