import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";
import { useAuth } from "./auth/authProvider";
import { vi } from "vitest";

// Mock auth context to provide a fake user session
vi.mock("./auth/authProvider", () => {
  const useAuthMock = vi.fn();
  return { useAuth: useAuthMock, supabase: {} };
});

// Mock supabase client methods used in components if needed
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: "test-user-id" } } } }),
      onAuthStateChange: vi.fn().mockImplementation((callback) => {
        // invoke callback immediately with a fake session
        callback("SIGNED_IN", { user: { id: "test-user-id" } });
        return { data: { subscription: () => {} } };
      }),
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    }),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: "test.jpg" }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "http://example.com/test.jpg" } }),
      }),
    },
  })),
}));

describe("Full App Navigation", () => {
  const mockUseAuth = {
    session: { user: { id: "test-user-id" } },
    user: { id: "test-user-id" },
    profile: { role: "user" },
    loading: false,
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
  };

  beforeEach(() => {
    (useAuth as vi.Mock).mockReturnValue(mockUseAuth);
    // Reset the URL to a known state before each test
    window.history.replaceState({}, "", "/");
  });

  test("renders navbar links and navigates to correct pages", async () => {
    render(<App />);

    // Helper to click a link and wait for URL change
    const clickAndWait = async (linkText: string, expectedPath: string) => {
      const link = screen.getAllByRole("link", { name: new RegExp(linkText, "i") })[0];
      await fireEvent.click(link);
      // Wait for URL to update
      await waitFor(() => {
        expect(window.location.pathname).toBe(expectedPath);
      });
    };

    // Test each navbar link
    await clickAndWait("Accueil", "/home");
    await clickAndWait("Articles", "/articles");
    await clickAndWait("Catégories", "/categories");
    await clickAndWait("À propos", "/about");
    await clickAndWait("Contact", "/contact");
  }, 15000);

  test("navbar logo links to home", async () => {
    // Start at /articles
    window.history.pushState({}, "", "/articles");
    render(<App />);

    const logo = screen.getByRole("link", { name: /blogidsi/i });
    await fireEvent.click(logo);
    await waitFor(() => {
      expect(window.location.pathname).toBe("/home");
    });
  });

  test("home page 'Voir tous les articles' button navigates to articles", async () => {
    render(<App />);

    // Find the button/link with text "Voir tous les articles" in the home page
    const viewAllLink = screen.getAllByRole("link", { name: /voir tous les articles/i })[0];
    await fireEvent.click(viewAllLink);
    await waitFor(() => {
      expect(window.location.pathname).toBe("/articles");
    });
  });

  test("article detail page 'Retour aux articles' button navigates back", async () => {
    // Start at an article detail page
    window.history.pushState({}, "", "/article/1");
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /retour aux articles/i })).toBeInTheDocument();
    });

    const backButton = screen.getByRole("button", { name: /retour aux articles/i });
    await fireEvent.click(backButton);
    await waitFor(() => {
      expect(window.location.pathname).toBe("/articles");
    });
  });

  test("home page category link navigates to articles with filter", async () => {
    render(<App />);

    // Click a category link (e.g., React) on the home page
    const reactLink = screen.getAllByRole("link", { name: /^react$/i })[0];
    await fireEvent.click(reactLink);
    await waitFor(() => {
      // Expect the URL to have query param category=react
      expect(window.location.pathname).toBe("/articles");
      expect(window.location.search).toContain("category=react");
    });
  });

  test("navbar logout button calls logout and redirects to login", async () => {
    render(<App />);

    // Open user menu dropdown
    const menuTrigger = screen.getByRole("button", { name: /menu utilisateur/i });
    fireEvent.click(menuTrigger);

    const logoutButton = screen.getByRole("button", { name: /déconnexion/i });
    await fireEvent.click(logoutButton);

    // Expect logout method called
    expect(mockUseAuth.logout).toHaveBeenCalledTimes(1);
    // Expect navigation to login
    await waitFor(() => {
      expect(window.location.pathname).toBe("/login");
    });
  });
});
