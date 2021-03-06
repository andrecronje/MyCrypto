import {
  TChangeLanguage,
  TChangeNodeIntent,
  TChangeNodeIntentOneTime,
  TAddCustomNode,
  TRemoveCustomNode,
  TAddCustomNetwork,
  AddCustomNodeAction,
  changeLanguage,
  changeNodeIntent,
  changeNodeIntentOneTime,
  addCustomNode,
  removeCustomNode,
  addCustomNetwork
} from 'actions/config';
import logo from 'assets/images/cryptocurve-logo-white2.png';
import { OldDropDown, ColorDropdown } from 'components/ui';
import React, { Component } from 'react';
import classnames from 'classnames';
import { Link } from 'react-router-dom';
import { TSetGasPriceField, setGasPriceField } from 'actions/transaction';
import { ANNOUNCEMENT_MESSAGE, ANNOUNCEMENT_TYPE, languages } from 'config';
import Navigation from './components/Navigation';
import Node from './components/Node';
import NavigationLink from 'components/NavigationLink';
import OnlineStatus from './components/OnlineStatus';
import CustomNodeModal from 'components/CustomNodeModal';
import { getKeyByValue } from 'utils/helpers';
import { NodeConfig } from 'types/node';
import './index.scss';
import './components/Navigation.scss';
import { AppState } from 'reducers';
import {
  getOffline,
  isNodeChanging,
  getLanguageSelection,
  getNodeId,
  getNodeConfig,
  CustomNodeOption,
  NodeOption,
  getNodeOptions,
  getNetworkConfig,
  isStaticNodeId
} from 'selectors/config';
import { NetworkConfig } from 'types/network';
import { connect, MapStateToProps } from 'react-redux';
import translate from 'translations';

interface OwnProps {
  networkParam: string | null;
}

interface DispatchProps {
  changeLanguage: TChangeLanguage;
  changeNodeIntent: TChangeNodeIntent;
  changeNodeIntentOneTime: TChangeNodeIntentOneTime;
  setGasPriceField: TSetGasPriceField;
  addCustomNode: TAddCustomNode;
  removeCustomNode: TRemoveCustomNode;
  addCustomNetwork: TAddCustomNetwork;
}

interface StateProps {
  shouldSetNodeFromQS: boolean;
  network: NetworkConfig;
  languageSelection: AppState['config']['meta']['languageSelection'];
  node: NodeConfig;
  nodeSelection: AppState['config']['nodes']['selectedNode']['nodeId'];
  isChangingNode: AppState['config']['nodes']['selectedNode']['pending'];
  isOffline: AppState['config']['meta']['offline'];
  nodeOptions: (CustomNodeOption | NodeOption)[];
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, AppState> = (
  state,
  { networkParam }
): StateProps => ({
  shouldSetNodeFromQS: !!(networkParam && isStaticNodeId(state, networkParam)),
  isOffline: getOffline(state),
  isChangingNode: isNodeChanging(state),
  languageSelection: getLanguageSelection(state),
  nodeSelection: getNodeId(state),
  node: getNodeConfig(state),
  nodeOptions: getNodeOptions(state),
  network: getNetworkConfig(state)
});

const mapDispatchToProps: DispatchProps = {
  setGasPriceField,
  changeLanguage,
  changeNodeIntent,
  changeNodeIntentOneTime,
  addCustomNode,
  removeCustomNode,
  addCustomNetwork
};

interface State {
  isAddingCustomNode: boolean;
}

type Props = OwnProps & StateProps & DispatchProps;

class Header extends Component<Props, State> {
  public state = {
    isAddingCustomNode: false
  };

  public componentDidMount() {
    this.attemptSetNodeFromQueryParameter();
  }

  public render() {
    const {
      languageSelection,
      node,
      nodeSelection,
      isChangingNode,
      isOffline,
      nodeOptions,
      network
    } = this.props;
    const { isAddingCustomNode } = this.state;
    const selectedLanguage = languageSelection;
    const LanguageDropDown = OldDropDown as new () => OldDropDown<typeof selectedLanguage>;
    const options = nodeOptions.map(n => {
      if (n.isCustom) {
        const { label, isCustom, id, ...rest } = n;
        return {
          ...rest,
          name: (
            <span>
              {label.network} - {label.nodeName} <small>(custom)</small>
            </span>
          ),
          onRemove: () => this.props.removeCustomNode({ id })
        };
      } else {
        const { label, isCustom, ...rest } = n;
        return {
          ...rest,
          name: (
            <span>
              {label.network} <small>({label.service})</small>
            </span>
          )
        };
      }
    });

    return (
      <div className="Header">
        <section className="Header-branding">
          <section className="Header-branding-inner container">
            <Link to="/" className="Header-branding-title" aria-label="Go to homepage">
              <img
                className="Header-branding-title-logo"
                src={logo}
                height="64px"
                width="245px"
                alt="CryptoCurve logo"
              />
            </Link>
            <div className="Header-branding-right" />
          </section>
        </section>
        <Navigation color={!network.isCustom && network.color} />

        <CustomNodeModal
          isOpen={isAddingCustomNode}
          addCustomNode={this.addCustomNode}
          handleClose={this.closeCustomNodeModal}
        />
      </div>
    );
  }

  public changeNodeWan = (value: string) => {
    this.props.changeNodeIntent('wan_auto');
  };
  public changeNodeEth = (value: string) => {
    this.props.changeNodeIntent('eth_auto');
  };

  public changeLanguage = (value: string) => {
    const key = getKeyByValue(languages, value);
    if (key) {
      this.props.changeLanguage(key);
    }
  };

  private openCustomNodeModal = () => {
    this.setState({ isAddingCustomNode: true });
  };

  private closeCustomNodeModal = () => {
    this.setState({ isAddingCustomNode: false });
  };

  private addCustomNode = (payload: AddCustomNodeAction['payload']) => {
    this.setState({ isAddingCustomNode: false });
    this.props.addCustomNode(payload);
  };

  private attemptSetNodeFromQueryParameter() {
    const { shouldSetNodeFromQS, networkParam } = this.props;
    if (shouldSetNodeFromQS) {
      this.props.changeNodeIntentOneTime(networkParam!);
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);
