import React, {Component} from 'react';
import reactAutobind from 'react-autobind';
import {
  Alert,
  Dimensions,
  ImageBackground,
  PermissionsAndroid,
  Pressable,
  SafeAreaView,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import {DownloadDirectoryPath, exists, mkdir, writeFile} from 'react-native-fs';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNPrint from 'react-native-print';
import QRCodeStyled from 'react-native-qrcode-styled';
import QRCode from 'react-native-qrcode-svg';
import backImage from '../../assets/backgrounds/backgroundModules.png';
import {logo} from '../../assets/logo';
import GlobalStyles from '../../styles/styles';
import ContextModule from '../../utils/contextModule';
import IconFA6 from 'react-native-vector-icons/FontAwesome6';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AccountAbstractionEVMs,
  ProgrammableWalletsEVMs,
} from '../../utils/constants';

const baseDirectTransfer = {
  flag: false, // false
  saveData: '',
  evmCarrousel: [
    {
      address: '0x',
      network: 'EVM',
      kind: '',
    },
  ],
  carrousel: 0,
};

class DirectTransfer extends Component {
  constructor(props) {
    super(props);
    this.state = baseDirectTransfer;
    reactAutobind(this);
    this.svg = null;
  }

  static contextType = ContextModule;

  async componentDidMount() {
    this.props.navigation.addListener('focus', async () => {
      console.log(this.props.route.name);
      this.setState(baseDirectTransfer);
      (this.context.value.settings.aa || this.context.value.settings.circlePW) && this.checkAA();
    });
    this.props.navigation.addListener('blur', async () => {
      this.setState(baseDirectTransfer);
    });
  }

  async checkAA() {
    const addresses =
      (await this.getAsyncStorageValue('addresses')) ??
      AccountAbstractionEVMs.map(() => '0x');
    const circleAddresses =
      (await this.getAsyncStorageValue('circleAddresses')) ??
      ProgrammableWalletsEVMs.map(() => ({}));
    let temp = [
      {
        address: this.context.value.ethAddress,
        network: 'EVM',
        kind: '',
      },
    ];
    addresses.forEach((item, index) => {
      if (item !== '0x') {
        temp.push({
          address: item,
          network: AccountAbstractionEVMs[index].network,
          kind: '\nSmart Contract Wallet',
        });
      }
    });
    console.log(circleAddresses)
    circleAddresses.forEach(item => {
      if (Object.keys(item).length > 0) {
        temp.push({
          address: item.address,
          network: item.blockchain,
          kind: '\nProgrammable Wallet',
        });
      }
    });
    this.setState({
      evmCarrousel: temp,
    });
  }

  async getAsyncStorageValue(value) {
    try {
      const session = await AsyncStorage.getItem('General');
      if (value in JSON.parse(session)) {
        return JSON.parse(session)[value];
      } else {
        return null;
      }
    } catch {
      return null;
    }
  }

