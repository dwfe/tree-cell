import {IAsyncCellOpt, ICellOpt, IObsValueCellOpt} from '../contract';
import {ICellInit} from './contract';

export function cell(cellOpt?: ICellOpt<any>): ICellInit {
  return {annotation: 'cell', cellOpt};
}

export function asyncCell(cellOpt?: IAsyncCellOpt<any>): ICellInit {
  return {annotation: 'asyncCell', cellOpt};
}

export function obsValueCell(cellOpt?: IObsValueCellOpt<any>): ICellInit {
  return {annotation: 'obsValueCell', cellOpt};
}

export function processAnnotation(makeObservableData: any, prop: string | symbol): ICellInit {
  const init = makeObservableData[prop] as Function | ICellInit;
  switch (init) {
    case cell:
      return cell();
    case asyncCell:
      return asyncCell();
    case obsValueCell:
      return obsValueCell();
    default:
      return init as ICellInit;
  }
}
