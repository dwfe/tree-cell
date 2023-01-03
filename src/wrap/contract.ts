export type IAnnotation = 'cell' | 'asyncCell' | 'obsValueCell';

export interface ICellInit {
  annotation: IAnnotation;
  cellOpt?: any;
}
