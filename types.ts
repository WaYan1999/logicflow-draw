export enum NodeType {
  // General
  TEXT = 'TEXT',
  INFO = 'INFO',
  METHOD = 'METHOD',
  
  // Development
  APP = 'APP',
  API = 'API',
  TRIGGER = 'TRIGGER',
  JOB = 'JOB',
  INTERCEPTOR = 'INTERCEPTOR',
  LOGIC = 'LOGIC',
  VALUE = 'VALUE',
  IMPL = 'IMPL',
  
  // Infrastructure
  REDIS = 'REDIS',
  MYSQL = 'MYSQL',
  MQ = 'MQ',
  
  // Container
  GROUP = 'GROUP'
}

export interface NodeData {
  title: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path?: string;
  description?: string;
  cron?: string;
  type: NodeType;
  isEditing?: boolean;
  isConnectSource?: boolean;
  value?: string | number;
}