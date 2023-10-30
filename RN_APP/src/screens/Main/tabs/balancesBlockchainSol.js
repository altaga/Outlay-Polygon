import {HeliusAPI} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {LAMPORTS_PER_SOL} from '@solana/web3.js';
import React, {Component} from 'react';
import reactAutobind from 'react-autobind';
import {
  Dimensions,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {SvgUri} from 'react-native-svg';
import SolanaAsset from '../../../assets/solana-token.png';
import GlobalStyles from '../../../styles/styles';
import ContextModule from '../../../utils/contextModule';

const size = 40;
const marginBottom = 20;

class BalancesBlockchainSOL extends Component {
  constructor(props) {
    super(props);
    this.state = {
      balances: {
        nativeBalance: 0,
        tokens: [],
      },
    };
    reactAutobind(this);
    this.controller = new AbortController();
    this.counter = 1;
    this.reference = 0;
  }

  static contextType = ContextModule;

  async getBalances() {
    return new Promise(resolve => {
      const myAddress = this.context.value.solAddress;
      fetch(
        `https://api.helius.xyz/v0/addresses/${myAddress}/balances?api-key=${HeliusAPI}`,
        {
          signal: this.controller.signal,
          method: 'GET',
          redirect: 'follow',
        },
      )
        .then(response => response.json())
        .then(balances => resolve(balances))
        .catch(error =>
          resolve({
            nativeBalance: 0,
            tokens: [],
          }),
        );
    });
  }

  async getImages(array) {
    return new Promise(resolve => {
      var myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      var raw = JSON.stringify({
        mintAccounts: array,
        includeOffChain: true,
        disableCache: false,
      });
      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
        signal: this.controller.signal,
      };
      fetch(
        `https://api.helius.xyz/v0/token-metadata?api-key=${HeliusAPI}`,
        requestOptions,
      )
        .then(response => response.json())
        .then(result => resolve(result))
        .catch(error => resolve([]));
    });
  }

  async getBalancesAndImages() {
    const balances = await this.getBalances();
    const metadata = await this.getImages(
      balances.tokens.map(item => item.mint),
    );
    console.log(metadata);
    if (balances.tokens.length > 0 && metadata.length > 0) {
      const data = metadata.map(item => {
        const flag = item.offChainMetadata.metadata === null;
        const flagLegacy = item.legacyMetadata === null;
        if (flag && flagLegacy) {
          return {
            mint: item.account,
            image: null,
            name: 'Unknown Token',
            symbol: 'Unknown Ticker',
          };
        } else if (flag) {
          return {
            mint: item.account,
            image: item.legacyMetadata.logoURI,
            name: item.legacyMetadata.name,
            symbol: item.legacyMetadata.symbol,
          };
        } else {
          return {
            mint: item.account,
            image: item.offChainMetadata.metadata.image,
            name: item.offChainMetadata.metadata.name,
            symbol: item.offChainMetadata.metadata.symbol,
          };
        }
      });
      const tokens = balances.tokens.map((item, index) => {
        return {
          ...item,
          ...data[index],
        };
      });
      this.setState({
        balances: {
          ...balances,
          tokens,
        },
      });
      this.setAsyncStorageValue({
        balancesSOL: {
          ...balances,
          tokens,
        },
      });
    } else {
      this.setState({
        balances: {
          ...balances,
          tokens: [],
        },
      });
      this.setAsyncStorageValue({
        balancesSOL: {
          ...balances,
          tokens: [],
        },
      });
    }
  }

  async componentDidMount() {
    const balances = (await this.getAsyncStorageValue('balancesSOL')) ?? {
      nativeBalance: 0,
      tokens: [],
    };
    await this.setStateAsync({balances});
    this.getBalancesAndImages();
  }

  componentWillUnmount() {
    this.controller.abort();
  }

  // Utils

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

  tapCounter(reference, token) {
    if (this.reference === reference) {
      if (this.counter === 2) {
        this.counter = 0;
        if(reference===0){
          this.props.navigation.navigate("TransferSOL",{
            token:{
              symbol:"SOL",
              mint:""
            }
          })
        }
        else{
          this.props.navigation.navigate("TransferSOL",{
            token
          })
        }
      }
      this.counter++;
    } else {
      this.reference = reference;
      this.counter = 2;
    }
  }

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            width: '100%',
            alignItems: 'center',
            showsVerticalScrollIndicator: false,
          }}>
          <Pressable
            onPress={() => (this.context.value.kind === 0 || this.context.value.kind === 2) && this.tapCounter(0)}
            style={[
              GlobalStyles.assetStyle,
              {
                flexDirection: 'row',
                justifyContent: 'space-around',
                width: Dimensions.get('window').width * 0.9,
                borderColor: '#db00ff',
                marginBottom,
              },
            ]}>
            <View
              style={{
                justifyContent: 'space-evenly',
                alignItems: 'center',
                width: '50%',
              }}>
              <Image
                resizeMode="contain"
                source={SolanaAsset}
                alt="SolanaAsset"
                style={{
                  width: size,
                  height: size,
                  borderRadius: size,
                }}
              />
              <Text style={{color: 'white'}}>{'Solana'}</Text>
            </View>
            <View
              style={{
                justifyContent: 'space-evenly',
                alignItems: 'center',
                width: '50%',
              }}>
              <Text style={{color: 'white'}}>{`${
                this.state.balances.nativeBalance / LAMPORTS_PER_SOL
              }`}</Text>
              <Text style={{color: 'white'}}>{'SOL'}</Text>
            </View>
          </Pressable>
          {this.state.balances.tokens
            .sort((a, b) => a - b)
            .map((token, index) => (
              <Pressable
                onPress={() => (this.context.value.kind === 0 || this.context.value.kind === 2) && this.tapCounter(index + 1,token)}
                key={'AssetBlock:' + index}
                style={[
                  GlobalStyles.assetStyle,
                  {
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    width: Dimensions.get('window').width * 0.9,
                    borderColor: '#db00ff',
                    marginBottom,
                  },
                ]}>
                <View
                  style={{
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                    width: '50%',
                  }}>
                  {token.image.indexOf('.svg') > -1 ? (
                    <SvgUri
                      resizeMode="contain"
                      uri={token.image}
                      alt={'AssetImage:' + index}
                      width={size}
                      height={size}
                      style={{
                        borderRadius: size,
                      }}
                    />
                  ) : (
                    <Image
                      resizeMode="contain"
                      source={{
                        uri: token.image,
                      }}
                      alt={'AssetImage:' + index}
                      style={{
                        width: size,
                        height: size,
                        borderRadius: size,
                      }}
                    />
                  )}
                  <Text style={{color: 'white'}}>{token.name}</Text>
                </View>
                <View
                  style={{
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                    width: '50%',
                  }}>
                  <Text style={{color: 'white'}}>{`${
                    token.amount / Math.pow(10, token.decimals)
                  }`}</Text>
                  <Text style={{color: 'white'}}>{token.symbol}</Text>
                </View>
              </Pressable>
            ))}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

export default BalancesBlockchainSOL;
