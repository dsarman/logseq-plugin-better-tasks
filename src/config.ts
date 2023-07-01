export type DayType = 0 | 1 | 2 | 3 | 4 | 5 | 6

const convertStartingDay = (day: number): DayType => {
    console.log(day);
    return ((day + 1) % 7) as DayType
}

export const getStartingDay = async (): Promise<DayType> => {
    const {preferredStartOfWeek} = await logseq.App.getUserConfigs();
    return convertStartingDay(Number(preferredStartOfWeek));
}