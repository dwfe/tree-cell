// @formatter:off
import {Listener} from '@do-while-for-each/common';

export interface ICell<TValue = any> {

  isDataCell: boolean; // such cell doesn't have this.fn defined

  value: TValue; // cell state
  error: IError; // cell state
  isActual: boolean; // is the cell state up-to-date?

  get(): TValue;
  set(value: TValue, error?: any): void;
  actualize(): void;

  reactions: Set<ICell>;
  dependencies: Set<ICell>;
  isObserved: boolean;

  addReaction(cell: ICell): void;
  deleteReaction(cell: ICell): void;
  isActivated: boolean;

  onChange(listener: Listener<EventChangeListenerParam<TValue>>): () => void;
  offChange(listener: Listener<EventChangeListenerParam<TValue>>): void;
  onValue(listener: Listener<EventChangeValueListenerParam<TValue>>): () => void;
  offValue(listener: Listener<EventChangeValueListenerParam<TValue>>): void;
  onError(listener: Listener<Error>): () => void;
  offError(listener: Listener<Error>): void;

  equals(value: TValue): boolean;

}

export type Fn<TValue = any> = () => TValue;

export type EventChangeValueListenerParam<TValue = any> = { value: TValue; oldValue: TValue };
export type EventChangeListenerParam<TValue = any> = Partial<EventChangeValueListenerParam<TValue>> & { error?: Error; };

export type IError = Error | null;


export interface ICellOpt<TValue> {

  isEqual?: (a: any, b: any) => boolean;
  equalsMapping?: (value: TValue) => any;

  onChangedFromOutside?: (change: EventChangeListenerParam<TValue>) => void;

  tap?: (change: EventChangeListenerParam<TValue>) => void; // transparently perform actions or side-effects after changing the cell state, such as logging

  filter?: (value: TValue) => boolean;

}

export type IAsyncCellOpt<TValue> = ICellOpt<TValue> & {

  startWith?: TValue;

};

export type IObsValueCellOpt<TValue> = ICellOpt<TValue>;


/**
 * The data source from which the value will be retrieved asynchronously
 */
export type IAsyncSource<T = any> =
  Promise<T> |
  AsyncIterable<T> |
  Iterable<T>
;
