import * as React from "react";
import ReactDOM from 'react-dom';

import { BodyWidget } from "./components/BodyWidget";
import { Application } from "./Application";

import "./sass/main.scss";

var app = new Application();
var body = <BodyWidget app={app} />;
ReactDOM.render(body, document.getElementById('root'));
