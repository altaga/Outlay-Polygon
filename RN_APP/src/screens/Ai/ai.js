import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import reactAutobind from 'react-autobind';
import {
  ImageBackground,
  SafeAreaView,
  Modal,
  TextInput,
  Text,
  Dimensions,
  Pressable,
  View,
  ScrollView,
} from 'react-native';
import backImage from '../../assets/backgrounds/backgroundAi.png';
import GlobalStyles from '../../styles/styles';
import ContextModule from '../../utils/contextModule';
import {
  settingsAvailable,
  settingsDescription,
  settingsIcons,
  settingsNames,
} from '../Settings/settings';

const baseAiState = {
  modal: false, // false
  loading: false,
  prompt: '',
  settings: settingsAvailable,
};

function postProcessing(input) {
  try {
    const stage1 = input.substring(input.indexOf('{'), input.indexOf('}') + 1); // Extract only JSON
    console.log(stage1);
    const stage2 = JSON.parse(stage1); // Transform to JSON
    console.log(stage2);
    let stage3 = {};
    Object.keys(settingsAvailable).forEach(
      item => (stage3[item] = stage2[item] ?? false), // We get the results even if the json does not contain all the keys
    );
    console.log(stage3);
    let stage4 = {};
    Object.keys(settingsAvailable).forEach(
      item => (stage4[item] = settingsAvailable[item] ? stage3[item] : false), // Filter only available services
    );
    console.log(stage4);
    return stage4;
  } catch (e) {
    console.log(e);
    return settingsAvailable;
  }
}

class AiSelector extends Component {
  constructor(props) {
    super(props);
    this.state = baseAiState;
    reactAutobind(this);
  }

  static contextType = ContextModule;

  async componentDidMount() {
    this.props.navigation.addListener('focus', () => {
      console.log(this.props.route.name);
      this.setState(baseAiState);
    });
    this.props.navigation.addListener('blur', () => {
      this.setState(baseAiState);
    });
  }

  async setStateAsync(value) {
    return new Promise(resolve => {
      this.setState(
        {
          ...value,
        },
        () => resolve(),
      );
    });
  }

  async setContextValueAsync(value) {
    return new Promise(resolve => {
      this.context.setValue(
        {
          ...value,
        },
        () => resolve(),
      );
    });
  }

  async setAsyncStorageValue(value) {
    const session = await AsyncStorage.getItem('General');
    await AsyncStorage.setItem(
      'General',
      JSON.stringify({
        ...JSON.parse(session),
        ...value,
      }),
    );
  }

