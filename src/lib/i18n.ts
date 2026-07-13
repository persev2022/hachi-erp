// Hachi Platform — i18n system

export type Locale = "pt-BR" | "en" | "es";

export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "pt-BR", label: "Português", flag: "BR" },
  { code: "en", label: "English", flag: "US" },
  { code: "es", label: "Español", flag: "ES" },
];

type TranslationKeys = {
  // Navigation
  dashboard: string;
  patients: string;
  schedule: string;
  financial: string;
  inventory: string;
  rooms: string;
  records: string;
  reports: string;
  settings: string;
  communication: string;
  documents: string;
  // Actions
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  create: string;
  search: string;
  filter: string;
  export: string;
  back: string;
  confirm: string;
  // Status
  active: string;
  inactive: string;
  pending: string;
  completed: string;
  // Messages
  loading: string;
  noData: string;
  error: string;
  success: string;
  notAuthenticated: string;
  accessDenied: string;
  requiredField: string;
  savedSuccessfully: string;
  deletedSuccessfully: string;
  confirmDelete: string;
  // Auth
  login: string;
  logout: string;
  email: string;
  password: string;
  forgotPassword: string;
  // Common
  name: string;
  phone: string;
  date: string;
  status: string;
  actions: string;
  total: string;
  theme: string;
  language: string;
};

const translations: Record<Locale, TranslationKeys> = {
  "pt-BR": {
    dashboard: "Painel",
    patients: "Pacientes",
    schedule: "Agenda",
    financial: "Financeiro",
    inventory: "Estoque",
    rooms: "Quartos",
    records: "Prontuário",
    reports: "Relatórios",
    settings: "Configurações",
    communication: "Comunicação",
    documents: "Documentos",
    save: "Salvar",
    cancel: "Cancelar",
    delete: "Excluir",
    edit: "Editar",
    create: "Criar",
    search: "Buscar",
    filter: "Filtrar",
    export: "Exportar",
    back: "Voltar",
    confirm: "Confirmar",
    active: "Ativo",
    inactive: "Inativo",
    pending: "Pendente",
    completed: "Concluído",
    loading: "Carregando...",
    noData: "Nenhum dado encontrado",
    error: "Erro",
    success: "Sucesso",
    notAuthenticated: "Não autenticado",
    accessDenied: "Acesso negado",
    requiredField: "Campo obrigatório",
    savedSuccessfully: "Salvo com sucesso",
    deletedSuccessfully: "Excluído com sucesso",
    confirmDelete: "Tem certeza que deseja excluir?",
    login: "Entrar",
    logout: "Sair",
    email: "E-mail",
    password: "Senha",
    forgotPassword: "Esqueci a senha",
    name: "Nome",
    phone: "Telefone",
    date: "Data",
    status: "Status",
    actions: "Ações",
    total: "Total",
    theme: "Tema",
    language: "Idioma",
  },
  en: {
    dashboard: "Dashboard",
    patients: "Patients",
    schedule: "Schedule",
    financial: "Financial",
    inventory: "Inventory",
    rooms: "Rooms",
    records: "Records",
    reports: "Reports",
    settings: "Settings",
    communication: "Communication",
    documents: "Documents",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    search: "Search",
    filter: "Filter",
    export: "Export",
    back: "Back",
    confirm: "Confirm",
    active: "Active",
    inactive: "Inactive",
    pending: "Pending",
    completed: "Completed",
    loading: "Loading...",
    noData: "No data found",
    error: "Error",
    success: "Success",
    notAuthenticated: "Not authenticated",
    accessDenied: "Access denied",
    requiredField: "Required field",
    savedSuccessfully: "Saved successfully",
    deletedSuccessfully: "Deleted successfully",
    confirmDelete: "Are you sure you want to delete?",
    login: "Sign in",
    logout: "Sign out",
    email: "Email",
    password: "Password",
    forgotPassword: "Forgot password",
    name: "Name",
    phone: "Phone",
    date: "Date",
    status: "Status",
    actions: "Actions",
    total: "Total",
    theme: "Theme",
    language: "Language",
  },
  es: {
    dashboard: "Panel",
    patients: "Pacientes",
    schedule: "Agenda",
    financial: "Financiero",
    inventory: "Inventario",
    rooms: "Habitaciones",
    records: "Historial",
    reports: "Informes",
    settings: "Configuración",
    communication: "Comunicación",
    documents: "Documentos",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    create: "Crear",
    search: "Buscar",
    filter: "Filtrar",
    export: "Exportar",
    back: "Volver",
    confirm: "Confirmar",
    active: "Activo",
    inactive: "Inactivo",
    pending: "Pendiente",
    completed: "Completado",
    loading: "Cargando...",
    noData: "No se encontraron datos",
    error: "Error",
    success: "Éxito",
    notAuthenticated: "No autenticado",
    accessDenied: "Acceso denegado",
    requiredField: "Campo obligatorio",
    savedSuccessfully: "Guardado exitosamente",
    deletedSuccessfully: "Eliminado exitosamente",
    confirmDelete: "¿Está seguro que desea eliminar?",
    login: "Ingresar",
    logout: "Salir",
    email: "Correo",
    password: "Contraseña",
    forgotPassword: "Olvidé mi contraseña",
    name: "Nombre",
    phone: "Teléfono",
    date: "Fecha",
    status: "Estado",
    actions: "Acciones",
    total: "Total",
    theme: "Tema",
    language: "Idioma",
  },
};

export function getTranslations(locale: Locale): TranslationKeys {
  return translations[locale] || translations["pt-BR"];
}

export function t(key: keyof TranslationKeys, locale: Locale): string {
  return translations[locale]?.[key] || translations["pt-BR"][key] || key;
}
