// ============================================================================= //

// ─────────────────────────────────────────────────────────────────────────────
// The Brain of the LLM
// ─────────────────────────────────────────────────────────────────────────────

// < - LLM Strcuture/Skeleton = Core deinetions (classes, interfaces) and infastructure (objects, arrays) to be used throughout the file - > //

// < - Frontend Response Function = Function to print the response generated - > //

// < - Backend Response Generator = Function to generate the reponse - > //

// < - Backend Directories = Message and tool directories for the generator to navigate to - > //

// < - Logging = A backend "database" where all conversations live (good for debugging) - > //

// ============================================================================= //

  // ─────────────────────────────────────────────────────────────────────────────
  // Imports
  // ─────────────────────────────────────────────────────────────────────────────

// ========================================== //
// Import libararies //
// ========================================== //
import OpenAI from 'openai';

// ========================================== //
// Import functions //
// ========================================== //
import { Message } from './Message';
import { Tool } from './Tool';
import { Prompt } from './Prompt';

  // ─────────────────────────────────────────────────────────────────────────────
  // LLM Skeleton
  // ─────────────────────────────────────────────────────────────────────────────

  // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  // Optional settings for the AI interface //
  // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
export interface LLMConfig {

  // OpenAI API key (defaults to OPENAI_API_KEY env var) //
  apiKey?: string;

  // Model to use (defaults to OPENAI_MODEL env var or "gpt-5-nano") //
  model?: string;

  // Maximum tokens in response //
  maxTokens?: number;

  // Enable debug logging //
  debug?: boolean;
}

// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Tool navigation/idnetifier interface //
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
export interface ToolCallResponse {

  // Name of the tool //
  tool: string;

  // Materials needed for the tool to run //
  args: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// LLM Class //
// ─────────────────────────────────────────────────────────────────────────────
export class LLM {

  // non-editable key = client,value = OpenAi libraray import //
  private readonly client: OpenAI;

    // non-editable key = model,value = string //
  private readonly model: string;

    // non-editable key = maxTokens,value = number //
  private readonly maxTokens: number;

    // non-editable key = debug,value = boolean //
  private readonly debug: boolean;

  // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  // A constructor function with a key = config, value = LLMConfig object //
  // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  constructor(config: LLMConfig = {}) {

    // Define apiKey as the existing value in the object // 
    const apiKey = config.apiKey 

    // Else use envs key // 
    ?? process.env.OPENAI_API_KEY;

    // !!!!!!!!!!!!!! //
    //  If there isn't an apikey // 
    // !!!!!!!!!!!!!! //
    if (!apiKey) {

      // respond with an error // 
      throw new Error(
        'OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass apiKey in config.\n' +
        'Tip: Copy .env.example to .env and add your API key.'
      );
    }

    // client value creates a new apikey //
    this.client = new OpenAI({ apiKey });

    // model value is existing value in the object //
    this.model = config.model 

    // Else use envs key //
    ?? process.env.OPENAI_MODEL 

    // Else use default gpt //
    ?? 'gpt-5-nano';

    // model value is existing value in the object //
    this.maxTokens = config.maxTokens 

    // Else use 4096 //
    ?? 4096;

    // model value is existing value in the object //
    this.debug = config.debug 

    // Else use envs key //
    ?? process.env.DEBUG === 'true';
  }

  
  // ─────────────────────────────────────────────────────────────────────────────
  // Frontend Response Function
  // ─────────────────────────────────────────────────────────────────────────────

  // ########################################################################### //
  // Async function with a key = input, value = Messsage array or Prompt object //
  // ########################################################################### //
  async generate(input: Message[] | Prompt): 
    
