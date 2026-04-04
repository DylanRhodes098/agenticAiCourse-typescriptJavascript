// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

/**
 * Shared file operations for agent tools.
 *
 * This module provides common file system operations that agents can use.
 * Centralizing these prevents code duplication across modules.
 *
 * @example
 * ```typescript
 * // List files in current directory
 * const files = FileTools.listFiles();
 *
 * // Read a file
 * const content = FileTools.readFile("package.json");
 *
 * // Check if file exists
 * if (FileTools.exists("readme.md")) { ... }
 * ```
 */

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

// ============================================================================= //
// Imports
// ============================================================================= //

import * as fs from 'fs';
import * as path from 'path';
import { ActionResult } from './ActionResult';

// ============================================================================= //
// TITLES 
// ============================================================================= //

export const FileTools = {
  /**
   * Lists all files in a directory.
   * @param directory - Directory to list (defaults to cwd)
   * @returns Array of filenames (not full paths)
   */

  // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  // syncpruous funciton that creturns all files in current directory //
  // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  // param current direcotry as a string //
  listFiles(directory: string = process.cwd())
  
  // Output is an array //
  : string[] {


    try {

      // define entries as read just the current directory (eg shared) //
      const entries = fs.readdirSync(directory);

      // map through each file, each one as entry //
      return entries.filter(entry => {

        // a fullpath equals the directory name followed by one file //
        const fullPath = path.join(directory, entry);

        try {

          // return a boolean that checks if each file is a file //
          return fs.statSync(fullPath).isFile();

          // else return false //
        } catch {
          return false;
        }

        // catch //
      });
    } catch (error) {
      console.error(`Error listing files in ${directory}:`, error);
      return [];
    }
  },

  // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  // syncpruous funciton that returns all directories in node //
  // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  listDirectories(directory: string = process.cwd()): string[] {
    try {
      const entries = fs.readdirSync(directory);
      return entries.filter(entry => {
        const fullPath = path.join(directory, entry);
        try {
          return fs.statSync(fullPath).isDirectory();
        } catch {
          return false;
        }
      });
    } catch (error) {
      console.error(`Error listing directories in ${directory}:`, error);
      return [];
    }
  },
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  // syncpruous funciton that reads the contents of a file outputting content as a string  //
  // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
    // param is a string //
  readFile(filePath: string)
  
  // output a string //
  : string {

     // output a string //
     // Define the the full path of the file //
    const resolvedPath = path.resolve(filePath);

    // Return the content of the inputed file  //
    return fs.readFileSync(resolvedPath, 'utf-8');
  },

// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  // syncpruous funciton that reads the contents of a file and returns an actionresult (sucess or error)  //
  // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  // Input filepath //
  readFileSafe(filePath: string)
  
  // output actionresult as a string //
  : ActionResult<string> {

    // use the syncorunous function that inputs nothing 
    return ActionResult.fromTry(() => 
      
      // executes the readFile function using the inputed filepath //
      FileTools.readFile(filePath));
  },

 // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  // Does a file or directory exist //
  // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //

  // Input file name //
  exists(filePath: string): boolean {

    try {

      // an fs tool that checks if files exists //
      fs.accessSync(path.resolve(filePath));
      return true;
    } catch {
      return false;
    }
  },

 // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  // Checks if a path is a file //
  // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  isFile(filePath: string): boolean {
    try {

      // uses isFile to return a boolean if the pth is a file //
      return fs.statSync(path.resolve(filePath)).isFile();
    } catch {
      return false;
    }
  },

 // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  // Checks if a path is a directory //
  // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  isDirectory(dirPath: string): boolean {
    try {

      // uses isDirectory to return a boolean if the pth is a directory //
      return fs.statSync(path.resolve(dirPath)).isDirectory();
    } catch {
      return false;
    }
  },

 // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  // Writes content to a file //
  // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// input is filepath and content // 
  writeFile(filePath: string, content: string)
  
  // output nothing //
  : void {

    // Define full file path // 
    const resolvedPath = path.resolve(filePath);

    // retrive just the directories on thet file path //
    const dir = path.dirname(resolvedPath);

    // Create directory if it doesn't exist //
    // if existssync return false //
    if (!fs.existsSync(dir)) {

      // create full path //
      fs.mkdirSync(dir, { recursive: true });
    }

    // write the defined content into the file //
    fs.writeFileSync(resolvedPath, content, 'utf-8');
  },

 // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  // Writes content to a file but output a success or error messag //
  // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  writeFileSafe(filePath: string, content: string): ActionResult<void> {
    return ActionResult.fromTry(() => FileTools.writeFile(filePath, content));
  },

 // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  // Get all the metadata info from the file //
  // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  getStats(filePath: string)
  
  // output stats (fs tool) or nothing //
  : fs.Stats | null {
    try {
      return fs.statSync(path.resolve(filePath));
    } catch {
      return null;
    }
  },
};
