# deckgl-demo
deck-gl demo based on video from: https://www.youtube.com/watch?v=e_5W-JF_E2U

Requires a Google Maps API key

View it live on https://deckgl-demo.copy.gdn

## To run locally
Set your Google Maps API key in environment variable:  
On Windows PowerShell: `$env:GOOGLE_API_KEY="your-api-key"`
On Unix/Linux/Mac: `export GOOGLE_API_KEY="your-api-key"`

```
npm run start
```

You can find other datasets and modify them for your use-case here: https://www.kaggle.com/datasets  

There is included a command to convert csv to json. Run `npm run convert-csv`