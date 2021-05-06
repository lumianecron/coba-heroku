const ngrok = require('ngrok');
ngrok.connect(3000).then(function (url) {
    console.log(`Ngrok URL: ${url}`);
});