### Requirement
* chromeless 1.0.1
* node >= 8.2.1
* [chrome-canary](https://www.google.com/chrome/browser/canary.html)
* Mac OS Sierra(10.12.6)

### Usage
```shell
yarn install

alias canary="/Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary"

canary --remote-debugging-port=9222 --disable-gpu --headless

node crawer.js
```
