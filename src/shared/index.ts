/**
 * Shared module exports.
 *
 * This barrel file re-exports all shared types and classes for convenient importing.
 *
 * @example
 * ```typescript
 * import { Message, LLM, Action, Tool } from './shared';
 * ```
 */

// Core types
export { Message, Role } from './llmTools/Message';
export { Action, ToolArgs } from './agentExecuteTools/Action';
export { ActionResult } from './agentExecuteTools/ActionResult';
export { Tool, ToolParameters } from './llmTools/Tool';
export { Prompt, PromptMetadata } from './llmTools/Prompt';
export { Memory } from './llmTools/Memory';
export { Goal } from './Goal';
export { LLM, LLMConfig, ToolCallResponse } from './llmTools/LLM';
export { FileTools } from './agentExecuteTools/FileTools';

// New GAME framework components
export { ConversationMemory, MemoryItem, MemoryItemType } from './llmTools/ConversationMemory';
export { Environment, ActionResultEnvelope, EnvironmentConfig } from './agentBuildTools/Environment';
export {
  AgentLanguage,
  NaturalLanguage,
  JsonActionLanguage,
  FunctionCallingLanguage,
  Goal as AgentGoal,
  ParsedAction,
  PromptContext,
  ErrorContext,
  createGoal,
  extractCodeBlock,
} from './agentBuildTools/AgentLanguage';
export {
  Agent,
  AgentBuilder,
  AgentConfig,
  AgentStepResult,
  AgentCallbacks,
  GenerateResponseFn,
  createSimpleAgent,
} from './agentExecuteTools/Agent';

// Zod-based tool definition
export {
  defineTool,
  ToolDefinition,
  RegisteredTool,
  getGlobalTool,
  getAllGlobalTools,
  getToolNamesByTag,
  clearGlobalRegistry,
  listFilesDefinition,
  readFileDefinition,
  terminateDefinition,
} from './toolBox/defineTool';
export {
  ToolRegistry,
  ToolRegistryOptions,
  createFileOperationsRegistry,
  createFullRegistry,
} from './agentBuildTools/ToolRegistry';
