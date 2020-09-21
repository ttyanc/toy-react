module.exports = {
    entry:{
        main:'./main.js'
    },
    module:{
        rules:[
            {
                test:/\.js$/,
                use:{
                    loader:'babel-loader',
                    options:{
                        presets:['@babel/preset-env'],
                        plugins:[['@babel/plugin-transform-react-jsx',{pragma:'createElement'}]]
                    }
                }
            }
        ]
    },
    //以下配置，使打包文件dist/main.js易于可读
    mode:'development',
    optimization:{
        minimize:false
    }
}  