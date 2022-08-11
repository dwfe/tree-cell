import {delayAsync} from '@do-while-for-each/common';
import {checkFields, lastValueChangeResult} from '../../util';
import {actualizeScheduledCells, Cell} from '../../..';

describe('00_some', () => {

  test('debounce changes', () => {
    const firstName = new Cell('Tom');
    const lastName = new Cell('Cat');
    const fullName = new Cell(() => firstName.get() + ' ' + lastName.get());
    const fullNameOnChange = jest.fn();

    fullName.onChange(fullNameOnChange);
    expect(fullNameOnChange).toBeCalledTimes(1);
    lastValueChangeResult(fullNameOnChange, undefined, 'Tom Cat');

    firstName.set('Jerry');
    lastName.set('Mouse');
    expect(fullNameOnChange).toBeCalledTimes(1);
    actualizeScheduledCells();
    expect(fullNameOnChange).toBeCalledTimes(2);

    expect(fullName.get()).eq('Jerry Mouse');
    actualizeScheduledCells();
    expect(fullNameOnChange).toBeCalledTimes(2);
    lastValueChangeResult(fullNameOnChange, 'Tom Cat', 'Jerry Mouse');
  });

  test('dispose -> #1 root cell has no dependencies', async () => {
    const a = new Cell(() => b.get());
    const b = new Cell(17);

    checkFields(a, [undefined, false, false, 0, 0, false, false, false]);
    checkFields(b, [17, true, false, 0, 0, false, false, false]);

    const aOnChange = jest.fn();
    a.onChange(aOnChange);

    checkFields(a, [17, true, true, 1, 0, true, true, false]);
    checkFields(b, [17, true, true, 0, 1, false, false, false]);

    a.offChange(aOnChange);
    await delayAsync(50);
    checkFields(a, [17, false, false, 0, 0, false, false, false]);
    checkFields(b, [17, true, false, 0, 0, false, false, false]);
  });

  test('dispose -> #2 root cell has no dependencies', async () => {
    const a = new Cell(() => b.get());
    const b = new Cell(17);

    checkFields(a, [undefined, false, false, 0, 0, false, false, false]);
    checkFields(b, [17, true, false, 0, 0, false, false, false]);

    const aOnChange = jest.fn();
    a.onChange(aOnChange);

    checkFields(a, [17, true, true, 1, 0, true, true, false]);
    checkFields(b, [17, true, true, 0, 1, false, false, false]);

    b.set(84); // schedule rootCell before dispose!!!

    a.offChange(aOnChange);
    await delayAsync(50);
    checkFields(a, [84, false, false, 0, 0, false, false, false]);
    checkFields(b, [84, true, false, 0, 0, false, false, false]);
  });

});
