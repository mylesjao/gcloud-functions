# gcloud-functions
Contain some google cloud 

## Start local emulator
```sh
$ npx functions start
```

## Deploy
### Deploy to local emulator
```sh
$ npx functions deploy etf --trigger-http --entry-point get --source functions/etf
```

### Deploy to cloud
```sh
$ gcloud beta functions deploy etf --trigger-http --entry-point get --timeout 15s --memory 128MB --source functions/etf
```

