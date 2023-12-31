import {Dimensions, Platform, StatusBar, StyleSheet} from 'react-native';

const header = 70;
const footer = 60;

export const main = Dimensions.get('window').height - (header + footer);

const screenHeight = Dimensions.get('screen').height;
const windowHeight = Dimensions.get('window').height;

export const StatusBarHeight = StatusBar.currentHeight;
export const NavigatorBarHeight = screenHeight - windowHeight;

const API = parseInt(Platform.constants['Release']);

const GlobalStyles = StyleSheet.create({
  // Globals Layout
  container: {
    // Global Style
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#222222',
  },
  header: {
    height: header,
    width: Dimensions.get('window').width,
  },
  main: {
    height: main,
    width: Dimensions.get('window').width,
  },
  footer: {
    width: Dimensions.get('window').width,
    height: footer,
  },
  // Pressables
  buttonStyle: {
    width: Dimensions.get('window').width * 0.9,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 5,
    borderTopLeftRadius: 5,
    backgroundColor: '#000000aa',
    padding: 8,
  },
  buttonTextStyle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  modulePressable: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: "space-evenly",
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00e599',
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 5,
    borderTopLeftRadius: 5,
    backgroundColor: '#000000aa',
    padding: 20,
    marginBottom: 20,
    width:"90%"
  },
  accountAbstraction: {
    display: 'flex',
    justifyContent: "space-evenly",
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00e599',
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 5,
    borderTopLeftRadius: 5,
    backgroundColor: '#000000aa',
    padding: 20,
    marginBottom: 20,
    width:"90%",
  },
  productImage: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00e599',
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 5,
    borderTopLeftRadius: 5,
    backgroundColor: 'white',
    width: Dimensions.get('screen').width * 0.6,
    height: Dimensions.get('screen').width * 0.6,
    borderRadius: 50,
    alignSelf: 'center',
    marginVertical:10
  },
  buttonRowLeftStyle: {
    width: Dimensions.get('window').width * 0.44,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 5,
    backgroundColor: '#000000aa',
    padding: 8,
    marginRight: Dimensions.get('window').width * 0.01,
  },
  buttonRowRightStyle: {
    width: Dimensions.get('window').width * 0.44,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 5,
    borderTopLeftRadius: 0,
    backgroundColor: '#000000aa',
    padding: 8,
    marginLeft: Dimensions.get('window').width * 0.01,
  },
  // Forms
  mnemonicBoxStyle: {
    backgroundColor: 'black',
    width: Dimensions.get('screen').width * 0.3,
    marginVertical: 6,
    alignItems: 'flex-start',
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 5,
    borderTopLeftRadius: 5,
    borderColor: 'white',
    borderWidth: 0.5,
  },
  //// Picker
  pickerInputStyle: {
    width: Dimensions.get('window').width * 0.9,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 5,
    borderTopLeftRadius: 5,
    backgroundColor: '#000000aa',
    padding: 8,
    alignSelf: 'center',
  },
  iconWrapperStyle: {
    backgroundColor: '#00000000',
    width: 0,
  },
  labelStyle: {
    backgroundColor: '#00000000',
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
    marginTop: 10,
    marginLeft: '2.5%',
    marginBottom: -10,
  },
  selectedValueStyle: {
    color: 'white',
    width: '80%',
    marginLeft: '10%',
    textAlign: 'center',
    fontSize: 24,
  },
  //// Text Input
  textInput: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
    marginTop: 10,
    marginLeft: '2.5%',
  },
  textInputStyle: {
    width: Dimensions.get('window').width * 0.9,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 5,
    borderTopLeftRadius: 5,
    backgroundColor: '#000000aa',
    padding: 8,
    fontSize: 24,
    color: 'white',
    alignSelf: 'center',
  },
  settingsIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00e599',
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 5,
    borderTopLeftRadius: 5,
    backgroundColor: '#000000aa',
    padding: 10,
  },
  // General
  title: {
    fontWeight: 'bold',
    fontSize: 32,
    color: '#fff',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  description: {
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    color: '#aaa',
    marginHorizontal: 10,
  },
  imageBackground: {
    width: Dimensions.get('window').width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  assetStyle: {
    width: Dimensions.get('window').width * 0.9,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    borderWidth: 2,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 5,
    borderTopLeftRadius: 5,
    backgroundColor: '#000000aa',
    padding: 8,
  },
  titleModule: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    marginHorizontal: 10,
  },
});

export default GlobalStyles;
