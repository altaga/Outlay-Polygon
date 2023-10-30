[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE) [<img src="https://img.shields.io/badge/View-Video-red">](pending)

# Outlay-Polygon

<img src="https://i.ibb.co/hm6Y2Bv/logo-2.png">

Outlay aims to significantly boost the adoption of USDC for payments. Through a modular point of Sale that eases user experience through Account Abstraction powered by AI.

## DApp:

Our dapp is ready and compatible with all devices and everything is on mainnet.

[Download APK Here!](./APK/app-release.apk)

## Main demo video: 

[![Demo](https://i.ibb.co/g4W3ypx/image.png)](pending)

## Pitch Deck: 

### https://bit.ly/OutlaySlideDeck

## Notion webpage:

### https://bit.ly/OutlayNotion

# Introduction and Problem

Solana stands out as the blockchain uniquely positioned to excel in the primary cryptocurrency use case, payments. 

<img src="https://i0.wp.com/criptotendencia.com/wp-content/uploads/2023/08/Solana.jpg?fit=1043%2C575&ssl=1" width="400">

However, to achieve widespread adoption, it must cater to everyday consumers, including major retailers and mom-and-pop shops.

Our previous experiences have shown us that businesses face two main challenges:

First, Many businesses already possess numerous point-of-sale terminals and hoard them.

<img src="https://th-i.thgim.com/public/business/Economy/article16900720.ece/alternates/FREE_1200/PoS" width="500">

The second challenge is rooted in legacy systems. These businesses often contend with long queues, slow processing, and over complex user interfaces. 

They're in dire need of a superior solution that can address their specific requirements and replace these outdated legacy systems.

Enter Outlay

### Our goal for this project is to actually enable and get crypto at the point of sale.

# Solution

Outlay aims to significantly boost the adoption of USDC for payments. Through a modular point of Sale that eases user experience through Account Abstraction powered by AI.

### System's Architecture:

<img src="https://i.ibb.co/fQW475q/scheme-Plygon-drawio.png">

- All EVMs transactions are controlled through [Ethers.js](https://docs.ethers.org/v5/) and [WalletConnectV2](https://docs.walletconnect.com/2.0/) on mainnet.

- Account Abstraction for Polygon, Optimism, Ethereum, Abritrum and Base Payments with [Alchemy LightAccount SDK](https://accountkit.alchemy.com/getting-started.html#a-simple-light-account-example).

- Programmable wallets and USDC Payments with [Circle Web3Services](https://www.circle.com/en/programmable-wallets).

- Crosschain payments (EVM <-> Solana and EVM <-> EVM) through [Wormhole](https://wormhole.com/).

- Generative AI analysis done via [AWS (Amazon Web Services)](https://aws.amazon.com/) and the Text model [Llama2 (Meta)](https://ai.meta.com/llama/).

- Through [Stripe APIs](https://stripe.com/docs/api) we can create inventories and credit card checkouts.

# Wallet Setup:

The first thing we have to do is the initial configuration of our wallet, this is very intuitive, but we will explain the 3 Wallet types that our Dapp accepts.

### Create new Wallet:

In this option we can configure a wallet completely from scratch, we will create the mnemonic and configure some security features.

<img src="https://i.ibb.co/sRpZGDv/Screenshot-20231013-194234.png" width="32%"> <img src="https://i.ibb.co/vsQqP3s/Screenshot-20231013-194246.png" width="32%"> <img src="https://i.ibb.co/0q6ySZm/Screenshot-20231013-194306.png" width="32%"> 

Always remember to save your mnemonic in a safe place so you can import it later if your hardware is lost.

<img src="https://i.ibb.co/SfZ99G6/Screenshot-20231013-194313.png" width="32%"> <img src="https://i.ibb.co/98TJnjf/Screenshot-20231013-194318.png" width="32%"> <img src="https://i.ibb.co/37kBqJM/Screenshot-20231013-194328.png" width="32%"> 

And with those simple steps we already have the POS ready to use.

The code to create the wallet is in the following link:

[CODE](./RN_APP/src/screens/SetupNewWallet/setupNewWallet.js)

### Import a Wallet:

In this option we will have to configure a wallet from an existing mnemonic. If you don't know how to create one, we recommend using the previous option.

<img src="https://i.ibb.co/DzpDL2f/Screenshot-20231013-194234-1.png" width="32%"> <img src="https://i.ibb.co/PQTZQTb/Screenshot-20231013-194405.png" width="32%"> <img src="https://i.ibb.co/zXRtfJC/Screenshot-20231013-194335.png" width="32%">

After these steps, the entire other process is the same as the previous one.

The code to import a wallet from a mnemonic is in the following link:

[CODE](./RN_APP/src/screens/SetupImportWallet/setupImportWallet.js)

### Watch-only Wallet:

In this option we can import a watch-only wallet, this means that the only thing configured in the POS will be the public key, this is quite useful if you want to have the private keys in a cold wallet since the POS will only be able to receive payments. (HIGHLY RECOMMENDED)

<img src="https://i.ibb.co/BGzg6nZ/Screenshot-20231013-194234-2.png" width="32%"> <img src="https://i.ibb.co/yR6hjY3/vlcsnap-2023-10-13-20h00m11s469.png" width="32%"> <img src="https://i.ibb.co/mcVMHSy/vlcsnap-2023-10-13-20h00m34s517.png" width="32%">

After these steps, the entire other process is the same as the previous one.

The code to be able to setup a watch-only wallet is in the following link:

[CODE](./RN_APP/src/screens/SetupWatchWallet/setupWatchWallet.js)

# Modules:

We are going to describe each of the modules available in our application.

### Modules Setup:

Before starting to make payments with our DApp we will have to configure the modules that we want active in the POS, these will be updated over time and each time you will have many more options.

<img src="https://i.ibb.co/k3kMBqT/Screenshot-20231013-200855.png" width="32%"> <img src="https://i.ibb.co/0Zz4J5c/Screenshot-20231013-200901.png" width="32%"> <img src="https://i.ibb.co/RPFQ0f5/Screenshot-20231013-200910.png" width="32%">

The code section where we can modify the modules is in the following link:

[CODE](./RN_APP/src/screens/Settings/settings.js)

### AI Setup:

To facilitate the configuration even more, we made a feature that allows us through artificial intelligence to configure your POS just by describing the business and if the business needs deem it appropriate, our AI will analyze and make the relevant configurations.

<img src="https://i.ibb.co/Tb6HJs9/Screenshot-20231013-200901.png" width="32%"> <img src="https://i.ibb.co/jfxGCnW/Screenshot-20231013-202011.png" width="32%"> <img src="https://i.ibb.co/QpCkm15/Screenshot-20231013-202017.png" width="32%">

Once the business and its needs have been described, we will press the Ai Settings button and the AI, after a few seconds, will send us a configuration proposal and we will accept or reject them according to our criteria.

<img src="https://i.ibb.co/Qng55yg/Screenshot-20231013-202058.png" width="32%"> <img src="https://i.ibb.co/KyhGgHJ/Screenshot-20231013-202105.png" width="32%"> <img src="https://i.ibb.co/k4SHtNx/Screenshot-20231013-202112.png" width="32%">

The code section where we perform the AI Settings is in the following link:

[CODE](./RN_APP/src/screens/Ai/ai.js)

Something important to highlight is that AI, since it is a text generation model, sometimes does not respond with a JSON with the configurations, so we must post-process it in our app.

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

Additionally, the code implementation of AI as a service on the EC2 server is as follows.

[CODE](./EC2_Llama2/index.py)

The important part of the implementation is to correctly "program" the AI so that it correctly interprets our description.

    template = """
    You are a program that decide what features a business should have according to its description. 
    The features available are:

    - email: This service sends the receipt of transactions by mail if the customer requests it.
    - print: Allows the system to print receipts and permanent payment QRs.
    - eth: Allows the system to receive payments on any EVM compatible network
    - jupiter: This service performs currency exchange at the time of payment by Jupiter, this includes payments with tokens and spl-tokens.
    - tipping: Allows the system to send payment requests by mail.
    - crosschain: Allows pay from one source network to another by Wormhole.
    - fiat: Allows the use of traditional finance by Stripe.

    The business description is the following and is delimited by triple backquotes.

    ```{text}```

    Return all the features that best fit the business and and your return must be only a json format with every feature key asigned with bool value without comments.

    Your JSON:
    """

### Alchemy Account Abstraction SDK:

Este modulo permite al business crear una Light Wallet, la cual es un tipo de Account Abstraction wallet creada por Alchemy y con la cual el negocio podra recibir y utilizar todos los servicios de Outlay pero con todos los beneficios de usar Smart Contract Wallet.

<img src="https://i.ibb.co/y64KJHS/Screenshot-20231029-234215.png" width="32%"> <img src="https://i.ibb.co/9G00cN4/Screenshot-20231030-000029.png" width="32%"> <img src="https://i.ibb.co/bR1Fnjp/Screenshot-20231030-000004.png" width="32%"> 

Gracias a Alchemy y a su LightAccountFactory Contract en la red de Polygon, tan solo con un clic podemos configurar nuestra Smart Contract Wallet en nuestro POS.

<img src="https://i.ibb.co/bbr2MHp/vlcsnap-2023-10-30-00h13m08s023.png" width="32%"> <img src="https://i.ibb.co/WzwWJCr/vlcsnap-2023-10-30-00h13m20s646.png" width="32%">

The technical implementation of this code is in the following link:

[CODE](./RN_APP/src/screens/AccountAbstraction/aa.js)

El contrato ABI que se esta utilizando para la creacion de la wallet es:

[FACTORY CONTRACT](./RN_APP/src/programs/contractsETH/LightAccountFactory.js)

De este codigo es importante resaltar la siguiente seccion:

    const provider = new providers.JsonRpcProvider(rpc);
    const session = await this.getEncryptStorageValue('ethPrivate'); // YOUR BUNDLER ACCOUNT
    const wallet = new Wallet(session, provider);
    const gasPrice = await provider.getGasPrice();
    const accountAbstractionFactory = new Contract(
        contractAddress,
        abiLightAccountFactory,
        wallet,
    );
    const gas = await accountAbstractionFactory.estimateGas.createAccount(
        this.context.value.ethAddress,
        0,
    );
    const gasLimit = gas.mul(BigNumber.from(2));
    let receipt = await accountAbstractionFactory.createAccount(
        this.context.value.ethAddress,
        0,
        {
            gasLimit,
            gasPrice,
        },
    );
    receipt = await receipt.wait();

Y el contrato con el que interaccionamos con la smart contract wallet una vez creada es el siguiente:

[LIGHT CONTRACT](./RN_APP/src/programs/contractsETH/LightAccount.js)

Una vez creada la wallet, podremos relizar cualquier operacion sobre la misma, ya sea interaccionar con un smart contract o simplemente disponer del dinero en la wallet.

    const provider = new providers.JsonRpcProvider(this.state.network.rpc);
    const session = await this.getEncryptStorageValue('ethPrivate');    // YOUR BUNDLER ACCOUNT
    const wallet = new Wallet(session, provider);
    const gasPrice = await provider.getGasPrice();
    const accountAbstraction = new Contract( 
        this.state.aa.address,  // YOUR AA Address
        abiLightAccount,
        wallet,
    );
    const balance = await this.getBalance(this.state.network.rpc,this.state.aa.address)
    const gas = await accountAbstraction.estimateGas.execute(
        this.state.ethAddress,
        utils.parseUnits(this.state.amount, 'ether'),
        "0x"
    );
    const gasLimit = gas.mul(BigNumber.from(2));
    let receipt = await accountAbstraction.execute(
        this.state.ethAddress,
        utils.parseUnits(this.state.amount, 'ether'),
        "0x",
        {
            gasLimit,
            gasPrice,
        },
    );
    receipt = await receipt.wait();

### Programmable Wallets Circle:

Este modulo permite al business crear una Programmable Wallet, la cual es un tipo de Wallet creada por Circle y sus servicios Web3 Services, con este modulo el negocio podra recibir y utilizar todos los servicios de Outlay pero con toda la seguridad de Circle, sin necesidad nunca de preocuparse por sus private keys.

<img src="https://i.ibb.co/58mHrGz/Screenshot-20231030-000129.png" width="32%"> <img src="https://i.ibb.co/d6Mr9Y1/Screenshot-20231030-000134.png" width="32%"> <img src="https://i.ibb.co/Fh5LryN/Screenshot-20231030-000839.png" width="32%"> 

Todas las wallets que creen los clientes estan protegidas completamente en la cloud de Circle, ademas de ser posible verificar todas las transaccions y balances de las mismas desde la interfaz de developer.

<img src="https://i.ibb.co/rscjLpp/vlcsnap-2023-10-30-00h24m17s561.png"> 

The technical implementation of this code is in the following link:

[CODE](./RN_APP/src/screens/ProgramableWallet/cpw.js)

De este codigo es importante resaltar la siguiente seccion:

    const entitySecretCiphertext = await new Promise(resolve =>
      fetch('https://YOURAPI/getEntitySecretCipherText', {
        method: 'GET',
        redirect: 'follow',
      })
        .then(response => response.text())
        .then(res => resolve(res))
        .catch(() => resolve('')),
    );
    // Por Razones de seguridad es necesario generar un Entity Secret Cipher Text para cada API Call, ya que esto evitara que se manipulen los fondos de las wallets sin permisos.
    const wallet = await new Promise(resolve => {
      var myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      myHeaders.append('Authorization', CIRCLE_BEARER);
      var raw = JSON.stringify({
        blockchains: [chainId],
        count: 1,
        entitySecretCiphertext,
        idempotencyKey: UUIDv4.generate(),
        walletSetId: WALLET_SET_ID,
      });

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      };

      fetch('https://api.circle.com/v1/w3s/developer/wallets', requestOptions)
        .then(response => response.json())
        .then(result => resolve(result.data.wallets))
        .catch(() => resolve(null));
    });

El esquema de como se realiza la creacion de una wallet es el siguiente almenos del lado del app, el esquema completo de creacion de la wallet esta en la documentacion oficial de Circle.

<img src="https://i.ibb.co/RTtf6gn/image.png"> 

https://developers.circle.com/w3s/docs/developer-controlled-create-your-first-wallet

En este caso el tipo de wallet que estamos creando es una Developer controlled wallet y estan en Testnet. Los servicios de circle y Outlay seguiremos mejorando progrsivamente hasta tener User controlled Wallets y Mainnet disponibles para todos nuestros usuarios.

### Direct Deposit:

This module is activated by default since it allows you to display, print (if you have a printer and the printing module is turned on) or save static QR codes to make payments to the POS without the need for hardware or the internet.

<img src="https://i.ibb.co/k8wZ3J6/Screenshot-20231013-203305.png" width="32%"> <img src="https://i.ibb.co/Kq3hvHM/Screenshot-20231013-203310.png" width="32%"> 

Todas las cuentas de Account Abstraction (Alchemy SDK) y Programmable Wallets (Circle Web3 services) apareceran automaticamente despues de ser creadas para poder empezar a usarlas de inmediato.

<img src="https://i.ibb.co/88fmsG4/vlcsnap-2023-10-30-00h17m09s997.png" width="32%"> <img src="https://i.ibb.co/bbr2MHp/vlcsnap-2023-10-30-00h13m08s023.png" width="32%"> <img src="https://i.ibb.co/VLyP1VH/vlcsnap-2023-10-30-00h16m53s235.png" width="32%"> 

We can see that the QR can be easily printed if you have a POS with a ticket printer without any special configuration.

<img src="https://i.ibb.co/cTk5Z0v/Screenshot-20231013-203346.png" width="32%"> <img src="https://i.ibb.co/GJthdS3/IMG-20231013-203515605.png" width="34%">

The technical implementation of this code is in the following link:

[CODE](./RN_APP/src/screens/DirectTransfer/directTransfer.js)

### Stripe:

This module allows, through a simple interface, to generate a payment link with a credit or debit card to obtain the items that the seller preconfigures in the Stripe interface, above all you can see your balance and transactions.

 <img src="https://i.ibb.co/tCWmqHT/Screenshot-20231013-215756.png" width="32%"> <img src="https://i.ibb.co/r0GQKC3/Screenshot-20231013-215102.png" width="32%"> <img src="https://i.ibb.co/bKPPS0V/Screenshot-20231013-215118.png" width="32%">

The technical implementation of this code is in the following link:

[CODE](./RN_APP/src/screens/TradiFi/tradifi.js)

Here is a screenshot of our stripe interface with the DEMO products available.

<img src="https://i.ibb.co/BCxZrkq/image.png">

NOTE: This module is only working in TEST mode, due to traditional finance restrictions of requiring KYC, however it will soon be available as well.

### Wormhole:

The purpose of this module is to receive payments from any of the EVMs compatible with the Token Bridge protocol to Solana and to be able to send native tokens to their respective Wrapped tokens on the Solana network, which can easily be swapped for USDC.

<img src="https://i.ibb.co/xC7MsbR/Screenshot-20231013-213618.png" width="32%"> <img src="https://i.ibb.co/ZfXRqHR/Screenshot-20231013-213625.png" width="32%"> <img src="https://i.ibb.co/9V58KKx/Screenshot-20231013-213705.png" width="32%">

In order to make the payment from an EVM wallet, we will use WalletConnectv2, in order to make a payment as simple as Solana Pay payments.

<img src="https://i.ibb.co/w6nkFMz/Screenshot-20231013-213648.png" width="32%"> <img src="https://i.ibb.co/Q8NV9Fb/Screenshot-20231013-213658.png" width="32%"> <img src="https://i.ibb.co/tBqHn99/Screenshot-20231013-213711.png" width="32%">

Compatibility in transfers between EVMs is fully integrated, in addition to giving the business the option of having the client pay the redeem fee.

<img src="https://i.ibb.co/mhM4qT3/Screenshot-20231022-231115.png" width="32%"> <img src="https://i.ibb.co/xHG0jYR/Screenshot-20231022-231054.png" width="32%"> <img src="https://i.ibb.co/XL5bQ1k/Screenshot-20231022-231104.png" width="32%">

The technical implementation of this code is in the following link:

[CODE](./RN_APP/src/screens/Wormhole/wormholeComponent.js)

The important part of the code to perform the transaction in the EVM is as follows.

    CODE

### Transfer from POS:

This POS function is only active when the wallet was created, imported. This function allows us to send money received at the POS to any public key we want, whether over the Solana or EVM network. This opens by double clicking on the network and asset that we want to send.

<img src="https://i.ibb.co/Htm1QGS/Screenshot-20231013-220451.png" width="32%"> <img src="https://i.ibb.co/T2N2ksf/Screenshot-20231013-220446.png" width="32%">

In this example we will make a USDC transfer with a wallet connected from seedvault, once again showing our complete compatibility with SAGA.

<img src="https://i.ibb.co/D1B9c5S/vlcsnap-2023-10-13-22h10m18s627.png" width="32%"> <img src="https://i.ibb.co/LdzQR1L/Screenshot-20231013-220541.png" width="32%"> <img src="https://i.ibb.co/KsbtPTy/Screenshot-20231013-220613.png" width="32%">

The technical implementation of this code is in the following link:

Solana:
[CODE](./RN_APP/src/screens/TransferSOL/transferSOL.js)

EVM:
[CODE](./RN_APP/src/screens/TransferETH/transferETH.js)

### Print:

The function of the print module is to enable print receipts, completed transactions and static QRs. For this module we strongly recommend having hardware that has a printer included for receipts.

<img src="https://i.ibb.co/yRPBCY7/Screenshot-20231013-215458.png" width="32%"> <img src="https://i.ibb.co/Kq3hvHM/Screenshot-20231013-203310.png" width="32%"> <img src="https://i.ibb.co/GJthdS3/IMG-20231013-203515605.png" width="32%">

The technical implementation of this code is throughout the app, however the code segment that is responsible for printing the ticket is as follows:

    await this.getDataURL();
    const results = await RNHTMLtoPDF.convert({
        html: `
    <div style="text-align: center;">
        <img src='${logo}' width="400px"></img>
        <h1 style="font-size: 3rem;">--------- Original Reciept ---------</h1>
        <h1 style="font-size: 3rem;">Date: ${new Date().toLocaleDateString()}</h1>
        <h1 style="font-size: 3rem;">Type: Solana Pay</h1>
        <h1 style="font-size: 3rem;">------------------ • ------------------</h1>
        <h1 style="font-size: 3rem;">Transaction</h1>
        <h1 style="font-size: 3rem;">Amount: ${
            this.state.amount
        } ${this.state.outputTokenSelected.label}</h1>
        <h1 style="font-size: 3rem;">------------------ • ------------------</h1>
        <img src='${this.state.printData}'></img>
    </div>
    `,
        fileName: 'print',
        base64: true,
    });
    await RNPrint.print({filePath: results.filePath});
