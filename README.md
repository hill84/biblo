<p align="center">
  <a href="https://delibris-4fa3b.firebaseapp.com/" rel="noopener" target="_blank"><img width="100" src="https://firebasestorage.googleapis.com/v0/b/delibris-4fa3b.appspot.com/o/assets%2Flogo-biblo.png?alt=media&token=5c7d3558-49bc-493d-a466-508ca444cd49" alt="Biblo logo"></a></p>
</p>

<h1 align="center">Biblo.space</h1>

<div align="center">

**Biblo** is a social network for book lovers, developed with [React](http://facebook.github.io/react/), [Typescript](https://github.com/microsoft/TypeScript) and [Firebase](https://github.com/firebase).

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/facebook/react/blob/main/LICENSE) 
![latest release](https://badgen.net/github/release/hill84/biblo)
![latest tag](https://badgen.net/github/tag/hill84/biblo)
![code size in bytes](https://img.shields.io/github/languages/code-size/hill84/biblo.svg)

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

</div>

## Preview this App

You can preview this app from this page on [biblo.space](https://biblo.space).

## Setup the Project

### Clone this repository

First clone this repo `git clone https://github.com/hill84/biblo.git`

### Install dependencies and run

Just run `yarn`, when finished type `yarn start` to run your app in development mode.

## Build and deploy

1. Update package.json version
2. Run `yarn build`
3. Run `firebase login`
4. Run one of the following commands to deploy:
  * `yarn deploy`
  * `yarn deploy:hosting`
  * `yarn deploy:functions`
  * `yarn deploy:staging`
  * `yarn deploy:staging:hosting`
  * `yarn deploy:staging:functions`

## Maintenance

Update regularly your local version of [firebase-tools](https://www.npmjs.com/package/firebase-tools) with `yarn global add firebase-tools`.