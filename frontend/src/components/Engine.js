import React from 'react';
import {  DiagramEngine, DefaultNodeFactory, DefaultLinkFactory, DefaultNodeInstanceFactory, 
	DefaultPortInstanceFactory, LinkInstanceFactory } from 'react-js-diagrams';

import { OutputWidgetFactory } from './nodes/output/OutputWidgetFactory';
import { OutputNodeFactory } from './nodes/output/OutputInstanceFactories';
import { InputWidgetFactory } from './nodes/input/InputWidgetFactory';
import { InputNodeFactory } from './nodes/input/InputInstanceFactories';
import { ConnectionWidgetFactory } from './nodes/connection/ConnectionWidgetFactory';
import { ConnectionNodeFactory } from './nodes/connection/ConnectionInstanceFactories';

// Setup the diagram engine
export const diagramEngine = new DiagramEngine();
diagramEngine.registerNodeFactory(new DefaultNodeFactory());
diagramEngine.registerLinkFactory(new DefaultLinkFactory());
diagramEngine.registerNodeFactory(new OutputWidgetFactory());
diagramEngine.registerNodeFactory(new InputWidgetFactory());
diagramEngine.registerNodeFactory(new ConnectionWidgetFactory());

// Register instance factories
diagramEngine.registerInstanceFactory(new DefaultNodeInstanceFactory());
diagramEngine.registerInstanceFactory(new DefaultPortInstanceFactory());
diagramEngine.registerInstanceFactory(new LinkInstanceFactory());
diagramEngine.registerInstanceFactory(new OutputNodeFactory());
diagramEngine.registerInstanceFactory(new InputNodeFactory());
diagramEngine.registerInstanceFactory(new ConnectionNodeFactory());
