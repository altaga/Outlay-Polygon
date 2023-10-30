import {Image} from 'react-native';
import solana from '../assets/solana-token.png';
import usdc from '../assets/usdc-token.png';
import usdt from '../assets/usdt-token.png';
import {PublicKey} from '@solana/web3.js';
import Arb from '../assets/evmLogos/arb.png';
import Avax from '../assets/evmLogos/avax.png';
import Base from '../assets/evmLogos/base.png';
import Bnb from '../assets/evmLogos/bnb.png';
import Eth from '../assets/evmLogos/eth.png';
import Matic from '../assets/evmLogos/matic.png';
import Neon from '../assets/evmLogos/neon.png';
import Op from '../assets/evmLogos/op.png';

export const APP_IDENTITY = {
  name: 'Outlay',
  uri: 'https://outlay.site', // CREATE NEXT JS APP WITH FAVICON
  icon: 'favicon.ico', // Full path resolves to https://yourdapp.com/favicon.ico
};

const logoSize = 24;

export const splTokens = [
  {
    value: null,
    label: 'SOL',
    publicKey: '',
    icon: <Image style={{width: logoSize, height: logoSize}} source={solana} />,
  },
  {
    value: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    label: 'USDC',
    publicKey: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    icon: <Image style={{width: logoSize, height: logoSize}} source={usdc} />,
  },
  {
    value: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
    label: 'USDT',
    publicKey: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    icon: <Image style={{width: logoSize, height: logoSize}} source={usdt} />,
  },
];

export const EVMs = [
  {
    network: 'Neon EVM',
    nativeToken: 'NEON',
    rpc: 'https://neon-proxy-mainnet.solana.p2p.org',
    chainId: 245022934,
    blockExplorer: 'https://neonscan.org/',
    icon: <Image style={{width: logoSize, height: logoSize}} source={Neon} />,
  },
  {
    network: 'Arbitrum One',
    nativeToken: 'ETH',
    rpc: 'https://arb1.arbitrum.io/rpc',
    chainId: 42161,
    blockExplorer: 'https://arbiscan.io/',
    icon: <Image style={{width: logoSize, height: logoSize}} source={Arb} />,
  },
  {
    network: 'Avalanche C-Chain',
    nativeToken: 'AVAX',
    rpc: 'https://avalanche-c-chain.publicnode.com',
    chainId: 43114,
    blockExplorer: 'https://snowtrace.io/',
    icon: <Image style={{width: logoSize, height: logoSize}} source={Avax} />,
  },
  {
    network: 'Base',
    nativeToken: 'ETH',
    rpc: 'https://mainnet.base.org/',
    chainId: 8453,
    blockExplorer: 'https://basescan.org/',
    icon: <Image style={{width: logoSize, height: logoSize}} source={Base} />,
  },
  {
    network: 'BSC',
    nativeToken: 'BNB',
    rpc: 'https://bsc-dataseed.binance.org/',
    chainId: 56,
    blockExplorer: 'https://bscscan.com/',
    icon: <Image style={{width: logoSize, height: logoSize}} source={Bnb} />,
  },
  {
    network: 'Ethereum',
    nativeToken: 'ETH',
    rpc: 'https://eth.llamarpc.com',
    chainId: 1,
    blockExplorer: 'https://etherscan.io/',
    icon: <Image style={{width: logoSize, height: logoSize}} source={Eth} />,
  },
  {
    network: 'Optimism',
    nativeToken: 'ETH',
    rpc: 'https://mainnet.optimism.io/',
    chainId: 10,
    blockExplorer: 'https://optimistic.etherscan.io/',
    icon: <Image style={{width: logoSize, height: logoSize}} source={Op} />,
  },
  {
    network: 'Polygon',
    nativeToken: 'MATIC',
    rpc: 'https://polygon-rpc.com',
    chainId: 137,
    blockExplorer: 'https://polygonscan.com/',
    icon: <Image style={{width: logoSize, height: logoSize}} source={Matic} />,
  },
];

