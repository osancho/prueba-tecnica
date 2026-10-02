const LIST_URL_KEY = 'mbst-list-url';

/** Keeps the list URL, search included, so Back from a product returns to it. */
export function rememberListUrl() {
  try {
    sessionStorage.setItem(
      LIST_URL_KEY,
      window.location.pathname + window.location.search,
    );
  } catch {
    // Without storage, Back falls back to the full list.
  }
}

export function lastListUrl(): string {
  try {
    return sessionStorage.getItem(LIST_URL_KEY) ?? '/';
  } catch {
    return '/';
  }
}
