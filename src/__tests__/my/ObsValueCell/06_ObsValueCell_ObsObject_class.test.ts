import {createObsObject} from '@do-while-for-each/common';
import  '@do-while-for-each/test';
import {autorun, makeObservable, obsValueCell} from '../../../wrap';
import {actualizeScheduledCells} from '../../../scheduler';

describe('06_ObsValueCell_ObsObject_class', () => {

  test('check', () => {

    class Main {

      obj = createObsObject({
        prop0: 123,
        prop1: 'hello',
        prop2: 'world',
      });

      constructor() {
        makeObservable(this, {
          obj: obsValueCell,
        });
      }
    }

    const main = new Main();

    autorun(() => {
      console.log(`root`, main.obj);
    }, {
      onChange: (value, oldValue, error) => {
        console.log(`onChange`, value === oldValue);
      },
    });

    main.obj.prop0 = 777;
    actualizeScheduledCells();
    main.obj.prop1 = 'Hi';
    actualizeScheduledCells();
    main.obj.prop2 = 'there';
    actualizeScheduledCells();
  });

});
