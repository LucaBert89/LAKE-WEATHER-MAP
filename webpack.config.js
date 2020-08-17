const path = require("path");
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require(`html-webpack-plugin`);
module.exports = {
    entry:"./script.js",
    mode:"production",
    output:{
        filename:"main.js",
        path :path.resolve(__dirname,"build")
    },
    plugins: [
        new Dotenv(),
        new HtmlWebpackPlugin({
            template: path.resolve(`./index.html`)
        })
      ]
  };