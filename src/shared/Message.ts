// ============================================================================= //

// ─────────────────────────────────────────────────────────────────────────────
// Represents a message in an LLM conversation.
// ─────────────────────────────────────────────────────────────────────────────

// < - System = Instructions for the AI to use - > //

// < - User = The users request - > //

// < - Assistant = The AI response - > //

// ============================================================================= //

// ─────────────────────────────────────────────────────────────────────────────
// Strcuture/Skeleton
// ─────────────────────────────────────────────────────────────────────────────

// """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" //
// defines a type that only allows the follwoing strings //
// """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" //
export type Role = 'system' | 'user' | 'assistant';

// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ //
// defines a class //
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ //
export class Message {
 
  // ########################################################################### //
  // the message object has to look like //
  // ########################################################################### //
  constructor(

    // role can only be a string of 'sysem', 'user', 'assistant', and not change //
    public readonly role: Role,

    // content can only be a string and not changed //
    public readonly content: string
  ) {}

 // ─────────────────────────────────────────────────────────────────────────────
 // Message functions //
 // ─────────────────────────────────────────────────────────────────────────────

  // ########################################################################### //
  // A system function that belongs to the Message class //
  // ########################################################################### //
  static system(content: string): Message {

    // returns an object, role : "system", content : string //
    return new Message('system', content);
  }

  // ########################################################################### //
   // A user function that belongs to the Message class //
  // ########################################################################### //
  static user(content: string): Message {

    // returns an object, role : "user", content : string //
    return new Message('user', content);
  }

  // ########################################################################### //
  // An assistant function that belongs to the Message class //
  // ########################################################################### //
  static assistant(content: string): Message {

        // returns an object, role : "assistant", content : string //
    return new Message('assistant', content);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Serialization Functions
  // ─────────────────────────────────────────────────────────────────────────────

  // ########################################################################### //
  // toJson function that Define how the object with role and content keys should look in json //
  // ########################################################################### //
  toJSON(): { role: Role; content: string } {

    // This is how it should look //
    return { role: this.role, content: this.content };
  }

  // ########################################################################### //
   // a fromJson function that defines how the json should look as an object //
  // ########################################################################### //
  static fromJSON(json: { role: Role; content: string }): Message {

    // Return the new object message using json parameters // 
    return new Message(json.role, json.content);
  }

  // ########################################################################### //
  // String representation for debugging //
// a string converter function that returns a string //
  // ########################################################################### //
  toString(): string {

    // Define the strong format with the key being role //
    return `[${this.role}]: 

    // and the value being content // 
    ${this.content.substring(0, 50)}${this.content.length > 50 ? '...' : ''}`;
  }
}
