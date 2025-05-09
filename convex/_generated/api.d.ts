/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin_creds from "../admin_creds.js";
import type * as categories from "../categories.js";
import type * as constants from "../constants.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as settings from "../settings.js";
import type * as storage from "../storage.js";
import type * as tarif_livraison from "../tarif_livraison.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin_creds: typeof admin_creds;
  categories: typeof categories;
  constants: typeof constants;
  orders: typeof orders;
  products: typeof products;
  settings: typeof settings;
  storage: typeof storage;
  tarif_livraison: typeof tarif_livraison;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
