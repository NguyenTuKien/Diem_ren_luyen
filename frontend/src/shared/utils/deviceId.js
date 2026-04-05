const DEVICE_ID_KEY = 'drl_device_id';

function createFallbackUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function generateDeviceId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return createFallbackUuid();
}

export function getOrCreateDeviceId() {
  if (typeof window === 'undefined') {
    return generateDeviceId();
  }

  const existingId = window.localStorage.getItem(DEVICE_ID_KEY);
  if (existingId && existingId.trim()) {
    return existingId;
  }

  const nextId = generateDeviceId();
  window.localStorage.setItem(DEVICE_ID_KEY, nextId);
  return nextId;
}
