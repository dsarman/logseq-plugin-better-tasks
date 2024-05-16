import { BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { isBlockEntity, TaskStates, TaskStateStats } from '../common/types';

const getTasks = (block: BlockEntity): BlockEntity[] => {
  const childrenBlocks = block.children?.filter(isBlockEntity) ?? [];
  const childrenTasks = childrenBlocks.filter(child => child.marker);
  const nestedTasks = childrenBlocks?.flatMap(child => getTasks(child));

  return [...childrenTasks, ...nestedTasks];
};

export const getTaskStats = async (
  parentUuid: string
): Promise<TaskStateStats> => {
  const result: TaskStateStats = {
    BLOCKED: 0,
    CANCELLED: 0,
    DONE: 0,
    IN_PROGRESS: 0,
    NOT_DONE: 0,
  };

  const parentBlock = await logseq.Editor.getBlock(parentUuid, {
    includeChildren: true,
  });
  if (!parentBlock) {
    console.warn('No blocks found for parentUuid: ', parentUuid);
    return result;
  }

  const allTasks = getTasks(parentBlock);
  allTasks.forEach(task => {
    switch (task.marker) {
      case TaskStates.LATER:
      case TaskStates.TODO:
        result.NOT_DONE += 1;
        break;
      case TaskStates.NOW:
      case TaskStates.DOING:
      case TaskStates.IN_PROGRESS:
        result.IN_PROGRESS += 1;
        break;
      case TaskStates.WAITING:
      case TaskStates.WAIT:
        result.BLOCKED += 1;
        break;
      case TaskStates.CANCELED:
      case TaskStates.CANCELLED:
        result.CANCELLED += 1;
        break;
      case TaskStates.DONE:
        result.DONE += 1;
        break;
      default:
        console.error(`Unknown task marker [${task.marker}]`);
    }
  });

  return result;
};
