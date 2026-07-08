type Locale = "pt-BR" | "en" | "es";

const translations: Record<Locale, Record<string, string>> = {
  "pt-BR": {
    dashboard: "Dashboard",
    patients: "Pacientes",
    financial: "Financeiro",
    schedule: "Agenda",
    documents: "Documentos",
    inventory: "Estoque",
    reports: "Relatórios",
    settings: "Configurações",
    logout: "Sair",
    save: "Salvar",
    cancel: "Cancelar",
    search: "Buscar",
    loading: "Carregando...",
    error: "Erro",
    success: "Sucesso",
    confirm: "Confirmar",
    delete: "Excluir",
    edit: "Editar",
    create: "Criar",
    back: "Voltar",
    next: "Próximo",
    previous: "Anterior",
  },
  en: {
    dashboard: "Dashboard",
    patients: "Patients",
    financial: "Financial",
    schedule: "Schedule",
    documents: "Documents",
    inventory: "Inventory",
    reports: "Reports",
    settings: "Settings",
    logout: "Logout",
    save: "Save",
    cancel: "Cancel",
    search: "Search",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    confirm: "Confirm",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    back: "Back",
    next: "Next",
    previous: "Previous",
  },
  es: {
    dashboard: "Panel",
    patients: "Pacientes",
    financial: "Financiero",
    schedule: "Agenda",
    documents: "Documentos",
    inventory: "Inventario",
    reports: "Informes",
    settings: "Configuración",
    logout: "Salir",
    save: "Guardar",
    cancel: "Cancelar",
    search: "Buscar",
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    confirm: "Confirmar",
    delete: "Eliminar",
    edit: "Editar",
    create: "Crear",
    back: "Volver",
    next: "Siguiente",
    previous: "Anterior",
  },
};

// Default locale
let currentLocale: Locale = "pt-BR";

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: string): string {
  return translations[currentLocale]?.[key] || translations["pt-BR"][key] || key;
}

export function getAvailableLocales(): { id: Locale; label: string }[] {
  return [
    { id: "pt-BR", label: "Português (Brasil)" },
    { id: "en", label: "English" },
    { id: "es", label: "Español" },
  ];
}
