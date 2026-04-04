  // ============================================================================= //

// ─────────────────────────────────────────────────────────────────────────────
// Represents the settings for the AI 
// ─────────────────────────────────────────────────────────────────────────────

// < - Messages = The conversation history, to provide better quality AI responses- > //

// < - Tools = Expands AI responses to just text, see files in a directory, read file contents, search the internet, run a shell command- > //

// < - Metadata = The AI settings - > //
  // < - - - Temperature = Configures how creative the AI can be (0.0 → very deterministic, 0.5 → balanced, 1.0 → very creative) - - - > //
  // < - - - maxToken = Configures the max word count - - - > //
  // < - - - RequestID = An id on a user request (for debugging) - - - > //

  // ============================================================================= //

// ─────────────────────────────────────────────────────────────────────────────
// Import functions //
// ─────────────────────────────────────────────────────────────────────────────
import { Message } from './Message';
import { Tool } from './Tool';

  // ─────────────────────────────────────────────────────────────────────────────
  // Strcuture/Skeleton
  // ─────────────────────────────────────────────────────────────────────────────

// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ //
// Define an interface function //
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ //
export interface PromptMetadata {

  // temperature is optional, and has to be a number //
  temperature?: number;

  // maxToken is optional, and has to be a number //
  maxTokens?: number;

  // requestid is optional, and has to be a string //
  requestId?: string;
}

// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ //
// Define a prompt class //
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ //
export class Prompt {

  // ########################################################################### //
  // Instructions //
  // ########################################################################### //
  constructor(

    // messages key can not be edited and is the Message import in an array // 
    public readonly messages: readonly Message[],

      // tools key can not be edited and is the tool import in an array // 
      // = [] means default value if nothing is provided //
    public readonly tools: readonly Tool[] = [],

    // metadata key can not be edited and is the PromptMetadata object //  
    // = {} means default value if nothing is provided //
    public readonly metadata: PromptMetadata = {}
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // Prompt functions
  // ─────────────────────────────────────────────────────────────────────────────

  // ########################################################################### //
  // withMessage function where message key = message value //
  // ########################################################################### //
  withMessage(message: Message): 

  // Output equals prompt object //
  Prompt {

    // Create new prompt object Where... //
    return new Prompt([

      // message key = retrieve all message data and add new message onto it //
      ...this.messages, message], 

      // tool key = retreive current tools data //
      this.tools, 

      // metadata key = retreive current metadata data //
      this.metadata);
  }

  // ########################################################################### //
   // withMessages function where message key = all messages //
  // ########################################################################### //
  withMessages(messages: Message[]): 
  
   // Output equals prompt object //
  Prompt {

    
    return new Prompt([

      // message key = retrieve all message data and add all new message onto it //
      ...this.messages, ...messages], 
      this.tools, 
      this.metadata);
  }

  // ########################################################################### //
  // withTools function where tools key = all new tools //
  // ########################################################################### //
  withTools(tools: Tool[]): 
  
  Prompt {

    return new Prompt(
      this.messages, 
      tools, 
      this.metadata);
  }

  // ########################################################################### //
    // withMetadata function where metaData key = Promptmetadata object //
    // partial makes all key values optional //
  // ########################################################################### //
  withMetadata(metadata: Partial<PromptMetadata>): 

  Prompt {

    return new Prompt(
      this.messages, 
      this.tools, 

      // meta data key = all meta data and all new metadata //
      { ...this.metadata, ...metadata }
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Accessors
  // ─────────────────────────────────────────────────────────────────────────────

  // ########################################################################### //
  // checks if tools has data  //
  // hastools function that is a boolean //
  // ########################################################################### //
  hasTools(): boolean {

    // returns yes if the tools are larger than 0 //
    return this.tools.length > 0;
  }

  // ########################################################################### //
  // messageCount that returns how many messages (back and forths with ai) there have been //
  // ########################################################################### //
  get messageCount(): number {
    return this.messages.length;
  }

  // ########################################################################### //
  // lastMessage funciton that returns a mesage or undefined //
  // ########################################################################### //
  get lastMessage(): Message | undefined {

    // get all new messages //
    return this.messages[

      // define the index as the message count number - 1//
      // this returns the previosu message //
      this.messages.length - 1
    ];

    // for example, messages = [a, b, c], this.message[1] = c //
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Factory Methods
  // ─────────────────────────────────────────────────────────────────────────────

  // ########################################################################### //
  // a simple function with an object where... //
  // ########################################################################### //
  static simple(

    // key = string //
    systemPrompt: string, 

    // key = string //
    userInput: string): 
    
    // outputs a prompt object //
    Prompt {

      // create a new prompt //
    return new Prompt([

      // messages key has a value of system key inside message object = systemprompt //
      Message.system(systemPrompt),

      // tools key has a value of user key inside message object = userinput //
      Message.user(userInput),
    ]);
  }

  // ########################################################################### //
  // a fromUser function with an object where... //
  // ########################################################################### //
  static fromUser(

    // userINput = string//
    userInput: string): 
    
    Prompt {

      // create a new prompt object // 
    return new Prompt([
      
      // user key in message object 
      Message.user(userInput)
    
    ]);
  }
}
