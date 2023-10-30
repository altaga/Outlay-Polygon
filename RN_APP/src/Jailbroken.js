import React, {Component} from 'react';
import reactAutobind from 'react-autobind';
import {ImageBackground, SafeAreaView, Text, Dimensions} from 'react-native';
import GlobalStyles from './styles/styles';
import Jail from './assets/backgrounds/jail.png';

class Main extends Component {
  constructor(props) {
    super(props);
    reactAutobind(this);
  }

  async componentDidMount() {}

  render() {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: 'black'}}>
        <ImageBackground
          style={[GlobalStyles.imageBackground]}
          imageStyle={{
            opacity: 0.5,
          }}
          source={Jail}
          resizeMode="cover">
          <SafeAreaView style={{flex: 1, justifyContent:"center",alignItems:"center"}}>
            <Text
              style={{
                color: 'white',
                flexShrink: 1,
                width: Dimensions.get("window").width *0.8,
                textAlign: 'center',
                fontSize: 36,
                
              }}>
              Sorry, due to our security measures, it is not possible to use this app on rooted or jailbroken devices.
            </Text>
          </SafeAreaView>
        </ImageBackground>
      </SafeAreaView>
    );
  }
}

export default Main;
