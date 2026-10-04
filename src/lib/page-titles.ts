export const SITE_NAME = 'MBST';
export const DEFAULT_TITLE = `Smartphones | ${SITE_NAME}`;
export const TITLE_TEMPLATE = `%s | ${SITE_NAME}`;

/** Full title of the list; the layout template does not reach pages in its own segment. */
export function listDocumentTitle(search: string): string {
  return search
    ? TITLE_TEMPLATE.replace('%s', `Results for “${search}”`)
    : DEFAULT_TITLE;
}
