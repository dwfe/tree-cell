import {noThrow, Throw} from '@do-while-for-each/test';
import {actualizeScheduledCells, cell, Cell, getCachedCell, makeObservable} from '../../..';
import {instanceTomAndJerry, objTomAndJerry} from './util/tom-and-jerry';
import {checkFields} from '../../util';

describe('05_makeObservable', () => {

  test('Tom and Jerry, object', () => {
    checkTomAndJerry(objTomAndJerry());
  });

  test('Tom and Jerry, constructor', () => {
    checkTomAndJerry(instanceTomAndJerry());
  });

  test('Incorrect use of .value()', () => {
    const obj = {
      name: 'Alex',
      fullName(nick) {
        return this.name + ', ' + nick;
      }
    };
    makeObservable(obj, {
      name: cell,
      fullName: cell,
    });
    let nick = 'Z';
    const rootCell = new Cell(() => obj.fullName(nick));
    checkFields(rootCell, [undefined, false, false, 0, 0, false, false, false]);
    rootCell.onChange(() => {
    });
    checkFields(rootCell, ['Alex, undefined', true, true, 1, 0, true, true, false]);
    expect(obj.fullName(nick)).eq('Alex, undefined');
    noThrow(() => rootCell.get());

    nick = '123';
    expect(obj.fullName(nick)).eq('Alex, undefined');

    obj.name = 'Naruto';
    actualizeScheduledCells();
    checkFields(rootCell, ['Naruto, undefined', true, true, 1, 0, true, true, false]);
    expect(obj.fullName(nick)).eq('Naruto, undefined');
  });

  test('throw on unknown property', () => {
    const obj = {
      name: 'Alex',
    };
    Throw(() => {
      makeObservable(obj, {
        hello: cell,
      });
    }, 'cannot get property descriptor "hello"');
  });

});

function checkTomAndJerry(obj) {
  const a = new Cell(() => obj.fullName() + ' | ' + obj.fullNameReversed);
  const aOnChange = jest.fn();

  const fullNameCell = getCachedCell<Cell>(obj, 'fullName')!;
  checkFields(fullNameCell, [undefined, false, false, 0, 0, false, false, false]);
  checkFields(a, [undefined, false, false, 0, 0, false, false, false]);

  a.onChange(aOnChange);
  noThrow(() => a.get());
  expect(aOnChange).toBeCalledTimes(1);
  checkFields(fullNameCell, ['Tom Cat', true, true, 2, 1, true, true, false]);
  checkFields(a, ['Tom Cat | taC moT', true, true, 1, 0, true, true, false]);

  obj.name = 'Jerry';
  obj.kind = 'Mouse';
  checkFields(fullNameCell, ['Tom Cat', false, true, 2, 1, true, true, false]);
  checkFields(a, ['Tom Cat | taC moT', false, true, 1, 0, true, true, false]);

  actualizeScheduledCells();
  expect(aOnChange).toBeCalledTimes(2);
  checkFields(fullNameCell, ['Jerry Mouse', true, true, 2, 1, true, true, false]);
  checkFields(a, ['Jerry Mouse | esuoM yrreJ', true, true, 1, 0, true, true, false]);

  a.offChange(aOnChange);
  checkFields(fullNameCell, ['Jerry Mouse', false, false, 0, 0, false, false, false]);
  checkFields(a, ['Jerry Mouse | esuoM yrreJ', false, false, 0, 0, false, false, false]);
}
