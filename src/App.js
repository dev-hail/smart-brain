import React, { Component } from 'react'
import Navigation from './Components/Navigation/Navigation'
import Logo from './Components/Logo/Logo'
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm.js'
import Rank from './Components/Rank/Rank'
import FaceRecognition from './Components/FaceRecognition/FaceRecognition.js'
import SignIn from './Components/SignIn/SignIn.js'
import Register from './Components/Register/Register.js'
import './App.css';

const USER_ID = 'clarifai';
const PAT = '16e186681b3a414a8b3f6391b9be3144';
const APP_ID = 'main';
const MODEL_ID = 'face-detection';
const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';


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

  async fetchUrl(url) {
      let response = await fetch(url);
      console.log(response.headers.get("content-type"))
      if (response.ok) {
        
        return true
      }
        
      return false
  }

  onButtonSubmit = () => {
    var input = document.getElementById("inputImageF")
    var response = this.fetchUrl(input)
    console.log(response)
    if (!input.value.length || !response) {
        alert('Fetch Failed. Check URL again.');
        return;
    } else {
      this.setState({imageUrl: this.state.input});
      const IMAGE_URL = this.state.input
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
                'Authorization': 'Key ' + PAT
            },
            body: raw
        };
        fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs", requestOptions)
            .then(response => response.json())
            .then(response => {
              try  {
                this.displayFaceBox(this.calculateFaceLocation(response))
              } catch {
                alert("Fetch Failed. Check URL Again.")
                return false
              }
              fetch('https://smart-brain-api-phi.vercel.app/image', {
                method: 'put',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                  id: this.state.user.id
                })
              })
                .then(response => response.json())
                .then(count => {
                  this.setState(Object.assign(this.state.user, { entries: count}))
                })
                .catch(console.log)
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