export const WEVMs = [
  {
    network: 'Solana',
    nativeToken: 'SOL',
    rpc: 'https://api.mainnet-beta.solana.com',
    chainId: 0,
    blockExplorer: 'https://solana.fm/',
    icon: <Image style={{width: logoSize, height: logoSize}} source={solana} />,
    wChainId: 1,
    wBridgeContract: 'wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb',
    wCoreContract: 'worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth',
    gekkoPrice: 'solana',
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    tokens: {
      0: {
        // Solana
        native: '',
        USDC: '',
      },
      43114: {
        // AVAX
        native: 'KgV1GvrHQmRBY8sHQQeUKwTm2r2h8t4C8qt12Cw1HVE',
        USDC: 'FHfba3ov5P3RjaiLVgh8FTv4oirxQDoVXuoUUDvHuXax',
      },
      56: {
        // BSC
        native: '9gP2kCy3wA1ctvYWQk75guqXuHfrEomqydHLtcTCqiLa',
        USDC: 'FCqfQSujuPxy6V42UvafBhsysWtEq1vhjfMN1PUbgaxA',
      },
      1: {
        // Ethereum
        native: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
        USDC: 'A9mUU4qviSctJVPJdBJWkb28deg915LYJKrzQ19ji3FM',
      },
      137: {
        // Polygon
        native: 'Gz7VkD4MacbEB6yC5XD3HcumEiYx2EtDYYrfikGsvopG',
        USDC: 'E2VmbootbVCBkMNNxKQgCLMS1X3NoGMaYAsufaAsf7M',
      },
    },
  },
  {
    network: 'Avalanche C-Chain',
    nativeToken: 'AVAX',
    rpc: 'https://avax-rpc.gateway.pokt.network',
    chainId: 43114,
    blockExplorer: 'https://snowtrace.io/',
    icon: <Image style={{width: logoSize, height: logoSize}} source={Avax} />,
    wChainId: 6,
    wBridgeContract: '0x0e082F06FF657D94310cB8cE8B0D9a04541d8052',
    wCoreContract: '0x54a8e5f9c4CbA08F9943965859F6c34eAF03E26c',
    gekkoPrice: 'avalanche',
    USDC: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    tokens: {
      0: {
        // Solana
        native: '0xFE6B19286885a4F7F55AdAD09C3Cd1f906D2478F',
        USDC: '0x0950Fc1AD509358dAeaD5eB8020a3c7d8b43b9DA',
      },
      43114: {
        // AVAX
        native: '',
        USDC: '',
      },
      56: {
        // BSC
        native: '0x442F7f22b1EE2c842bEAFf52880d4573E9201158',
        USDC: '0x6145E8a910aE937913426BF32De2b26039728ACF',
      },
      1: {
        // Ethereum
        native: '0x8b82A291F83ca07Af22120ABa21632088fC92931',
        USDC: '0xB24CA28D4e2742907115fECda335b40dbda07a4C',
      },
      137: {
        // Polygon
        native: '0xf2f13f0B7008ab2FA4A2418F4ccC3684E49D20Eb',
        USDC: '0x543672E9CBEC728CBBa9C3Ccd99ed80aC3607FA8',
      },
    },
  },
  {
    network: 'BSC',
    nativeToken: 'BNB',
    rpc: 'https://bsc-rpc.gateway.pokt.network',
    chainId: 56,
    blockExplorer: 'https://bscscan.com/',
    icon: <Image style={{width: logoSize, height: logoSize}} source={Bnb} />,
    wChainId: 4,
    wBridgeContract: '0xB6F6D86a8f9879A9c87f643768d9efc38c1Da6E7',
    wCoreContract: '0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B',
    wrappedToken: '9gP2kCy3wA1ctvYWQk75guqXuHfrEomqydHLtcTCqiLa',
    gekkoPrice: 'binance-smart-chain',
    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    tokens: {
      0: {
        // Solana
        native: '0xfA54fF1a158B5189Ebba6ae130CEd6bbd3aEA76e',
        USDC: '0x91Ca579B0D47E5cfD5D0862c21D5659d39C8eCf0',
      },
      43114: {
        // AVAX
        native: '0x96412902aa9aFf61E13f085e70D3152C6ef2a817',
        USDC: '0xc1F47175d96Fe7c4cD5370552e5954f384E3C791',
      },
      56: {
        // BSC
        native: '',
        USDC: '',
      },
      1: {
        // Ethereum
        native: '0x4DB5a66E937A9F4473fA95b1cAF1d1E1D62E29EA',
        USDC: '0xB04906e95AB5D797aDA81508115611fee694c2b3',
      },
      137: {
        // Polygon
        native: '0xc836d8dC361E44DbE64c4862D55BA041F88Ddd39',
        USDC: '0x672147dD47674757C457eB155BAA382cc10705Dd',
      },
    },
  },
  {
    network: 'Ethereum',
    nativeToken: 'ETH',
    rpc: 'https://eth-rpc.gateway.pokt.network',
    chainId: 1,
    blockExplorer: 'https://etherscan.io/',
    icon: <Image style={{width: logoSize, height: logoSize}} source={Eth} />,
    wChainId: 2,
    wBridgeContract: '0x3ee18B2214AFF97000D974cf647E7C347E8fa585',
    wCoreContract: '0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B',
    wrappedToken: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
    gekkoPrice: 'ethereum',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    tokens: {
      0: {
        // Solana
        native: '0xD31a59c85aE9D8edEFeC411D448f90841571b89c',
        USDC: '0x41f7B8b9b897276b7AAE926a9016935280b44E97',
      },
      43114: {
        // AVAX
        native: '0x85f138bfEE4ef8e540890CFb48F620571d67Eda3',
        USDC: '', // None
      },
      56: {
        // BSC
        native: '0x418D75f65a02b3D53B2418FB8E1fe493759c7605',
        USDC: '0x7cd167B101D2808Cfd2C45d17b2E7EA9F46b74B6',
      },
      1: {
        // Ethereum
        native: '',
        USDC: '',
      },
      137: {
        // Polygon
        native: '0x7c9f4C87d911613Fe9ca58b579f737911AAD2D43',
        USDC: '0x566957eF80F9fd5526CD2BEF8BE67035C0b81130',
      },
    },
  },
  {
    network: 'Polygon',
    nativeToken: 'MATIC',
    rpc: 'https://poly-rpc.gateway.pokt.network',
    chainId: 137,
    blockExplorer: 'https://polygonscan.com/',
    icon: <Image style={{width: logoSize, height: logoSize}} source={Matic} />,
    wChainId: 5,
    wBridgeContract: '0x5a58505a96D1dbf8dF91cB21B54419FC36e93fdE',
    wCoreContract: '0x7A4B5a56256163F07b2C80A7cA55aBE66c4ec4d7',
    wrappedToken: 'Gz7VkD4MacbEB6yC5XD3HcumEiYx2EtDYYrfikGsvopG',
    gekkoPrice: 'polygon-pos',
    USDC: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    tokens: {
      0: {
        // Solana
        native: '0xd93f7e271cb87c23aaa73edc008a79646d1f9912',
        USDC: '0x576cf361711cd940cd9c397bb98c4c896cbd38de',
      },
      43114: {
        // AVAX
        native: '0x7Bb11E7f8b10E9e571E5d8Eace04735fDFB2358a',
        USDC: '',
      },
      56: {
        // BSC
        native: '0xecdcb5b88f8e3c15f95c720c51c71c9e2080525d',
        USDC: '',
      },
      1: {
        // Ethereum
        native: '0x11CD37bb86F65419713f30673A480EA33c826872',
        USDC: '0x4318cb63a2b8edf2de971e2f17f77097e499459d',
      },
      137: {
        // Polygon
        native: '',
        USDC: '',
      },
    },
  },
];

