import {Cell} from '../cell/Cell';

export type IAnnotation = 'cell' | 'asyncCell' | 'obsValueCell';

export interface ICellInit {
  annotation: IAnnotation;
  cellOpt?: any;
}


export type IChangeHandler<TValue = any> =
  (value: TValue, oldValue: TValue, error?: Error) => void
  ;


export interface IRunnersDispose<TValue = any> {

  (): void;

  rootCell: Cell<TValue>;

}
