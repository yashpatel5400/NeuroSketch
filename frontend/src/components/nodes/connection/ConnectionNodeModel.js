import _ from 'lodash';
import { NodeModel, DefaultPortModel } from 'react-js-diagrams';

export class ConnectionNodeModel extends NodeModel {
  constructor(name = 'Untitled', color = 'rgb(224, 98, 20)') {
    super('connection');
    this.addPort(new DefaultPortModel(false, 'output', 'Out'));
    this.addPort(new DefaultPortModel(true, 'input', 'In'));
    this.name = name;
    this.color = color;
  }

  deSerialize(object) {
    super.deSerialize(object);
    this.name = object.name;
    this.color = object.color;
  }

  serialize() {
    return _.merge(super.serialize(), {
      name: this.name,
      color: this.color,
    });
  }

  getInPort() {
    return this.ports.input;
  }

  getOutPort() {
    return this.ports.output;
  }
}
