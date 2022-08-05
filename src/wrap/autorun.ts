import {Listener} from '@do-while-for-each/common';
import {EventChangeListenerParam} from '../contract';
import {Dispose} from './contract';
import {Cell} from '../cell/Cell';

export function autorun(runFn: () => void, opt?: IOpt): Dispose {
  const onChange = opt?.onChange ?? onChangeDefault;

  const rootCell = new Cell(runFn);
  rootCell.onChange(onChange);

  const dispose: Dispose = (): void => {
    rootCell.offChange(onChange);
  };
  dispose.rootCell = rootCell;
  return dispose;
}


interface IOpt<TValue = any> {
  onChange?: Listener<EventChangeListenerParam<TValue>>;
}

function onChangeDefault(change: EventChangeListenerParam): void {
  if (change.error)
    console.error('AUTORUN', change.error.message);
}
