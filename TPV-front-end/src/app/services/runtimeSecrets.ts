type SecretStore = Record<string, string>;

declare global {
  interface Window {
    __TPV_LOCAL_SECRETS__?: SecretStore;
  }
}

export function readLocalSecret(name: string): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const runtimeSecrets = window.__TPV_LOCAL_SECRETS__;
  if (runtimeSecrets && runtimeSecrets[name]) {
    return runtimeSecrets[name];
  }

  return window.localStorage.getItem(name) ?? '';
}