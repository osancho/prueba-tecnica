import type {
  ColorOption,
  Product,
  ProductListItem,
  ProductSpecs,
  StorageOption,
} from '../domain/product';

type Fields = Record<string, unknown>;

const SPEC_FIELDS: (keyof ProductSpecs)[] = [
  'screen',
  'resolution',
  'processor',
  'mainCamera',
  'selfieCamera',
  'battery',
  'os',
  'screenRefreshRate',
];

function isObject(value: unknown): value is Fields {
  return typeof value === 'object' && value !== null;
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value !== '';
}

function isPrice(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function isProductListItem(value: unknown): value is ProductListItem {
  return (
    isObject(value) &&
    isText(value.id) &&
    isText(value.brand) &&
    isText(value.name) &&
    isPrice(value.basePrice) &&
    isText(value.imageUrl)
  );
}

function isColorOption(value: unknown): value is ColorOption {
  return (
    isObject(value) &&
    isText(value.name) &&
    isText(value.hexCode) &&
    isText(value.imageUrl)
  );
}

function isStorageOption(value: unknown): value is StorageOption {
  return isObject(value) && isText(value.capacity) && isPrice(value.price);
}

function isSpecs(value: unknown): value is ProductSpecs {
  return (
    isObject(value) &&
    SPEC_FIELDS.every((field) => typeof value[field] === 'string')
  );
}

/** Checks what the detail page renders; similar products are filtered one by one later. */
export function isProduct(value: unknown): value is Product {
  return (
    isObject(value) &&
    isText(value.id) &&
    isText(value.brand) &&
    isText(value.name) &&
    isPrice(value.basePrice) &&
    isSpecs(value.specs) &&
    Array.isArray(value.colorOptions) &&
    value.colorOptions.every(isColorOption) &&
    Array.isArray(value.storageOptions) &&
    value.storageOptions.every(isStorageOption) &&
    Array.isArray(value.similarProducts)
  );
}
