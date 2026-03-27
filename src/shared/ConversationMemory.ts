// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

/**
 * Typed Conversation Memory
 *
 * This module provides a typed conversation history for agent interactions.
 * Unlike the key-value Memory class, this specifically tracks the conversation
 * flow with typed entries for user, assistant, and environment messages.
 *
 * This matches Python's Memory class in the GAME framework:
 * - Items are typed (user, assistant, environment)
 * - Supports filtering and transformation
 * - Can be converted to LLM message format
 *
 * @example
 * ```typescript
 * const memory = new ConversationMemory();
 *
 * // Add conversation items
 * memory.add('user', 'List the files');
 * memory.add('assistant', '{"tool": "listFiles", "args": {}}');
 * memory.add('environment', '{"result": ["file1.ts", "file2.ts"]}');
 *
 * // Convert to messages for LLM
 * const messages = memory.toMessages();
 * ```
 */

// ========================================== //
// Types //
// ========================================== //

// Envionment = the outside/external place the ai needs to execute thr action in // 


// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

import { Message } from './Message';

// ============================================================================= //
// Memory Object //
// ============================================================================= //

// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// A type that defines memoryitems as 1 of 4 things, including enviroment //
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
export type MemoryItemType = 'user' | 'assistant' | 'environment' | 'system';

// ─────────────────────────────────────────────────────────────────────────────
// The memory item object, including the memoeryitemtype strings 
// ─────────────────────────────────────────────────────────────────────────────
export interface MemoryItem {
  /** The type of this memory item */
  type: MemoryItemType;

  /** The content of the item */
  content: string;

  /** Optional timestamp */
  timestamp?: Date;

  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

// ============================================================================= //
// The memoryItem Modification //
// ============================================================================= //

// ─────────────────────────────────────────────────────────────────────────────
// Class with key = items, value = memoryItem array
// ─────────────────────────────────────────────────────────────────────────────
export class ConversationMemory {
  private items: MemoryItem[] = [];

// ========================================== //
// Adding Items //
// ========================================== //

  // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Add item subFunction
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  add(type: MemoryItemType, content: string, metadata?: Record<string, unknown>): this {
    this.items.push({
      type,
      content,
      timestamp: new Date(),
      metadata,
    });
    return this;
  }

    // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Add userMessage subFunction
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  addUser(content: string): this {
    return this.add('user', content);
  }

    // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Add AssistantResponse subFunction
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  addAssistant(content: string): this {
    return this.add('assistant', content);
  }

      // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Add Environment subFunction
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  addEnvironment(content: string): this {
    return this.add('environment', content);
  }

    // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Add systemPrompt subFunction
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  addSystem(content: string): this {
    return this.add('system', content);
  }

  // ========================================== //
// GET Items //
// ========================================== //

  // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// GET All items in the current Memoryitem Array
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  getItems(limit?: number): MemoryItem[] {
    if (limit === undefined) {
      return [...this.items];
    }
    return this.items.slice(-limit);
  }

 // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// GET a custom amount of most recent items in the current Memoryitem Array
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  getLast(n: number): MemoryItem[] {
    return this.items.slice(-n);
  }

 // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// GET all items of a specific type in the current Memoryitem Array
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  getByType(type: MemoryItemType): MemoryItem[] {
    return this.items.filter(item => item.type === type);
  }

 // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// GET the most recent item in the current Memoryitem Array
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  getLatest(): MemoryItem | undefined {
    return this.items[this.items.length - 1];
  }

 // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// GET the amount of items in the current Memoryitem Array
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  get length(): number {
    return this.items.length;
  }

    // ========================================== //
// DUPLICATE MemoryItems Array //
// ========================================== //

 // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// COPY the Memoryitem Array wihtout system prompts 
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  copyWithoutSystem(): ConversationMemory {
    const memory = new ConversationMemory();
    memory.items = this.items.filter(m => m.type !== 'system');
    return memory;
  }

// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// COPY the Memoryitem Array fully
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  copy(): ConversationMemory {
    const memory = new ConversationMemory();
    memory.items = this.items.map(item => ({ ...item }));
    return memory;
  }

// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// RESET MemoryItems
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  clear(): this {
    this.items = [];
    return this;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Conversion to Messages
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Converts memory items to Message objects for LLM consumption.
   *
   * The mapping is:
   * - user → user
   * - assistant → assistant
   * - environment → user (tool results are sent as user messages)
   * - system → system
   */
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// A function that defines each item in the memoryItem to the LLM equivelant,, so the LLM can read succesfully. 
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  toMessages(): Message[] {
    return this.items.map(item => {
      switch (item.type) {

        //  - user → user
        case 'user':
          return Message.user(item.content);

          //- assistant → assistant
        case 'assistant':
          return Message.assistant(item.content);

          // environment → user (tool results are sent as user messages)
        case 'environment':
          // Environment results are typically sent as user messages
          // (the "user" here is the environment responding to the assistant)
          return Message.user(item.content);

          // - system → system
        case 'system':
          return Message.system(item.content);

          // If nothign is parsed, default to userMessage
        default:
          return Message.user(item.content);
      }
    });
  }

  /**
   * Gets items formatted for LLM with a specific role mapping.
   *
   * This allows custom mapping of item types to roles.
   */

// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Convert MemoryItem object into a message array for the LLM to read /
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// where the value for key mapping defines memeoryitemtype as an object, with each string as an optional key value //
// Outputs the message aray //
  toMessagesWithMapping(mapping: Partial<Record<MemoryItemType, 'user' | 'assistant' | 'system'>>): Message[] {

    // define defualtmapping as MemoryItemType as an object, with 3 key values = user :, assistant :, system : //
    const defaultMapping: Record<MemoryItemType, 'user' | 'assistant' | 'system'> = {
      user: 'user',
      assistant: 'assistant',
      environment: 'user',
      system: 'system',
    };

    // Define finalmapping as joining both objects together //
    const finalMapping = { ...defaultMapping, ...mapping };

    return this.items.map(item => {

      // Define the role in the object above //
      const role = finalMapping[item.type];

      // Return a new mesage array with the newly defined role and its content //
      return new Message(role, item.content);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Serialization Functions
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Converts to a plain object for JSON serialization.
   */

  // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Converts a plain object into JSON. 
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  toJSON(): MemoryItem[] {
    return this.items.map(item => ({
      type: item.type,
      content: item.content,
      timestamp: item.timestamp,
      metadata: item.metadata,
    }));
  }

  /**
   * Creates a ConversationMemory from a JSON array.
   */

   // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Converts JSON into an object //
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  static fromJSON(items: MemoryItem[]): ConversationMemory {
    const memory = new ConversationMemory();
    memory.items = items.map(item => ({
      type: item.type,
      content: item.content,
      timestamp: item.timestamp ? new Date(item.timestamp) : undefined,
      metadata: item.metadata,
    }));
    return memory;
  }

 // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Return an error if the object/json is empty 
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  toString(): string {
    if (this.items.length === 0) {
      return '(empty)';
    }

     // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Return the object or json into a string with... 
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
    return this.items

    // Type of item
      .map(item => `[${item.type}] 

         // the first 50 lettters of content 
        ${item.content.substring(0, 50)}

        // a ... or empty strnig if content is greater than 50 //
        ${item.content.length > 50 ? '...' : ''}`)

        // put an /n on the end //
      .join('\n');
  }
}
