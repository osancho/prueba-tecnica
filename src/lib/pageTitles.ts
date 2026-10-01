export const DEFAULT_TITLE = 'Smartphones | MBST';
export const TITLE_TEMPLATE = '%s | MBST';

/** Full title of the list; the layout template does not reach pages in its own segment. */
export function listDocumentTitle(search: string): string {
  return search
    ? TITLE_TEMPLATE.replace('%s', `Results for “${search}”`)
    : DEFAULT_TITLE;
}
