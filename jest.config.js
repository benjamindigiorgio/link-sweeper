module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest",
    "node_modules/chalk/.+\\.(j|t)sx?$": "ts-jest",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!chalk/)", // Adjust this regex to match the specific module(s) causing issues
  ],

  testEnvironment: "node",
};
