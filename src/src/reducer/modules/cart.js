import {
  INIT_CART,
  ADD_ICON_TO_CART,
  DELETE_ICON_IN_CART,
  FETCH_CART_DETAIL,
  TOGGLE_CART_LIST_DISPLAY,
  DUMP_ICON_LOCALSTORAGE,
} from '../../constants/actionTypes';

const initialState = {
  iconsInLocalStorage: [],
  iconsInCart: [],
  isShowCartList: false,
  saveType: 'DEFAULT',
};

export default (state = initialState, action) => {
  switch (action.type) {
    case INIT_CART: {
      return {
        ...state,
        iconsInLocalStorage: action.payload,
      };
    }
    case ADD_ICON_TO_CART: {
      return {
        ...state,
        iconsInLocalStorage: action.payload,
      };
    }
    case DELETE_ICON_IN_CART: {
      return {
        ...state,
        iconsInLocalStorage: action.payload,
      };
    }
    case FETCH_CART_DETAIL: {
      return {
        ...state,
        iconsInCart: action.payload.data,
      };
    }
    case TOGGLE_CART_LIST_DISPLAY: {
      return {
        ...state,
        isShowCartList: action.payload.isShowCartList,
      };
    }
    case DUMP_ICON_LOCALSTORAGE: {
      return {
        ...state,
        iconsInCart: [],
        iconsInLocalStorage: [],
      };
    }
    default:
      return state;
  }
};
