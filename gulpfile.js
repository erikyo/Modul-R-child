// Gulp
const gulp = require('gulp');

// Utilities
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require("autoprefixer");
const fs = require('fs');
const newer = require('gulp-newer');
const imagemin = require('gulp-imagemin');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const wpPot = require('gulp-wp-pot');

// Gulp plugins
const header = require('gulp-header');
const del = require("del");
const notify = require("gulp-notify");

// Misc/global vars
const pkg = JSON.parse(fs.readFileSync('./package.json'));

// Use node sass as compiler
sass.compiler = require('node-sass');

// Task options
const opts = {
  rootPath: './',
  devPath: './assets/src/',
  distPath: './assets/dist/',

  autoprefixer: {
    cascade: false
  },

  cssnano: {
    compressed: {
      preset: ['default', {
        reduceIdents: {
          keyframes: false
        }
      }]
    },
    extended: {
      preset: ['default', {
        reduceIdents: {
          keyframes: false
        },
        normalizeWhitespace: false
      }]
    }
  },

  cssvariables: {
    preserve : true,
    preserveInjectedVariables: true
  },

  sass: {
    outputStyle: 'nested'
  },

  imagemin: {
    settings : ([
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
        plugins: [
          {removeViewBox: true},
          {cleanupIDs: false}
        ]
      })
    ], {
      verbose: true
    })
  },

  banner: [
    '@charset "UTF-8"; ' ,
    '/*!' ,
    'Theme Name: <%= wp.themeName %> ' ,
    'Description: <%= wp.description %> ' ,
    'Version: <%= version %> ' ,
    'Theme URI: <%= homepage %> ' ,
    'Author: <%= author.name %> ' ,
    'Author URI: <%= author.website %> ' ,
    'Text Domain: <%= wp.textDomain %> ' ,
    'Template: <%= wp.template %> ' ,
    '*/',
    ''
  ].join('\n')
};

// ----------------------------
// Gulp task definitions
// ----------------------------

// Clean assets
function clean() {
  return del([
    '**/Thumbs.db',
    '**/.DS_Store',
    opts.rootPath + '*.css.map',
    opts.rootPath + 'assets/**/*.map',
    opts.distPath + '**'
  ]).then( paths => {
    console.log('Successfully deleted files and folders:\n', paths.join('\n'));
  });
}

// Minify images
function imageMinify() {
  return gulp
    .src(opts.devPath + 'img/**')
    .pipe(newer(opts.distPath + 'img/'))
    .pipe(
      imagemin(opts.imagemin.settings)
        .on('error', notify.onError('Error: <%= error.message %>,title: "Imagemin Error"'))
    )
    .pipe(gulp.dest(opts.distPath + 'img/'));
}

// Wordpress pot translation file
function createPot() {
  return gulp
    .src(opts.rootPath + '**/*.php')
    .pipe( wpPot({
        domain: pkg.wp.textDomain,
        package: pkg.name + '-theme'
      }).on('error', notify.onError('Error: <%= error.message %>,title: "Translation Error"'))
    )
    .pipe(gulp.dest(opts.rootPath + 'languages/' + pkg.name + '.pot'));
}

// Main Scripts
function mainScript() {
  return gulp
    .src(opts.devPath + 'js/*.js')
    .pipe(gulp.dest(opts.distPath + 'js/'));
}

// User Scripts
function userScript() {
  return gulp
    .src([
      '../modul-r/assets/src/js/user/*.js',
      '!../modul-r/assets/src/js/user/masonry.js',
      opts.devPath + 'js/user/*.js',
    ], {base: '.'})
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(concat('scripts.js'))
    .pipe(sourcemaps.write('.', { sourceRoot: '/' }))
    .pipe(gulp.dest(opts.distPath + 'js/'));
}

// Vendor scripts concat
function vendorScript() {
  return gulp
    .src(opts.devPath + 'js/vendor/*.js')
    .pipe(newer(opts.distPath + 'js/vendor-scripts.js'))
    .pipe(uglify())
    .pipe(concat('vendor-scripts.js'))
    .pipe(gulp.dest(opts.distPath + 'js/'));
}


// CSS Style functions
function cssAtf() {
  return gulp
    .src(opts.devPath + 'scss/atf.scss')
    .pipe(sass(opts.sass))
    .on('error', notify.onError('Error: <%= error.message %>,title: "SASS Error"'))
    .pipe(postcss([
      autoprefixer(opts.autoprefixer.build),
      cssnano(opts.cssnano.compressed)
    ]))
    .pipe(gulp.dest(opts.distPath + 'css/'));
}

function editorCSS() {
  return gulp
    .src(opts.devPath + 'scss/editor.scss')
    .pipe(sass(opts.sass))
    .on('error', notify.onError('Error: <%= error.message %>,title: "SASS Error"'))
    .pipe(postcss([
      autoprefixer(opts.autoprefixer.dev)
    ]))
    .pipe(gulp.dest(opts.distPath + 'css/'));
}

function mainCSS() {
  return gulp
    .src(opts.devPath + 'scss/style.scss')
    .pipe(sourcemaps.init())
    .pipe(sass(opts.sass))
    .on('error', notify.onError('Error: <%= error.message %>,title: "SASS Error"'))
    .pipe(postcss([
      autoprefixer(opts.autoprefixer.dev)
    ]))
    .pipe(header(opts.banner, pkg))
    .pipe(gulp.dest(opts.rootPath))
    .pipe(sourcemaps.write('.', { sourceRoot: '/' }))
    .pipe(gulp.dest(opts.rootPath));
}

function buildMainCSS() {
  return gulp
    .src(opts.devPath + 'scss/style.scss')
    .pipe(sass(opts.sass))
    .on('error', notify.onError('Error: <%= error.message %>,title: "SASS Error"'))
    .pipe(gulp.dest(opts.rootPath))
    .pipe(postcss([
      autoprefixer(opts.autoprefixer.build),
      cssnano(opts.cssnano.compressed)
    ]))
    .pipe(header(opts.banner, pkg))
    .pipe(gulp.dest(opts.rootPath));
}




// Watch files
function watchStyle() {
  gulp.watch([ opts.devPath + 'scss/**/*.scss', '../modul-r/assets/src/scss/**/*.scss' ], style );
}

function watchCode() {
  gulp.watch([ opts.devPath + 'js/**/*.js', '../modul-r/assets/src/js/**/*.js' ], scripts );
}

function watchImages() {
  gulp.watch(opts.devPath + 'img/**/*', imageMinify );
}


const style = gulp.parallel(mainCSS, cssAtf, editorCSS);
const scripts = gulp.parallel(vendorScript, userScript, mainScript);
const build = gulp.series(clean, gulp.parallel( imageMinify, createPot, buildMainCSS, cssAtf, editorCSS, scripts));
const watch = gulp.parallel(watchStyle, watchCode, watchImages);


// exports
exports.default = build;
exports.watch = watch;
exports.build = build;

exports.style = style;
exports.scripts = scripts;

exports.createPot = createPot;
exports.imageMinify = imageMinify;