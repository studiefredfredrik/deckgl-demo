const express = require('express')
const path = require('path')
const app = express()
const port = 5000

setGoogleApiKeyFromEnv()

app.use('/', express.static(path.join(__dirname, 'public')))

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})


function setGoogleApiKeyFromEnv(){
    const {readFile, writeFile} = require('fs');
    const indexHtmlFilePath = './public/index.html';
    readFile(indexHtmlFilePath, 'utf-8', function (err, contents) {
        if (err) {
            throw err
        }
        
        if(!process.env.GOOGLE_API_KEY){
            console.log('GOOGLE_API_KEY not set')
            return
        }

        const replaced = contents.replace(`<%= GOOGLE_API_KEY %>`, process.env.GOOGLE_API_KEY);
        writeFile(indexHtmlFilePath, replaced, 'utf-8', function (err) {
            if(err){
                throw err    
            }
            console.log('GOOGLE_API_KEY replaced')
        });
        
    });
}