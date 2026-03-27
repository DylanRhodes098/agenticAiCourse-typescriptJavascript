// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

/**
 * Represents an action (tool invocation) that an AI agent wants to perform.
 *
 * Actions are parsed from LLM responses and contain:
 * - The name of the tool to invoke
 * - Arguments to pass to that tool
 *
 * @example
 * ```typescript
 * // Parse from LLM response
 * const action = Action.fromJSON({ tool: "readFile", args: { path: "readme.md" } });
 *
 * // Access arguments with type safety
 * const path = action.getArg<string>("path"); // "readme.md"
 *
 * // Create special actions
 * const done = Action.terminate("Task completed successfully");
 * const err = Action.error("Something went wrong");
 * ```
 */

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

/** Arguments passed to a tool - a record of string keys to unknown values */

// ============================================================================= //
// Action Skeleton
// ============================================================================= //

// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Define the tool properties ( materials )
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
export type ToolArgs = Record<string, unknown>;

// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// The action with the tool name and the materials //
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
export class Action {
  /**
   * Creates a new Action.
   * @param toolName - The name of the tool to invoke
   * @param args - Arguments to pass to the tool
   */
  constructor(
    public readonly toolName: string,
    public readonly args: ToolArgs = {}
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // Argument Access
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Gets a specific argument by name with type assertion.
   *
   * Note: This performs a type assertion, not runtime validation.
   * For runtime safety, provide a validator function.
   *
   * @param name - The argument name
   * @param validator - Optional runtime type validator
   * @returns The argument value or undefined if not present
   *
   * @example
   * ```typescript
   * // Simple usage (type assertion only)
   * const count = action.getArg<number>("count");
   *
   * // With runtime validation
   * const count = action.getArg("count", (v): v is number => typeof v === "number");
   * ```
   */

  // ============================================================================= //
  // Primary Functions
  // ============================================================================= //

  // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Get the arguemnt / material in a desired tool, if there is one //
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// A function where the output is T, with parameter name : string and... // 
  getArg<T>(name: string, 

    // a function with parameters value : unkown, where value is T... //
    validator?: (value: unknown) => value is T)

    // The output is a boolean either T or undefined //
    : T | undefined {
      
      // define value as the name value in the args object //
    const value = this.args[name];

     // if the args name is undefined, return undefined // 
    if (value === undefined) return undefined;

         // if validator exists // 
    if (validator) {

      // return the value else return undefined //
      return validator(value) ? value : undefined;
    }

    // Return T //
    return value as T;
  }

  /**
   * Gets a required argument, throwing if not present.
   * @throws Error if argument is missing
   */

    // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Get the arguemnt / material in a desired tool, but there has to be one //
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  requireArg<T>(name: string, validator?: (value: unknown) => value is T): T 
  
  {

    // define value as the name and validator in getArg value //
    const value = this.getArg<T>(name, validator);

        // if value is undefined //
    if (value === undefined) {

       // return an error //
      throw new Error(`Missing required argument: ${name}`);
    }

    // else return the argument //
    return value;
  }

  // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Check if the action is a temrinartion
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  isTerminate(): boolean {
    return this.toolName === 'terminate';
  }

  /**
   * Checks if this action is an error action.
   */
    // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Check if the action is an error
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  isError(): boolean {
    return this.toolName === 'error';
  }

  // ============================================================================= //
  // Subfunctions //
  // ============================================================================= //
  
      // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Terminate action
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  /** Creates a termination action */
  static terminate(message: string): Action {
    return new Action('terminate', { message });
  }

      // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Error action
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  /** Creates an error action */
  static error(message: string): Action {
    return new Action('error', { message });
  }

  // ============================================================================= //
  // Serialization
  // ============================================================================= //

  /** Converts to a plain object */
  toJSON(): { tool: string; args: ToolArgs } {
    return { tool: this.toolName, args: this.args };
  }

  /**
   * Creates an Action from a JSON object.
   * Accepts both { tool, args } and { toolName, args } formats.
   */
  static fromJSON(json: { tool?: string; toolName?: string; args?: ToolArgs }): Action {
    const toolName = json.tool ?? json.toolName;
    if (!toolName) {
      throw new Error('Action JSON must have "tool" or "toolName" field');
    }
    return new Action(toolName, json.args ?? {});
  }

  /** String representation for debugging */
  toString(): string {
    return `Action(${this.toolName}, ${JSON.stringify(this.args)})`;
  }
}
