import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './reducers/authReducer';
import wearCategoryReducer from './reducers/wearCategoryReducer';
import wearProductReducer from './reducers/wearProductReducer';
import wearCartReducer from './reducers/wearCartReducer';

import profileReducer from './reducers/profileReducer';
import orderReducer from './reducers/orderReducer';
import vendorReducer from './reducers/vendorReducer';
import vendorOfferReducer from './reducers/vendorOfferReducer';
import addressReducer from './reducers/addressReducer';
import reviewReducer from './reducers/reviewReducer';
import configReducer from './reducers/configReducer';
import menuReducer from './reducers/menuReducer';

const appReducer = combineReducers({
    auth: authReducer,
    wearCategory: wearCategoryReducer,
    wearProduct: wearProductReducer,
    wearCart: wearCartReducer,
    profile: profileReducer,
    order: orderReducer,
    vendor: vendorReducer,
    vendorOffer: vendorOfferReducer,
    address: addressReducer,
    review: reviewReducer,
    config: configReducer,
    menu: menuReducer,
});

const rootReducer = (state, action) => {
    if (action.type === 'auth/user_logout') {
        state = undefined;
    }
    return appReducer(state, action);
};

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false
    })
});

export default store;
