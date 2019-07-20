const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const entry = {
    app: "./src/app",
    effectWorker: "./src/EffectWorker",
}

const babelRule = {
    test: /\.(ts|js)x?$/,
    exclude: /node_modules/,
    loader: "babel-loader"
}

const shaderRule = {
    test: /\.(glsl|vert)$/,
    loader: 'ts-shader-loader'
}

const development = {
    entry: entry,
    output: {
        path: path.resolve(__dirname, "dev-dist"),
        filename: "[name].bundle.js"
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".json", ".glsl", ".vert"]
    },
    module: {
        rules: [babelRule, shaderRule]
    },
    plugins: [
        new CopyWebpackPlugin([{ from: ".", to: ".", ignore: ["!*.html"] }], { context: "static" }),
        new CopyWebpackPlugin([{ from: ".", to: "./css", ignore: ["!*.css"] }], { context: "static/css" }),
        new CopyWebpackPlugin([{ from: ".", to: "./js", ignore: ["!*.js"] }], { context: "static/js" }),
        new CopyWebpackPlugin([{ from: ".", to: "./assets", ignore: ["!*"] }], { context: "static/assets" })
    ],
    devtool: "inline-source-map"
};

const production = {
    mode: "production",
    entry: { app: "./src/sample/app" },
    output: {
        path: path.resolve(__dirname, "prod-dist"),
        filename: "[name].bundle.js"
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".json", ".glsl", ".vert"]
    },
    module: {
        rules: [babelRule, shaderRule]
    },
    plugins: [
        new CopyWebpackPlugin([{ from: ".", to: ".", ignore: ["!*.html"] }], { context: "static" }),
        new CopyWebpackPlugin([{ from: ".", to: "./css", ignore: ["!*.css"] }], { context: "static/css" }),
        new CopyWebpackPlugin([{ from: ".", to: "./js", ignore: ["!*.js"] }], { context: "static/js" }),
        new CopyWebpackPlugin([{ from: ".", to: "./assets", ignore: ["!*"] }], { context: "static/assets" })
    ]
};

if ((process.env.NODE_ENV || "").trim() != "production") {
    console.log("NODE_ENV", "development");
    module.exports = development;
} else {
    console.log("NODE_ENV", "production");
    module.exports = production;
}