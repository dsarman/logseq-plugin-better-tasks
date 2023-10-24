const taskRegex = /(?<state>LATER|NOW|DONE)\s(?<title>.*)(?<content>((.|\n)*)\n):LOGBOOK:\n(?<log>(.|\n)*)\n:END:/g;
export const getRepeatingTodoTemplate = async (originBlockId: string, blockId: string) => {
  const task = await logseq.Editor.getBlock(blockId);
  if (!task) {
    console.error(`Block ${blockId} not found while getting repeating todo template`);
    return '';
  }

  const originBlock = await logseq.Editor.getBlock(originBlockId);
  console.log('originBlock', originBlock);
  if (!originBlock || !originBlock.page) {
    console.error(`Origin block ${originBlockId} not found while getting repeating todo template`);
    return '';
  }
  const journalPage = await logseq.Editor.getPage(originBlock.page.id);
  console.log('journalPage', journalPage);
  if (!journalPage || !journalPage['journal?'] || !journalPage.journalDay) {
    console.error(`Journal page ${originBlock.page.id} not found while getting repeating todo template`);
    return '';
  }

  const match = taskRegex.exec(task.content);
  taskRegex.lastIndex = 0;
  console.log(task);
  console.log(match);
  const title = match?.groups?.title;

  const doneList = getDoneList(match?.groups?.log || '');
  console.log('doneList', doneList);

  const isDoneToday = doneList.includes(journalPage.journalDay);
  console.log('isDoneToday', isDoneToday);
  const marker = isDoneToday ? 'DONE' : task.marker;

  return '<div class="flex-1 w-full">' +
    `<span class="inline ${marker.toLowerCase()}">` +
    `<input data-uuid='${blockId}' data-on-click='toggleTask' type="checkbox" class="form-checkbox h-4 w-4 transition duration-150 ease-in-out mr-1 cursor ${isDoneToday ? 'checked' : ''}" ${isDoneToday ? 'checked=""' : ''} style="margin-right: 5px;">` +
    `<a class="marker-switch block-marker ${marker}">` +
    (isDoneToday ? '' : marker) +
    '</a>' +
    title +
    '</span>' +
    '</div>';
};

const doneLogRegex = /\*\sState\s"DONE"\sfrom\s".*"\s\[(?<year>\d*)-(?<month>\d*)-(?<day>\d*)/g;

const getDoneList = (logbookContent: string): number[] => {
  const doneList: number[] = [];
  let match;
  while ((match = doneLogRegex.exec(logbookContent)) !== null) {
    const date = `${match.groups?.year}${match.groups?.month}${match.groups?.day}`;
    doneList.push(Number(date));
  }
  doneLogRegex.lastIndex = 0;
  return doneList;
};