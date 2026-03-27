  // ============================================================================= //
/**
 * Module 1: Programmatic Prompting
 *
 * This is the simplest possible interaction with an LLM - sending a prompt
 * and receiving a response. No memory, no tools, no agent loop.
 *
 * Key concepts:
 * - Creating messages with roles (system, user, assistant)
 * - Using the LLM abstraction to generate responses
 * - Understanding the basic request/response flow
 *
 * Run with: npm run module1:prompting
 */
  // ============================================================================= //

// ─────────────────────────────────────────────────────────────────────────────
// Imports //
// ─────────────────────────────────────────────────────────────────────────────

// Functions imports //
import { loadEnv } from '../shared/env';

// File imports //
import { Message, LLM } from '../shared';

/**
 * Demonstrates basic LLM prompting without any agent features.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Backend Functions //
// ─────────────────────────────────────────────────────────────────────────────

// ========================================== //
// Simple Comletion Example //
// ========================================== //

// ########################################################################### //
// async function with a void as final output (this generates the furst 3 examples) //
// ########################################################################### //
async function basicPrompting(): Promise<void> {

  // return = 60 times //
  console.log('='.repeat(60));

  // ========================================== //
  // TITLE of the Module //
  // ========================================== //
  console.log('Module 1: Programmatic Prompting');

  // return = 60 times //
  console.log('='.repeat(60));

  // Define a new LLM (chat) as llm //
  const llm = new LLM();

  // ========================================== //
  // SUBTITLE Example 1 //
  // ========================================== //
  console.log('\n📝 Example 1: Simple Completion\n');

  // Define message as an arry with... //
  const messages = [

    // The system is... //
    Message.system('You are a helpful assistant that gives concise answers.'),

      // The user requests... //
    Message.user('What is TypeScript in one sentence?'),
  ];

  // Define repsonse as the frontend response function, using the defined message as the current message//
  const response = await llm.generate(messages);

    // Return the ais response //
  console.log('Response:', response);

  // ========================================== //
  // SUUBTITLE example 2 //
  // ========================================== //
  console.log('\n📝 Example 2: Code Generation\n');

  // Define codemessage as an arry with... // 
  const codeMessages = [

    // the system as a typescript expert //
    Message.system(
      'You are a TypeScript expert. Write clean, well-typed code. ' +
      'Only output the code, no explanations.'
    ),

     // User requests... //
    Message.user('Write a function that checks if a string is a palindrome.'),
  ];

  // Define repsonse as the frontend response function, using the defined codemessage as the current message//
  const codeResponse = await llm.generate(codeMessages);
  console.log('Generated code:\n');
  console.log(codeResponse);

  // ========================================== //
  // SUBTITLE example 3 //
  // ========================================== //
  console.log('\n📝 Example 3: Structured Output (JSON)\n');

  // Define jsonessage as an array with... //
  const jsonMessages = [

    // system being... //
    Message.system(
      'You are a helpful assistant. Always respond in valid JSON format.'
    ),

    // user requesting... //
    Message.user(
      'List 3 programming languages with their primary use case. ' +
      'Format: [{"language": "name", "useCase": "description"}]'
    ),
  ];

  // Define repsonse as the frontend response function, using the definedjsonmessage as the current message //
  const jsonResponse = await llm.generate(jsonMessages);

  // return ai repsonse //
  console.log('JSON Response:', jsonResponse);

  // |||||||||||||||||||||||||||||||||||||||||| //
  // Convert into json format //
  try {

    // Define parsed as the ai response in json format //
    const parsed = JSON.parse(jsonResponse);

    // Return a success message //
    console.log('Parsed successfully:', parsed);

  // |||||||||||||||||||||||||||||||||||||||||| //
  } catch {

    // return error if ais response wasnt json //
    console.log('Note: Response was not valid JSON');
  }
}

// ========================================== //
// System prompt example //
// ========================================== //

// ########################################################################### //
// async function with a void as final output //
// ########################################################################### //
async function systemPromptVariations(): Promise<void> {

  // ========================================== //
  // TITLE //
  // ========================================== //
  console.log('\n' + '='.repeat(60));
  console.log('System Prompt Variations');
  console.log('='.repeat(60));

  // Create a new llm //
  const llm = new LLM();

  // Define userQuestion as exlpain recursion //
  const userQuestion = 'Explain recursion.';

  // Define personas as an object array with... //
  const personas = [

    // 3 different systems. teacher, expert, comedian //

    {
      name: 'Teacher',
      system: 'You are a patient teacher explaining to a beginner. Use simple analogies.',
    },
    {
      name: 'Expert',
      system: 'You are a computer science professor. Be precise and technical.',
    },
    {
      name: 'Comedian',
      system: 'You are a comedian. Explain technical concepts with humor.',
    },
  ];

  // Map through perosnas, each persona called persona //
  for (const persona of personas) {

    // Return the each peronsa name folloed by exlpantion //
    console.log(`\n🎭 ${persona.name}'s explanation:\n`);

    // Define messages as an array with... //
    const messages = [

      // Use the message funcitons (an object with role and content) //
      // Apply the system funciton to each system value in peronsas //
      Message.system(persona.system),

      // Apply the user function to the string in userQuestion //
      Message.user(userQuestion),
    ];

    // Define responee using the generate function in LLM file, applying the messages array // 
    const response = await llm.generate(messages);

    // Return the repsonse //
    console.log(response);
    console.log('\n' + '-'.repeat(40));
  }
}

// ========================================== //
// AiWithMemory example //
// ========================================== //

  // ########################################################################### //
  // async function with a void as final output //
  // ########################################################################### //
async function AiWithMemory(): Promise<void> {

  // ========================================== //
  // TITLE //
  // ========================================== //
  console.log('\n' + '='.repeat(60));
  console.log('AiWithMemory example');
  console.log('='.repeat(60));

  const llm = new LLM();

 // ========================================== //
  // Message 1 //
  // ========================================== //

  const messages = [
    Message.system('You are an expert software engineer that prefers functional programming.'),
    Message.user('Write a function to swap the keys and values in an object.'),
  ];

  console.log('\n' + '-'.repeat(40));
  console.log('MESSAGE 1');
  console.log('\n' + '-'.repeat(40));

  const response = await llm.generate(messages);
  console.log(response);

   // ========================================== //
  // Message 2 //
  // ========================================== //
  
  // We are going to make this verbose so it is clear what
  // is going on. In a real application, you would likely
  // just append to the messages list.
  const messages2 = [
    Message.system('You are an expert software engineer that prefers functional programming.'),
    Message.user('Write a function to swap the keys and values in an object.'),
  
    // Here is the assistant's response from the previous step
    // with the code. This gives it "memory" of the previous
    // interaction.
    Message.assistant(response),
  
    // Now, we can ask the assistant to update the function
    Message.user('Update the function to include documentation.'),
  ];

  console.log('\n' + '-'.repeat(40));
  console.log('MESSAGE 2');
  console.log('\n' + '-'.repeat(40));

  const response2 = await llm.generate(messages2);
  console.log(response2);

}

// ─────────────────────────────────────────────────────────────────────────────
// Frontend Function
// ─────────────────────────────────────────────────────────────────────────────

// ########################################################################### //
// Define an async function that outputs a void //
// ########################################################################### //
async function main(): Promise<void> {

  // Fetch the loadEnv function that returns all the values in the env file //
  loadEnv();

  // |||||||||||||||||||||||||||||||||||||||||| //
  try {

     // Execute the basicPomrpting function defined above //
     await basicPrompting();

     // Execute the systemPromptVariations function defined above //
     await systemPromptVariations();

    await AiWithMemory();

    // Return a success message //
    console.log('\n✅ Programmatic prompting examples completed!');

  // |||||||||||||||||||||||||||||||||||||||||| //
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// !!!!!!!!!!!!!! //
// If this file is being run directly with Node (not imported by another file) //
// !!!!!!!!!!!!!! //
if (require.main === module) {

  // execute the main function //
  main();
}

export { basicPrompting, systemPromptVariations, AiWithMemory };
