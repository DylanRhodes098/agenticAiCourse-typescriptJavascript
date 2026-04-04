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

   // ============================================================================= //
  // Action result skeleton
  // ============================================================================= //

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

   // ============================================================================= //
  // SubFunctions
  // ============================================================================= //

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

   // ============================================================================= //
  // Catch functions
  // ============================================================================= //

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
// async function that catches any erorrs //
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// This stops bugs, catches anything that isnt recognised as success or error //
  async fromPromise<T>
  
  // Inputs T //
  (promise: Promise<T>)

  // Outputs success or error //
  : Promise<ActionResult<T>> {

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
// A syncournous function that uses a predefined funciton to output T //
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// the input is a function that outputs T // 
  fromTry<T>(fn: () => T): 
  
  // The output is eiehr success or error message //
  ActionResult<T> {

    try {

      // value is the funciton that outputs T //
      const value = fn();

      // return a true boolean followed by T //
      return { success: true, value };

      // Catches if theres an error //
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  },


// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// checks if a result is successful
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  isSuccess<T>(result: ActionResult<T>): result is SuccessResult<T> {
    return result.success;
  },

// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// checks if a result is error
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  isError<T>(result: ActionResult<T>): result is ErrorResult {
    return !result.success;
  },

   // ============================================================================= //
  // Serialization
  // ============================================================================= //

// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Converts reslt into usable json.
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  toJSON<T>(result: ActionResult<T>): { result: T } | { error: string } {
    if (result.success) {
      return { result: result.value };
    }
    return { error: result.error };
  },
};