  // Final value will be a string //
    Promise<string> {

// If input value is an array (which means its the Message class) //
// Message class = role : string, content : string //
    const prompt = Array.isArray(input) 

// Then create a new Prompt object with the current message array //
// Prompt class = { messages : Message array, tools : Tool array, metaData : Metadata array } //
    ? new Prompt(input) 

    // If it is not a message array, it assumes input is already a Prompt object and uses it directly.
    : input;

// |||||||||||||||||||||||||||||||||||||||||| //
    try {

      // define openaiMessages as the toOpenAIMessages function that uses the messages value //
      const openaiMessages = this.toOpenAIMessages(prompt.messages);

      // !!!!!!!!!!!!!! //
      // If the prompt has added tools //
      // !!!!!!!!!!!!!! //
      if (prompt.hasTools()) {

        // If the prompt has added tools, use generateWithTools function that uses the message and the tool //
        return await this.generateWithTools(openaiMessages, prompt.tools);

        // !!!!!!!!!!!!!! // 
      } else {

         // Else just retuen the message alone //
        return await this.generateSimple(openaiMessages);
      }

    // |||||||||||||||||||||||||||||||||||||||||| //
    } catch (error) {
      this.logError(error, prompt);
      throw error;
    }
  }

  /**
   * Alias for generate() - for backward compatibility.
   */

