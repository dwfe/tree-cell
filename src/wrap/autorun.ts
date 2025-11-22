import {debounce, noop} from '@do-while-for-each/common';
import {EventChangeListenerParam, ICellOpt} from '../contract';
import {IChangeHandler, IRunnersDispose} from './contract';
import {Cell} from '../cell/Cell';

export function autorun<TValue = any>(
  runFn: () => TValue,
  opt: IAutorunOpt<TValue> = {}
): IRunnersDispose<TValue> {

  const rootCell = new Cell(runFn, opt.rootCellOpt);
  const dispose: IRunnersDispose = (): void => {
    rootCell.dispose();
  };
  dispose.rootCell = rootCell;

  /**
   * Помимо дебонса на микротасках, встроенного в ячейки
   * при помощи opt.debounceTimeToProcessChanges можно добавить еще и дебонс на макротасках.
   * Такой дебонс способен фильтровать изменения rootCell, тем самым реже применяется измененное состояние.
   */
  let onChangeDebounced: IChangeHandler | null = null;
  if (!(opt.debounceTimeToProcessChanges == undefined)) {
    const waitTime = opt.debounceTimeToProcessChanges > 0 ? opt.debounceTimeToProcessChanges : 0;
    onChangeDebounced = debounce(
      (value: TValue, oldValue: TValue, error?: Error) => opt.onChange!(value, oldValue, error),
      waitTime,
    );
  }

  const onChange = opt.onChange
    ? getChangeHandler(opt, rootCell, onChangeDebounced)
    : getChangeHandlerDefault(rootCell);


  if (opt.skipInitResult) {
    rootCell.onChange(noop); // initialize the cell tree inside noop
  }
  rootCell.onChange(onChange);

  if (opt.skipInitResult) {
    rootCell.offChange(noop);
  }

  return dispose;
}


export interface IAutorunOpt<TValue = any> {
  onChange?: IChangeHandler<TValue>;
  skipInitResult?: boolean;
  debounceTimeToProcessChanges?: number;
  rootCellOpt?: ICellOpt<TValue>;
  debugId?: string;
}

const getChangeHandler = (opt: IAutorunOpt, rootCell: Cell, onChangeDebounced: IChangeHandler | null): any =>
  (change: EventChangeListenerParam) => {
    if (change.error) {
      printErr(change.error.message, rootCell);
      return;
    }
    if (onChangeDebounced) {
      onChangeDebounced(change.value, change.oldValue, change.error);
      return;
    }
    opt.onChange!(change.value, change.oldValue, change.error);
  }
;

const getChangeHandlerDefault = (rootCell: Cell): any =>
  (change: EventChangeListenerParam) => {
    if (change.error)
      printErr(change.error.message, rootCell);
  }
;

function printErr(message: string, rootCell: Cell): void {
  console.error('AUTORUN', message);
  console.error('rootCell.fn');
  console.log(rootCell.fn);
  console.log('---------',);
}
