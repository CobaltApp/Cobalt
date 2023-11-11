import React, { useEffect, useRef } from 'react';
import { View, Text } from 'react-native';

let tvScriptLoadingPromise;

export default function TradingViewWidget() {
  const onLoadScriptRef = useRef();

  useEffect(
    () => {
      onLoadScriptRef.current = createWidget;

      if (!tvScriptLoadingPromise) {
        tvScriptLoadingPromise = new Promise((resolve) => {
          const script = document.createElement('script');
          script.id = 'tradingview-widget-loading-script';
          script.src = 'https://s3.tradingview.com/tv.js';
          script.type = 'text/javascript';
          script.onload = resolve;

          document.head.appendChild(script);
        });
      }

      tvScriptLoadingPromise.then(() => onLoadScriptRef.current && onLoadScriptRef.current());

      return () => onLoadScriptRef.current = null;

      function createWidget() {
        if (document.getElementById('tradingview_17452') && 'TradingView' in window) {
          new window.TradingView.widget({
            autosize: true,
            symbol: "NASDAQ:AAPL",
            interval: "D",
            timezone: "Etc/UTC",
            theme: "light",
            style: "1",
            locale: "en",
            enable_publishing: false,
            allow_symbol_change: true,
            container_id: "tradingview_17452"
          });
        }
      }
    },
    []
  );

  return (
    <View className='tradingview-widget-container' style={{ height: "100%", width: "100%" }}>
      <View id='tradingview_17452' style={{ height: 700, width: 375 }} />
      <View className="tradingview-widget-copyright">
        <View href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
            <Text className="blue-text">Track all markets on TradingView</Text>
        </View>
      </View>
    </View>
  );
}
