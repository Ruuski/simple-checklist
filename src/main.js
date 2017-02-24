import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  TouchableOpacity,
  ToastAndroid,
  AsyncStorage
} from 'react-native'

class Main extends React.Component {

  constructor() {
    super();
    this.state = {
      tasks: [],
      completedTasks: [],
      task: ''
    }
  }

  componentWillMount() {
    this.loadInitialState();
  }

  /* loads in saved tasks and completedTasks
   */
  async loadInitialState() {
    try {
      let tasks = await AsyncStorage.getItem('tasks');
      if (tasks != null) {
        this.setState({tasks: JSON.parse(tasks)});
        console.log('set tasks');
      }
    } catch (error) {
      console.log('AsyncStorage error: ', error.message);
    }

    try {
      let completedTasks = await AsyncStorage.getItem('completedTasks');
      if (completedTasks != null) {
        this.setState({completedTasks: JSON.parse(completedTasks)});
        console.log('set completedTasks');
      }
    } catch (error) {
      console.log('AsyncStorage error: ', error.message);
    }
  };

  /* updates item key with data using AsyncStorage
   */
  async setStorage(key, data) {
    console.log('starting async storage on', key)
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
      console.log('AsyncStorage', key, 'successful');
    } catch (error) {
      console.log('AsyncStorage error: ', error);
    }
  }

  /* render list of tasks in state.tasks to screen along with a button
   * button to move task to completedTasks
   */
  renderList(tasks) {
    return (
      tasks.map((task, index) => {
        return (
          <View key={task} style={styles.task}>
            <Text style={styles.text}>
              {task}
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={()=>this.completeTask(index)}
            >
              <Text style={styles.checkmarkText}>&#10003;</Text>
            </TouchableOpacity>
          </View>
        )
      })
    )
  }

  /* render list of tasks marked completed by user along with button to
   * remove task from completedTasks
   */
  renderCompleted(completedTasks) {
    return (
      completedTasks.map((task, index) => {
        return (
          <View key={task} style={styles.task}>
            <Text style={styles.completedText}>
              {task}
            </Text>
            <TouchableOpacity style={styles.button}
              onPress={()=>this.deleteTask(index)}
            >
              <Text style={styles.crossmarkText}>&#10060;</Text>
            </TouchableOpacity>
          </View>
        )
      })
    )
  }


  /* add task to array from task (text box)
   */
  addTask() {
    let task = this.state.task.trim();
    if (task == '') {
      this.clearText('inputTask');
      return;
    }
    if (this.state.tasks.includes(task)) {
      ToastAndroid.show('Duplicate item', ToastAndroid.SHORT);
      return;
    }
    let tasks = this.state.tasks.concat([task]);
    this.setState({tasks}, ()=> {
      this.setStorage('tasks', this.state.tasks);
    })
    this.clearText('inputTask');
  }

  /* mark a task from tasks as completed and move it to completedTasks
   */
  completeTask(index) {
    let tasks = this.state.tasks.slice();
    tasks.splice(index, 1);

    let completedTasks = this.state.completedTasks.slice();
    completedTasks = completedTasks.concat([this.state.tasks[index]]);

    this.setState({
      completedTasks,
      tasks
    }, ()=> {
      this.setStorage('tasks', this.state.tasks);
      this.setStorage('completedTasks', this.state.completedTasks);
    })
  }

  /* remove a task from completedTasks
   */
  deleteTask(index) {
    let completedTasks = this.state.completedTasks.slice();
    completedTasks.splice(index, 1);
    this.setState({completedTasks}, ()=> {
      this.setStorage('completedTasks', this.state.completedTasks);
    });
  }

  /* set text in textinput to ''
   */
  clearText(fieldName) {
    this.refs[fieldName].setNativeProps({text: ''});
  }

  render() {
    return (
      <View style={styles.container} key='main'>
        <Text style={styles.title}>
          Simple: Checklist
        </Text>
        <TextInput
          underlineColorAndroid='rgba(0,0,0,0)'
          ref={'inputTask'}
          style={styles.input}
          placeholder='Add something..'
          onChangeText={(text) => {
            this.setState({task: text});
          }}
          onSubmitEditing={
            ()=>this.addTask()
          }
        />
        <ScrollView >
          {this.renderList(this.state.tasks)}
          {this.renderCompleted(this.state.completedTasks)}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FDF3E7'
    },
    task: {
      flex: 1,
      borderBottomWidth: 1,
      borderColor: 'black',
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: 10,
      paddingBottom: 10

    },
    completedText: {
      flex: 12,
      fontStyle: 'italic',
      fontSize: 20
    },
    button: {
      flex: 1,
      paddingLeft: 20,
    },
    checkmarkText: {
      color: 'green',
      fontSize: 30
    },
    crossmarkText: {
      color: 'red',
      fontSize: 22
    },
    text: {
      flex: 12,
      color: 'black',
      fontSize: 20
    },
    title: {
      textAlign: 'center',
      margin: 30,
      fontSize: 30
    },
    input: {
      height: 60,
      borderWidth: 1,
      borderRadius: 5,
      borderColor: 'black',
      textAlign: 'center',
      margin: 10,
      fontSize: 20
    }
})

export default Main;
