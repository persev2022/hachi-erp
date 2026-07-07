/**
 * Feature Flags for Hachi Platform
 *
 * Controls which modules are visible/available per tenant vertical.
 * Phase 1: All features enabled (Recovery vertical default).
 * Phase 2: Features loaded from tenant config via API.
 */

export interface PlatformFeatures {
  // Core modules
  financeiro: boolean;
  agenda: boolean;
  documentos: boolean;
  estoque: boolean;
  comunicacao: boolean;
  relatorios: boolean;
  configuracoes: boolean;

  // Vertical modules
  prontuario: boolean;
  portalFamilia: boolean;
  quartos: boolean;
  prescricoes: boolean;

  // Future modules
  crm: boolean;
  pdv: boolean;
  delivery: boolean;
  reservas: boolean;
}

// Vertical presets
export const VERTICAL_FEATURES: Record<string, PlatformFeatures> = {
  recovery: {
    financeiro: true,
    agenda: true,
    documentos: true,
    estoque: true,
    comunicacao: true,
    relatorios: true,
    configuracoes: true,
    prontuario: true,
    portalFamilia: true,
    quartos: true,
    prescricoes: true,
    crm: false,
    pdv: false,
    delivery: false,
    reservas: false,
  },
  clinic: {
    financeiro: true,
    agenda: true,
    documentos: true,
    estoque: true,
    comunicacao: true,
    relatorios: true,
    configuracoes: true,
    prontuario: true,
    portalFamilia: false,
    quartos: false,
    prescricoes: true,
    crm: true,
    pdv: false,
    delivery: false,
    reservas: false,
  },
  hotel: {
    financeiro: true,
    agenda: true,
    documentos: true,
    estoque: true,
    comunicacao: true,
    relatorios: true,
    configuracoes: true,
    prontuario: false,
    portalFamilia: false,
    quartos: true,
    prescricoes: false,
    crm: true,
    pdv: false,
    delivery: false,
    reservas: true,
  },
  restaurant: {
    financeiro: true,
    agenda: false,
    documentos: true,
    estoque: true,
    comunicacao: true,
    relatorios: true,
    configuracoes: true,
    prontuario: false,
    portalFamilia: false,
    quartos: false,
    prescricoes: false,
    crm: true,
    pdv: true,
    delivery: true,
    reservas: false,
  },
  senior: {
    financeiro: true,
    agenda: true,
    documentos: true,
    estoque: true,
    comunicacao: true,
    relatorios: true,
    configuracoes: true,
    prontuario: true,
    portalFamilia: true,
    quartos: true,
    prescricoes: true,
    crm: false,
    pdv: false,
    delivery: false,
    reservas: false,
  },
  services: {
    financeiro: true,
    agenda: true,
    documentos: true,
    estoque: false,
    comunicacao: true,
    relatorios: true,
    configuracoes: true,
    prontuario: false,
    portalFamilia: false,
    quartos: false,
    prescricoes: false,
    crm: true,
    pdv: false,
    delivery: false,
    reservas: false,
  },
  education: {
    financeiro: true,
    agenda: true,
    documentos: true,
    estoque: false,
    comunicacao: true,
    relatorios: true,
    configuracoes: true,
    prontuario: false,
    portalFamilia: true,
    quartos: false,
    prescricoes: false,
    crm: true,
    pdv: false,
    delivery: false,
    reservas: false,
  },
  vet: {
    financeiro: true,
    agenda: true,
    documentos: true,
    estoque: true,
    comunicacao: true,
    relatorios: true,
    configuracoes: true,
    prontuario: true,
    portalFamilia: true,
    quartos: true,
    prescricoes: true,
    crm: false,
    pdv: false,
    delivery: false,
    reservas: false,
  },
};

/**
 * Get features for the current vertical.
 * Phase 1: always returns recovery (default).
 * Phase 2: will be loaded from tenant config.
 */
export function getFeatures(vertical?: string): PlatformFeatures {
  if (vertical && vertical in VERTICAL_FEATURES) {
    return VERTICAL_FEATURES[vertical];
  }
  return VERTICAL_FEATURES.recovery;
}

/**
 * Check if a specific feature is enabled.
 */
export function isFeatureEnabled(
  feature: keyof PlatformFeatures,
  vertical?: string
): boolean {
  const features = getFeatures(vertical);
  return features[feature];
}
