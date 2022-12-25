// @formatter:off
import {Cell} from '../cell/Cell';

export type IAnnotation = 'cell' | 'asyncCell' | 'obsValueCell';

export interface ICellInit {
  annotation: IAnnotation;
  cellOpt?: any;
}

export interface IAutorunDispose {
  (): void;
  rootCell: Cell;
}
