import React from 'react';

class SignIn extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			signInEmail: '',
			signInPassword: ''
		}
	}

	onEmailChange = (event) => {
		this.setState({signInEmail: event.target.value})		
	}

	onPasswordChange = (event) => {
		this.setState({signInPassword: event.target.value})
	}

	onSubmitSignIn = () => {
		const password = this.state.signInPassword || ""; 

		fetch('https://smart-brain-api-phi.vercel.app/signin', {
			method: 'post',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				email: this.state.signInEmail,
				password: password
			})
		})
		.then(response => {console.log(response); return response.json()})
		.then(user => {
			user = user[0]
	        if(user.id){ // does the user exist?
	          this.props.loadUser(user);
	          this.props.onRouteChange('home');
			} else {
				alert("username or password is wrong")
			}
		})
	}

	render() {
		const { onRouteChange } = this.props;
		return (
			<article className="br3 ba b--black-10 mv4 w-100 w-50-m w-25-l mw6 shadow-5 center">
				<main className="pa4 black-80">
				  <div className="measure ">
				    <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
				      <legend className="f1 fw6 ph0 mh0">Sign In</legend>
				      <div className="mt3">
				        <label className="db fw6 lh-copy f6" htmlFor="email-address">Email</label>
				        <input type="email"
				        className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" 
				        name="email-address" id="email-address"
				        onChange={this.onEmailChange}
				        />
				      </div>
				      <div className="mv3">
				        <label className="db fw6 lh-copy f6" htmlFor="password">Password</label>
				        <input 
				        className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" 
				        type="password" name="password"  
				        id="password"
				        onChange={this.onPasswordChange}
						defaultValue={""}
				        />
				      </div>
				    </fieldset>
				    <div className="">
				      <input 
				      onClick={this.onSubmitSignIn} 
				      className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib" 
				      type="submit" 
				      value="Sign in" 
				      />
				    </div>
				    <div className="lh-copy mt3">
				      <p onClick={() => onRouteChange('register')} href="#0" className="f6 link dim black db pointer">Register here</p>
				    </div>
				  </div>
				</main>
			</article>
		);
	}
} 

export default SignIn;
