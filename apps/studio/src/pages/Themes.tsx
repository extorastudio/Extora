import { useEffect } from "react";
import { useThemeStore } from "../stores/theme-store";
import { Palette, CheckCircle2, Circle } from "lucide-react";

export default function ThemesPage() {
  const { themes, isLoading, fetchThemes, activateTheme } = useThemeStore();

  useEffect(() => {
    void fetchThemes();
  }, [fetchThemes]);

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-white">Themes</h2>
      {isLoading ? (
        <div className="py-12 text-center text-gray-400">Loading themes...</div>
      ) : themes.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 py-16 text-center">
          <Palette className="mx-auto mb-3 h-10 w-10 text-gray-600" />
          <p className="text-gray-400">No themes installed</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={`rounded-xl border p-5 ${
                theme.isActive ? "border-blue-700 bg-blue-900/10" : "border-gray-800 bg-gray-900"
              }`}
            >
              <div className="mb-3 flex items-center gap-3">
                <Palette className={`h-5 w-5 ${theme.isActive ? "text-blue-400" : "text-gray-500"}`} />
                <p className="font-medium text-white">{theme.title}</p>
              </div>
              <p className="mb-3 text-sm text-gray-400">
                {theme.name} v{theme.version} by {theme.author}
              </p>
              <button
                onClick={() => void activateTheme(theme.name)}
                disabled={theme.isActive}
                className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                  theme.isActive
                    ? "cursor-default bg-blue-600/20 text-blue-400"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {theme.isActive ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Active
                  </>
                ) : (
                  <>
                    <Circle className="h-4 w-4" /> Activate
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
