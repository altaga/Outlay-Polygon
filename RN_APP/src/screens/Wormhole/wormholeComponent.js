import {
  getEmitterAddressEth,
  parseSequenceFromLogEth,
} from '@certusone/wormhole-sdk';
import {HeliusAPI, WC_ID} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {transact} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import {Connection, PublicKey, Transaction} from '@solana/web3.js';
import UniversalProvider from '@walletconnect/universal-provider';
import {getSdkError} from '@walletconnect/utils';
import {BigNumber, Contract, Wallet, providers, utils} from 'ethers';
import React, {Component} from 'react';
import reactAutobind from 'react-autobind';
import {
  Dimensions,
  Image,
  ImageBackground,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {Picker} from 'react-native-form-component';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNPrint from 'react-native-print';
import QRCodeStyled from 'react-native-qrcode-styled';
import QRCode from 'react-native-qrcode-svg';
import IconIonicons from 'react-native-vector-icons/Ionicons';
import backImage from '../../assets/backgrounds/backgroundModules.png';
import {logo} from '../../assets/logo';
import Tick from '../../assets/tick.png';
import {abiIERC} from '../../programs/contractsETH/IERC';
import {abiITokenBridge} from '../../programs/contractsETH/ITokenBridge';
import GlobalStyles, {StatusBarHeight} from '../../styles/styles';
import {
  APP_IDENTITY,
  AccountAbstractionEVMs,
  WEVM2,
  WEVMs,
} from '../../utils/constants';
import ContextModule from '../../utils/contextModule';
import KeyboardAwareScrollViewComponent from '../../utils/keyboardAvoid';
import {abiLightAccount} from '../../programs/contractsETH/LightAccount';

const WCmethods = [
  'eth_sendTransaction',
  'eth_signTransaction',
  'eth_sign',
  'personal_sign',
  'eth_signTypedData',
];

const WCevents = ['accountsChanged', 'chainChanged'];

const WalletConnectNetworks = WEVMs.map(item => ({
  ...item,
  value: item.rpc,
  label: item.network,
}));

const WalletConnectNetworks2 = WEVM2.map(item => ({
  ...item,
  value: item.rpc,
  label: item.network,
}));

const baseWormhole = {
  // Utils
  qr: '', // null
  stage: 0, // 0
  loading: false,
  account: '',
  amount: '0', // 0
  paymentStatus: 'Pending...',
  signature: '', // ""
  printData: '',
  // Chains
  networkSelectedFrom: WalletConnectNetworks[1], // [0]
  networkSelectedTo: WalletConnectNetworks[0], // [1]
  tokenSelected: [
    {
      label: WalletConnectNetworks2[0].nativeToken,
      value: 'native',
    },
    {
      label: 'USDC',
      value: 'USDC',
    },
  ][0],
  businessPay: false, // false
  aaSwitch: false,
  aaAddress: '',
};

function createNonce() {
  const nonceConst = Math.random() * 100000;
  const nonceBuffer = Buffer.alloc(4);
  nonceBuffer.writeUInt32LE(nonceConst, 0);
  return nonceBuffer;
}

function base64ToArrayBuffer(base64) {
  var binaryString = atob(base64);
  var bytes = new Uint8Array(binaryString.length);
  for (var i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function base64ToArrayBuffer2(base64) {
  var binaryString = atob(base64);
  var bytes = new Uint8Array(binaryString.length);
  for (var i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function getSignedVAA(chainId, emitter, sequence) {
  return new Promise(resolve => {
    var myHeaders = new Headers();
    myHeaders.append('accept', 'application/json');

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    };

    fetch(
      `https://api.wormholescan.io/api/v1/vaas/${chainId}/${emitter}/${sequence}`,
      requestOptions,
    )
      .then(response => response.json())
      .then(result => {
        const hex = Buffer.from(base64ToArrayBuffer(result.data.vaa));
        resolve(hex);
      })
      .catch(error => {
        const hex = Buffer.from(base64ToArrayBuffer(''));
        resolve(hex);
      });
  });
}

function getSignedVAASolana(chainId, emitter, sequence) {
  return new Promise(resolve => {
    var myHeaders = new Headers();
    myHeaders.append('accept', 'application/json');

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    };

    fetch(
      `https://api.wormholescan.io/api/v1/vaas/${chainId}/${emitter}/${sequence}`,
      requestOptions,
    )
      .then(response => response.json())
      .then(result => {
        const bytes = result.data.vaa;
        resolve(bytes);
      })
      .catch(error => {
        const bytes = '';
        resolve(bytes);
      });
  });
}

function postVaaSolanaTransaction(bridgeAddress, payer, signedVaa) {
  return new Promise(resolve => {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    var raw = JSON.stringify({
      bridgeAddress,
      payer,
      signedVaa,
    });

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    fetch('https://api.outlay.site/postVaaSolana', requestOptions)
      .then(response => response.json())
      .then(result => {
        const transactionBuffer = Buffer.from(
          result.transactionSerialized,
          'base64',
        );
        resolve(Transaction.from(transactionBuffer));
      })
      .catch(error => console.log('error', error));
  });
}

function getChainList(from, to) {
  if (to === 0) {
    return ['eip155:' + from.toString()];
  } else {
    return ['eip155:' + from.toString(), 'eip155:' + to.toString()];
  }
}

class WormholeComponent extends Component {
  constructor(props) {
    super(props);
    this.state = baseWormhole;
    reactAutobind(this);
    this.svg = null;
    this.controller = new AbortController();
    this.connector = null;
    this.connection = new Connection(
      `https://rpc.helius.xyz/?api-key=${HeliusAPI}`,
      'confirmed',
    );
  }

  static contextType = ContextModule;

  async getDataURL() {
    return new Promise(async (resolve, reject) => {
      this.svg.toDataURL(async data => {
        this.setState(
          {
            printData: 'data:image/png;base64,' + data,
          },
          () => resolve('ok'),
        );
      });
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

  async setStateAsyncDelay(value, delay) {
    return new Promise(resolve => {
      this.setState(
        {
          ...value,
        },
        () =>
          setTimeout(() => {
            resolve();
          }, delay),
      );
    });
  }

  async componentDidMount() {
    this.props.navigation.addListener('focus', async () => {
      console.log(this.props.route.name);
      await this.clearAsyncStorageWC();
      this.setState(baseWormhole);
      //this.test();
    });
    this.props.navigation.addListener('blur', async () => {
      this.setState(baseWormhole);
      this.connector
        ? await this.cancelAndClearConnection()
        : await this.clearAsyncStorageWC();
      this.controller.abort();
    });
  }

  async componentWillUnmount() {
    this.connector
      ? await this.cancelAndClearConnection()
      : await this.clearAsyncStorageWC();
    this.controller.abort();
  }

  async transferFromSolana() {}

  async transferNativeToSolana() {
    try {
      const providerWC = new providers.Web3Provider(this.connector);
      const fromProvider = new providers.JsonRpcProvider(
        this.state.networkSelectedFrom.rpc,
      );
      const transferAmount = (
        parseFloat(this.state.amount) * Math.pow(10, 18)
      ).toString();
      const solanaMintKey = new PublicKey(
        WEVMs[0].tokens[this.state.networkSelectedFrom.chainId].native,
      );
      const recipientAddress = await getAssociatedTokenAddress(
        solanaMintKey,
        new PublicKey(this.context.value.solAddress),
        (allowOwnerOffCurve = false),
        (programId = TOKEN_PROGRAM_ID),
        (associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID),
      );
      // Send Contract
      const tokenBridgeContractFrom = new Contract(
        this.state.networkSelectedFrom.wBridgeContract,
        abiITokenBridge,
        providerWC.getSigner(),
      );
      // Get Gas
      let gasPrice = await fromProvider.getGasPrice();
      let gasLimit =
        await tokenBridgeContractFrom.estimateGas.wrapAndTransferETH(
          this.state.networkSelectedTo.wChainId,
          recipientAddress.toBuffer(),
          BigNumber.from(0),
          createNonce(),
          {
            value: BigNumber.from(transferAmount),
            gasPrice,
          },
        );
      // Send
      let receipt = await tokenBridgeContractFrom.wrapAndTransferETH(
        this.state.networkSelectedTo.wChainId,
        recipientAddress.toBuffer(),
        BigNumber.from(0),
        createNonce(),
        {
          value: BigNumber.from(transferAmount),
          //gasLimit,
          //gasPrice,
        },
      );
      const signature = receipt.hash;
      console.log(signature);
      receipt = await receipt.wait();
      this.setState({
        stage: 3,
        signature,
      });
      /**
        console.log(receipt);
        const sequence = parseSequenceFromLogEth(
          receipt,
          this.state.networkSelectedFrom.wCoreContract,
        );
        const emitterAddress = getEmitterAddressEth(
          this.state.networkSelectedFrom.wBridgeContract,
        );
        console.log({sequence, emitterAddress});
        let flag = true;
        let checker = await new Promise(resolve => {
          setInterval(async () => {
            if (flag) {
              flag = false;
              const bytes = await getSignedVAASolana(
                this.state.networkSelectedFrom.wChainId,
                emitterAddress,
                sequence,
              );
              if (bytes === '') {
                flag = true;
                console.log('.');
              } else {
                resolve(bytes);
              }
            }
          }, 5000);
        });
        const session = await this.getEncryptStorageValue('solPrivate');
        const wallet = Keypair.fromSecretKey(Uint8Array.from(session.split(',')));
  
        let res = await postVaaSolana(
          this.connection,
          wallet,
          this.state.networkSelectedTo.wBridgeContract,
          this.context.value.solAddress,
          base64ToArrayBuffer(checker)
        )
        console.log(res)
      */
      this.connector
        ? await this.cancelAndClearConnection()
        : await this.clearAsyncStorageWC();
    } catch (e) {
      console.log(e);
    }
  }

  async transferTokenToSolana() {
    try {
      let providerWC = new providers.Web3Provider(this.connector);
      // EVM Get Token Data
      const fromProvider = new providers.JsonRpcProvider(
        this.state.networkSelectedFrom.rpc,
      );
      const ercContractFromRead = new Contract(
        this.state.networkSelectedFrom.USDC,
        abiIERC,
        fromProvider,
      );
      const decimals = await ercContractFromRead.decimals();
      // Transaction Details
      const transferAmount = utils.parseUnits(this.state.amount, decimals);

      const solanaMintKey = new PublicKey(
        WEVMs[0].tokens[this.state.networkSelectedFrom.chainId].USDC,
      );
      const recipientAddress = new PublicKey(
        'CPfiw9nGuD18zfspAPfdTVmra7zspPd13GMrxBLDQXxU',
      );
      // Approve Bridge to use token
      const ercContractFrom = new Contract(
        this.state.networkSelectedFrom.USDC,
        abiIERC,
        providerWC.getSigner(),
      );
      let gasPrice = await fromProvider.getGasPrice();
      let gasLimit = await ercContractFrom.estimateGas.approve(
        this.state.networkSelectedFrom.wBridgeContract,
        transferAmount,
        {
          gasPrice,
        },
      );
      let receipt = await ercContractFrom.approve(
        this.state.networkSelectedFrom.wBridgeContract,
        transferAmount,
        {
          //gasPrice,
          //gasLimit,
        },
      );
      receipt = await receipt.wait();
      console.log(receipt);
      const tokenBridgeContractFrom = new Contract(
        this.state.networkSelectedFrom.wBridgeContract,
        abiITokenBridge,
        providerWC.getSigner(),
      );
      gasPrice = await fromProvider.getGasPrice();
      gasLimit = await tokenBridgeContractFrom.estimateGas.transferTokens(
        this.state.networkSelectedFrom.USDC,
        transferAmount,
        this.state.networkSelectedTo.wChainId,
        recipientAddress.toBuffer(),
        BigNumber.from(0),
        createNonce(),
        {
          gasPrice,
        },
      );
      console.log(gasLimit);
      receipt = await tokenBridgeContractFrom.transferTokens(
        this.state.networkSelectedFrom.USDC,
        transferAmount,
        this.state.networkSelectedTo.wChainId,
        recipientAddress.toBuffer(),
        BigNumber.from(0),
        createNonce(),
        {
          //gasPrice,
          //gasLimit,
        },
      );
      const signature = receipt.hash;
      console.log(signature);
      receipt = await receipt.wait();
      this.setState({
        stage: 3,
        signature,
      });
      this.connector
        ? await this.cancelAndClearConnection()
        : await this.clearAsyncStorageWC();
    } catch (e) {
      console.log(e);
    }
  }

  async transferNativeEVM() {
    // EVM Setup Amount
    const transferAmount = (
      parseFloat(this.state.amount) * Math.pow(10, 18)
    ).toString();
    // Setup WC Chain
    this.connector.setDefaultChain(
      'eip155:' + this.state.networkSelectedFrom.chainId.toString(),
    );
    let providerWC = new providers.Web3Provider(this.connector);
    const toProvider = new providers.JsonRpcProvider(
      this.state.networkSelectedTo.rpc,
    );
    const fromProvider = new providers.JsonRpcProvider(
      this.state.networkSelectedFrom.rpc,
    );
    // Send Contract
    const tokenBridgeContractFrom = new Contract(
      this.state.networkSelectedFrom.wBridgeContract,
      abiITokenBridge,
      providerWC.getSigner(),
    );
    // Get Gas
    let gasPrice = await fromProvider.getGasPrice();
    let gasLimit = await tokenBridgeContractFrom.estimateGas.wrapAndTransferETH(
      this.state.networkSelectedTo.wChainId,
      utils.hexlify(
        utils.zeroPad(
          this.state.aaSwitch
            ? this.state.aaAddress
            : this.context.value.ethAddress,
          32,
        ),
      ),
      BigNumber.from(0),
      createNonce(),
      {
        value: BigNumber.from(transferAmount),
        gasPrice,
      },
    );
    console.log(gasLimit);
    // Send
    let receipt = await tokenBridgeContractFrom.wrapAndTransferETH(
      this.state.networkSelectedTo.wChainId,
      utils.hexlify(
        utils.zeroPad(
          this.state.aaSwitch
            ? this.state.aaAddress
            : this.context.value.ethAddress,
          32,
        ),
      ),
      BigNumber.from(0),
      createNonce(),
      {
        value: BigNumber.from(transferAmount),
        gasLimit: gasLimit.mul(BigNumber.from('2')),
      },
    );
    const signature = receipt.hash;
    receipt = await receipt.wait();
    console.log(receipt);
    const sequence = parseSequenceFromLogEth(
      receipt,
      this.state.networkSelectedFrom.wCoreContract,
    );
    const emitterAddress = getEmitterAddressEth(
      this.state.networkSelectedFrom.wBridgeContract,
    );
    console.log({sequence, emitterAddress});
    let flag = true;
    let checker = await new Promise(resolve => {
      setInterval(async () => {
        if (flag) {
          flag = false;
          const bytes = await getSignedVAA(
            this.state.networkSelectedFrom.wChainId,
            emitterAddress,
            sequence,
          );
          if (bytes.toString('hex') === '') {
            flag = true;
            console.log('.');
          } else {
            resolve(bytes);
          }
        }
      }, 5000);
    });
    if (this.state.businessPay) {
      const session = await this.getEncryptStorageValue('ethPrivate');
      const wallet = new Wallet(session, toProvider);
      if (this.state.aaSwitch) {
        const iTokenBridge = new utils.Interface(abiITokenBridge);
        const data = iTokenBridge.encodeFunctionData('completeTransfer', [
          checker,
        ]);
        const accountAbstraction = new Contract(
          this.state.aaAddress,
          abiLightAccount,
          wallet,
        );
        gasPrice = await toProvider.getGasPrice();
        gasLimit = await accountAbstraction.estimateGas.execute(
          this.state.networkSelectedTo.wBridgeContract,
          utils.parseUnits('0', 'ether'),
          data,
          {
            gasPrice,
          },
        );
        console.log(gasLimit);
        receipt = await accountAbstraction.execute(
          this.state.networkSelectedTo.wBridgeContract,
          utils.parseUnits('0', 'ether'),
          data,
          {
            gasLimit: gasLimit.mul(BigNumber.from('2')),
          },
        );
        receipt = await receipt.wait();
        console.log(receipt);
        this.setState({
          stage: 3,
          signature,
        });
      } else {
        const tokenBridgeContractTo = new Contract(
          this.state.networkSelectedTo.wBridgeContract,
          abiITokenBridge,
          wallet,
        );
        gasPrice = await toProvider.getGasPrice();
        gasLimit = await tokenBridgeContractTo.estimateGas.completeTransfer(
          checker,
          {
            gasPrice,
          },
        );
        console.log(gasLimit);
        receipt = await tokenBridgeContractTo.completeTransfer(checker, {
          gasLimit: gasLimit.mul(BigNumber.from('2')),
        });
        receipt = await receipt.wait();
        console.log(receipt);
        this.setState({
          stage: 3,
          signature,
        });
      }
    } else {
      this.connector.setDefaultChain(
        'eip155:' + this.state.networkSelectedTo.chainId.toString(),
      );
      providerWC = new providers.Web3Provider(this.connector);
      const tokenBridgeContractTo = new Contract(
        this.state.networkSelectedTo.wBridgeContract,
        abiITokenBridge,
        providerWC.getSigner(),
      );
      gasPrice = await toProvider.getGasPrice();
      gasLimit = await tokenBridgeContractTo.estimateGas.completeTransfer(
        checker,
        {
          gasPrice,
        },
      );
      receipt = await tokenBridgeContractTo.completeTransfer(checker, {
        gasLimit: gasLimit.mul(BigNumber.from('2')),
      });
      receipt = await receipt.wait();
      console.log(receipt);
      this.setState({
        stage: 3,
        signature,
      });
    }
    this.connector
      ? await this.cancelAndClearConnection()
      : await this.clearAsyncStorageWC();
  }

  async transferTokenEVM() {
    this.connector.setDefaultChain(
      'eip155:' + this.state.networkSelectedFrom.chainId.toString(),
    );
    let providerWC = new providers.Web3Provider(this.connector);
    const toProvider = new providers.JsonRpcProvider(
      this.state.networkSelectedTo.rpc,
    );
    const fromProvider = new providers.JsonRpcProvider(
      this.state.networkSelectedFrom.rpc,
    );
    // EVM Get Token Data
    const ercContractFromRead = new Contract(
      this.state.networkSelectedFrom.USDC,
      abiIERC,
      fromProvider,
    );
    const decimals = await ercContractFromRead.decimals();
    const balance = await ercContractFromRead.balanceOf(this.state.account);
    // Transaction Details
    const transferAmount = utils.parseUnits(this.state.amount, decimals);
    console.log({
      balance,
      transferAmount,
    });
    // Approve Bridge to use token
    const ercContractFrom = new Contract(
      this.state.networkSelectedFrom.USDC,
      abiIERC,
      providerWC.getSigner(),
    );
    let gasPrice = await fromProvider.getGasPrice();
    let gasLimit = await ercContractFrom.estimateGas.approve(
      this.state.networkSelectedFrom.wBridgeContract,
      transferAmount,
      {
        gasPrice,
      },
    );
    let receipt = await ercContractFrom.approve(
      this.state.networkSelectedFrom.wBridgeContract,
      transferAmount,
      {
        gasLimit: gasLimit.mul(BigNumber.from('2')),
      },
    );
    receipt = await receipt.wait();
    console.log(receipt);
    const tokenBridgeContractFrom = new Contract(
      this.state.networkSelectedFrom.wBridgeContract,
      abiITokenBridge,
      providerWC.getSigner(),
    );
    gasPrice = await fromProvider.getGasPrice();
    gasLimit = await tokenBridgeContractFrom.estimateGas.transferTokens(
      this.state.networkSelectedFrom.USDC,
      transferAmount,
      this.state.networkSelectedTo.wChainId,
      utils.hexlify(
        utils.zeroPad(
          this.state.aaSwitch
            ? this.state.aaAddress
            : this.context.value.ethAddress,
          32,
        ),
      ),
      BigNumber.from(0),
      createNonce(),
      {
        gasPrice,
      },
    );
    console.log(gasLimit);
    receipt = await tokenBridgeContractFrom.transferTokens(
      this.state.networkSelectedFrom.USDC,
      transferAmount,
      this.state.networkSelectedTo.wChainId,
      utils.hexlify(
        utils.zeroPad(
          this.state.aaSwitch
            ? this.state.aaAddress
            : this.context.value.ethAddress,
          32,
        ),
      ),
      BigNumber.from(0),
      createNonce(),
      {
        gasLimit: gasLimit.mul(BigNumber.from('2')),
      },
    );
    const signature = receipt.hash;
    receipt = await receipt.wait();
    console.log(receipt);
    const sequence = parseSequenceFromLogEth(
      receipt,
      this.state.networkSelectedFrom.wCoreContract,
    );
    const emitterAddress = getEmitterAddressEth(
      this.state.networkSelectedFrom.wBridgeContract,
    );
    console.log({sequence, emitterAddress});
    let flag = true;
    let checker = await new Promise(resolve => {
      setInterval(async () => {
        if (flag) {
          flag = false;
          const bytes = await getSignedVAA(
            this.state.networkSelectedFrom.wChainId,
            emitterAddress,
            sequence,
          );
          if (bytes.toString('hex') === '') {
            flag = true;
            console.log('.');
          } else {
            resolve(bytes);
          }
        }
      }, 5000);
    });
    if (this.state.businessPay) {
      const session = await this.getEncryptStorageValue('ethPrivate');
      const wallet = new Wallet(session, toProvider);
      if (this.state.aaSwitch) {
        const iTokenBridge = new utils.Interface(abiITokenBridge);
        const data = iTokenBridge.encodeFunctionData('completeTransfer', [
          checker,
        ]);
        const accountAbstraction = new Contract(
          this.state.aaAddress,
          abiLightAccount,
          wallet,
        );
        gasPrice = await toProvider.getGasPrice();
        gasLimit = await accountAbstraction.estimateGas.execute(
          this.state.networkSelectedTo.wBridgeContract,
          utils.parseUnits('0', 'ether'),
          data,
          {
            gasPrice,
          },
        );
        console.log(gasLimit);
        receipt = await accountAbstraction.execute(
          this.state.networkSelectedTo.wBridgeContract,
          utils.parseUnits('0', 'ether'),
          data,
          {
            gasLimit: gasLimit.mul(BigNumber.from('2')),
          },
        );
        receipt = await receipt.wait();
        console.log(receipt);
        this.setState({
          stage: 3,
          signature,
        });
      } else {
        const tokenBridgeContractTo = new Contract(
          this.state.networkSelectedTo.wBridgeContract,
          abiITokenBridge,
          wallet,
        );
        gasPrice = await toProvider.getGasPrice();
        gasLimit = await tokenBridgeContractTo.estimateGas.completeTransfer(
          checker,
          {
            gasPrice,
          },
        );
        console.log(gasLimit);
        receipt = await tokenBridgeContractTo.completeTransfer(checker, {
          gasLimit: gasLimit.mul(BigNumber.from('2')),
        });
        receipt = await receipt.wait();
        console.log(receipt);
        this.setState({
          stage: 3,
          signature,
        });
      }
    } else {
      this.connector.setDefaultChain(
        'eip155:' + this.state.networkSelectedTo.chainId.toString(),
      );
      providerWC = new providers.Web3Provider(this.connector);
      const tokenBridgeContractTo = new Contract(
        this.state.networkSelectedTo.wBridgeContract,
        abiITokenBridge,
        providerWC.getSigner(),
      );
      gasPrice = await toProvider.getGasPrice();
      gasLimit = await tokenBridgeContractTo.estimateGas.completeTransfer(
        checker,
        {
          gasPrice,
        },
      );
      console.log(gasLimit);
      receipt = await tokenBridgeContractTo.completeTransfer(checker, {
        gasLimit: gasLimit.mul(BigNumber.from('2')),
      });
      receipt = await receipt.wait();
      console.log(receipt);
      this.setState({
        stage: 3,
        signature,
      });
    }
    this.connector
      ? await this.cancelAndClearConnection()
      : await this.clearAsyncStorageWC();
  }

  // Wallet Connect V2

  async setupWalletConnect() {
    this.connector = await UniversalProvider.init({
      projectId: WC_ID, // REQUIRED your projectId
      metadata: {
        name: 'Outlay',
        description:
          'Outlay aims to significantly boost the adoption of Solana Pay and USDC for payments.',
        url: `https://outlay.site/`,
        icons: ['https://www.outlay.site/logo512.png'],
      },
    });

    this.connector.on('display_uri', uri => {
      console.log(uri);
      (this.state.qr === null || this.state.stage === 0) &&
        this.setState({
          qr: uri,
          stage: 1,
          loading: false,
        });
    });

    // Subscribe to session ping
    this.connector.on('session_ping', ({id, topic}) => {
      console.log('session_ping', id, topic);
    });

    // Subscribe to session event
    this.connector.on('session_event', ({event, chainId}) => {
      console.log('session_event', event, chainId);
    });

    // Subscribe to session update
    this.connector.on('session_update', ({topic, params}) => {
      console.log('session_update', topic, params);
    });

    // Subscribe to session delete
    this.connector.on('session_delete', ({id, topic}) => {
      console.log('session_delete', id, topic);
    });

    // session established
    this.connector.on('connect', async e => {
      const address = await this.connector.request(
        {
          method: 'eth_accounts',
          params: [],
        },
        'eip155:' + this.state.networkSelectedFrom.chainId.toString(),
      );
      await this.setStateAsync({
        account: address[0],
        stage: 2,
      });
      if (this.state.networkSelectedTo.chainId === 0) {
        if (this.state.tokenSelected.value === 'USDC') {
          this.transferTokenToSolana();
        } else {
          this.transferNativeToSolana();
        }
      } else {
        if (this.state.tokenSelected.value === 'USDC') {
          this.transferTokenEVM();
        } else {
          this.transferNativeEVM();
        }
      }
    });
    // session disconnect
    this.connector.on('disconnect', async e => {
      console.log(e);
      console.log('Connection Disconnected');
    });
    this.connector
      .connect({
        namespaces: {
          eip155: {
            methods: WCmethods,
            chains: getChainList(
              this.state.networkSelectedFrom.chainId,
              this.state.networkSelectedTo.chainId,
            ),
            events: WCevents,
            rpcMap: {},
          },
        },
      })
      .then(e => {
        console.log('Connection OK');
        console.log(e);
      })
      .catch(async e => {
        console.log(e);
        console.log('Connection Rejected');
        this.connector
          ? await this.cancelAndClearConnection()
          : await this.clearAsyncStorageWC();
      });
  }

  async cancelAndClearConnection() {
    const topic = this.state.qr.substring(
      this.state.qr.indexOf('wc:') + 3,
      this.state.qr.indexOf('@'),
    );
    await this.connector.client.disconnect({
      topic,
      reason: getSdkError('USER_DISCONNECTED'),
    });
    await this.clearAsyncStorageWC();
    delete this.connector;
    this.connector = null;
  }

  async clearAsyncStorageWC() {
    await AsyncStorage.multiRemove([
      'wc@2:client:0.3//proposal',
      'wc@2:client:0.3//session',
      'wc@2:core:0.3//expirer',
      'wc@2:core:0.3//history',
      'wc@2:core:0.3//keychain',
      'wc@2:core:0.3//messages',
      'wc@2:core:0.3//pairing',
      'wc@2:core:0.3//subscription',
      'wc@2:universal_provider:/namespaces',
      'wc@2:universal_provider:/optionalNamespaces',
      'wc@2:universal_provider:/sessionProperties',
    ]);
  }

  async setEncryptedStorageValue(value) {
    const session = await EncryptedStorage.getItem('General');
    await EncryptedStorage.setItem(
      'General',
      JSON.stringify({
        ...JSON.parse(session),
        ...value,
      }),
    );
  }

  async getEncryptStorageValue(value) {
    try {
      const session = await EncryptedStorage.getItem('General');
      if (value in JSON.parse(session)) {
        return JSON.parse(session)[value];
      } else {
        return null;
      }
    } catch {
      return null;
    }
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
          <KeyboardAwareScrollViewComponent>
            {this.state.stage === 0 && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  alignItems: 'center',
                  height: Dimensions.get('window').height - StatusBarHeight,
                }}>
                <Picker
                  // Style Eq
                  buttonStyle={[
                    GlobalStyles.pickerInputStyle,
                    {
                      borderColor: '#db00ff',
                      height: 'auto',
                      marginTop: 20,
                    },
                  ]}
                  // Button Disappear
                  iconWrapperStyle={GlobalStyles.iconWrapperStyle}
                  // Uppper Label
                  labelStyle={GlobalStyles.labelStyle}
                  label="From Network"
                  // Selected
                  selectedValueStyle={GlobalStyles.selectedValueStyle}
                  selectedValue={this.state.networkSelectedFrom.value}
                  items={WalletConnectNetworks2}
                  onSelection={networkSelectedFrom => {
                    if (
                      networkSelectedFrom.chainId !==
                      this.state.networkSelectedTo.chainId
                    )
                      this.setState({
                        networkSelectedFrom,
                      });
                  }}
                  type="modal"
                />
                <Picker
                  // Style Eq
                  buttonStyle={[
                    GlobalStyles.pickerInputStyle,
                    {
                      borderColor: '#00e599',
                      height: 'auto',
                      marginTop: 20,
                    },
                  ]}
                  // Button Disappear
                  iconWrapperStyle={GlobalStyles.iconWrapperStyle}
                  // Uppper Label
                  labelStyle={GlobalStyles.labelStyle}
                  label="To Network"
                  // Selected
                  selectedValueStyle={GlobalStyles.selectedValueStyle}
                  selectedValue={this.state.networkSelectedTo.value}
                  items={WalletConnectNetworks}
                  onSelection={networkSelectedTo => {
                    if (
                      networkSelectedTo.chainId !==
                      this.state.networkSelectedFrom.chainId
                    ) {
                      this.setState({
                        networkSelectedTo,
                        aaSwitch: false,
                        aaAddress: '',
                      });
                    }
                  }}
                  type="modal"
                />
                <Picker
                  // Style Eq
                  buttonStyle={[
                    GlobalStyles.pickerInputStyle,
                    {
                      borderColor: '#db00ff',
                      height: 'auto',
                      marginTop: 20,
                    },
                  ]}
                  // Button Disappear
                  iconWrapperStyle={GlobalStyles.iconWrapperStyle}
                  // Uppper Label
                  labelStyle={GlobalStyles.labelStyle}
                  label="Token"
                  // Selected
                  selectedValueStyle={GlobalStyles.selectedValueStyle}
                  selectedValue={this.state.tokenSelected.value}
                  items={[
                    {
                      label: this.state.networkSelectedFrom.nativeToken,
                      value: 'native',
                    },
                    {
                      label: 'USDC',
                      value: 'USDC',
                    },
                  ]}
                  onSelection={tokenSelected => {
                    this.setState({
                      tokenSelected,
                    });
                  }}
                  type="modal"
                />
                <Text style={[GlobalStyles.textInput, {marginTop: 0}]}>
                  Amount
                </Text>
                <TextInput
                  style={[
                    GlobalStyles.textInputStyle,
                    {
                      borderColor: '#00e599',
                      height: 'auto',
                      marginVertical: 10,
                    },
                  ]}
                  keyboardType="number-pad"
                  value={this.state.amount}
                  onChangeText={amount => this.setState({amount})}
                  textAlign="center"
                />
                <View
                  style={{
                    width: Dimensions.get('screen').width,
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    marginTop: 20,
                  }}>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: 'white',
                      textAlign: 'center',
                      textAlignVertical: 'center',
                    }}>
                    {`To Smart\nContract Wallet`}
                  </Text>
                  <Switch
                    onChange={async () => {
                      const addresses =
                        (await this.getAsyncStorageValue('addresses')) ??
                        AccountAbstractionEVMs.map(() => '0x');
                      let temp = [];
                      addresses.forEach((item, index) => {
                        if (item !== '0x') {
                          temp.push({
                            address: item,
                            network: AccountAbstractionEVMs[index].network,
                          });
                        }
                      });
                      const aaAddress =
                        temp.filter(
                          item =>
                            item.network ===
                            this.state.networkSelectedTo.network,
                        ).length > 0
                          ? temp.filter(
                              item =>
                                item.network ===
                                this.state.networkSelectedTo.network,
                            )[0]
                          : '';
                      console.log({
                        aaSwitch: aaAddress ? !this.state.aaSwitch : false,
                        aaAddress: aaAddress?.address ?? '',
                      });
                      this.setState({
                        aaSwitch: aaAddress ? !this.state.aaSwitch : false,
                        aaAddress: aaAddress?.address ?? '',
                      });
                    }}
                    value={this.state.aaSwitch}
                    thumbColor={this.state.aaSwitch ? '#00ffa9' : '#008055'}
                    trackColor={'#00e59955'}
                  />
                </View>
                <View
                  style={{
                    width: Dimensions.get('screen').width,
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    marginVertical: 20,
                  }}>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: 'white',
                      textAlign: 'center',
                      textAlignVertical: 'center',
                    }}>
                    Business Pay Redeem
                  </Text>
                  <Switch
                    onChange={() =>
                      this.setState({
                        businessPay: !this.state.businessPay,
                      })
                    }
                    value={this.state.businessPay}
                    thumbColor={this.state.businessPay ? '#00ffa9' : '#008055'}
                    trackColor={'#00e59955'}
                  />
                </View>
                <View
                  style={{
                    height: 3,
                    width: Dimensions.get('screen').width * 0.9,
                    backgroundColor: '#00e599',
                    marginTop: 20,
                    borderRadius: 3,
                  }}
                />
                <Pressable
                  disabled={this.state.loading}
                  style={[
                    GlobalStyles.buttonStyle,
                    {
                      borderColor: this.state.loading ? '#db00ff33' : '#db00ff',
                      marginVertical: 30,
                    },
                  ]}
                  onPress={async () => {
                    await this.setStateAsyncDelay(
                      {
                        loading: true,
                      },
                      100,
                    );
                    this.setupWalletConnect();
                  }}>
                  <Text style={[GlobalStyles.buttonTextStyle]}>
                    {this.state.loading ? 'Creating...' : 'Create Payment'}
                  </Text>
                </Pressable>
              </ScrollView>
            )}
            {this.state.stage === 1 && (
              <SafeAreaView
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: Dimensions.get('window').height - StatusBarHeight,
                }}>
                <Text style={[GlobalStyles.titleModule]}>
                  {this.state.tokenSelected.value === 'USDC'
                    ? `Receive Wormhole USDC`
                    : `Receive Wrapped ${this.state.networkSelectedFrom.nativeToken}`}
                </Text>
                <View
                  style={[
                    {
                      backgroundColor: '#000000',
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: '#00e599',
                      marginVertical: 10,
                    },
                  ]}>
                  <QRCodeStyled
                    data={this.state.qr}
                    maxSize={Dimensions.get('screen').width * 0.85}
                    style={[
                      {
                        backgroundColor: '#000000',
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: '#00e599',
                        margin: 10,
                      },
                    ]}
                    padding={4}
                    pieceBorderRadius={4}
                    isPiecesGlued
                    gradient={{
                      type: 'linear',
                      options: {
                        start: [0, 0],
                        end: [1, 1],
                        colors: ['white'], // colors: ['#db00ff', '#00e599'],
                        locations: [0, 1],
                      },
                    }}
                  />
                </View>
                <Pressable
                  disabled={this.state.loading}
                  style={[
                    GlobalStyles.buttonStyle,
                    {
                      borderColor: this.state.loading ? '#db00ff33' : '#db00ff',
                      marginVertical: 30,
                    },
                  ]}
                  onPress={async () => {
                    await this.setStateAsync(baseWormhole);
                    this.connector
                      ? await this.cancelAndClearConnection()
                      : await this.clearAsyncStorageWC();
                  }}>
                  <Text style={[GlobalStyles.buttonTextStyle]}>Cancel</Text>
                </Pressable>
              </SafeAreaView>
            )}
            {this.state.stage === 2 && (
              <SafeAreaView
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: Dimensions.get('window').height - StatusBarHeight,
                }}>
                <Text style={[GlobalStyles.titleModule]}>Wallet Connected</Text>
                <IconIonicons
                  name="wallet-outline"
                  size={200}
                  color={'#00e599'}
                  style={{
                    marginVertical: '20%',
                  }}
                />
                <Pressable
                  disabled={this.state.loading}
                  style={[
                    GlobalStyles.buttonStyle,
                    {
                      borderColor: this.state.loading ? '#db00ff33' : '#db00ff',
                      marginVertical: 30,
                    },
                  ]}
                  onPress={async () => {
                    await this.setStateAsync(baseWormhole);
                    this.connector
                      ? await this.cancelAndClearConnection()
                      : await this.clearAsyncStorageWC();
                  }}>
                  <Text style={[GlobalStyles.buttonTextStyle]}>Disconnect</Text>
                </Pressable>
              </SafeAreaView>
            )}
            {this.state.stage === 3 && (
              <SafeAreaView
                style={{
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  height: Dimensions.get('window').height - StatusBarHeight,
                }}>
                <Image
                  resizeMode="contain"
                  source={Tick}
                  alt="Cat"
                  style={{
                    width: Dimensions.get('window').width * 0.4,
                    height: Dimensions.get('window').width * 0.4,
                  }}
                />
                <View>
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
                            {borderColor: '#db00ff'},
                          ]}
                          onPress={async () =>
                            Linking.openURL(
                              `https://wormholescan.io/#/tx/${this.state.signature}`,
                            )
                          }>
                          <Text style={[GlobalStyles.buttonTextStyle]}>
                            Explorer
                          </Text>
                        </Pressable>
                        <Pressable
                          style={[
                            GlobalStyles.buttonRowRightStyle,
                            {borderColor: '#00e599'},
                          ]}
                          onPress={async () => {
                            await this.getDataURL();
                            const results = await RNHTMLtoPDF.convert({
                              html: `
                            <div style="text-align: center;">
                                <img src='${logo}' width="400px"></img>
                                <h1 style="font-size: 3rem;">--------- Original Reciept ---------</h1>
                                <h1 style="font-size: 3rem;">Date: ${new Date().toLocaleDateString()}</h1>
                                <h1 style="font-size: 3rem;">Type: Wormhole Pay</h1>
                                <h1 style="font-size: 3rem;">------------------ • ------------------</h1>
                                <h1 style="font-size: 3rem;">Transaction</h1>
                                <h1 style="font-size: 3rem;">Amount: ${
                                  this.state.amount
                                } W${
                                this.state.networkSelectedFrom.nativeToken
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
                          <Text style={[GlobalStyles.buttonTextStyle]}>
                            Print
                          </Text>
                        </Pressable>
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <Pressable
                          style={[
                            GlobalStyles.buttonStyle,
                            {borderColor: '#db00ff'},
                          ]}
                          onPress={async () =>
                            Linking.openURL(
                              `https://wormholescan.io/#/tx/${this.state.signature}`,
                            )
                          }>
                          <Text style={[GlobalStyles.buttonTextStyle]}>
                            Explorer
                          </Text>
                        </Pressable>
                      </React.Fragment>
                    )}
                  </View>
                  <Pressable
                    style={[
                      GlobalStyles.buttonStyle,
                      {
                        borderColor: this.context.value.settings.print
                          ? '#47a6cc'
                          : '#00e599',
                      },
                    ]}
                    onPress={async () => {
                      this.props.navigation.navigate('Main');
                    }}>
                    <Text style={[GlobalStyles.buttonTextStyle]}>Done</Text>
                  </Pressable>
                </View>
              </SafeAreaView>
            )}
          </KeyboardAwareScrollViewComponent>
        </ImageBackground>
        <View style={{position: 'absolute', bottom: -1000}}>
          <QRCode
            value={`https://wormholescan.io/#/tx/${this.state.signature}`}
            size={Dimensions.get('window').width * 0.7}
            ecl="L"
            getRef={c => (this.svg = c)}
          />
        </View>
      </SafeAreaView>
    );
  }
}

export default WormholeComponent;
