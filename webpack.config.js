const HtmlWebpackPlugin = require("html-webpack-plugin")
const InlineChunkHtmlPlugin = require("react-dev-utils/InlineChunkHtmlPlugin")
const path = require("path")
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin")

module.exports = (env, argv) => ({
   mode: argv.mode === "production" ? "production" : "development",

   // This is necessary because Figma's 'eval' works differently than normal eval
   devtool: argv.mode === "production" ? false : "inline-source-map",

   entry: {
      ui: "./core/figma.tsx", // The entry point for your UI code
      controller: "./src/controller.ts", // The entry point for your plugin code
   },

   module: {
      rules: [
         // Converts TypeScript code to JavaScript
         { test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/ },

         // -- For *.module.css files (CSS Modules) ---------------
         {
            test: /\.module\.css$/,
            use: [
               "style-loader",
               {
                  loader: "css-loader",
                  options: {
                     modules: true, // Enable CSS modules
                     importLoaders: 1, // Number of loaders before css-loader
                  },
               },
            ],
         },

         // -- For regular *.css files (not modules) --------------
         {
            test: /\.css$/,
            exclude: /\.module\.css$/,
            use: ["style-loader", "css-loader"],
         },

         // -- For *.module.scss files (SCSS Modules) -------------
         {
            test: /\.module\.scss$/,
            use: [
               "style-loader",
               {
                  loader: "css-loader",
                  options: {
                     modules: true, // Enable SCSS modules
                     importLoaders: 2, // postcss-loader + sass-loader (if you use postcss-loader)
                  },
               },
               "sass-loader",
            ],
         },

         // -- For regular *.scss files (not modules) -------------
         {
            test: /\.scss$/,
            exclude: /\.module\.scss$/,
            use: ["style-loader", "css-loader", "sass-loader"],
         },

         // Allows you to use "<%= require('./file.svg') %>" in your HTML code to get a data URI
         { test: /\.(png|jpg|gif|webp|svg)$/, loader: "url-loader" },
      ],
   },

   // Webpack tries these extensions for you if you omit the extension like "import './file'"
   resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js"],
      plugins: [new TsconfigPathsPlugin({ configFile: "./tsconfig.json" })],
   },

   output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "dist"), // Compile into a folder called "dist"
   },

   // Tells Webpack to generate "ui.html" and to inline "ui.ts" into it
   plugins: [
      new HtmlWebpackPlugin({
         template: "./core/index.html",
         filename: "ui.html",
         chunks: ["ui"],
         cache: false,
      }),
      new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/ui/]),
   ],
})
