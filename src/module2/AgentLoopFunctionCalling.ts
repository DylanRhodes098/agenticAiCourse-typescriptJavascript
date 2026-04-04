// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

/**
 * Module 2: Agent Loop with Function Calling
 *
 * This combines the agent loop pattern from Module 1 with the function
 * calling feature from earlier in this module.
 *
 * The result is a more robust agent that:
 * - Uses structured function calls instead of text parsing
 * - Has better tool invocation reliability
 * - Can dynamically register new tools
 *
 * Run with: npm run module2:agent
 */

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

// ============================================================================= //
// Imports
// ============================================================================= //
import { loadEnv } from '../shared/env';
import { Message, LLM, Tool, Prompt, Action, ActionResult, FileTools } from '../shared';

// Maximum iterations to prevent infinite loops //
const MAX_ITERATIONS = 10;

// ============================================================================= //
// SubFunctions
// ============================================================================= //

// Function shape that allows the llm to use the tools automatically //
type ToolFunction = 

// Input args which is a string and Unkown key value //
(args: Record<string, unknown>) => 
  
  // output unkown or promise unkown //
  unknown | Promise<unknown>;

/**
 * Agent that uses OpenAI function calling for tool invocation.
 *
 * This is more reliable than text-based action parsing because:
 * 1. The LLM outputs structured JSON via the function calling API
 * 2. Arguments are validated against schemas
 * 3. No regex or string parsing needed
 */

// ============================================================================= //
// LLM Skeleton
// ============================================================================= //

// ─────────────────────────────────────────────────────────────────────────────
// Agent class //
// ─────────────────────────────────────────────────────────────────────────────
class FunctionCallingAgent {

  // the Tool array //
  private readonly tools: Tool[] = [];

  // an object with string as keys and ToolFunction funciton as values //
  // Toolfunction inputs a string : unknown, outputs unkown //
  private readonly toolFunctions: Map<string, ToolFunction> = new Map();

  // the LLM object // 
  private readonly llm: LLM;

  // constructor inputs //
  constructor(

    // Systempompt key //  
    private readonly systemPrompt: string,

    // maxIterations keys //
    private readonly maxIterations: number = MAX_ITERATIONS,

    // optional llmconfig //
    llmConfig?: { model?: string }
  ) 
  
    // constructor rules //
  {

    // this.llm crerates a new llm using the llmconfig //
    this.llm = new LLM(llmConfig);
  }

// ============================================================================= //
// SubFunctions
// ============================================================================= //

  /**
   * Registers a tool with its implementation.
   *
   * @param tool - Tool definition (name, description, parameters)
   * @param fn - Function to execute when tool is called
   */
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// synchronous function that updates the class with newly added tools //
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// inputs the tool array and the tool implementation function // 
  registerTool(tool: Tool, fn: ToolFunction)
  
  // output the updated class object //
  : this {

    // add the inputted tool to the tools array //
    this.tools.push(tool);

    // add the key value pair to the existing toolfunction object // 
    this.toolFunctions.set(tool.name, fn);

    // Return to the updated class to loop this function, adding more than one tool //
    return this; 
  }

// ============================================================================= //
// THE LLM FUNCTION
// ============================================================================= //

// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// async function that loops through a user request 
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //

// input userRequest // 
  async run(userRequest: string)
  
  // Ouput message array // 
  : Promise<Message[]> {

    console.log('\n' + '='.repeat(60));
    console.log('Function Calling Agent');
    console.log('='.repeat(60));

    // user request //
    console.log(`\n📋 Request: ${userRequest}`);

    // maps through all the tool names, and lists them using join //
    console.log(`🔧 Available tools: ${this.tools.map(t => t.name).join(', ')}`);

// 1-1-1 ========================================== 1-1-1 //
// CREATE MESSAGE //
// 1-1-1 ========================================== 1-1-1 //
    const memory: Message[] = 
    [
      Message.system(this.systemPrompt),
      Message.user(userRequest),
    ];

    // iterations is 0 // 
    let iterations = 0;

    // loop through iterations, if iterations is smaller than maxiterations //
    // Keep looping while iterations is less than maxIterations //
    while (iterations < this.maxIterations) {

      // log the iteration count //
      console.log(`\n${'─'.repeat(40)}`);
      console.log(`Iteration ${iterations + 1}/${this.maxIterations}`);

// 2-2-2 ========================================== 2-2-2 //
// CREATE PROMPT //
// 2-2-2 ========================================== 2-2-2 //
      const prompt = new Prompt(memory, this.tools);

// 3-3-3 ========================================== 3-3-3 //
// CREATE LLM RESPONSE //
// 3-3-3 ========================================== 3-3-3 //
      const response = await this.llm.generate(prompt);
      console.log('\n📥 Response:', response.substring(0, 150) + '...');

// 4-4-4 ========================================== 4-4-4 //
// DETECT TOOLS //
// 4-4-4 ========================================== 4-4-4 //
      let action: Action;
      try {
        action = Action.fromJSON(JSON.parse(response));
      } catch {
        // Not a function call - LLM responded with text //
        console.log('📝 Text response (no function call)');

// M-M-M ========================================== M-M-M //
// UPDATE MEMORY //
// M-M-M ========================================== M-M-M //
        memory.push(Message.assistant(response));
        break;
      }

      console.log(`\n🎯 Tool call: ${action.toolName}`);
      console.log('   Args:', JSON.stringify(action.args));

      // Check for termination //
      // if action is a terminate function //
      if (action.isTerminate()) {

        // Create a message called done //
        const message = action.getArg<string>('message') ?? 'Done.';
        console.log(`\n✅ Terminated: ${message}`);

// M-M-M ========================================== M-M-M //
// UPDATE MEMORY //
// M-M-M ========================================== M-M-M // 
        memory.push(Message.assistant(response));
        break;
      }

// 5-5-5 ========================================== 5-5-5 //
// EXECUTE TOOLS //
// 5-5-5 ========================================== 5-5-5 //
      const result = await this.executeAction(action);
      console.log('📊 Result:', JSON.stringify(ActionResult.toJSON(result)).substring(0, 1000));

// M-M-M ========================================== M-M-M //
// UPDATE MEMORY //
// M-M-M ========================================== M-M-M //
      memory.push(Message.assistant(response));
      memory.push(Message.user(JSON.stringify(ActionResult.toJSON(result))));

      iterations++;
    }

    // if iterations is more than or equal to maxiterations //
    if (iterations >= this.maxIterations) {

      // log //
      console.log('\n⚠️  Maximum iterations reached');
    }

    // return full conversation history //
    return memory;
  }

// ============================================================================= //
// SubFunctions //
// ============================================================================= //

// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Hidden async function that generates the action results //
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Input the desired action // 
  private async executeAction(action: Action)
  
