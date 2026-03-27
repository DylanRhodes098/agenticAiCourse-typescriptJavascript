// Imports //

// Import Node Libraries //

// Path is a built-in node library that allows the coder to navigate through directories //
// https://trello.com/b/ou3GObaW/pathlib-library //
import * as path from 'path';

// loadEnv function to navigate to the env file //

// Void is a function type that caps functions returning anything to the user //
export function loadEnv(): void {

  // Import dotenv file deifning as result dotenv //
  // https://trello.com/b/g7phaLtD/dotenv-library?search_id=f0322a3a-9113-4674-a2e2-73d9a1b6349c //
  const dotenv = require('dotenv');

  // Read the env file and import variables to process.env //
  let result = dotenv.config();

  // if configuration fails //
  // this if manually find the env file //
  if (result.error) {

    // define a new root expanding 2 dir up from the current dir // 
    const projectRoot = path.resolve(__dirname, '..', '..');

    // read and import to process.env //
    result = dotenv.config(
      // this object joins the expanded project root with the env file, to try manually navigate to the env //
      { path: path.join(projectRoot, '.env')}
    );
  }

  // If there isnt an open ai key //
  if (!process.env.OPENAI_API_KEY) {

    // respond with error message //
    console.warn(
      '\n⚠️  Warning: OPENAI_API_KEY not found in environment.\n' +
      '   Copy .env.example to .env and add your API key:\n' +
      '   cp .env.example .env\n'
    );
  }
}

/**
 * Gets an environment variable, throwing if not found.
 * @param name - The environment variable name
 * @returns The value
 * @throws Error if the variable is not set
 */

// reuireEnv function that returns a string //
export function requireEnv(name: string): string {

  // define the name key in the env as value //
  const value = process.env[name];

  // if vthe name doesnt exist //
  if (!value) {

    // return an error //
    throw new Error(`Required environment variable ${name} is not set`);
  }

  // else return value //
  return value;
}

/**
 * Gets an environment variable with a default value.
 * @param name - The environment variable name
 * @param defaultValue - Default value if not set
 */

// reuireEnv function that returns a string //
export function getEnv(name: string, defaultValue: string): string {

  // if name doesnt work, return defaultvalue //
  return process.env[name] ?? defaultValue;
}
