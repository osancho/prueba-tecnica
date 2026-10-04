import catalog from './catalog.json';

/** How many phones the list shows without a search. */
export const LIST_SIZE = 20;

/** Searches of the fixture catalog and how many different phones each one finds. */
export const SEARCHES = {
  brand: { term: 'samsung', matches: 6 },
  // 22 entries of the catalog match, one of them a repeated id.
  beyondList: { term: 'a', matches: 21 },
  none: { term: 'zzzzzz', matches: 0 },
};

const galaxy = catalog.details['SMG-S24U'];
const [firstStorage, storage] = galaxy.storageOptions;
const [, color] = galaxy.colorOptions;

/** The phone the journeys buy. Its `basePrice` is not its lowest price. */
export const PHONE = {
  id: galaxy.id,
  path: `/product/${galaxy.id}`,
  brand: galaxy.brand,
  name: galaxy.name,
  lowestPrice: Math.min(...galaxy.storageOptions.map(({ price }) => price)),
  firstStorage: firstStorage.capacity,
  storage: storage.capacity,
  price: storage.price,
  color: color.name,
};

/** `PHONE` as the cart keeps it in `localStorage`, with the storage and color above. */
export const SAVED_LINE = {
  id: PHONE.id,
  brand: PHONE.brand,
  name: PHONE.name,
  imageUrl: `/api/images/${color.imageUrl.slice(color.imageUrl.lastIndexOf('/') + 1)}?v=3`,
  colorName: PHONE.color,
  capacity: PHONE.storage,
  price: PHONE.price,
};

const pixel = catalog.details['GPX-8A'];

/** A second phone, for carts with more than one. */
export const OTHER_PHONE = {
  path: `/product/${pixel.id}`,
  name: pixel.name,
  storage: pixel.storageOptions[0].capacity,
  color: pixel.colorOptions[0].name,
};

/** An id the catalog does not have: the API answers 404. */
export const UNKNOWN_ID = 'NOPE-123';
export const UNKNOWN_PATH = `/product/${UNKNOWN_ID}`;
