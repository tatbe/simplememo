/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
} from 'react-native';
import Realm from 'realm'
import Dimensions from 'Dimensions'


var { width, height, scale } = Dimensions.get('window');
console.log('w:'+ width +' h:'+ height +' s:'+ scale);

console.ignoredYellowBox = ['Remote debugger'];
const keyPreference = "MemoData";
const Preference = {
  name: keyPreference,
  primaryKey: 'id', // プライマリキーを指定
  properties: {
      id: 'int', // プライマリキーとして扱う (int型)
      text: 'string', // 任意のプロパティ (string型)
      date: 'date',
  }
};

const realmPreference = () => {
  const realm = new Realm({
      schema: [Preference] // スキーマを設定
  });

  // if (realm.objects(keyPreference).length == 0) {
  //     // 初回はデータがないのでレコードを1つ作る
  //     realm.write(() => {
  //         realm.create(keyPreference, {
  //             id: 0,
  //             text: '',
  //             date: new Date,

  //         });
  //     });
  // }

  return realm;
};

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      list: [],
    }
  }
  componentWillMount(){ // ライフサイクル
    console.log('lifecycle - componentWillMount');
    this._getList();
  }
  componentDidUpdate(){ // ライフサイクル
    console.log('lifecycle - componentDidMount');
  }
  keyboardWillShow(e) { // キーボード表示
    this.flatList.scrollToEnd();
  }
  _onChangeText = (text) => { // テキストエリア変化時に呼ばれる
    console.log('_onChangeText()')
    this.setState({text: text});
  }

  _addList = () => { // テキスト追加時に呼ばれる
    console.log('_addList()');
    const text = this.state.text;

    // 型の確認
    if (typeof text !== 'string') {
      return;
    }

    const realm = realmPreference();
    // memo取得
    const memo = realm.objects(keyPreference);

    // 追加するメモのidを設定
    var id = memo.length;

    // レコード追加
    realm.write(() => {
        realm.create(keyPreference, {
            id: id,
            text: text,
            date: new Date,
        }, true);
    });
    this._getList();
    this.flatList.scrollToEnd();
    // inputのテキストを削除
    this._textInput.setNativeProps({text: ''});
  }

  _getList = () => { // データベースから全メモ取得
    console.log('_getList()');
    const realm = realmPreference();
    const memo = realm.objects(keyPreference);
    this.setState({
      list: memo,
    });
  }

  render() { // 描画
    const {
      text,
      list,
    } = this.state;

    return (
      <View style={styles.container}>
        <KeyboardAvoidingView behavior='position'>
          <View style={{flex:1}}>
            <FlatList style={styles.list}
              ref={(r) => {
                this.flatList = r;
              }}
              keyExtractor={(item, index) => item.id}
              data={this.state.list}
              renderItem={({item}) => 
              <View style={styles.memoBox}>
                <Text>{item.text}</Text>
              </View>
              }
            />
          </View>
          <View style={styles.inputBox}>
            <TextInput
              ref={component => this._textInput = component}
              onChangeText = {this._onChangeText}
              style = {styles.input}
              editable = {true}
              multiline
              blurOnSubmit = {false}
            />
            <View style={styles.buttonBox}>
              <TouchableOpacity style={styles.button}
                  onPress={this._addList}
                >
                  <Text>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
  },
  list: {
    width: width,
  },
  memoBox: {
    borderColor: 'gray',
    borderWidth: 1,
    padding: 5,
    margin: 5,
  },
  inputBox: {
    flexDirection: 'row',
    padding: 5,
  },
  input: {
    flex: 1,
    borderColor: 'gray',
    borderWidth: 1,
    marginRight: 5,
  },
  buttonBox:{

  },
  button:{
    borderColor: 'gray',
    borderWidth: 1,
    padding: 5,
  }
});