export const WEVM2 = [
  {
    network: 'Avalanche C-Chain',
    nativeToken: 'AVAX',
    rpc: 'https://avax-rpc.gateway.pokt.network',
    chainId: 43114,
    blockExplorer: 'https://snowtrace.io/',
    icon: <Image style={{width: logoSize, height: logoSize}} source={Avax} />,
    wChainId: 6,
    wBridgeContract: '0x0e082F06FF657D94310cB8cE8B0D9a04541d8052',
    wCoreContract: '0x54a8e5f9c4CbA08F9943965859F6c34eAF03E26c',
    gekkoPrice: 'avalanche',
    USDC: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    tokens: {
      0: {
        // Solana
        native: '0xFE6B19286885a4F7F55AdAD09C3Cd1f906D2478F',
        USDC: '0x0950Fc1AD509358dAeaD5eB8020a3c7d8b43b9DA',
      },
      43114: {
        // AVAX
        native: '',
        USDC: '',
      },
      56: {
        // BSC
        native: '0x442F7f22b1EE2c842bEAFf52880d4573E9201158',
        USDC: '0x6145E8a910aE937913426BF32De2b26039728ACF',
      },
      1: {
        // Ethereum
        native: '0x8b82A291F83ca07Af22120ABa21632088fC92931',
        USDC: '0xB24CA28D4e2742907115fECda335b40dbda07a4C',
      },
      137: {
        // Polygon
        native: '0xf2f13f0B7008ab2FA4A2418F4ccC3684E49D20Eb',
        USDC: '0x543672E9CBEC728CBBa9C3Ccd99ed80aC3607FA8',
      },
    },
  },
  {
    network: 'BSC',
    nativeToken: 'BNB',
    rpc: 'https://bsc-rpc.gateway.pokt.network',
    chainId: 56,
    blockExplorer: 'https://bscscan.com/',
    icon: <Image style={{width: logoSize, height: logoSize}} source={Bnb} />,
    wChainId: 4,
    wBridgeContract: '0xB6F6D86a8f9879A9c87f643768d9efc38c1Da6E7',
    wCoreContract: '0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B',
    wrappedToken: '9gP2kCy3wA1ctvYWQk75guqXuHfrEomqydHLtcTCqiLa',
    gekkoPrice: 'binance-smart-chain',
    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    tokens: {
      0: {
        // Solana
        native: '0xfA54fF1a158B5189Ebba6ae130CEd6bbd3aEA76e',
        USDC: '0x91Ca579B0D47E5cfD5D0862c21D5659d39C8eCf0',
      },
      43114: {
        // AVAX
        native: '0x96412902aa9aFf61E13f085e70D3152C6ef2a817',
        USDC: '0xc1F47175d96Fe7c4cD5370552e5954f384E3C791',
      },
      56: {
        // BSC
        native: '',
        USDC: '',
      },
      1: {
        // Ethereum
        native: '0x4DB5a66E937A9F4473fA95b1cAF1d1E1D62E29EA',
        USDC: '0xB04906e95AB5D797aDA81508115611fee694c2b3',
      },
      137: {
        // Polygon
        native: '0xc836d8dC361E44DbE64c4862D55BA041F88Ddd39',
        USDC: '0x672147dD47674757C457eB155BAA382cc10705Dd',
      },
    },
  },
  {
    network: 'Ethereum',
    nativeToken: 'ETH',
    rpc: 'https://eth-rpc.gateway.pokt.network',
    chainId: 1,
    blockExplorer: 'https://etherscan.io/',
    icon: <Image style={{width: logoSize, height: logoSize}} source={Eth} />,
    wChainId: 2,
    wBridgeContract: '0x3ee18B2214AFF97000D974cf647E7C347E8fa585',
    wCoreContract: '0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B',
    wrappedToken: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
    gekkoPrice: 'ethereum',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    tokens: {
      0: {
        // Solana
        native: '0xD31a59c85aE9D8edEFeC411D448f90841571b89c',
        USDC: '0x41f7B8b9b897276b7AAE926a9016935280b44E97',
      },
      43114: {
        // AVAX
        native: '0x85f138bfEE4ef8e540890CFb48F620571d67Eda3',
        USDC: '', // None
      },
      56: {
        // BSC
        native: '0x418D75f65a02b3D53B2418FB8E1fe493759c7605',
        USDC: '0x7cd167B101D2808Cfd2C45d17b2E7EA9F46b74B6',
      },
      1: {
        // Ethereum
        native: '',
        USDC: '',
      },
      137: {
        // Polygon
        native: '0x7c9f4C87d911613Fe9ca58b579f737911AAD2D43',
        USDC: '0x566957eF80F9fd5526CD2BEF8BE67035C0b81130',
      },
    },
  },
  {
    network: 'Polygon',
    nativeToken: 'MATIC',
    rpc: 'https://poly-rpc.gateway.pokt.network',
    chainId: 137,
    blockExplorer: 'https://polygonscan.com/',
    icon: <Image style={{width: logoSize, height: logoSize}} source={Matic} />,
    wChainId: 5,
    wBridgeContract: '0x5a58505a96D1dbf8dF91cB21B54419FC36e93fdE',
    wCoreContract: '0x7A4B5a56256163F07b2C80A7cA55aBE66c4ec4d7',
    wrappedToken: 'Gz7VkD4MacbEB6yC5XD3HcumEiYx2EtDYYrfikGsvopG',
    gekkoPrice: 'polygon-pos',
    USDC: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    tokens: {
      0: {
        // Solana
        native: '0xd93f7e271cb87c23aaa73edc008a79646d1f9912',
        USDC: '0x576cf361711cd940cd9c397bb98c4c896cbd38de',
      },
      43114: {
        // AVAX
        native: '0x7Bb11E7f8b10E9e571E5d8Eace04735fDFB2358a',
        USDC: '',
      },
      56: {
        // BSC
        native: '0xecdcb5b88f8e3c15f95c720c51c71c9e2080525d',
        USDC: '',
      },
      1: {
        // Ethereum
        native: '0x11CD37bb86F65419713f30673A480EA33c826872',
        USDC: '0x4318cb63a2b8edf2de971e2f17f77097e499459d',
      },
      137: {
        // Polygon
        native: '',
        USDC: '',
      },
    },
  },
];

