import React from 'react';

export class Demos extends React.Component {
  render() {
    return (
      <div>
        <div className='demo-link'><a onClick={() => window.location.assign('/demos/demo4')}>Demo 4</a></div>
      </div>
    );
  }
}
