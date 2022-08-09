import {isJustObject} from '@do-while-for-each/common';
import {ICell} from '../contract';

/**
 * The data-cell that may change in the future - Variable Data Cell.
 */
export function couldBeAssociatedToVariableDataCell(cell: ICell): boolean {
  return (
    validForAsyncCellSourceValue(cell.value) ||
    couldBeAssociatedToObsValueCell(cell)
  );
}

export function validForAsyncCellSourceValue(value: any): boolean {
  return (
    value instanceof Promise ||
    isJustObject(value) && (
      Symbol.asyncIterator in value ||
      Symbol.iterator in value
    ));
}

/**
 * The ObsValueCell can trigger changes,
 * after which the resulting value of the reaction-cell will not change:
 *----------------------------------------------------------------------
 *
 * CASE(1) rootCell.value.canBeObservable
 *
 *   const rootCell = new Cell(() => mapCell.get());
 *   const mapCell = new ObsValueCell(createObsMap());
 *----------------------------------------------------------------------
 *
 * CASE(2) rootCell.fn -> dep.value.canBeObservable
 *
 *   const rootCell = new Cell(() => {
 *     const emitter = mapCell.get();
 *     return emitter.size;
 *   });
 *   const mapCell = new ObsValueCell(createObsMap());
 */
export function couldBeAssociatedToObsValueCell(reactionCell: ICell): boolean {
  return (
    reactionCell.value?.canBeObservable ||
    (Array.from(reactionCell.dependencies).some(
      dep => dep.value?.canBeObservable
    ))
  );
}
