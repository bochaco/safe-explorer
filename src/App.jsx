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
    this.fetchPublicMD = this.fetchPublicMD.bind(this);
    this.fetchPrivateMD = this.fetchPrivateMD.bind(this);
    this.handleExplore = this.handleExplore.bind(this);
  }

  async componentDidMount() {
    console.log('Authorising app...');
    const safeAppHandle = await window.safeApp.initialise(appInfo);
    this.setState({ appHandle: safeAppHandle });
    console.log('App handle retrieved ', safeAppHandle);
    const authUri = await window.safeApp.authorise(this.state.appHandle, {});
    await window.safeApp.connectAuthorised(safeAppHandle, authUri);
    console.log('Connected to the SAFE Network');
  }

  handleInputChange(event) {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;

    this.setState({
      [name]: value,
    });
  }

  async fetchPublicMD() {
    const mdHandle = await window.safeMutableData.newPublic(
      this.state.appHandle,
      this.state.xorname,
      this.state.typeTag,
    );
    const nameTag = await window.safeMutableData.getNameAndTag(mdHandle);
    const mdVersion = await window.safeMutableData.getVersion(mdHandle);
    const mdEntries = [];
    const entriesHandle = await window.safeMutableData.getEntries(mdHandle);
    await window.safeMutableDataEntries.forEach(entriesHandle, (k, v) => {
      mdEntries.push({
        key: k.toString(),
        value: v.buf.toString(),
        version: v.version,
      });
    });
    const permsHandle = await window.safeMutableData.getPermissions(mdHandle);
    const permSetsList = await window.safeMutableDataPermissions.listPermissionSets(permsHandle);
    const mdPermissions = permSetsList.map((permSet) => {
      // FIXME: const signKey = window.safeCryptoPubSignKey.getRaw(permSet.signKey);
      const signKey = '';
      return {
        perms: permSet.permSet,
        signKey,
      };
    });
    this.setState({
      mdName: nameTag.name.buffer.toString(),
      mdTypeTag: nameTag.type_tag,
      mdVersion,
      mdEntries,
      mdPermissions,
    });
  }

  async fetchPrivateMD() {
    console.log('PRIVATE ', this.state.xorname);
    await window.safeMutableData.newPrivate(
      this.state.appHandle,
      this.state.xorname,
      this.state.typeTag,
      this.state.secEncKey,
      this.state.nonce,
    );
  }

  handleExplore() {
    console.log('Exploring', this.state.accessType, 'MutableData with name/address:', this.state.xorname);
    if (this.state.accessType === 'public') {
      this.fetchPublicMD();
    } else {
      this.fetchPrivateMD();
    }
    console.log('MutableData\'s data:', this.state);
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
        <div>
          MutableData info:<br />
          name/address: {this.state.mdName}<br />
          type tag: {this.state.mdTypeTag}<br />
          version: {this.state.mdVersion}<br />
        </div>
        <div>
          MutableData permissions:<br />
          <ul>
            {this.state.mdPermissions &&
              this.state.mdPermissions.map(mdPerm => (
                <li>permissions: {Object.keys(mdPerm.perms).map(perm =>
                  <span><input type="checkbox" disabled checked={mdPerm.perms[perm]} />{perm}</span>)}<br />
                  sign key: {mdPerm.signKey}<br />
                </li>
              ))
            }
          </ul>
        </div>
        <div>
          MutableData entries:<br />
          <ul>
            {this.state.mdEntries &&
              this.state.mdEntries.map(mdEntry => (
                <li>key: {mdEntry.key}<br />
                  value: {mdEntry.value}<br />
                  version: {mdEntry.version}<br />
                </li>
              ))
            }
          </ul>
        </div>
      </div>
    );
  }
}