export const AccountAbstractionEVMs = [
  {
    network: 'Arbitrum One',
    nativeToken: 'ETH',
    rpc: 'https://arb1.arbitrum.io/rpc',
    chainId: 42161,
    blockExplorer: 'https://arbiscan.io/',
    icon: <Image style={{width: logoSize, height: logoSize}} source={Arb} />,
    accountAbstractionFactory: '0x000000893A26168158fbeaDD9335Be5bC96592E2',
  },
  {
    network: 'Base',
    nativeToken: 'ETH',
    rpc: 'https://mainnet.base.org/',
    chainId: 8453,
    blockExplorer: 'https://basescan.org/',
    icon: <Image style={{width: logoSize, height: logoSize}} source={Base} />,
    accountAbstractionFactory: '0x000000893A26168158fbeaDD9335Be5bC96592E2',
  },
  {
    network: 'Ethereum',
    nativeToken: 'ETH',
    rpc: 'https://eth.llamarpc.com',
    chainId: 1,
    blockExplorer: 'https://etherscan.io/',
    icon: <Image style={{width: logoSize, height: logoSize}} source={Eth} />,
    accountAbstractionFactory: '0x000000893A26168158fbeaDD9335Be5bC96592E2',
  },
  {
    network: 'Optimism',
    nativeToken: 'ETH',
    rpc: 'https://mainnet.optimism.io/',
    chainId: 10,
    blockExplorer: 'https://optimistic.etherscan.io/',
    icon: <Image style={{width: logoSize, height: logoSize}} source={Op} />,
    accountAbstractionFactory: '0x000000893A26168158fbeaDD9335Be5bC96592E2',
  },
  {
    network: 'Polygon',
    nativeToken: 'MATIC',
    rpc: 'https://endpoints.omniatech.io/v1/matic/mainnet/public',
    chainId: 137,
    blockExplorer: 'https://polygonscan.com/',
    icon: <Image style={{width: logoSize, height: logoSize}} source={Matic} />,
    accountAbstractionFactory: '0x000000893A26168158fbeaDD9335Be5bC96592E2',
  },
];

