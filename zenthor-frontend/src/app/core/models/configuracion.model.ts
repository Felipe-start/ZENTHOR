export interface ConfiguracionRecordatorios {
  usuario_id: string;
  recordatorios_activos: boolean;
  recordatorio_24h: boolean;
  recordatorio_1h: boolean;
  created_at: Date;
  updated_at: Date;
}