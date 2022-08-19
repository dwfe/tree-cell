import {getPropDescriptor} from '@do-while-for-each/common';
import {noThrow, Throw} from '@do-while-for-each/test';
import {fieldsInstance, fieldsObj, fieldsSimple} from './util/fields-simple';
import {checkPossibilityOfUsing} from '../../../wrap/cache';
import {IAnnotation} from '../../../wrap/contract';

describe('01_checkPossibilityOfUsing', () => {

  test('object', () => {
    check(fieldsObj());
  });

  test('instance', () => {
    check(fieldsInstance());
  });

});

function check(obj) {
  for (const [propType, prop] of Object.entries(fieldsSimple)) {
    for (const annotation of ['cell', 'asyncCell', 'obsValueCell'] as IAnnotation[]) {
      if (propType === 'accessor' || propType === 'setter') {
        Throw(() => checkPossibilityOfUsing(obj, prop, getPropDescriptor(obj, prop), annotation), `It's forbidden to annotate properties that have a setter.`);
      } else if (annotation === 'asyncCell' && propType === 'getter') {
        Throw(() => checkPossibilityOfUsing(obj, prop, getPropDescriptor(obj, prop), annotation), `Incorrect use of annotation 'asyncCell'`);
      } else if (annotation === 'obsValueCell' && propType !== 'value') {
        Throw(() => checkPossibilityOfUsing(obj, prop, getPropDescriptor(obj, prop), annotation), `Incorrect use of annotation 'obsValueCell'`);
      } else {
        noThrow(() => checkPossibilityOfUsing(obj, prop, getPropDescriptor(obj, prop), annotation));
      }
    }
  }
}
