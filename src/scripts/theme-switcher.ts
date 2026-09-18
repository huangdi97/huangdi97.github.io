/**
 * Appearance switching.
 *
 * Lives in a module rather than in an inline `define:vars` block so that the
 * browser's ES module registry guarantees it executes exactly once per page,
 * even though the switcher is rendered twice (header popover + mobile list).
 *
 * Switching writes `data-theme` on <html>, updates the browser chrome colour
 * and persists the choice. No network request, no reload, no framework.
 */
import { THEME_META, THEME_STORAGE_KEY, isTheme, type Theme } from '../config/themes';

const KEY = THEME_STORAGE_KEY;

const CHROME: Record<Theme, string> = {
  paper: THEME_META.paper.chrome,
  white: THEME_META.white.chrome,
  night: THEME_META.night.chrome,
};

function readTheme(): Theme {
  const attr = document.documentElement.dataset.theme;
  return isTheme(attr) ? attr : 'paper';
}

function apply(theme: Theme): void {
  document.documentElement.dataset.theme = theme;

  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', CHROME[theme]);

  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* Storage blocked: the theme still applies for this session. */
  }

  sync();
}

function sync(): void {
  const current = readTheme();
  document.querySelectorAll<HTMLElement>('[data-theme-option]').forEach((btn) => {
    btn.setAttribute('aria-checked', btn.dataset.themeOption === current ? 'true' : 'false');
  });
}

function closeAll(except: Element | null): void {
  document.querySelectorAll('[data-theme-switcher]').forEach((sw) => {
    if (sw === except) return;
    const menu = sw.querySelector<HTMLElement>('[data-theme-menu]');
    const trigger = sw.querySelector<HTMLElement>('[data-theme-toggle]');
    if (menu && !menu.hidden) {
      menu.hidden = true;
      trigger?.setAttribute('aria-expanded', 'false');
    }
  });
}

document.querySelectorAll('[data-theme-switcher]').forEach((sw) => {
  const trigger = sw.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  const menu = sw.querySelector<HTMLElement>('[data-theme-menu]');
  const options = Array.from(sw.querySelectorAll<HTMLButtonElement>('[data-theme-option]'));

  options.forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = btn.dataset.themeOption;
      if (isTheme(next)) apply(next);
      if (menu && !menu.hidden) {
        menu.hidden = true;
        if (trigger) {
          trigger.setAttribute('aria-expanded', 'false');
          trigger.focus();
        }
      }
    });
  });

  if (!trigger || !menu) return;

  const open = (state: boolean): void => {
    menu.hidden = !state;
    trigger.setAttribute('aria-expanded', state ? 'true' : 'false');
    if (state) {
      closeAll(sw);
      const checked = options.find((b) => b.getAttribute('aria-checked') === 'true');
      (checked ?? options[0])?.focus();
    }
  };

  trigger.addEventListener('click', () => open(menu.hidden));

  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      open(true);
    }
  });

  menu.addEventListener('keydown', (event) => {
    const index = options.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === 'Escape') {
      event.preventDefault();
      open(false);
      trigger.focus();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      options[(index + 1) % options.length]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      options[(index - 1 + options.length) % options.length]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      options[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      options[options.length - 1]?.focus();
    } else if (event.key === 'Tab') {
      open(false);
    }
  });

  menu.addEventListener('focusout', (event) => {
    if (!(event.relatedTarget instanceof Node) || !menu.contains(event.relatedTarget)) open(false);
  });
});

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  if (event.target.closest('[data-theme-switcher]')) return;
  closeAll(null);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeAll(null);
});

// A theme chosen in another tab should not silently disagree with this one.
window.addEventListener('storage', (event) => {
  if (event.key !== KEY || !isTheme(event.newValue)) return;
  document.documentElement.dataset.theme = event.newValue;
  sync();
});

sync();
