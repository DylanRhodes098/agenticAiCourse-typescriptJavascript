// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

// ========================================== //
// Memory Manipulation SubFunctions //
// ========================================== //

/**
 * Module 1: The Agent Loop - Text Parsing Agent
 *
 * This module introduces the fundamental agent loop pattern using TEXT-BASED
 * action parsing (not OpenAI function calling). This demonstrates how agents
 * can work with any LLM by parsing structured output from responses.
 *
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │                      THE AGENT LOOP                         │
 *   │                                                             │
 *   │   1. Construct prompt (rules + memory + user request)       │
 *   │                           ↓                                 │
 *   │   2. Send to LLM, get response                              │
 *   │                           ↓                                 │
 *   │   3. Parse response to extract action (TEXT PARSING!)       │
 *   │                           ↓                                 │
 *   │   4. Execute action in the environment                      │
 *   │                           ↓                                 │
 *   │   5. Update memory with results                             │
 *   │                           ↓                                 │
 *   │   6. Check if done → if not, go to step 1                   │
 *   └─────────────────────────────────────────────────────────────┘
 *
 * Key concepts demonstrated:
 * - **Text-based action parsing** using ```action code blocks
 * - **Memory accumulation** across loop iterations
 * - **Tool execution** with result handling
 * - **Termination conditions** via terminal actions
 *
 * This is the foundation before introducing:
 * - Function calling (Module 3)
 * - The GAME framework (Module 3)
 * - Zod-based tool registration (Module 4)
 *
 * Run with: npm run module1:agent
 * 
 * 1. Construct Prompt: Combine the agent’s memory, user input, and system rules into a single prompt. This ensures the LLM has all the context it needs to decide on the next action, maintaining continuity across iterations.

2. Generate Response: Send the constructed prompt to the LLM and retrieve a response. This response will guide the agent’s next step by providing instructions in a structured format.

3. Parse Response: Extract the intended action and its parameters from the LLM’s output. The response must adhere to a predefined structure (e.g., JSON format) to ensure it can be interpreted correctly.

4. Execute Action: Use the extracted action and its parameters to perform the requested task with the appropriate tool. This could involve listing files, reading content, or printing a message.

5. Convert Result to String: Format the result of the executed action into a string. This allows the agent to store the result in its memory and provide clear feedback to the user or itself.

6. Continue Loop?: Evaluate whether the loop should continue based on the current action and results. The loop may terminate if a “terminate” action is specified or if the agent has completed the task.
 */

// ============================================================================= //
// Imports //
// ============================================================================= //

// ========================================== //
// Import Functions //
// ========================================== //
import { loadEnv } from '../shared/env';
import { Message, LLM } from '../shared';
import { ConversationMemory } from '../shared/llmTools/ConversationMemory';

// ============================================================================= //
// Action Objects
// ============================================================================= //
/**
 * A parsed action from text-based LLM responses.
 *
 * In text-parsing agents, the LLM outputs structured JSON inside
 * markdown code blocks that we parse to determine what to do.
 */

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

// ─────────────────────────────────────────────────────────────────────────────
// Action Input interface 
// ─────────────────────────────────────────────────────────────────────────────
export interface TextParsedAction {
  /** Name of the tool to invoke */
  toolName: string;

  /** Arguments to pass to the tool */
  args: Record<string, unknown>;
}


// ─────────────────────────────────────────────────────────────────────────────
// Action Output interface 
// ─────────────────────────────────────────────────────────────────────────────
export interface ActionExecutionResult {
  /** Whether execution was successful */
  success: boolean;

  /** The result data (if successful) */
  result?: unknown;

  /** Error message (if failed) */
  error?: string;
}

/** Maximum iterations to prevent infinite loops */
const MAX_ITERATIONS = 10;

/**
 * The system prompt that defines the agent's behavior.
 */
const AGENT_RULES = `You are an agent that can perform tasks using tools.

Available tools:
1. printMessage(message: string): Print a message to the console.
2. listFiles(): List all files in the current directory. Returns string[].
3. readFile(fileName: string): Read and return the contents of a file.
4. terminate(message: string): End the session with a final summary.

IMPORTANT RULES:
- When asked about files, ALWAYS list them first before reading.
- EVERY response MUST include exactly one action in a code block.
- Use terminate when you have completed the user's request.

Response format - you MUST wrap your action in this exact format:

\`\`\`action
{"toolName": "toolName", "args": {"argName": "argValue"}}
\`\`\`

Example responses:

To list files:
\`\`\`action
{"toolName": "listFiles", "args": {}}
\`\`\`

To read a file:
\`\`\`action
{"toolName": "readFile", "args": {"fileName": "package.json"}}
\`\`\`

To finish:
\`\`\`action
{"toolName": "terminate", "args": {"message": "Task completed successfully."}}
\`\`\`
`;

