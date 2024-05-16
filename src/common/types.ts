import { BlockEntity } from '@logseq/libs/dist/LSPlugin';

export function isBlockEntity(block: any): block is BlockEntity {
  return (block as BlockEntity).id !== undefined;
}

export const TaskStates = {
  LATER: 'LATER',
  TODO: 'TODO',

  NOW: 'NOW',
  DOING: 'DOING',
  IN_PROGRESS: 'IN_PROGRESS',

  WAIT: 'WAIT',
  WAITING: 'WAITING',

  CANCELED: 'CANCELED',
  CANCELLED: 'CANCELLED',

  DONE: 'DONE',
} as const;

export type TaskStateStats = {
  NOT_DONE: number;
  IN_PROGRESS: number;
  BLOCKED: number;
  CANCELLED: number;
  DONE: number;
};
