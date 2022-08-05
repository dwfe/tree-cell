import {nextTick} from '@do-while-for-each/common';
import {ICell} from '../contract';

const scheduled: Array<ICell> = []; // root cells scheduled for actualization
let rootCellInProcess: ICell | null = null; // the root cell that is currently being actualized

export function scheduleRootCellActualization(cell: ICell): void {
  cell.isActual = false;
  if (cell.reactions.size > 0) { // is cell not a root?
    for (const reaction of cell.reactions) {
      scheduleRootCellActualization(reaction); // let's find the root
    }
    return;
  }
  if (
    /**
     * IF cell is the root of its tree
     * AND cell is not the root cell that is currently being actualized
     */
    cell !== rootCellInProcess &&
    cell !== scheduled[scheduled.length - 1] // AND is not the same as the last scheduled root cell
  ) {
    if (scheduled.push(cell) === 1)
      nextTick(actualizeScheduledCells);
  }
}

export function actualizeScheduledCells(): void {
  if (rootCellInProcess !== null) {
    throw new CyclicActualizeOfScheduledCellsError();
  }
  let index = 0;
  while (index < scheduled.length) {
    rootCellInProcess = scheduled[index++];
    rootCellInProcess.actualize();
  }
  scheduled.length = 0;
  rootCellInProcess = null;
}


export function isCellScheduled(cell: ICell): boolean {
  return scheduled.includes(cell);
}


export class CyclicActualizeOfScheduledCellsError extends Error {
  constructor() {
    super('cyclic actualize of scheduled cells was detected');
  }
}