// ============================================================================= //
// Tools
// ============================================================================= //

// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Tool subFunctions
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //

// Return string message //
const tools = {
  printMessage(message: string): string {
    console.log(`📢 ${message}`);
    return 'Message printed';
  },

  // retrn list of file sin current directory //
  listFiles(): string[] {
    const fs = require('fs');
    const files = fs.readdirSync('.');
    console.log(`📁 Found ${files.length} files`);
    return files;
  },

  // Return content within a given file //
  readFile(fileName: string): string {
    const fs = require('fs');
    try {
      const content = fs.readFileSync(fileName, 'utf-8');
      console.log(`📄 Read ${content.length} characters from ${fileName}`);
      return content;
    } catch (error) {
      throw new Error(`Failed to read ${fileName}: ${error}`);
    }
  },

  terminate(message: string): string {
    console.log(`✅ Terminating: ${message}`);
    return message;
  },
};

// ============================================================================= //
// Action subFunctions 
// ============================================================================= //

// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Function that reads and generates action input 
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
export function parseTextAction(response: string): TextParsedAction {
  const startMarker = '```action';
  const endMarker = '```';

  // finds where action is in the response and outputs a number where it is in the string //
  const startIndex = response.indexOf(startMarker);

  // if there isnt an action //
  if (startIndex === -1) {
    // No action block found - gracefully degrade to terminate
    console.log('⚠️  No ```action block found, treating as terminate');
    return {
      toolName: 'terminate',
      args: { message: response },
    };
  }

  // else Measure where the action prompt starts //
  const contentStart = startIndex + startMarker.length;

  // Measure where the action prompt ends //
  const endIndex = response.indexOf(endMarker, contentStart);

  //If the action doesnt end //
  if (endIndex === -1) {
    console.log('⚠️  Unclosed ```action block, treating as terminate');
    return {
      toolName: 'terminate',
      args: { message: response },
    };
  }

  // else read the action //
  const jsonStr = response.substring(contentStart, endIndex).trim();

  try {

    // Transfrom string into json //
    const parsed = JSON.parse(jsonStr);

    // Support both toolName and tool_name formats
    const toolName = parsed.toolName ?? parsed.tool_name ?? parsed.tool;

    // if there isnt a tool name idnetified //
    if (!toolName) {
      throw new Error('Missing tool name in action');
    }

    // return the toolname and required materials for the tool //
    return {
      toolName,
      args: parsed.args ?? {},
    };

    // throw error //
  } catch (error) {
    console.log(`⚠️  Failed to parse action JSON: ${error}`);
    return {
      toolName: 'terminate',
      args: { message: `Parse error: ${error}. Original response: ${response}` },
    };
  }
}

// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Function that generates action output
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
export function executeTextAction(action: TextParsedAction): ActionExecutionResult {
  console.log(`\n🔧 Executing: ${action.toolName}`, JSON.stringify(action.args));

  try {

    // if there is a tool name //
    switch (action.toolName) {

 // if the tool name is printmessage //
      case 'printMessage': {

        // define tool argeuments/materials as a string //
        const message = action.args.message as string;

        // Use printMessage function to return agruments in tool //
        const result = tools.printMessage(message);

        // return a success bvoolean followed by the arguments //
        return { success: true, result };
      }

       // if the tool name is lisfiles //
      case 'listFiles': {
        const result = tools.listFiles();
        return { success: true, result };
      }

      // if the tool name is readfiles //
      case 'readFile': {
        const fileName = action.args.fileName as string;
        if (!fileName) {
          return { success: false, error: 'fileName argument is required' };
        }
        const result = tools.readFile(fileName);
        return { success: true, result };
      }

      // if the tool name is terminate //
      case 'terminate': {
        const message = action.args.message as string;
        const result = tools.terminate(message);
        return { success: true, result };
      }

      // if none of the above, default to error message //
      default: {
        return {
          success: false,
          error: `Unknown tool: ${action.toolName}`,
        };
      }
    }

    // throw error //
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

// ============================================================================= //
// The LLM Function
// ============================================================================= //

// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// A function that executes a functioning LLM with actions //
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
export async function runTextParsingAgentLoop(

  // Paramteres are user request, the LLM file and 10 iterations //
  userInput: string,
  llm: LLM,
  maxIterations = MAX_ITERATIONS
)

// Final value will be the conversationMmeory object including... //
// memoryitem array, all the functions to add, get and delete tools //
: Promise<ConversationMemory> {
  console.log('\n' + '='.repeat(60));
  console.log('Text-Parsing Agent Loop');
  console.log('='.repeat(60));
  console.log(`\n📋 User Request: ${userInput}`);

  // Create a new memory for llm //
  const memory = new ConversationMemory();

  // uses addUser (userMessage) function, applying the current user request //
  memory.addUser(userInput);

  // define iterations as 0 //
  let iterations = 0;

  // ========================================== //
  // THE AGENT LOOP //
  // ========================================== //

  // If maxIterations is larger than 0 // 
  while (iterations < maxIterations) {
    console.log(`\n${'─'.repeat(40)}`);

    // log the amount of user equests there have been as 1 / X //
    console.log(`Iteration ${iterations + 1}/${maxIterations}`);
    console.log('─'.repeat(40));

    // ========================================== //
    // Step 1: Build llm memory using previous iteraitons/messages 
    // ========================================== //

    // Create a new message array with... //
    const messages: Message[] = [

      // an array with the system as the defined agent rules //
      Message.system(AGENT_RULES),

      // all of the previous messages in the current llm memory //
      ...memory.toMessages(),
    ];

    // ========================================== //
    // Step 2: Get LLM response
    // ========================================== //
    console.log('\n📤 Sending prompt to LLM...');

    // Generate a string that can be used as a LLM response //
    const response = await llm.generate(messages);
    console.log('\n📥 LLM Response:');
    console.log(response.substring(0, 300) + (response.length > 300 ? '...' : ''));

    // ========================================== //
    // Step 3: Use response to read and generate the action 
    // ========================================== //
    // Read and generate the action using the LLM response //
    const action = parseTextAction(response);
    console.log(`\n🎯 Parsed Action: ${action.toolName}`, action.args);

    // ========================================== //
    // Step 4: Execute action //
    // ========================================== //
    // Execute action using action defintion //
    const result = executeTextAction(action);
    console.log('📊 Result:', JSON.stringify(result).substring(0, 200));

    // ========================================== //
    // Step 5: Update memory
    // ========================================== //
    // Use ConversationMemory actions to update llm memory //
    memory.addAssistant(response);
    memory.addEnvironment(JSON.stringify(result));

    // ========================================== //
    // Step 6: Check termination
    // ========================================== //
    // if the action is to temrinate the llm //
    if (action.toolName === 'terminate') {
      console.log('\n✅ Agent terminated');
      break;
    }

    iterations++;
  }

  // if iterations more than or equal to 10 //
  if (iterations >= maxIterations) {
    console.log('\n⚠️  Maximum iterations reached');
  }

  // ========================================== //
  // Step 7: sucessfully return memory //
  // ========================================== //
  // else return the llms memory //
  return memory;
}

// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// An alterative LLM funciton that outputs a similar result but a simpler version 
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
export async function runSimpleAgentLoop(
  userInput: string,
  llm: LLM
): Promise<Message[]> {
  // Memory is just an array of messages
  const memory: Message[] = [
    { role: 'user', content: userInput } as Message,
  ];

  const rules: Message = Message.system(AGENT_RULES);

  let iterations = 0;

  while (iterations < MAX_ITERATIONS) {
    // 1. Build prompt
    const prompt = [rules, ...memory];

    // 2. Get response
    console.log('Agent thinking...');
    const response = await llm.generate(prompt);
    console.log(`Agent response: ${response.substring(0, 200)}...`);

    // 3. Parse action
    const action = parseTextAction(response);

    // 4. Execute and get result
    const result = executeTextAction(action);
    console.log(`Action result: ${JSON.stringify(result).substring(0, 200)}`);

    // 5. Update memory
    memory.push(Message.assistant(response));
    memory.push(Message.user(JSON.stringify(result)));

    // 6. Check termination
    if (action.toolName === 'terminate') {
      console.log(action.args.message);
      break;
    }

    iterations++;
  }

  return memory;
}

// ============================================================================= //
// Frontend Function 
// ============================================================================= //

// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  // An async function that Runs all functions defined above //
  // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
async function main(): Promise<void> {
  loadEnv();

  try {
    const llm = new LLM();

    // Example task
    // This is why the ai executed the listfiles, readfiles, printm,essage and terminate actions in the console when you run the code //
    const userRequest =
      'What files are in this directory? Please read the package.json ' +
      'file and tell me about this project.';

    const memory = await runTextParsingAgentLoop(userRequest, llm);

    console.log('\n' + '='.repeat(60));
    console.log('Agent Loop Completed');
    console.log('='.repeat(60));

    console.log('\n📚 Key Takeaways:');
    console.log('1. The agent loop: prompt → response → parse → execute → memory → repeat');
    console.log('2. Text parsing works with ANY LLM (no function calling needed)');
    console.log('3. Memory accumulates context across iterations');
    console.log('4. Terminal actions end the loop');

    console.log(`\n📊 Final memory has ${memory.length} items`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

// Re-export for backwards compatibility
export {
  AGENT_RULES as AGENT_SYSTEM_PROMPT,
  parseTextAction as parseAction,
  executeTextAction as executeAction,
  runTextParsingAgentLoop as runAgentLoop,
};
