# fly-watch [![Build Status](https://travis-ci.org/flyjs/fly-watch.svg?branch=master)](https://travis-ci.org/flyjs/fly-watch)

> Watch files & Execute specified tasks on change

After initializing a [Chokidar](https://github.com/paulmillr/chokidar) instance, specified paths will be watched and run Tasks _serially_ in response to adding, updating, or deleting a matching filepath.

When a Task is restarted by `fly.watch`, the Task's `options.src` will contain the full path of the file that triggered a response.


## Install

```
$ npm install --save-dev fly-watch
```


## Usage

```js
module.exports = {
  * lint(fly, opts) {
    // process single file via `opts.src` if populated
    yield fly.source(opts.src || 'src/*.js').eslint();
  },
  * scripts(fly, opts) {
    // process single file via `opts.src` if populated
    yield fly.source(opts.src || 'src/*.js').babel({ presets: ['es2015'] }).target('dist/js');
  },
  * styles(fly) {
    yield fly.source('src/app.sass').sass().target('dist/css');
  },
  * default(fly) {
    // watch all JS files; run 'lint' then 'scripts'
    yield fly.watch('src/**/*.js', ['lint', 'scripts']);
    // watch multiple paths; only run 'styles'
    yield fly.watch(['src/foo/*.sass', 'src/*.sass'], 'styles');
  }
}
```


## API

### fly.watch(globs, tasks, [options])

#### globs

Type: `string` or `array`

A filepath, directory path, or glob pattern. Multiple paths must use an `array`.


#### tasks

Type: `string` or `array`

The task(s) to run when a matched file (from `globs`) is added, changed, or deleted. Multiple tasks must use an `array` and will run as a [serial chain](https://github.com/flyjs/fly#flyserialtasks-options).

#### options

Type: `object`<br>
Default: `{}`

Initial options to be passed to each Task. See [`fly.start`](https://github.com/flyjs/fly#flystarttask-options) for more info.


## License

MIT © [Luke Edwards](http://flyjs.io)
