import BN from 'bn.js';
import {
  FieldAction,
  TypeKeys as TK,
  SwapTokenToEtherAction,
  SwapEtherToTokenAction,
  SwapTokenToTokenAction,
  SwapAction,
  ResetTransactionSuccessfulAction
} from 'actions/transaction';
import { Reducer } from 'redux';
import { State } from './typings';
import { gasPriceToBase } from 'libs/units';

const INITIAL_STATE: State = {
  to: { raw: '', value: null },
  data: { raw: '', value: null },
  nonce: { raw: '', value: null },
  value: { raw: '', value: null },
  gasLimit: { raw: '21000', value: new BN(21000) },
  gasPrice: { raw: '20', value: gasPriceToBase(20) }
};

const updateField = (key: keyof State): Reducer<State> => (state: State, action: FieldAction) => ({
  ...state,
  [key]: { ...state[key], ...action.payload }
});

const tokenToEther = (
  state: State,
  { payload: { decimal: _, ...rest } }: SwapTokenToEtherAction
): State => ({
  ...state,
  ...rest,
  data: INITIAL_STATE.data
});

const etherToToken = (
  state: State,
  { payload: { decimal: _, tokenTo: __, tokenValue: ___, ...rest } }: SwapEtherToTokenAction
): State => ({
  ...state,
  ...rest,
  value: INITIAL_STATE.value
});

const tokenToToken = (
  state: State,
  { payload: { decimal: _, tokenValue: __, ...rest } }: SwapTokenToTokenAction
): State => ({ ...state, ...rest });

const reset = (
  state: State,
  { payload: { isContractInteraction } }: ResetTransactionSuccessfulAction
): State => ({
  ...INITIAL_STATE,
  ...(isContractInteraction ? { to: state.to } : {})
});

export const fields = (
  state: State = INITIAL_STATE,
  action: FieldAction | SwapAction | ResetTransactionSuccessfulAction
) => {
  switch (action.type) {
    case TK.TO_FIELD_SET:
      return updateField('to')(state, action);
    case TK.VALUE_FIELD_SET:
      return updateField('value')(state, action);
    case TK.DATA_FIELD_SET:
      return updateField('data')(state, action);
    case TK.GAS_LIMIT_FIELD_SET:
      return updateField('gasLimit')(state, action);
    case TK.NONCE_FIELD_SET:
      return updateField('nonce')(state, action);
    case TK.GAS_PRICE_FIELD_SET:
      return updateField('gasPrice')(state, action);
    case TK.TOKEN_TO_ETHER_SWAP:
      return tokenToEther(state, action);
    case TK.ETHER_TO_TOKEN_SWAP:
      return etherToToken(state, action);
    case TK.TOKEN_TO_TOKEN_SWAP:
      return tokenToToken(state, action);

    case TK.RESET_SUCCESSFUL:
      return state; //reset(state, action);
    default:
      return state;
  }
};
