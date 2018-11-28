# H5P Boilerplate
This repository provides you with some boilerplate code in different branches
that are intended to make creating new content types a little easier.

The master branch holds a very simple example, other branches contain different
frames for different purposes. The source files may contain some TODOs for
you in order to fill some functions with life.

Please note that you'll need some familiarity with git and npm.

Please also note that you'll still need some familiarity with how H5P works. If
you have not yet had a [look at our developer guide](https://h5p.org/developers):
Now is the right time :-)

## Getting started
Clone this repository with git and check out the branch that you are interested
in (or choose the branch first and then download the archive, but learning
how to use git really makes sense).

Change to the repository directory and run
```bash
npm install
```

to install required modules. Afterwards, you can build the project using
```bash
npm run build
```

or, if you want to let everything be built continuously while you are making
changes to the code, run
```bash
npm run watch
```
Before putting the code in production, you should always run `npm run build`.

The build process will transpile ES6 to earlier versions in order to improve
compatibility to older browsers. If you want to use particular functions that
some browsers don't support, you'll have to add a polyfill.

The build process will also move the source files into one distribution file and
minify the code.
