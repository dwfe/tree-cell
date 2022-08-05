import {ObsValueLike} from '@do-while-for-each/common';
import {IObsValueCellOpt} from '../contract';
import {Cell} from './Cell';

/**
 * The cell whose value can be observable.
 * The cell listens for Changes of value and propagates them.
 */
export class ObsValueCell<TValue extends ObsValueLike<'change', any>>
  extends Cell<TValue> {

  constructor(val: TValue,
              opt?: IObsValueCellOpt<TValue>) {
    if (!val?.canBeObservable) {
      throw new Error('ObsValueCell can only be initiated by an ObsValueLike');
    }
    super(val, opt);
  }

  protected activate() {
    if (!this.value.hasListeners)
      this.listenValueContentChanges();
    //super.activate();  ObsValueCell cannot have dependencies, because technically ObsValueCell is just a cell with data
  }

  protected deactivate() {
    if (!this.isObserved)
      this.value.dispose();
    //super.deactivate();  ObsValueCell was not activated
  }


  private listenValueContentChanges(): void {
    this.value.on('change', this.onValueContentChanged.bind(this));
  }

  private onValueContentChanged(): void {
    this.process(this.value);
  }


  protected process(value: TValue): boolean {
    const oldValue = this.value;
    if (oldValue !== value) {
      oldValue.dispose();
      this.value = value;
      this.listenValueContentChanges();
    }
    this.scheduleRootCellActualization();
    this.emit('change', {value, oldValue});
    this.emit('value', {value, oldValue});
    this.tap?.({value, oldValue});
    return true;
  }

}
