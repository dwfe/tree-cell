import {delayAsync} from '@do-while-for-each/common';
import {EventChangeValueListenerParam, Fn, IAsyncCellOpt, IAsyncSource} from '../contract';
import {validForAsyncCellSourceValue} from './var-data-cell.detectors';
import {Cell} from './Cell';

/**
 * The cell whose value can change asynchronously.
 * The first value returned by AsyncCell is always:
 *   - null;
 *   - or the value passed in the "startWith" option.
 */
export class AsyncCell<TValue = any> extends Cell<TValue> {

  private sourceCell: Cell<IAsyncSource<TValue>>;
  private triggerSourceCell = new Cell(0);

  constructor(val: Fn<IAsyncSource<TValue>> | IAsyncSource<TValue>,
              opt?: IAsyncCellOpt<TValue>) {
    if (typeof val !== 'function' && !validForAsyncCellSourceValue(val)) {
      throw getAsyncCellSourceCannotProcessValueError(val);
    }
    const startWith = (opt?.startWith ?? null) as TValue;
    super(startWith, opt);
    this.sourceCell = new Cell(() => {
      this.triggerSourceCell.get();
      if (typeof val !== 'function') {
        return val;
      }
      try {
        return val();
      } catch (error) {
        return Promise.reject(error); // catches synchronous execution errors
      }
    });
  }

  protected activate() {
    if (!this.sourceCell.hasListeners)
      this.sourceCell.onValue(this.onSourceCellValueChanged.bind(this));
    //super.activate();  AsyncCell cannot have dependencies, because technically AsyncCell is just a cell with data
  }

  protected deactivate() {
    if (!this.isObserved)
      this.sourceCell.dispose();
    //super.deactivate();  AsyncCell was not activated
  }

  public rerun(): void {
    this.triggerSourceCell.set(
      this.triggerSourceCell.get() + 1
    );
  }

  private async onSourceCellValueChanged({value}: EventChangeValueListenerParam<IAsyncSource<TValue>>) {
    if (!validForAsyncCellSourceValue(value)) {
      await delayAsync(0);
      this.set(this.value, getAsyncCellSourceCannotProcessValueError(value));
      return;
    }
    try {
      if (value instanceof Promise) {
        this.set(await (value as Promise<TValue>));
        return;
      }
      if (Symbol.asyncIterator in value) {
        for await(const next of (value as AsyncIterable<TValue>))
          this.set(next);
        return;
      }
      if (Symbol.iterator in value) {
        await delayAsync(0);
        for (const next of (value as Iterable<TValue>)) {
          this.set(next);
          await delayAsync(0);
        }
        return;
      }
    } catch (error) {
      /**
       * handle the error that occurred:
       *  - as a result of executing this.sourceCell.fn
       *  - or while retrieving data from the this.sourceCell.value
       */
      this.set(this.value, error);
    }
  }

}

function getAsyncCellSourceCannotProcessValueError(value: any): Error {
  console.error('AsyncCell.sourceCell can process the following types of values: Promise, AsyncIterable or Iterable. But it was received:', value);
  return new Error('AsyncCell.sourceCell cannot process value');
}
