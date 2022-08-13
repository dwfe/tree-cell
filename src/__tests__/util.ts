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
  if (cell.error && cell.error.hasOwnProperty('message')) {
    expect(cell.error.message).eq(err);
  } else if (cell.error) {
    throw new Error('something went wrong');
  } else {
    expect(!!cell.error).eq(!!err);
  }
}

export function lastValueChangeResult(fn: ReturnType<typeof jest.fn>, oldValue, value, err?) {
  const last = fn.mock.lastCall[0];
  expect(oldValue).eq(last.oldValue);
  expect(value).eq(last.value);

  const lastErr = last.error;
  if (lastErr && lastErr.hasOwnProperty('message')) {
    expect(lastErr.message).eq(err);
  } else if (lastErr) {
    throw new Error('something went wrong');
  } else {
    expect(!!lastErr).eq(!!err);
  }
}
