// Endpoints para Planificador de Metas (mock, para conectar IA y persistencia luego)

export async function sugerirMicroMetasIA(metaPrincipal: string) {
  // Aquí se conectará con la IA
  return [];
}

export async function guardarMeta(meta: any) {
  // Aquí se conectará con la base de datos
  return { ok: true };
} 