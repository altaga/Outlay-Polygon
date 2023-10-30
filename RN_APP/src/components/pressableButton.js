import React, { Component } from 'react';

export default class PressableButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }
  render() {
    const {children} = this.props;
    return (
      <Pressable style={[...this.props.style, {}]} {...this.props}>
        {children}
      </Pressable>
    );
  }
}
