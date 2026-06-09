const DEFAULT_API_URL = "http://127.0.0.1:8080/blog/api";

export const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, "");
export const API_HEALTH_URL = `${API_URL}/hello`;
export const TOKEN_KEY = "blog_auth_token";

export type ApiUser = {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

export type AuthPayload = {
  token: string;
  user: ApiUser;
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string | null) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

const isBackendReachable = async () => {
  try {
    const response = await fetch(API_HEALTH_URL);
    return response.ok;
  } catch {
    return false;
  }
};

const readableErrorMessage = (path: string, status: number, message: string) => {
  const cleanMessage = message.trim();
  const isHtmlError = cleanMessage.startsWith("<!doctype html") || cleanMessage.includes("<html");

  if (path === "/auth/login" && status === 401) {
    return "Email ou mot de passe incorrect. Verifie tes informations puis reessaie.";
  }
  if (path === "/auth/change-password" && status === 401) {
    return isHtmlError || !cleanMessage ? "Connecte-toi pour changer ton mot de passe." : cleanMessage;
  }
  if (path === "/auth/register" && status === 409) {
    return "Cet email est deja utilise. Connecte-toi ou utilise une autre adresse.";
  }
  if (status === 401) {
    return "Ta session a expire. Reconnecte-toi pour continuer.";
  }
  if (status === 403) {
    return "Action reservee a l'administrateur.";
  }
  if (status === 400) {
    return isHtmlError || !cleanMessage ? "Verifie les informations saisies." : cleanMessage;
  }

  return isHtmlError || !cleanMessage ? `Erreur API ${status}` : cleanMessage;
};

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    const backendIsReachable = await isBackendReachable();
    if (backendIsReachable) {
      throw new Error(
        `Backend OK sur ${API_HEALTH_URL}, mais l'appel ${path} echoue. Verifie Supabase et les logs Tomcat.`
      );
    }
    throw new Error(`Backend indisponible. Demarre Tomcat avec l'API sur ${API_URL}. Test: ${API_HEALTH_URL}`);
  }

  if (!response.ok) {
    const message = await response.text();
    if (response.status >= 500) {
      throw new Error(`Erreur serveur ${response.status} sur ${path}. Verifie Supabase et les logs Tomcat.`);
    }
    throw new Error(readableErrorMessage(path, response.status, message));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<AuthPayload>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password: string) =>
    apiRequest<AuthPayload>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest<void>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  me: () => apiRequest<ApiUser>("/auth/me"),
};
