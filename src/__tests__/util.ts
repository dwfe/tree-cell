import '@do-while-for-each/test';
import {ICell} from '..';

export enum Check {
  SKIP,
}

//                                        1      2       3         4     5     6          7          8
export function checkFields(cell: ICell, [value, actual, observed, deps, reac, notOnEdge, activated, err]) {
  if (value !== Check.SKIP) {
    expect(cell.value).eq(value);
  }
  expect(cell.isActual).eq(actual);
  expect(cell.isObserved).eq(observed);
  expect(cell.dependencies.size).eq(deps);
  expect(cell.reactions.size).eq(reac);
  expect(cell.dependencies.size > 0 && cell.isObserved).eq(notOnEdge);
  expect(cell.isActivated).eq(activated);
  if (err.hasOwnProperty('message')) {
    expect(cell.error?.message).eq(err.message);
  } else {
    expect(!!cell.error).eq(!!err);
  }
}

export function lastValueChangeResult(fn: ReturnType<typeof jest.fn>, fromValue, toValue) {
  const last = fn.mock.lastCall[0];
  expect(fromValue).eq(last.oldValue);
  expect(toValue).eq(last.value);
}
