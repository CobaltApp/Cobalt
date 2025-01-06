import * as React from 'react';
import { createNavigationContainerRef } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

export const navigationRef = React.createRef();

export function navigate(name, params) {
  navigationRef.current?.navigate(name, params);
}

export function getRoute() {
  const route = useRoute();
  return route;
}

export function dispatch(params) {
  navigationRef.current?.dispatch(params);
}

export function canGoBack() {
  return navigationRef.current?.canGoBack();
}

export function goBack() {
  navigationRef.current?.goBack();
}

// export function navigate(name, params) {
//   // if (navigationRef.isReady()) {
//     navigationRef.navigate(name, params);
//   //}
// }
