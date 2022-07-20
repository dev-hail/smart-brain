import React, { Component } from 'react'
import Navigation from './Components/Navigation/Navigation'
import Logo from './Components/Logo/Logo'
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm.js'
import Rank from './Components/Rank/Rank'
import FaceRecognition from './Components/FaceRecognition/FaceRecognition.js'
import SignIn from './Components/SignIn/SignIn.js'
import Register from './Components/Register/Register.js'
import './App.css';

const USER_ID = 'hail';
const PAT = 'e8cde8984ebc4ccd89894929192334bb';
const APP_ID = '5353c5790f224a49820b8dd422499bb1';
const MODEL_ID = 'd02b4508df58432fbb84e800597b8959';

const initialState = {
      input:'',
      imageUrl:'',
      boxes:[],
      route:'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
    }
}

class App extends Component { 
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
     }})
  }

  calculateFaceLocation = (data) => {
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return data.outputs[0].data.regions.map(face => {
      const clarifaiFace = face.region_info.bounding_box;
      return {
        leftCol: clarifaiFace.left_col * width,
        topRow: clarifaiFace.top_row * height,
        rightCol: width - (clarifaiFace.right_col * width),
        bottomRow: height - (clarifaiFace.bottom_row * height)
      }
    });
  }

  displayFaceBox = (boxes) => {
    this.setState({boxes: boxes});
  }


  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    var input = document.getElementById("inputImageF")
    if (!input.value.length) {
            alert('empty input');
            return;
        } else {
        this.setState({ imageUrl: this.state.input})
        const IMAGE_URL = this.state.input;
        const raw = JSON.stringify({
            "user_app_id": {
                "user_id": USER_ID,
                "app_id": APP_ID
            },
            "inputs": [
                {
                    "data": {
                        "image": {
                            "url": IMAGE_URL
                        }
                    }
                }
            ]
        });
        const requestOptions = {
          method: 'POST',
          headers: {
              'Accept': 'application/json',
              'Authorization': 'Key ' + PAT,
      
            },
          body: raw
          }; 

        fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/outputs", requestOptions)
        .then(response => { if (!response.ok) {
          alert("please input a valid image link")
          throw new Error("HTTP status " + response.status);
        }
          return response.json()})
        .then(result => {
          if (result) {
            fetch('https://afro-thunder.herokuapp.com/image' , {
              method: 'put',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                id: this.state.user.id
          })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, {entries: count}))
            })
          }
          this.displayFaceBox(this.calculateFaceLocation(result))
        })
        .catch(error => console.log('error', error));
      }
    }

  onRouteChange = (route) => {
    if (route === 'signin' || route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn:true})
    }
    this.setState({route: route})

  }

  render() {
    const {isSignedIn, boxes, route, imageUrl} = this.state;
    return (
      <div className="App">
          <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
          { this.state.route === 'home'
            ? <div>
                <Logo />
                <Rank name={this.state.user.name} entries={this.state.user.entries}/>
                <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
                <FaceRecognition boxes={boxes} imageUrl={imageUrl}/>
            </div>
            :(
              route === 'signin'
              ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/> 
              : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
              )
        }
      </div> )
  }
}


export default App;
