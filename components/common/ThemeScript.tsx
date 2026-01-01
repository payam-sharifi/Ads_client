/**
 * ThemeScript - Injects theme class before React hydration to prevent flash
 * This script runs synchronously before React hydrates, ensuring the correct
 * theme is applied immediately on page load.
 */
export default function ThemeScript() {
  const codeToRunOnClient = `
    (function() {
      try {
        const theme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = theme === 'dark' || (!theme && systemPrefersDark);
        
        if (shouldBeDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {
        // Silently fail if localStorage is not available
      }
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: codeToRunOnClient,
      }}
    />
  );
}