  async getSettings() {
    return new Promise(resolve => {
      var myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');

      var raw = JSON.stringify({
        prompt: this.state.prompt !== "" ? this.state.prompt : "An organization or entity engaged in commercial, industrial, or professional activities, typically aiming to generate profit by providing goods or services to customers",
      });

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      };

      fetch('https://api.outlay.site/ai-settings', requestOptions)
        .then(response => response.text())
        .then(result => {
          resolve(postProcessing(result));
        })
        .catch((e) => {
          console.log(e)
          resolve(settingsAvailable)});
    });
  }

  async setSettings() {
    const {settings} = this.state;
    await this.setAsyncStorageValue({settings});
    await this.setContextValueAsync({settings});
  }

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <ImageBackground
          style={[GlobalStyles.imageBackground, {}]}
          imageStyle={{
            opacity: 0.5,
          }}
          source={backImage}
          resizeMode="cover">
          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.modal}
            onRequestClose={() => console.log()}>
            <SafeAreaView
              style={[
                GlobalStyles.modulePressable,
                {
                  marginTop: Dimensions.get('window').height * 0.05,
                  height: Dimensions.get('window').height * 0.9,
                  width: Dimensions.get('window').width * 0.9,
                  fontSize: 14,
                  color: 'white',
                  borderColor: '#db00ff',
                  marginBottom: 20,
                  alignSelf: 'center',
                  backgroundColor: '#000000DD',
                },
              ]}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  alignItems: 'center',
                  showsVerticalScrollIndicator: false,
                }}>
                <Text
                  style={[
                    GlobalStyles.title,
                    {fontSize: 24, marginBottom: 20},
                  ]}>
                  Our AI suggests the following modules for your business
                </Text>
                {Object.keys(this.state.settings).map((item, index) =>
                  this.state.settings[item] ? (
                    <View
                      key={'Module:' + index}
                      style={[
                        GlobalStyles.modulePressable,
                        {
                          justifyContent: 'space-around',
                          width: Dimensions.get('window').width * 0.78,
                        },
                      ]}>
                      <View
                        style={{
                          justifyContent: 'space-evenly',
                          alignItems: 'center',
                        }}>
                        {settingsIcons(true)[item]}
                        <Text
                          style={{
                            color: settingsAvailable[item] ? 'white' : 'gray',
                            marginTop: 6,
                          }}>
                          {settingsNames[item]}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: settingsAvailable[item] ? 'white' : 'gray',
                          flexShrink: 1,
                          width: '60%',
                          textAlign: 'center',
                          fontSize: 16,
                        }}>
                        {settingsDescription[item]}
                      </Text>
                    </View>
                  ) : (
                    <React.Fragment key={'Module:' + index} />
                  ),
                )}
                <Pressable
                  disabled={this.state.loading}
                  style={[
                    GlobalStyles.buttonStyle,
                    {
                      borderColor: this.state.loading ? '#db00ff33' : '#db00ff',
                      marginBottom: 10,
                      width: '100%',
                    },
                  ]}
                  onPress={async () => {
                    await this.setSettings();
                    this.props.navigation.navigate('Main');
                  }}>
                  <Text style={[GlobalStyles.buttonTextStyle]}>Accept</Text>
                </Pressable>
                <Pressable
                  disabled={this.state.loading}
                  style={[
                    GlobalStyles.buttonStyle,
                    {
                      borderColor: this.state.loading ? '#00e59933' : '#00e599',
                      marginBottom: 10,
                      width: '100%',
                    },
                  ]}
                  onPress={async () => {
                    this.props.navigation.navigate('Main');
                  }}>
                  <Text style={[GlobalStyles.buttonTextStyle]}>Cancel</Text>
                </Pressable>
              </ScrollView>
            </SafeAreaView>
          </Modal>
          <Text style={[GlobalStyles.title, {fontSize: 24, marginBottom: 20}]}>
            Describe your business
          </Text>
          <TextInput
            multiline
            placeholderTextColor={'#555'}
            placeholder={`A physical and online college supply store...`}
            style={[
              GlobalStyles.modulePressable,
              {
                maxHeight: Dimensions.get('window').height * 0.4,
                height: 'auto',
                width: Dimensions.get('window').width * 0.9,
                fontSize: 14,
                color: 'white',
                borderColor: '#db00ff',
                marginBottom: 20,
              },
            ]}
            value={this.state.prompt}
            onChangeText={e =>
              this.setState({
                prompt: e,
              })
            }
            textAlign="center"
          />
          <Pressable
            disabled={this.state.loading}
            style={[
              GlobalStyles.buttonStyle,
              {
                borderColor: this.state.loading ? '#00e59933' : '#00e599',
                marginBottom: 10,
              },
            ]}
            onPress={async () => {
              await this.setStateAsync({
                loading: true,
              });
              const settings = await this.getSettings();
              await this.setStateAsync({
                loading: false,
                settings,
                modal: true,
              });
            }}>
            <Text style={[GlobalStyles.buttonTextStyle]}>AI Settings</Text>
          </Pressable>
          <Text style={[GlobalStyles.description, {fontSize: 14}]}>
            This process can take up to 30 seconds.
          </Text>
        </ImageBackground>
      </SafeAreaView>
    );
  }
}

export default AiSelector;
