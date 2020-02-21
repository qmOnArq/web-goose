const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpackMerge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const modeConfig = env => require(`./build-utils/webpack.${env}`)(env);

module.exports = ({ mode } = { mode: 'production', presets: [] }) => {
    return webpackMerge(
        {
            entry: './src/index.ts',
            mode,
            devtool: 'source-map',
            module: {
                rules: [
                    {
                        test: /\.tsx?$/,
                        use: 'ts-loader',
                        exclude: /node_modules/,
                    },
                ],
            },
            resolve: {
                extensions: ['.tsx', '.ts', '.mjs', '.js'],
            },
            output: {
                filename: 'bundle.js',
                sourceMapFilename: '[file].map',
                path: path.resolve(__dirname, 'dist'),
            },
            optimization: {},
            plugins: [
                new CleanWebpackPlugin(),
                new HtmlWebpackPlugin({
                    template: 'src/index.html',
                }),
            ],
        },
        modeConfig(mode),
    );
};
