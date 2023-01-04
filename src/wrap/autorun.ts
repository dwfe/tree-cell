import {noop} from '@do-while-for-each/common';
import {EventChangeListenerParam, ICellOpt} from '../contract';
import {Cell} from '../cell/Cell';

export function autorun<TValue = any>(
  runFn: () => TValue,
  opt: IAutorunOpt<TValue> = {}
): IAutorunDispose<TValue> {

  const rootCell = new Cell(runFn, opt.rootCellOpt);

  const onChange = opt.onChange
    ? getChangeHandler(opt.onChange)
    : getChangeHandlerDefault();

  if (opt.skipInitResult) {
    rootCell.onChange(noop); // initialize the cell tree inside noop
  }
  rootCell.onChange(onChange);

  if (opt.skipInitResult) {
    rootCell.offChange(noop);
  }

  const dispose: IAutorunDispose = (): void => {
    rootCell.dispose();
  };
  dispose.rootCell = rootCell;
  return dispose;
}


export interface IAutorunOpt<TValue> {
  onChange?: IAutorunChangeHandler<TValue>;
  skipInitResult?: boolean;
  rootCellOpt?: ICellOpt<TValue>;
  debugId?: string;
}

export type IAutorunChangeHandler<TValue = any> =
  (value: TValue, oldValue: TValue, error?: Error) => void
  ;

export interface IAutorunDispose<TValue = any> {

  (): void;

  rootCell: Cell<TValue>;

}


const getChangeHandler = (onChange: IAutorunChangeHandler): any =>
  (change: EventChangeListenerParam) => {
    if (change.error) {
      console.error('AUTORUN', change.error.message);
      return;
    }
    onChange(change.value, change.oldValue, change.error);
  }
;

const getChangeHandlerDefault = (): any =>
  (change: EventChangeListenerParam) => {
    if (change.error)
      console.error('AUTORUN', change.error.message);
  }
;
