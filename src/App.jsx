import { Component } from 'preact';
import './App.css';

const appInfo = {
  name: 'SAFE Explorer',
  id: 'safe-explorer',
  vendor: 'MaidSafe.net Ltd',
  scope: null,
};

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: 'SAFE Explorer',
      appHandle: null,
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleExplore = this.handleExplore.bind(this);
  }

  componentDidMount() {
    console.log('Authorising app...');
    return window.safeApp.initialise(appInfo)
      .then(res => (this.setState({ appHandle: res })))
      .then(() => (console.log('App handle retrieved ', this.state.appHandle)))
      .then(() => window.safeApp.authorise(this.state.appHandle, {}))
      .then(authUri => window.safeApp.connectAuthorised(this.state.appHandle, authUri))
      .then(() => (console.log('Connected to the SAFE Network')));
  }

  handleInputChange(event) {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;

    this.setState({
      [name]: value,
    });
  }

  handleExplore() {
    console.log('Explore MD at: ', this.state.xorname);
    if (this.state.accessType === 'public') {
      return window.safeMutableData.newPublic(this.state.appHandle, this.state.xorname)
        .then(mdHandle => window.safeMutableData.getNameAndTag(mdHandle))
        .then(nametag => console.log('NAME:', nametag.name,buffer));
    } else {
      console.log('PRIVATE ', this.state.xorname);
      return window.safeMutableData.newPrivate(this.state.appHandle,
                                        this.state.xorname,
                                        this.state.typeTag,
                                        this.state.secEncKey,
                                        this.state.nonce);
    }
  }

  render() {
    return (
      <div className="App">
        <h1>Welcome to {this.state.name} {this.state.xorname}</h1>
        <span>Enter the MutableData information and click the explore button
        to retrieve the entries from the SAFE Network.
        </span>
        <div>
          MutableData XoR name/address:
          <input name="xorname" type="text" onChange={this.handleInputChange} />
        </div>
        <div>
          <input
            type="radio"
            name="accessType"
            value="public"
            onClick={this.handleInputChange}
          /> Public
          <input
            type="radio"
            name="accessType"
            value="private"
            onClick={this.handleInputChange}
          /> Private
        </div>
        <div>
          MutableData secret encryption key:
          <input
            disabled={this.state.accessType === 'public'}
            name="secEncKey"
            type="text"
            onChange={this.handleInputChange}
          />
        </div>
        <div>
          MutableData encryption nonce:
          <input
            disabled={this.state.accessType === 'public'}
            name="nonce"
            type="text"
            onChange={this.handleInputChange}
          />
        </div>
        <div>
          MutableData type tag:
          <input
            disabled={this.state.accessType === 'public'}
            name="typeTag"
            type="text"
            onChange={this.handleInputChange}
          />
        </div>
        <div>
          <button name="explore" type="button" onClick={this.handleExplore} >
          Explore
          </button>
        </div>
      </div>
    );
  }
}
