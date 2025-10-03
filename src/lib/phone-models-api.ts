// Utilidades para consumir la API REST de modelos de celular
export async function fetchPhoneModels(): Promise<{ id: string, name: string }[]> {
  const res = await fetch('/api/phone-models', { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export async function deletePhoneModel(id: string): Promise<boolean> {
  const res = await fetch(`/api/phone-models?id=${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar modelo');
  return true;
}

export async function updatePhoneModel(id: string, name: string): Promise<{ id: string; name: string }> {
  const res = await fetch(`/api/phone-models`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name })
  });
  if (!res.ok) throw new Error('Error al editar modelo');
  return await res.json();
}

export async function createPhoneModel(name: string): Promise<{ id: string, name: string } | null> {
  const res = await fetch('/api/phone-models', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!res.ok) return null;
  return res.json();
}
