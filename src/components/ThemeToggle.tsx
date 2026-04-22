import { useTheme } from "../theme/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700"
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