export const ProgrammableWalletsEVMs = [
  {
    network: 'Avalanche Fuji',
    nativeToken: 'AVAX',
    rpc: 'https://avalanche-c-chain.publicnode.com',
    chainId: 'AVAX-FUJI',
    blockExplorer: 'https://snowtrace.io/',
    icon: <Image style={{width: logoSize, height: logoSize}} source={Avax} />,
  },
  {
    network: 'Ethereum Goerli',
    nativeToken: 'ETH',
    rpc: 'https://eth.llamarpc.com',
    chainId: 'ETH-GOERLI',
    blockExplorer: 'https://etherscan.io/',
    icon: <Image style={{width: logoSize, height: logoSize}} source={Eth} />,
    accountAbstractionFactory: '0x000000893A26168158fbeaDD9335Be5bC96592E2',
  },
  {
    network: 'Polygon Mumbai',
    nativeToken: 'MATIC',
    rpc: 'https://endpoints.omniatech.io/v1/matic/mainnet/public',
    chainId: 'MATIC-MUMBAI',
    blockExplorer: 'https://polygonscan.com/',
    icon: <Image style={{width: logoSize, height: logoSize}} source={Matic} />,
    accountAbstractionFactory: '0x000000893A26168158fbeaDD9335Be5bC96592E2',
  },
];
