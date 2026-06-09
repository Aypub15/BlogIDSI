import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "./Navbar";
import { vi } from "vitest";

const mockLogout = vi.fn();

// Mock the auth context
vi.mock("../auth/authProvider", () => ({
  useAuth: () => ({
    logout: mockLogout,
    user: { id: 1, name: "Test User", email: "test@example.com", role: "USER" },
  }),
}));

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/", search: "", hash: "", state: null, key: "" }),
  Link: ({ to, children, ...rest }: { to: string; children: React.ReactNode; [key: string]: unknown }) => {
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      window.history.pushState(null, "", to);
      window.dispatchEvent(new PopStateEvent("popstate"));
    };
    return (
      <a href={to} onClick={handleClick} {...rest}>
        {children}
      </a>
    );
  },
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(window.location.search), vi.fn()],
}));

describe("Navbar", () => {
  beforeEach(() => {
    mockLogout.mockReset();
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    window.history.replaceState({}, "", "");
  });

  it("renders all navigation links", () => {
    render(<Navbar />);

    // Check that the logo link is present and points to /home
    const logoLink = screen.getByRole("link", { name: /blogidsi/i });
    expect(logoLink).toHaveAttribute("href", "/home");

    // Check the nav links
    const homeLink = screen.getByRole("link", { name: /accueil/i });
    expect(homeLink).toHaveAttribute("href", "/home");

    const articlesLink = screen.getByRole("link", { name: /articles/i });
    expect(articlesLink).toHaveAttribute("href", "/articles");

    const categoriesLink = screen.getByRole("link", { name: /catégories/i });
    expect(categoriesLink).toHaveAttribute("href", "/categories");

    const aboutLink = screen.getByRole("link", { name: /à propos/i });
    expect(aboutLink).toHaveAttribute("href", "/about");

    const contactLink = screen.getByRole("link", { name: /contact/i });
    expect(contactLink).toHaveAttribute("href", "/contact");
  });

  it("handles logout button click", async () => {
    render(<Navbar />);

    // Open user menu dropdown
    const menuTrigger = screen.getByRole("button", { name: /menu utilisateur/i });
    fireEvent.click(menuTrigger);

    const logoutButton = screen.getByRole("button", { name: /déconnexion/i });
    expect(logoutButton).toBeInTheDocument();

    await fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
