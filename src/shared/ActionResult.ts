// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

/**
 * Represents the result of executing an action/tool.
 *
 * Uses a discriminated union pattern for type-safe success/error handling.
 * This is more idiomatic TypeScript than having nullable result/error fields.
 *
 * @example
 * ```typescript
 * // Create results
 * const success = ActionResult.success({ files: ["a.txt", "b.txt"] });
 * const failure = ActionResult.error("File not found");
 *
 * // Handle results
 * if (result.success) {
 *   console.log("Got:", result.value);
 * } else {
 *   console.error("Error:", result.error);
 * }
 *
 * // Wrap async operations
 * const result = await ActionResult.fromPromise(fetchData());
 * ```
 */

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

// ─────────────────────────────────────────────────────────────────────────────
// an object that geenrates a success message
// ─────────────────────────────────────────────────────────────────────────────
interface SuccessResult<T> {
  readonly success: true;
  readonly value: T;
}

// ─────────────────────────────────────────────────────────────────────────────
// an object that generates a error message
// ─────────────────────────────────────────────────────────────────────────────
interface ErrorResult {
  readonly success: false;
  readonly error: string;
}

// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// A function that outputs successresult or errorresult using T defined as unknown //
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
export type ActionResult<T = unknown> = SuccessResult<T> | ErrorResult;

/**
 * Factory functions for creating ActionResults.
 */

// An object that ... //
export const ActionResult = {

  // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Success funcion
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  // A function that inputs T, outputs either success or error //
  success<T>(value: T): ActionResult<T> {

    // Returns success true and T //
    return { success: true, value };
  },

  /**
   * Creates an error result.
   * @param error - The error message
   */

    // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Error funcion
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Inputs error string //
  error(error: string): ActionResult<never> {

    // Returns success false and error //
    return { success: false, error };
  },

  /**
   * Wraps a Promise into an ActionResult.
   * Catches any errors and converts them to error results.
   *
   * @param promise - The promise to wrap
   * @returns ActionResult with either the resolved value or error message
   *
   * @example
   * ```typescript
   * const result = await ActionResult.fromPromise(fs.readFile("test.txt"));
   * if (result.success) {
   *   console.log(result.value);
   * } else {
   *   console.error(result.error);
   * }
   * ```
   */

  // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// async function called fromPromise and T //
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// This stops bugs, catches anything that isnt recognised as success or error //
  async fromPromise<T>
  
  // Inputs T //
  (promise: Promise<T>): 
  
  // Outputs success or error //
  Promise<ActionResult<T>> {

    try {

      // Define value as T //
      const value = await promise;

      // Return an object of true and T //
      return { success: true, value };

       // else retrurn an error //
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  },

  /**
   * Wraps a synchronous function that might throw.
   * @param fn - The function to execute
   * @returns ActionResult with either the return value or error message
   */

// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// 
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  fromTry<T>(fn: () => T): ActionResult<T> {
    try {
      const value = fn();
      return { success: true, value };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  },

  /**
   * Checks if a result is successful (type guard).
   */
  isSuccess<T>(result: ActionResult<T>): result is SuccessResult<T> {
    return result.success;
  },

  /**
   * Checks if a result is an error (type guard).
   */
  isError<T>(result: ActionResult<T>): result is ErrorResult {
    return !result.success;
  },

  /**
   * Converts an ActionResult to a plain object for JSON serialization.
   * Format: { result: value } or { error: message }
   */
  toJSON<T>(result: ActionResult<T>): { result: T } | { error: string } {
    if (result.success) {
      return { result: result.value };
    }
    return { error: result.error };
  },
};
