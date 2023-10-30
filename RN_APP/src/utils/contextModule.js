// Basic Imports
import React from 'react';
import reactAutobind from 'react-autobind';

const ContextModule = React.createContext();

// Context Provider Component

class ContextProvider extends React.Component {
  // define all the values you want to use in the context
  constructor(props) {
    super(props);
    this.state = {
      value: {
        tokens:[],
        ethAddress: '',
        solAddress: '',
        biometrics: false,
        kind: 0,
        settings: {
          jupiter: false,
          email: false,
          print: false,
          eth: false,
          tipping: false,
          crosschain: false,
          fiat: false,
          aa:false,
          circlePW:false
        }
      },
    };
    reactAutobind(this);
  }

  setValue = (value, then = () => {}) => {
    this.setState(
      {
        value: {
          ...this.state.value,
          ...value,
        },
      },
      () => then(),
    );
  };

  render() {
    const {children} = this.props;
    const {value} = this.state;
    // Fill this object with the methods you want to pass down to the context
    const {setValue} = this;

    return (
      <ContextModule.Provider
        // Provide all the methods and values defined above
        value={{
          value,
          setValue,
        }}>
        {children}
      </ContextModule.Provider>
    );
  }
}

// Dont Change anything below this line

export { ContextProvider };
export const ContextConsumer = ContextModule.Consumer;
export default ContextModule;
