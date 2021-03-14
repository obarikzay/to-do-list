import './App.css';
import React, { Component } from 'react'
import {firestore} from './firebase-config'


const docRef = firestore.doc("sample/test")

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      test: 0,
    }
  }

incrementCountOne = () => {
    this.setState({
      test: this.state.test + 1
    })

    docRef.set({
      testData: this.state.test
    }).then(value => {
      console.log("Saved");

    }).catch(error =>{

      console.log("Error", error);

    });
 
  }



render() {
  return (
    <button id="savebutton" onClick = {this.incrementCountOne}>Save buton</button>

    );
  }
} 