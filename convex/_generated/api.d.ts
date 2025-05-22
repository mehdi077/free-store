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
import type * as auth from "../auth.js";
import type * as auth_admin from "../auth_admin.js";
import type * as categories from "../categories.js";
import type * as constants from "../constants.js";
import type * as http from "../http.js";
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
  auth: typeof auth;
  auth_admin: typeof auth_admin;
  categories: typeof categories;
  constants: typeof constants;
  http: typeof http;
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
