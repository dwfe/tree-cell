import {nextTick} from '@do-while-for-each/common';
import {ICell} from '../contract';

const scheduled: Array<ICell> = []; // root cells scheduled for actualization
let rootCellInProcess: ICell | null = null; // the root cell that is currently being actualized
const deactivateAfterActualize: Array<ICell> = [];
const skipActualization: Set<ICell> = new Set<ICell>();

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
  if (isActualizationProcessGoingOnNow()) {
    throw new CyclicActualizeOfScheduledCellsError();
  }
  let index = 0;
  while (index < scheduled.length) {
    rootCellInProcess = scheduled[index++];
    if (skipActualization.has(rootCellInProcess)) continue;
    rootCellInProcess.actualize();
  }
  scheduled.length = 0;
  rootCellInProcess = null;
  skipActualization.clear();

  for (const cell of deactivateAfterActualize) {
    cell.deactivate();
  }
  deactivateAfterActualize.length = 0;
}

export function isActualizationProcessGoingOnNow() {
  return rootCellInProcess !== null;
}

export function isActualizationProcessAlreadyScheduled() {
  return scheduled.length > 0;
}

export function isCellScheduled(cell: ICell): boolean {
  return scheduled.includes(cell);
}

export function scheduleDeactivation(cell: ICell): void {
  if (!deactivateAfterActualize.includes(cell))
    deactivateAfterActualize.push(cell);
}

export function skipWhenProcessingSchedule(cell: ICell) {
  skipActualization.add(cell)
}


export class CyclicActualizeOfScheduledCellsError extends Error {
  constructor() {
    super('cyclic actualize of scheduled cells was detected');
  }
}
