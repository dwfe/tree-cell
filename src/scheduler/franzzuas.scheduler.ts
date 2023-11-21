import {ICell} from '../contract';

const batch = new Set<ICell>();
let scheduledPromise: Promise<void> | null = null;
let queue: Array<ICell> | null = null;

export function scheduleCellActualization(cell: ICell): void {
  cell.isActual = false;
  if (queue) { // IF the cell value change occurred as part of 'actualizeAll'
    if (!queue.includes(cell))
      queue.unshift(cell);
    return;
  }
  batch.add(cell);
  if (scheduledPromise) {
    return;
  }
  scheduledPromise = Promise.resolve().then(actualizeAll); // -> will be executed in the next microtask
}

function actualizeAll(): void {
  queue = Array.from(batch);
  batch.clear();
  scheduledPromise = null;
  while (queue.length) {
    const cell = queue.pop()!;
    cell.actualize();
  }
  queue = null;
}


export function promiseForCellsToBeUpdated(): Promise<void> {
  return scheduledPromise || Promise.resolve();
}