  // Return an action result // 
  : Promise<ActionResult<unknown>> {

    // Get the name of the tool executer/name // 
    const fn = this.toolFunctions.get(action.toolName);

     // if there isnt a tool executer // 
    if (!fn) {

      // return error result //
      return ActionResult.error(`Unknown tool: ${action.toolName}`);
    }

    // else //
    try {

      // execute the tool // 
      const result = await fn(action.args);

      // return success message //
      return ActionResult.success(result);

      // catch any errors // 
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return ActionResult.error(`Tool execution failed: ${message}`);
    }
  }

// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Return the tools //
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
  getTools(): readonly Tool[] {
    return this.tools;
  }
}

// ============================================================================= //
// THE AGENT FUNCTIONS
// ============================================================================= //

// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// A file explorer agent //
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
function createFileExplorerAgent(): 

// Outputs the FunctionCallingAget Class // 
FunctionCallingAgent {

// 1-1-1 ========================================== 1-1-1 //
// CREATE SYSTEM //
// 1-1-1 ========================================== 1-1-1 //
  const agent = new FunctionCallingAgent(

    // systemprompt // 

    'You are a file explorer agent. Help users navigate and read files.\n\n' +
    'Guidelines:\n' +
    '- Always list files before reading them\n' +
    '- Summarize file contents helpfully\n' +
    '- Use terminate when the task is complete'
  );

// 2-2-2 ========================================== 2-2-2 //
// CREATE TOOLS //
// 2-2-2 ========================================== 2-2-2 //
  agent

  // list file tool //
    .registerTool(Tool.listFiles(), () => FileTools.listFiles())

      // read file tool //
    .registerTool(Tool.readFile(), (args) => {
      const fileName = args.fileName as string;
      return FileTools.readFile(fileName);
    })

     // terminate tool //
    .registerTool(Tool.terminate(), (args) => {

      // Just return the message - the loop handles termination
      return args.message;
    });

  return agent;
}

// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// A Calculator agent, creating a new tool within the agent //
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
async function customToolDemo(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('Custom Tool Demo');
  console.log('='.repeat(60));

// 1-1-1 ========================================== 1-1-1 //
// CREATE SYSTEM //
// 1-1-1 ========================================== 1-1-1 //
  const agent = new FunctionCallingAgent(
    'You are a helpful assistant with various tools.'
  );

// 2-2-2 ========================================== 2-2-2 //
// CREATE TOOLS //
// 2-2-2 ========================================== 2-2-2 //
  agent.registerTool(
    new Tool(
      'calculate',
      'Performs basic arithmetic calculations',
      {
        type: 'object',
        properties: {
          expression: {
            type: 'string',
            description: 'Mathematical expression like "2 + 2" or "10 * 5"',
          },
        },
        required: ['expression'],
      }
    ),

    // a function that inputs arguments //
    (args) => {

      // define expression as a string //
      const expr = args.expression as string;

      // Remove Base language //
      const sanitized = expr.replace(/[^0-9+\-*/().  ]/g, '');
      try {

        // execute calculation //
        return eval(sanitized);
      } catch {
        throw new Error(`Cannot evaluate: ${expr}`);
      }
    }
  );

  agent.registerTool(Tool.terminate(), (args) => args.message);

  await agent.run('What is 42 * 17?');
}

// ============================================================================= //
// THE EXECUTE FUNCTIONS 
// ============================================================================= //

async function main(): Promise<void> {
  loadEnv();

  try {
// ========================================== //
// FileExplorerAgent //
// ========================================== //
    const fileAgent = createFileExplorerAgent();
    await fileAgent.run(
      'What files are in this directory? Read the package.json and tell me about the project.'
    );

// ========================================== //
// Calculator Agent //
// ========================================== //
    await customToolDemo();

    console.log('\n✅ Function calling agent examples completed!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { FunctionCallingAgent, createFileExplorerAgent };
