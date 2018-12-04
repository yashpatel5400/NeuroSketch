import { AbstractInstanceFactory } from 'react-js-diagrams';
import { ConnectionNodeModel } from './ConnectionNodeModel';

export class ConnectionNodeFactory extends AbstractInstanceFactory {
  constructor() {
    super('ConnectionNodeModel');
  }

  getInstance() {
    return new ConnectionNodeModel();
  }
}
