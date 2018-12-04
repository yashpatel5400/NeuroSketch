import { AbstractInstanceFactory } from 'react-js-diagrams';
import { InputNodeModel } from './InputNodeModel';

export class InputNodeFactory extends AbstractInstanceFactory {
  constructor() {
    super('InputNodeModel');
  }

  getInstance() {
    return new InputNodeModel();
  }
}
