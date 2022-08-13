import {EventEmitter, Listener} from '@do-while-for-each/common';
import {EventChangeListenerParam, EventChangeValueListenerParam, Fn, ICell, ICellOpt, IError} from '../contract';
import {actualizeScheduledCells, isCellScheduled, scheduleRootCellActualization} from '../sheduler';
import {couldBeAssociatedToVariableDataCell} from './var-data-cell.detectors';

let nowExecCell: undefined | ICell; // the cell whose fn is currently being executed

export class Cell<TValue = any>
  extends EventEmitter<{
    change: EventChangeListenerParam<TValue>; // on cell state change. Listeners of the "change" event will receive an object: { value?, oldValue?, error? }
    value: EventChangeValueListenerParam<TValue>; // on value change. Listeners of the "value" event will receive an object: { value, oldValue }
    error: Error; // on error change. Listeners of the "error" event will receive an object: { error }
  }>
  implements ICell {

  fn?: Fn<TValue>;
  isFnExecuting = false;

  get isDataCell(): boolean {
    return !this.fn;
  }

  value!: TValue;
  error!: IError;
  isActual!: boolean;

  reactions = new Set<ICell>(); // this cell is located inside fn of each of this.reactions
  dependencies = new Set<ICell>(); // cells are located inside this.fn

  get isObserved(): boolean {
    return this.reactions.size > 0 || this.hasListeners;
  }

  isActivated = false;

  isEqual: ICellOpt<TValue>['isEqual'];
  equalsMapping: ICellOpt<TValue>['equalsMapping'];
  onChangedFromOutside: ICellOpt<TValue>['onChangedFromOutside'];
  tap: ICellOpt<TValue>['tap'];
  filter: ICellOpt<TValue>['filter'];

  constructor(val: Fn<TValue> | TValue,
              opt: ICellOpt<TValue> = {}) {
    super(); // activate EventEmitter
    this.setOptions(opt);
    this.initState(val);
  }

  get(): TValue {
    if (!this.isActual) {
      this.actualize();
    }
    if (nowExecCell) { // is the reaction-cell function of this cell currently executing?
      nowExecCell.dependencies.add(this);
    }
    if (this.error) {
      throw this.error;
    }
    return this.value;
  }

  /**
   * Be careful if you set a value/error for a cell that has this.fn;
   * You need to understand why you are doing this and how you plan to avoid
   * the consequences if your change is followed by an automatic actualization
   * via the this.fn call.
   */
  set(value: TValue, error?: any): void {
    const oldValue = this.value;
    const processed = this.process(value, error);
    if (this.onChangedFromOutside && processed)
      this.onChangedFromOutside(error ? {error} : {value, oldValue});
  }

  actualize(): void {
    if (this.isActual) {
      return;
    }
    if (this.isFnExecuting) {
      throw new CyclicExecutionError(this);
    }
    const prevDeps = this.dependencies;
    const newDeps = new Set<ICell>();
    this.dependencies = newDeps;

    const prevExecCell = nowExecCell;
    nowExecCell = this;
    this.isFnExecuting = true;
    let value, error;
    try {
      value = this.fn!(); // run actualization process. Sometimes you may encounter the term "pull" or "pulling"
    } catch (err) {
      error = err;
    }
    this.isFnExecuting = false;
    nowExecCell = prevExecCell;

    if (this.isObserved) { // is it allowed to update the links in the direction: [this] -> dependencies?
      for (const prevDep of prevDeps) {
        if (!newDeps.has(prevDep))
          prevDep.deleteReaction(this);
      }
      for (const newDep of newDeps) {
        if (!prevDeps.has(newDep))
          newDep.addReaction(this);
      }
    }
    this.process(value as TValue, error);
  }


//region Change the state of this cell

  protected process(value: TValue, error?: any): boolean {
    if (error === undefined && this.filter && !this.filter(value)) {
      error = new ValueAcceptanceError(value, this);
    }
    if (error !== undefined) {
      this.changeError(error);
      return true;
    }
    if (this.equals(value)) {
      this.handleEdgeCasesOnProcessingSameValue();
      return false;
    }
    this.changeValue(value);
    return true;
  }

  private changeValue(value: TValue): void {
    const oldValue = this.value;
    this.setState(value, null);
    this.scheduleRootCellActualization();
    this.emit('change', {value, oldValue});
    this.emit('value', {value, oldValue});
    this.tap?.({value, oldValue});
  }

  private changeError(error: any): void {
    error = error instanceof Error ? error : new Error(String(error));
    this.setState(this.value, error);
    this.scheduleRootCellActualizationOnErrorChanges();
    this.emit('change', {error});
    this.emit('error', error);
    this.tap?.({error});
  }

  private clearError(): void {
    this.setState(this.value, null);
    this.scheduleRootCellActualizationOnErrorChanges();
  }

  private setState(value: TValue, error: IError): void {
    this.value = value;
    this.error = error;
    if (
      this.dependencies.size === 0 ||
      this.isObserved // in an unobserved tree, cells that are not at the edge of the tree should not become up-to-date
    )
      this.isActual = true;
  }

  private initState(val: Fn<TValue> | TValue): void {
    if (typeof val === 'function') {
      this.value = undefined as unknown as TValue;
      this.error = null;
      this.isActual = false;
      this.fn = val as Fn<TValue>;
    } else {
      if (this.filter && !this.filter(val)) {
        this.value = undefined as unknown as TValue;
        this.error = new ValueAcceptanceError(val, this);
      } else {
        this.value = val;
        this.error = null;
      }
      this.isActual = true;
      this.fn = undefined as unknown as Fn<TValue>;
    }
  }

//endregion Change state of this cell


//region Activate

  override onFirstSubscribed(): void {
    this.actualize();
    this.activate();
  }

  addReaction(cell: ICell): void {
    this.reactions.add(cell);
    this.activate(); // propagate the activation down the cell tree
  }

  protected activate(): void {
    if (this.isActivated || this.dependencies.size === 0 || !this.isObserved) {
      return;
    }
    for (const dependency of this.dependencies) {
      dependency.addReaction(this);
    }
    this.isActual = true; // because this.fn() should have been called before this.activate()
    this.isActivated = true;
  }

//endregion Activate


//region Deactivate

  override onLastUnsubscribed(): void {
    if (!this.isActual && isCellScheduled(this) // if it is a rootCell that is scheduled for actualization
      && this.isActivated && !this.isObserved) {
      actualizeScheduledCells(); // actualize before deactivation
    }
    this.deactivate();
  }

  deleteReaction(cell: ICell): void {
    this.reactions.delete(cell);
    this.deactivate(); // propagate the deactivation down the cell tree
  }

  protected deactivate(): void {
    if (!this.isActivated || this.isObserved) {
      return;
    }
    for (const dependency of this.dependencies) {
      dependency.deleteReaction(this);
    }
    this.dependencies.clear();
    this.isActual = false;
    this.isActivated = false;
  }

//endregion Deactivate


//region Events wrap

  onChange(listener: Listener<EventChangeListenerParam<TValue>>): void {
    this.on('change', listener);
  }

  offChange(listener: Listener<EventChangeListenerParam<TValue>>): void {
    this.off('change', listener);
  }

  onValue(listener: Listener<EventChangeValueListenerParam<TValue>>): void {
    this.on('value', listener);
  }

  offValue(listener: Listener<EventChangeValueListenerParam<TValue>>): void {
    this.off('value', listener);
  }

  onError(listener: Listener<Error>): void {
    this.on('error', listener);
  }

  offError(listener: Listener<Error>): void {
    this.off('error', listener);
  }

//endregion Events wrap


  protected scheduleRootCellActualization(): void {
    for (const reaction of this.reactions)
      scheduleRootCellActualization(reaction);
  }

  private scheduleRootCellActualizationOnErrorChanges() {
    if (!nowExecCell) // if this.error has been changed outside the actualization process
      this.scheduleRootCellActualization();
    else {
      // in all other cases, the error will propagate automatically after calling this.get()
    }
  }

  private handleEdgeCasesOnProcessingSameValue(): void {
    if (this.error) { // if the new value doesn't change the value of this cell, but previous state change resulted in error
      this.clearError();
    }
    if (couldBeAssociatedToVariableDataCell(this))
      this.isActual = true;
  }


  private setOptions(opt: ICellOpt<TValue>): void {
    this.isEqual = opt.isEqual;
    this.equalsMapping = opt.equalsMapping;
    this.onChangedFromOutside = opt.onChangedFromOutside;
    this.tap = opt.tap;
    this.filter = opt.filter;
  }


  equals(value: TValue): boolean {
    let a = this.value;
    let b = value;
    if (this.equalsMapping) {
      a = this.equalsMapping(a);
      b = this.equalsMapping(b);
    }
    if (this.isEqual) {
      return this.isEqual(a, b);
    }
    return Object.is(a, b);
  }

}


export class CyclicExecutionError extends Error {
  constructor(public cell: ICell) {
    super('cyclic execution of cell.fn was detected');
  }
}

export class ValueAcceptanceError extends Error {
  constructor(public value: any,
              public cell: Cell) {
    super(`Cell did not accept value: ${value}`);
  }
}
