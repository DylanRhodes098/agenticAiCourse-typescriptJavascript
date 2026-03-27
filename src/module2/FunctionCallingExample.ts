
// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //
/**
 * Module 2: Function Calling
 *
 * This module demonstrates OpenAI's function calling feature, which provides
 * a structured way for LLMs to invoke tools.
 *
 * Why function calling is better than text parsing:
 * 1. **Reliability**: The LLM outputs structured JSON, not free-form text
 * 2. **Type Safety**: Arguments are validated against a schema
 * 3. **No Parsing Errors**: No need to extract actions from markdown blocks
 * 4. **Better Tool Understanding**: LLM sees the schema, not just descriptions
 *
 * Run with: npm run module2:function-calling
 */
// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

// ============================================================================= //
// Imports
// ============================================================================= //

import { loadEnv } from '../shared/env';
import { Message, LLM, Tool, Prompt, Action } from '../shared';

// ============================================================================= //
// Tool Functions
// ============================================================================= //
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Create tools function
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
async function basicFunctionCalling(): Promise<void> {

  // ========================================== //
// funciton calling basics title //
// ========================================== //
  console.log('='.repeat(60));
  console.log('Module 2: Function Calling Basics');
  console.log('='.repeat(60));

  const llm = new LLM();

  // Define tools array //
  const tools = [

      // ========================================== //
// Current weather tool //
// ========================================== //
    new Tool(
      'getCurrentWeather',
      'Get the current weather in a given location',
      {
        type: 'object',

        // materials needed the location and unit //
        properties: {
          location: {
            type: 'string',
            description: 'The city and state, e.g. San Francisco, CA',
          },
          unit: {
            type: 'string',
            enum: ['celsius', 'fahrenheit'],
            description: 'Temperature unit',
          },
        },
        required: ['location'],
      }
    ),

       // ========================================== //
// search web tool //
// ========================================== //
    new Tool(
      'searchWeb',
      'Search the web for information',
      {
        type: 'object',

        // materials needed the what to seach? //
        properties: {
          query: {
            type: 'string',
            description: 'The search query',
          },
        },
        required: ['query'],
      }
    ),
  ];

  // ========================================== //
// Create prompt //
// ========================================== //
  const prompt = new Prompt(

    // message //
    [
      Message.system('You are a helpful assistant. Use tools when appropriate.'),
      Message.user("What's the weather like in Tokyo?"),
    ],

    // tool //
    tools
  );

  console.log('\n📤 Sending prompt with tools...');
  console.log('   Tools:', tools.map(t => t.name).join(', '));


  const response = await llm.generate(prompt);
  console.log('\n📥 Raw response:', response);

  // Parse the function call
  
  try {
    const action = Action.fromJSON(JSON.parse(response));
    console.log('\n✅ Parsed function call:');
    console.log('   Tool:', action.toolName);
    console.log('   Args:', JSON.stringify(action.args, null, 2));
  } catch {
    console.log('\n📝 LLM responded with text (no function call)');
  }
}

// ============================================================================= //
// Backend Functions
// ============================================================================= //
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Shows how the llm can automate the right tools when needed //
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Output nothing // 
async function toolSelection(): Promise<void> {
  
    // ========================================== //
// TOOL SELECTION DEMO //
// ========================================== //
  console.log('\n' + '='.repeat(60));
  console.log('Tool Selection Demo');
  console.log('='.repeat(60));

  // Create new chat //
  const llm = new LLM();

  // deine tools //
  const tools = [
    Tool.listFiles('Lists all files in the current directory'),
    Tool.readFile('Reads the contents of a specific file'),
    new Tool(
      'writeFile',
      'Writes content to a file',
      {
        type: 'object',
        properties: {

          // define args for new tool //
          fileName: { type: 'string', description: 'Name of the file to write' },
          content: { type: 'string', description: 'Content to write' },
        },
        required: ['fileName', 'content'],
      }
    ),
    Tool.terminate('Ends the conversation with a summary'),
  ];

  // User requests //
  const requests = [
    'What files are available?',
    'Can you read the package.json file?',
    'I\'m done, thanks for your help!',
  ];

  // map through all user requests //
  for (const request of requests) {
    console.log(`\n👤 User: "${request}"`);

    // create a new prompt where ... //
    const prompt = new Prompt(

      [
        Message.system('You are a file assistant. Use the appropriate tool for each request.'),

        // it generates 3 responses due to there being 3 requetss in the user request array //
        Message.user(request),
      ],

      tools
    );

    // define the reponse as the chat using the prompt //
    const response = await llm.generate(prompt);

    try {

      // Use the fromJson function in actions which... //
      // accepts the toolname and toolArgs object and... //
      // outputs an Action object //

      const action = Action.fromJSON(
        
        // json.parse converts json into a usable js object //
        JSON.parse(response));

        // Return the toolname and arguments //
      console.log(`🔧 Selected tool: ${action.toolName}`);
      console.log(`   Arguments: ${JSON.stringify(action.args)}`);
    } catch {
      console.log(`📝 Text response: ${response.substring(0, 100)}...`);
    }
    console.log('─'.repeat(40));
  }
}

// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
// Shows the difference between using the system vs using tools aswell //
// _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_- //
async function comparisonDemo(): Promise<void> {

      // ========================================== //
// FUNCTION CALLING VS TEXT PARSING //
// ========================================== //
  console.log('\n' + '='.repeat(60));
  console.log('Comparison: Function Calling vs Text Parsing');
  console.log('='.repeat(60));

  // create new chat //
  const llm = new LLM();

  // deifne userrequest //
  const userRequest = 'Read the file named "test.txt"';

   // ========================================== //
// METHOD 1 //
// ========================================== //
  console.log('\n📋 Method 1: Text-based response');
  console.log('─'.repeat(40));

  // define prompt using system as the tool //
  const textPrompt = new Prompt([
    Message.system(
      'When asked to perform an action, respond with a JSON code block:\n' +
      '```action\n{"tool": "readFile", "args": {"fileName": "..."}}\n```'
    ),
    Message.user(userRequest),
  ]);

  // define ai response using textprompt //
  const textResponse = await llm.generate(textPrompt);
  console.log('Response:\n', textResponse);
  console.log('\n⚠️  Requires parsing markdown blocks, can fail');

 // ========================================== //
// METHOD 2 //
// ========================================== //
  console.log('\n📋 Method 2: Function calling');
  console.log('─'.repeat(40));


  // define prompt using a tool instead //
  const fcPrompt = new Prompt(
    [
      Message.system('You are a file assistant.'),
      Message.user(userRequest),
    ],
    [Tool.readFile()]
  );

  // create response using tool prompt //
  const fcResponse = await llm.generate(fcPrompt);
  console.log('Response:', fcResponse);

  // Return response into a string //
  const action = Action.fromJSON(JSON.parse(fcResponse));
  console.log('\n✅ Structured output:');
  console.log('   Tool:', action.toolName);
  console.log('   Args:', action.args);
  console.log('\n✅ No parsing needed, guaranteed structure');
}

// ============================================================================= //
// Frontend Functions
// ============================================================================= //
async function main(): Promise<void> {
  loadEnv();

  try {
    await basicFunctionCalling();
    await toolSelection();
    await comparisonDemo();

    console.log('\n✅ Function calling examples completed!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { basicFunctionCalling, toolSelection };
