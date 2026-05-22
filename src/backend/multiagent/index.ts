// 智能体模块导出
export { AgentCommunicationBus, communicationBus, MessageType } from './AgentCommunicationBus';
export type { AgentMessage, AgentRegistration, AgentCapability } from './AgentCommunicationBus';

export { BaseAgent } from './BaseAgent';

export { TaskCoordinator, taskCoordinator } from './TaskCoordinator';
export type { SubTask, CoordinatedTask } from './TaskCoordinator';

export { FileAgent, fileAgent } from './FileAgent';
export type { FileSearchResult, FileOrganizeOptions } from './FileAgent';

export { SystemAgent, systemAgent } from './SystemAgent';
export type { SystemStatus, AppInfo } from './SystemAgent';

export { KnowledgeAgent, knowledgeAgent } from './KnowledgeAgent';
export type { Document, SearchResult, Summary } from './KnowledgeAgent';

export { ImageAgent, imageAgent } from './ImageAgent';
export type { ImageInfo, Album, ClassificationResult } from './ImageAgent';

export { DataAgent, dataAgent } from './DataAgent';
export type { DataSet, AnalysisResult, Report, TrendAnalysis } from './DataAgent';

export { GeneralAgent, generalAgent } from './GeneralAgent';
export type { TaskContext, CoordinationResult } from './GeneralAgent';

export { AgentManager, agentManager } from './AgentManager';
export type { AgentStatusCallback, MessageCallback } from './AgentManager';
