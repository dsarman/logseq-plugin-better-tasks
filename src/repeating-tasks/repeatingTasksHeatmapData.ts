import { BlockEntity, PageEntity } from '@logseq/libs/dist/LSPlugin';
import { parse } from 'date-fns';
import { getLogbookContent, parseDates } from '../common/logbook';

type ReferencesType = [page: PageEntity, blocks: BlockEntity[]][];

const mapTaskReferences = (taskReferences: ReferencesType): BlockEntity[] => {
  return taskReferences.reduce((acc, [page, blocks]) => {
    if (!['daily journal', 'templates'].includes(page.name)) {
      // Filter out task definition entry
      blocks.forEach(block => {
        if (block.marker) {
          // Filter out non-task entries
          acc.push(block);
        }
      });
    }
    return acc;
  }, [] as BlockEntity[]);
};

const getJournalDates = (block: BlockEntity): Set<Date> => {
  const logbookContent = getLogbookContent(block.content);
  const dates = parseDates(logbookContent);
  return dates;
};

const getDoneTaskDate = (block: BlockEntity): Date | undefined => {
  if (block.marker === 'DONE' && block.page?.journalDay) {
    return parse(block.page.journalDay.toString(), 'yyyyMMdd', new Date());
  }
};

export const getTaskReferences = async (
  blockUuid: string
): Promise<BlockEntity[]> => {
  const taskBlock = await logseq.Editor.getBlock(blockUuid);
  // Usually the last reference is the one we want (task ref is at the end of the block)
  const rootTaskRef = taskBlock?.refs?.[taskBlock?.refs?.length - 1];
  if (!rootTaskRef) {
    console.error('Task ref is null');
    return [];
  } else if (rootTaskRef.id <= 20) {
    // Ignore internal Logseq refs like LATER, or priority markers
    console.warn('Task ref is internal Logseq ref, skipping task references');
    return [];
  }

  const rootTask = await logseq.Editor.getPage(rootTaskRef.id);
  if (!rootTask) {
    console.error('Root task is null');
    return [];
  }

  const rootTaskReferences = await logseq.Editor.getPageLinkedReferences(
    rootTask.uuid
  );
  if (!rootTaskReferences) {
    console.error('Root task references are null');
    return [];
  }

  return mapTaskReferences(rootTaskReferences);
};

export const getDoneDatesForTask = async (
  taskUuid: string
): Promise<Set<Date>> => {
  const mappedReferences = await getTaskReferences(taskUuid);
  const rootTask = await logseq.Editor.getBlock(taskUuid);
  if (rootTask) {
    mappedReferences.push(rootTask);
  }

  const allDates = new Set<Date>();
  for (const reference of mappedReferences) {
    const journalDates = getJournalDates(reference);
    journalDates.forEach(date => allDates.add(date));

    const date = getDoneTaskDate(reference);
    if (date) {
      allDates.add(date);
    }
  }

  return allDates;
};
