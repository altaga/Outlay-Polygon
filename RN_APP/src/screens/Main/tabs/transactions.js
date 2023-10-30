import {HeliusAPI} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {LAMPORTS_PER_SOL} from '@solana/web3.js';
import React, {Component} from 'react';
import reactAutobind from 'react-autobind';
import {
  Dimensions,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNPrint from 'react-native-print';
import QRCode from 'react-native-qrcode-svg';
import {logo} from '../../../assets/logo';
import GlobalStyles from '../../../styles/styles';
import ContextModule from '../../../utils/contextModule';

class Transactions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: [],
      printData: '',
    };
    reactAutobind(this);
    this.svg = [];
    this.controller = new AbortController();
  }

  static contextType = ContextModule;

  // Main Functions
  async getTransactions() {
    const myAddress = this.context.value.solAddress;
    fetch(
      `https://api.helius.xyz/v0/addresses/${myAddress}/transactions?api-key=${HeliusAPI}`,
      {
        signal: this.controller.signal,
        method: 'GET',
        redirect: 'follow',
      },
    )
      .then(response => response.json())
      .then(async transactions => {
        const temp = [
          ...new Set( // Remove duplicates
            transactions
              .map(item => item.tokenTransfers[0])
              .filter(item => item !== undefined)
              .map(item => item.mint),
          ),
        ];
        const metadata = await this.getImages(temp);
        if (metadata.length === 0) throw Error("Error Reading Metadata")
        let metadataProcessed = {};
        metadata.forEach(item => {
          const flag = item.offChainMetadata.metadata === null;
          const flagLegacy = item.legacyMetadata === null;
          if (flag && flagLegacy) {
            metadataProcessed[item.account] = {
              mint: item.account,
              image: null,
              name: 'Unknown Token',
              symbol: 'Unknown Ticker',
            };
          } else if (flag) {
            metadataProcessed[item.account] = {
              mint: item.account,
              image: item.legacyMetadata.logoURI,
              name: item.legacyMetadata.name,
              symbol: item.legacyMetadata.symbol,
            };
          } else {
            metadataProcessed[item.account] = {
              mint: item.account,
              image: item.offChainMetadata.metadata.image,
              name: item.offChainMetadata.metadata.name,
              symbol: item.offChainMetadata.metadata.symbol,
            };
          }
        });
        const transactionsProcessed = transactions.map(item => {
          if (item.tokenTransfers.length > 0) {
            return {
              ...item,
              tokenData: metadataProcessed[item.tokenTransfers[0].mint],
            };
          } else {
            return item;
          }
        });
        this.setState({
          transactions: transactionsProcessed,
        });
        this.setAsyncStorageValue({
          transactions: transactionsProcessed,
        });
      })
      .catch(async e => {
        const transactions =
          (await this.getAsyncStorageValue('transactions')) ?? [];
        this.setState({
          transactions,
        });
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

  async getDataURL(index) {
    return new Promise(async (resolve, reject) => {
      this.svg[index].toDataURL(async data => {
        this.setState(
          {
            printData: 'data:image/png;base64,' + data,
          },
          () => resolve('ok'),
        );
      });
    });
  }

  // Mount

  async componentDidMount() {
    const transactions =
      (await this.getAsyncStorageValue('transactions')) ?? [];
    await this.setStateAsync({
      transactions,
    });
    this.getTransactions();
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

  render() {
    return (
      <React.Fragment>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            width: '100%',
            alignItems: 'center',
            showsVerticalScrollIndicator: false,
          }}>
          {this.state.transactions.map((item, index, array) => (
            <React.Fragment key={'Transaction:' + index}>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginVertical: 10,
                }}>
                <Text
                  style={{color: 'white', fontSize: 20, textAlign: 'center'}}>
                  {'Signature\n'}
                  {`${item.signature.substring(
                    0,
                    10,
                  )}...${item.signature.substring(
                    item.signature.length - 10,
                    item.signature.length,
                  )}`}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    width: Dimensions.get('window').width,
                    alignItems: 'center',
                    marginTop: 4,
                  }}>
                  <View
                    style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{color: 'white', textAlign: 'center'}}>
                      {'Date\n'}
                      {new Date(item.timestamp * 1000).toLocaleDateString()}
                    </Text>
                  </View>
                  <View
                    style={{justifyContent: 'center', alignItems: 'center'}}>
                    {item.tokenTransfers.length > 0 ? (
                      <Text style={{color: 'white', textAlign: 'center'}}>
                        {'Amount\n'}
                        {`${item.tokenTransfers[0].tokenAmount} ${item.tokenData.symbol}`}
                      </Text>
                    ) : (
                      <Text style={{color: 'white', textAlign: 'center'}}>
                        {'Amount\n'}
                        {(item.nativeTransfers[0]?.amount ?? 0) /
                          LAMPORTS_PER_SOL}{' '}
                        SOL
                      </Text>
                    )}
                  </View>
                  <View
                    style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{color: 'white', textAlign: 'center'}}>
                      {'Gas Fee\n'}
                      {item.fee / LAMPORTS_PER_SOL} SOL
                    </Text>
                  </View>
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 20,
                }}>
                {this.context.value.settings.print ? (
                  <React.Fragment>
                    <Pressable
                      style={[
                        GlobalStyles.buttonRowLeftStyle,
                        {borderColor: '#db00ff', padding: 2},
                      ]}
                      onPress={async () =>
                        Linking.openURL(
                          `https://solana.fm/tx/${item.signature}?cluster=mainnet-solanafmbeta`,
                        )
                      }>
                      <Text style={[GlobalStyles.buttonTextStyle]}>
                        Explorer
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[
                        GlobalStyles.buttonRowRightStyle,
                        {borderColor: '#00e599', padding: 2},
                      ]}
                      onPress={async () => {
                        await this.getDataURL(index);
                        const results = await RNHTMLtoPDF.convert({
                          html: `
                            <div style="text-align: center;">
                                <img src='${logo}' width="400px"></img>
                                <h1 style="font-size: 3rem;">--------- Original Reciept ---------</h1>
                                <h1 style="font-size: 3rem;">Date: ${new Date(
                                  item.timestamp * 1000,
                                ).toLocaleDateString()}</h1>
                                <h1 style="font-size: 3rem;">Type: ${
                                  item.type
                                }</h1>
                                <h1 style="font-size: 3rem;">------------------ • ------------------</h1>
                                <h1 style="font-size: 3rem;">Transaction</h1>
                                <h1 style="font-size: 3rem;">Amount: ${
                                  item.tokenTransfers.length > 0
                                    ? item.tokenTransfers[0].tokenAmount
                                    : (item.nativeTransfers[0]?.amount ?? 0) /
                                      LAMPORTS_PER_SOL
                                } ${
                            item.tokenTransfers.length > 0
                              ? item.tokenData.symbol
                              : 'SOL'
                          }</h1>
                                <h1 style="font-size: 3rem;">------------------ • ------------------</h1>
                                <img src='${this.state.printData}'></img>
                            </div>
                            `,
                          fileName: 'print',
                          base64: true,
                        });
                        await RNPrint.print({filePath: results.filePath});
                      }}>
                      <Text style={[GlobalStyles.buttonTextStyle]}>Print</Text>
                    </Pressable>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <Pressable
                      style={[
                        GlobalStyles.buttonStyle,
                        {borderColor: '#db00ff', padding: 2},
                      ]}
                      onPress={async () =>
                        Linking.openURL(
                          `https://solana.fm/tx/${item.signature}?cluster=mainnet-solanafmbeta`,
                        )
                      }>
                      <Text style={[GlobalStyles.buttonTextStyle]}>
                        Explorer
                      </Text>
                    </Pressable>
                  </React.Fragment>
                )}
              </View>
              <View style={{position: 'absolute', bottom: -1000}}>
                <QRCode
                  value={`https://solana.fm/tx/${item.signature}?cluster=mainnet-solanafmbeta`}
                  size={Dimensions.get('window').width * 0.7}
                  ecl="L"
                  getRef={c => (this.svg[index] = c)}
                />
              </View>
              {array.length - 1 !== index && (
                <View
                  style={{
                    height: 1,
                    width: Dimensions.get('window').width * 0.9,
                    backgroundColor: index % 2 === 0 ? '#db00ff' : '#00e599',
                  }}
                />
              )}
            </React.Fragment>
          ))}
          {this.state.transactions.length === 0 && (
            <Text style={{color: 'white', fontSize: 20, textAlign: 'center'}}>
              {'No transactions...'}
            </Text>
          )}
        </ScrollView>
      </React.Fragment>
    );
  }
}

export default Transactions;
