module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-transform-export-namespace-from',
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          alias: {
            'react-native-maps': '@teovilla/react-native-web-maps',
            'lottie-react-native': 'react-native-web-lottie',
          },
        },
      ],
    ],
  };
};