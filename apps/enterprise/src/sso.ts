/** Extora Enterprise — SSO/SAML/OIDC Integration Stub */
interface SSOProvider { id: string; name: string; type: "saml"|"oidc"; issuerUrl: string; cert: string; isActive: boolean; }
interface SSOConfig { providers: SSOProvider[]; defaultRedirect: string; enforceSSO: boolean; }

function createSSOConfig(): SSOConfig {
  return { providers: [], defaultRedirect: "/studio", enforceSSO: false };
}

function addProvider(config: SSOConfig, provider: SSOProvider): SSOConfig {
  return { ...config, providers: [...config.providers, provider] };
}

function removeProvider(config: SSOConfig, id: string): SSOConfig {
  return { ...config, providers: config.providers.filter(p => p.id !== id) };
}

export { createSSOConfig, addProvider, removeProvider };
export type { SSOProvider, SSOConfig };