  // For Safety //
  // Async function that returns the generate function //
  async generateResponse(input: Message[] | Prompt): Promise<string> {
    return this.generate(input);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Backend Response Generator 
  // ─────────────────────────────────────────────────────────────────────────────

  // An async function with parameter value as as specific part of the chat //
  private async generateSimple(messages: OpenAI.Chat.ChatCompletionMessageParam[])
  
  // the output must return a string //
  : Promise<string> {

    // log a string //
    this.log('Generating response (no tools)...');

    // Define completion as a request to write an ai repsonse //
    const completion = await this.client.chat.completions.create({

      // the repsonse should include //

      // the LLM model //
      model: this.model,

      // The last message in the current chat //
      messages,

      // the max tokens for the LLM //
      max_completion_tokens: this.maxTokens,
    });

    // Read the completed mesage generated by the ai, completion is the repsonse, choices maps through each repsonse (if multiple), message is the role and ontent object //
    const message = completion.choices[0]?.message;

     // If message exists, read the content keyValue //
    const content = message?.content;

    // !!!!!!!!!!!!!! //
    // If there is a refusal //
    // !!!!!!!!!!!!!! //
    if ('refusal' in message && message.refusal) {

      // Return the refusal //
      throw new Error(`Model refused request: ${message.refusal}`);
    }

    // !!!!!!!!!!!!!! //
    // If there isnt any content //
    // !!!!!!!!!!!!!! //
    if (!content) {

      // Log the message generated //
      this.log('Full response:', JSON.stringify(completion.choices[0], null, 2));

      // Return an error //
      throw new Error('No response content received from OpenAI');
    }

    // Log the content the ai generated //
    this.log('Response received:', content.substring(0, 100) + '...');

    // return content //
    return content;
  }

  // An async function with parameter value as as specific part of the chat and all the tools //
  private async generateWithTools(messages: OpenAI.Chat.ChatCompletionMessageParam[], tools: readonly Tool[]
  )
  
  // output return a string //
  : Promise<string> {

    // Log all the tools names and join them with a commer //
    this.log('Generating response with tools:', tools.map(t => t.name).join(', '));

    // Define openaitools as the tools in the current message //
    const openaiTools = this.toOpenAITools(tools);

    // request ai to generate a message with... //
    const completion = await this.client.chat.completions.create({

      // the LLM model //
      model: this.model,

      // the last message in the current chat //
      messages,

      // the token number //
      max_completion_tokens: this.maxTokens,

      // the tools that will need to be used //
      tools: openaiTools,
    });

    // Read the generated messages //
    const message = completion.choices[0]?.message;

    // Reads the message and check is a tool is needed //
    const toolCalls = message?.tool_calls;

    // !!!!!!!!!!!!!! //
    // If there is a tool //
    // !!!!!!!!!!!!!! //
    if (toolCalls && toolCalls.length > 0) {

      // Define toolcall as the tool the ai needs //
      const toolCall = toolCalls[0];

      // !!!!!!!!!!!!!! //
      // if toolCall type is function //
      // !!!!!!!!!!!!!! //
      if (toolCall.type === 'function') {

        // Define an object called reponse with...
        const response: ToolCallResponse = {

          // the name of the tool //
          tool: toolCall.function.name,

          // the instructions of the tool in json format //
          args: JSON.parse(toolCall.function.arguments),
        };

        // log the tool and the instrucitons //
        this.log('Tool call:', response.tool, response.args);

        // return the tool as a string //
        return JSON.stringify(response);

        // !!!!!!!!!!!!!! //
      } else {

        // retrun an error //
        throw new Error(`Unsupported tool call type: ${toolCall.type}`);
      }

    // !!!!!!!!!!!!!! //
    } else {
      // LLM responded with text (no tool call)
      const content = message?.content;

      // !!!!!!!!!!!!!! //
      // if there isnt any content //
      // !!!!!!!!!!!!!! //
      if (!content) {

        // returna an erorr //
        throw new Error('No response content received from OpenAI');
      }

      // log the content //
      this.log('Text response (no tool call):', content.substring(0, 100) + '...');

      // return the content //
      return content;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Backend Directories (Messages/Tools) 
  // ─────────────────────────────────────────────────────────────────────────────

  // A private function wthat returns the most recent response/return in the chat //
  private toOpenAIMessages(messages: readonly Message[])

  // The output of the funciton will equal one part of the ai chat in the form of an array //
  : OpenAI.Chat.ChatCompletionMessageParam[] {

    // maps through the Messages array, with one message equal to msg //
    return messages.map(msg => ({

      // Returns role of the specific message (user, system, assistant) //
      role: msg.role,

        // Returns content of the specific message //
      content: msg.content,
    }));
  }

  // A private function with the parameter as the tools array //
  private toOpenAITools(tools: readonly Tool[])
  
  // Navigate to the tools section of the openai library //
  : OpenAI.Chat.ChatCompletionTool[] {

// map through the tools array, each tool as tool //
    return tools.map(tool => ({

      // key = type, value = 'function' as a type not a string //
      type: 'function' as const,

      // key = function, value = an object with...//
      function: {

            // key = name, value = specific tool //
        name: tool.name,

            // key = description, value = description of specific tool //
        description: tool.description,

            // key = parameter, value = the parameter object with open ai property allowing ai to fecth the mateirals to use the tool //
        parameters: tool.parameters as OpenAI.FunctionParameters,
      },
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Logging
  // ─────────────────────────────────────────────────────────────────────────────

  // A log function with a rest parameter, the key = args, value = an array of any type //
  private log(...args: unknown[]): void {

    // !!!!!!!!!!!!!! //
    // if debug boolean is true //
    // !!!!!!!!!!!!!! //
    if (this.debug) {

      // return the string LLM, and add all data passed through log //
      console.log('[LLM]', ...args);
    }
  }

    // A logError function with parameter key = erorr, value = anything, and key = prompt, value = Prompt object //
  private logError(error: unknown, prompt: Prompt): void {

    // Return an error //
    console.error('[LLM] Error generating response:', error);

      // !!!!!!!!!!!!!! //
      // if debug boolean is true //
      // !!!!!!!!!!!!!! //
    if (this.debug) {

      // Trigger a return that ... //
      console.log('[LLM] Messages:', 
        
        // Maps through all prompt messages, each message called m //
        prompt.messages.map(m => 
          
          // Return each message as a string //
          m.toString()));

          // !!!!!!!!!!!!!! //
          // if prompt object has tools //
          // !!!!!!!!!!!!!! //
      if (prompt.hasTools()) {

        // Trigger a return ... //
        console.log('[LLM] Tools:', 
          
          // Maps through all prompt tools, each message called t //
          prompt.tools.map(t => 
            
            // return each tools name //
            t.name));

      }

      // retrun the model of the llm //
      console.log('[LLM] Model:', this.model);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Utility
  // ─────────────────────────────────────────────────────────────────────────────

  /** Returns the model name being used */
  getModel(): string {
    return this.model;
  }
}
