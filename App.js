import React from 'react';
import moment from 'moment';

import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  FlatList,
  Linking,
  TouchableOpacity
} from 'react-native';
import { Card, Button, Icon , SearchBar} from 'react-native-elements';
import { AntDesign } from 'react-native-vector-icons';

// extraData: update items in FlatList 308c92e816ee407fa1e47efb3c287ccb
// onEndReached: limit items in views

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      articles: [],
      pageNumber:1,
      lastPageReached: false,
      value:'',
    };
    this.arrayholder = [];
  }

  componentDidMount() {
    this.getNews();
  }

  searchFilterFunction = text => {
    this.setState({
      value: text,
    });

    const newData = this.arrayholder.filter(item => {
      const itemData = `${item.title.toUpperCase()} `;
      const textData = text.toUpperCase();

      return itemData.indexOf(textData) > -1;
    });
    this.setState({
      articles: newData,
    });
  };

  renderHeader = () => {
    return (
      <SearchBar
        placeholder="Type Here..."
        round
        inputContainerStyle={{backgroundColor: 'white', borderColor:'black', borderBottomWidth:1,borderWidth:1}}
        containerStyle={{backgroundColor: 'white', borderBottomColor: 'transparent',
        borderTopColor: 'transparent', width:"100%"}}
        onChangeText={text => this.searchFilterFunction(text)}
        autoCorrect={false}
        value={this.state.value}
      />
    );
  };

  getNews = async () => {
    try {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=us&apiKey=308c92e816ee407fa1e47efb3c287ccb&page=${this.state.pageNumber}`
      );
      const jsonData = await response.json();
      console.log(jsonData);

      if (jsonData.status ==='error'){
        throw "Het load duoc!"
      }

      const hasMoreArticles = jsonData.articles.length > 0;
      if (hasMoreArticles) {

      const newArticleList = filterForUniqueArticles(
        this.state.articles.concat(jsonData.articles)
      );
      this.setState({
        loading: false,
        articles: newArticleList,
        hasErrored: false,
        pageNumber:this.state.pageNumber+1,
      });
      this.arrayholder = newArticleList;
    }
    else {
      this.setState({lastPageReached: true});
    }



    } catch{
      this.setState({ hasErrored: true });
    }
    this.setState({ loading: false });
  };

  onPress = url => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log(`Don't know how to open URL: ${url}`);
      }
    });
  };

  renderArticleItem = ({ item }) => {
    return (
      <Card
        image={{ uri: item.urlToImage }}
        title={item.title}
        key={item.title}
        containerStyle={styles.cardContainer}>
          <TouchableOpacity onPress={() => this.onPress(item.url)}>
            <View style={styles.row}>
              <Text style={styles.label}>Source</Text>
              <Text style={styles.info}>{item.source.name}</Text>
            </View>
            <Text numberOfLines={2} style={{ marginBottom: 10 }}>{item.content}</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Published</Text>
              <Text style={styles.info}>
                {moment(item.publishedAt).format('LLL')}
              </Text>
            </View>
          </TouchableOpacity>
      </Card>
    );
  }

  render() {
    if (this.state.loading) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }
    if (this.state.hasErrored) {
      return (
        <View style={styles.container}>
          <Text>Error =(</Text>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <View style = {styles.row}>
          <Text style = {styles.label}>Articles Count:</Text>
          <Text style={styles.info}>{this.state.articles.length}</Text>
        </View>
        <FlatList
          data={this.state.articles}
          renderItem={this.renderArticleItem}
          keyExtractor={(item) => item.title.toString()}
          ListFooterComponent={
            this.state.value==='' ? 
            this.state.lastPageReached ? 
            <Card containerStyle={styles.footerCard}>
              <View style={{ flexDirection: 'row', justifyContent:'center' }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: '300',
                  color: 'gray',
                  marginLeft: 20
                }}>
                  No more articles
                </Text>
              </View>
            </Card>
            :
            <TouchableOpacity onPress={this.getNews}>
            <Card containerStyle={styles.footerCard}>
              <View style={{ flexDirection: 'row' }}>
                <AntDesign
                  name='arrowright'
                  size={25}
                  color='gray'
                ></AntDesign>
                <Text style={{
                  fontSize: 20,
                  fontWeight: '300',
                  color: 'gray',
                  marginLeft: 20
                }}>
                  More stories
                </Text>
              </View>
            </Card>

            </TouchableOpacity>
            :
            <Text></Text>
          }
          ListHeaderComponent={this.renderHeader}
          stickyHeaderIndices={[0]}
        />
      </View>
    );
  }
}
const filterForUniqueArticles = arr => {
  const cleaned = [];
  arr.forEach(itm => {
    let unique = true;
    cleaned.forEach(itm2 => {
      const isEqual = JSON.stringify(itm) === JSON.stringify(itm2);
      if (isEqual) unique = false;
    });
    if (unique) cleaned.push(itm);
  });
  return cleaned;
};
const styles = StyleSheet.create({
  containerFlex: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  container: {
    flex: 1,
    marginTop: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
    justifyContent: 'center'
  },
  cardContainer: {
    borderRadius: 10,
    shadowColor: "#ff0000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  header: {
    height: 30,
    width: '100%',
    backgroundColor: 'pink'
  },
  row: {
    flexDirection: 'row'
  },
  label: {
    fontSize: 16,
    color: 'black',
    marginRight: 10,
    fontWeight: 'bold'
  },
  info: {
    fontSize: 16,
    color: 'gray'
  },
  hearderCard: {
    flexDirection: 'row',
    width: '90%',
    alignItems: 'center',
    height: 40,
    borderRadius: 20,
    shadowColor: "#ff0000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.20,
    shadowRadius: 3,
    elevation: 4,
    marginBottom: 10
  },
  textHeader:{
    fontSize: 15,
    fontWeight: '200',
    color: 'gray',
    marginLeft: 20
  },
  footerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 10,
    shadowColor: "#ff0000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
    marginBottom: 20
  },
});
