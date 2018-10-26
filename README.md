# DASHBOARD APP

A web application for displaying data and filtering results.

This is a milestone project for Interactive Frontend Development, part of the Full-Stack Web Developer program @ Code Institute.

## Introduction

A web application for displaying data and filtering results.

I used an existing unified login system with customized OAuth2 module and [PaymentGateway API](https://gateway.paywiser.eu/PaymentGateway.WL.Test/Docs).

This data dashboard is created for displaying basic and detailed data, to filter results, download CSV file, ... And with connections between pages, for example to view all transactions for selected account for selected merchant. 

This Project is deployed [here](http://bufo-test.info/PGWL/)

Source code is availible on [GitHub](https://github.com/tjasajan/dashboardApp)

## Build with

+ [VueJS Framework](https://vuejs.org/)
+ [Quasar Framework](https://v0-14.quasar-framework.org/)

## Other technologies used

+ Visual Studio Code editor
+ PaymentGateway API
+ Axios
+ Vuex
+ Webpack
+ ESlint
+ npm
+ Chrome DevTools

## Installation

1. Download files
2. Install [npm](https://nodejs.org/en/)
3. Install dependencies
~~~~
npm install or npm update
~~~~
4. Serve with hot reload at localhost:22555
~~~~
npm run dev
~~~~

Username for login is tjasaa@gmail.com and password is ynVOYYQG1d.

## Testing

Testing was done manually throughout development process and with help of a console.log function for each new functionality. 

Testing for responsive layout was done in Chrome and also on different devices. Final check was done with [this application](http://browsershots.org/).

## Deployment

1. Lint code
~~~~
npm run lint
~~~~

2. Build for production with minification
+ change returnURL in config.js
~~~~
npm run build
~~~~