  async checkGetPermission() {
    return new Promise(async resolve => {
      if (Platform.OS === 'android') {
        const checkPerm = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        if (!checkPerm) {
          PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          ]).then(result => {
            if (
              result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
            ) {
              resolve(true);
            } else {
              resolve(false);
            }
          });
        } else {
          resolve(true);
        }
      }
    });
  }

  async getDataURL() {
    return new Promise(async (resolve, reject) => {
      this.svg.toDataURL(async data => {
        this.setState(
          {
            saveData: data,
          },
          () => resolve('ok'),
        );
      });
    });
  }

  async print() {
    await this.getDataURL();
    const results = await RNHTMLtoPDF.convert({
      html: `
        <div style="text-align: center;">
            <img src='${logo}' width="30%"></img>
            <h1 style="font-size: 3rem;">--------- Static QR ---------</h1>
            <img style="width:80%" src='${
              'data:image/png;base64,' + this.state.saveData
            }'></img>
        </div>
      `,
      fileName: 'print',
      base64: true,
    });
    await RNPrint.print({filePath: results.filePath});
  }

  async saveImage() {
    const flag = this.checkGetPermission();
    if (!flag) {
      return;
    }
    await this.getDataURL();
    const file_path = `${DownloadDirectoryPath}/Outlay/${new Date().getTime()}.png`;
    const check = await exists(`${DownloadDirectoryPath}/Outlay`);
    if (!check) {
      await mkdir(`${DownloadDirectoryPath}/Outlay`);
    }
    writeFile(file_path, this.state.saveData, 'base64')
      .then(() =>
        ToastAndroid.showWithGravity(
          file_path,
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM,
        ),
      )
      .catch(error => {
        alert(JSON.stringify(error));
      });
  }

  moveCarrousel(movement) {
    let position = this.state.carrousel + movement;
    if (position < 0) {
      position = this.state.evmCarrousel.length - 1;
    } else if (position === this.state.evmCarrousel.length) {
      position = 0;
    }
    this.setState({
      carrousel: position,
    });
  }

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <ImageBackground
          style={[
            GlobalStyles.imageBackground,
            {justifyContent: 'space-around'},
          ]}
          imageStyle={{
            opacity: 0.5,
          }}
          source={backImage}
          resizeMode="cover">
          {this.context.value.settings.eth ? (
            <React.Fragment>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Pressable
                  style={[
                    GlobalStyles.buttonRowLeftStyle,
                    {borderColor: this.state.flag ? '#db00ff33' : '#db00ff'},
                  ]}
                  onPress={async () => {
                    this.setState({flag: false});
                  }}>
                  <Text style={[GlobalStyles.buttonTextStyle]}>Solana</Text>
                </Pressable>
                <Pressable
                  style={[
                    GlobalStyles.buttonRowRightStyle,
                    {borderColor: !this.state.flag ? '#00e59933' : '#00e599'},
                  ]}
                  onPress={async () => {
                    this.setState({flag: true});
                  }}>
                  <Text style={[GlobalStyles.buttonTextStyle]}>EVM</Text>
                </Pressable>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  width: '100%',
                }}>
                {(this.context.value.settings.aa || this.context.value.settings.circlePW) ? (
                  this.state.flag ? (
                    <Pressable
                      style={{padding: 20}}
                      onPress={() => this.moveCarrousel(-1)}>
                      <IconFA6 name="angle-left" size={20} color={'white'} />
                    </Pressable>
                  ) : (
                    <View style={{padding: 20}} />
                  )
                ) : (
                  <View style={{padding: 20}} />
                )}
                <Text style={[GlobalStyles.titleModule]}>
                  {!this.state.flag
                    ? 'Direct Deposit Solana\n(SOL or SPL-Tokens)'
                    : (this.context.value.settings.aa || this.context.value.settings.circlePW)
                    ? `Direct Deposit ${
                        this.state.evmCarrousel[this.state.carrousel].network
                      }${
                        this.state.evmCarrousel[this.state.carrousel].kind
                      }\n(Native and ERC20)`
                    : `Direct Deposit EVM\n(Native and ERC20)`}
                </Text>
                {(this.context.value.settings.aa || this.context.value.settings.circlePW) ? (
                  this.state.flag ? (
                    <Pressable
                      style={{padding: 20}}
                      onPress={() => this.moveCarrousel(1)}>
                      <IconFA6 name="angle-right" size={20} color={'white'} />
                    </Pressable>
                  ) : (
                    <View style={{padding: 20}} />
                  )
                ) : (
                  <View style={{padding: 20}} />
                )}
              </View>
              <View>
                <View
                  style={[
                    {
                      backgroundColor: '#000000',
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: !this.state.flag ? '#00e599' : '#db00ff',
                    },
                  ]}>
                  <Pressable
                    onPress={() =>
                      Alert.alert(
                        this.context.value.settings.print
                          ? 'Save or Print QR'
                          : 'Save Qr',
                        this.context.value.settings.print
                          ? 'Do you want to save or print this static QR'
                          : 'Do you want to save this static QR',
                        this.context.value.settings.print
                          ? [
                              {
                                text: 'Cancel',
                                onPress: () => console.log('Cancel Pressed'),
                                style: 'cancel',
                              },
                              {text: 'Print', onPress: () => this.print()},
                              {text: 'Save', onPress: () => this.saveImage()},
                            ]
                          : [
                              {
                                text: 'Cancel',
                                onPress: () => console.log('Cancel Pressed'),
                                style: 'cancel',
                              },
                              {text: 'OK', onPress: () => this.saveImage()},
                            ],
                      )
                    }>
                    <QRCodeStyled
                      maxSize={Dimensions.get('screen').width * 0.8}
                      data={
                        !this.state.flag
                          ? 'solana:' + this.context.value.solAddress
                          : (this.context.value.settings.aa || this.context.value.settings.circlePW)
                          ? this.state.evmCarrousel[this.state.carrousel]
                              .address
                          : this.context.value.ethAddress
                      }
                      style={[
                        {
                          backgroundColor: 'white',
                          borderRadius: 10,
                          margin: 10,
                        },
                      ]}
                      errorCorrectionLevel="H"
                      padding={4}
                      //pieceSize={10}
                      pieceBorderRadius={4}
                      isPiecesGlued
                      color={'black'}
                    />
                  </Pressable>
                </View>
                <Text style={{textAlign: 'center', color: 'white'}}>
                  {this.context.value.settings.print
                    ? 'Click to print or save'
                    : 'Click to save'}
                </Text>
              </View>
              <Text style={[GlobalStyles.title, {fontSize: 20}]}>
                {!this.state.flag
                  ? `${this.context.value.solAddress.substring(
                      0,
                      epsilonRound(this.context.value.solAddress.length / 2, 0),
                    )}\n${this.context.value.solAddress.substring(
                      epsilonRound(this.context.value.solAddress.length / 2, 0),
                      this.context.value.solAddress.length,
                    )}`
                  : (this.context.value.settings.aa || this.context.value.settings.circlePW)
                  ? `${this.state.evmCarrousel[
                      this.state.carrousel
                    ].address.substring(
                      0,
                      epsilonRound(
                        this.state.evmCarrousel[this.state.carrousel].address
                          .length / 2,
                        0,
                      ),
                    )}\n${this.state.evmCarrousel[
                      this.state.carrousel
                    ].address.substring(
                      epsilonRound(
                        this.state.evmCarrousel[this.state.carrousel].address
                          .length / 2,
                        0,
                      ),
                      this.state.evmCarrousel[this.state.carrousel].address
                        .length,
                    )}`
                  : `${this.context.value.ethAddress.substring(
                      0,
                      epsilonRound(this.context.value.ethAddress.length / 2, 0),
                    )}\n${this.context.value.ethAddress.substring(
                      epsilonRound(this.context.value.ethAddress.length / 2, 0),
                      this.context.value.ethAddress.length,
                    )}`}
              </Text>
              <Pressable
                style={[GlobalStyles.buttonStyle, {borderColor: '#47a6cc'}]}
                onPress={async () => {
                  this.props.navigation.navigate('Main');
                }}>
                <Text style={[GlobalStyles.buttonTextStyle]}>Done</Text>
              </Pressable>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Text style={[GlobalStyles.title, {fontSize: 28}]}>
                {'Direct Deposit Solana\n(SOL or SPL-Tokens)'}
              </Text>
              <View>
                <View
                  style={[
                    {
                      backgroundColor: '#000000',
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: '#db00ff',
                    },
                  ]}>
                  <Pressable
                    onPress={() =>
                      Alert.alert(
                        this.context.value.settings.print
                          ? 'Save or Print QR'
                          : 'Save Qr',
                        this.context.value.settings.print
                          ? 'Do you want to save or print this static QR'
                          : 'Do you want to save this static QR',
                        this.context.value.settings.print
                          ? [
                              {
                                text: 'Cancel',
                                onPress: () => console.log('Cancel Pressed'),
                                style: 'cancel',
                              },
                              {text: 'Print', onPress: () => this.print()},
                              {text: 'Save', onPress: () => this.saveImage()},
                            ]
                          : [
                              {
                                text: 'Cancel',
                                onPress: () => console.log('Cancel Pressed'),
                                style: 'cancel',
                              },
                              {text: 'OK', onPress: () => this.saveImage()},
                            ],
                      )
                    }>
                    <QRCodeStyled
                      maxSize={Dimensions.get('screen').width * 0.8}
                      data={'solana:' + this.context.value.solAddress}
                      style={[
                        {
                          backgroundColor: 'white',
                          borderRadius: 10,
                          margin: 10,
                        },
                      ]}
                      errorCorrectionLevel="H"
                      padding={4}
                      //pieceSize={10}
                      pieceBorderRadius={4}
                      isPiecesGlued
                      color={'black'}
                    />
                  </Pressable>
                </View>
                <Text style={{textAlign: 'center', color: 'white'}}>
                  {this.context.value.settings.print
                    ? 'Click to print or save'
                    : 'Click to save'}
                </Text>
              </View>
              <Text style={[GlobalStyles.title, {fontSize: 20}]}>
                {`${this.context.value.solAddress.substring(
                  0,
                  epsilonRound(this.context.value.solAddress.length / 2, 0),
                )}\n${this.context.value.solAddress.substring(
                  epsilonRound(this.context.value.solAddress.length / 2, 0),
                  this.context.value.solAddress.length,
                )}`}
              </Text>
              <Pressable
                style={[GlobalStyles.buttonStyle, {borderColor: '#00e599'}]}
                onPress={async () => {
                  this.props.navigation.navigate('Main');
                }}>
                <Text style={[GlobalStyles.buttonTextStyle]}>Done</Text>
              </Pressable>
            </React.Fragment>
          )}
        </ImageBackground>
        <View style={{position: 'absolute', bottom: -1000}}>
          <QRCode
            value={
              this.context.value.settings.eth
                ? !this.state.flag
                  ? 'solana:' + this.context.value.solAddress
                  : (this.context.value.settings.aa || this.context.value.settings.circlePW)
                  ? this.state.evmCarrousel[this.state.carrousel].address
                  : this.context.value.ethAddress
                : 'solana:' + this.context.value.solAddress
            }
            size={Dimensions.get('window').width * 0.7}
            ecl="L"
            getRef={c => (this.svg = c)}
          />
        </View>
      </SafeAreaView>
    );
  }
}

export default DirectTransfer;
