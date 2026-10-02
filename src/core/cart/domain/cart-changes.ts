/** What checking the saved cart against the catalog found, keyed by line. */
export interface CartChanges {
  /** Lines whose phone, storage or color can no longer be bought. */
  unavailable: string[];
  /** Lines whose storage now costs something else: line id → current price. */
  repriced: Record<string, number>;
}
