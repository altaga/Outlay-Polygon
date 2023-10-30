import { StripeAPI } from '@env';
import React, { Component } from 'react';
import reactAutobind from 'react-autobind';
import {
  Dimensions,
  Image,
  ImageBackground,
  Linking,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Picker } from 'react-native-form-component';
import backImage from '../../assets/backgrounds/backgroundModules.png';
import GlobalStyles, { StatusBarHeight } from '../../styles/styles';
import ContextModule from '../../utils/contextModule';
import KeyboardAwareScrollViewComponent from '../../utils/keyboardAvoid';
import { customerTest } from '../Main/tabs/balancesFiat';

const baseStripeTransfer = {
  flag: false,
  loading: false,
  link: '',
  quantity: '',
  currency: 'usd',
  automatic_payment_methods: true,
  description: 'Hello World',
  customer: customerTest,
  products: [
    {
      name: '',
      default_price: '',
    },
  ],
  productSelected: {},
};

class StripeTransfer extends Component {
  constructor(props) {
    super(props);
    this.state = baseStripeTransfer;
    reactAutobind(this);
    this.svg = null;
    this.controller = new AbortController();
  }

  static contextType = ContextModule;

  async getProducts() {
    return new Promise(resolve => {
      var myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
      myHeaders.append('Authorization', `${StripeAPI}`);

      const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
        signal: this.controller.signal,
      };
      fetch('https://api.stripe.com/v1/products?limit=3', requestOptions)
        .then(response => response.json())
        .then(result => resolve(result.data))
        .catch(() => resolve([]));
    });
  }

  async createPaymentLink() {
    return new Promise(resolve => {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
      myHeaders.append('Authorization', `${StripeAPI}`);

      const details = {
        'line_items[0][price]':
          this.state.productSelected.value ?? 'price_1NzvG3AsgJjilmmdu76dfdPI',
        'line_items[0][quantity]': parseInt(this.state.quantity),
        currency: 'usd',
      };

      let formBody = [];
      for (let property in details) {
        const encodedKey = encodeURIComponent(property);
        const encodedValue = encodeURIComponent(details[property]);
        formBody.push(encodedKey + '=' + encodedValue);
      }
      formBody = formBody.join('&');
      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formBody,
        redirect: 'follow',
      };

      fetch('https://api.stripe.com/v1/payment_links', requestOptions)
        .then(response => response.json())
        .then(result => resolve(result.url))
        .catch(() => resolve(''));
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

  async componentDidMount() {
    this.props.navigation.addListener('focus', async () => {
      console.log(this.props.route.name);
      this.setState(baseStripeTransfer);
      const products = await this.getProducts();
      console.log(products);
      this.setState({
        products,
      });
    });
    this.props.navigation.addListener('blur', async () => {
      this.setState(baseStripeTransfer);
      this.controller.abort();
    });
  }

  componentWillUnmount() {
    this.controller.abort();
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
            <View
              style={{
                justifyContent: 'space-around',
                height: Dimensions.get('window').height - StatusBarHeight,
              }}>
              <View>
                <Text style={[GlobalStyles.textInput, {marginTop: 0}]}>
                  Product Selection
                </Text>
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
                  // Selected
                  selectedValueStyle={[GlobalStyles.selectedValueStyle]}
                  selectedValue={this.state.productSelected.value}
                  items={this.state.products.map((item, index) => ({
                    ...item,
                    label: item.name,
                    value: item.default_price,
                  }))}
                  placeholder="Select Product"
                  onSelection={productSelected => {
                    console.log(productSelected);
                    this.setState({
                      productSelected,
                    });
                  }}
                  type="modal"
                />
                <Text style={[GlobalStyles.textInput, {marginTop: 0}]}>
                  Quantity
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
                  value={this.state.quantity}
                  onChangeText={quantity => this.setState({quantity})}
                  textAlign="center"
                />
                <Text
                  style={[
                    GlobalStyles.textInput,
                    {marginTop: 0, textAlign: 'center'},
                  ]}>
                  Product
                </Text>
                {this.state.productSelected?.images ? (
                  <Image
                    resizeMode="contain"
                    source={{
                      uri: this.state.productSelected.images[0],
                    }}
                    alt="Product"
                    style={[GlobalStyles.productImage]}
                  />
                ) : (
                  <View
                    style={{
                      height: Dimensions.get('screen').width * 0.6,
                    }}
                  />
                )}
              </View>
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
                  if (this.state.flag) {
                    Linking.openURL(this.state.link);
                  } else {
                    await this.setStateAsync({loading: true});
                    const link = await this.createPaymentLink();
                    await this.setStateAsync({
                      loading: false,
                      flag: link !== '' ? true : false,
                      link: link !== '' ? link : '',
                    });
                  }
                }}>
                <Text style={[GlobalStyles.buttonTextStyle]}>
                  {this.state.flag ? 'Open Link' : 'Create Payment Link'}
                </Text>
              </Pressable>
            </View>
          </KeyboardAwareScrollViewComponent>
        </ImageBackground>
      </SafeAreaView>
    );
  }
}

export default StripeTransfer;
