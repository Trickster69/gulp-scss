const dist_folder = "dist";
const source_folder = "src";

const path = {
  build: {
    html: dist_folder + '/',
    css: dist_folder + '/css/',
    js: dist_folder + '/js/',
    img: dist_folder + '/img/',
    fonts: dist_folder + '/fonts/',
  },

  src: {
    html: [source_folder + '/*.html', '!' + source_folder + '/_*.html'],
    css: source_folder + '/scss/style.scss',
    js: source_folder + '/js/script.js',
    img: source_folder + '/img/**/*.+(png|jpg|gif|ico|svg|webp)',
    fonts: source_folder + '/fonts/*.{ttf,otf}',
  },

  watch: {
    html: source_folder + '/**/*.html',
    css: source_folder + '/scss/**/*.scss',
    js: source_folder + '/js/**/*.js',
    img: source_folder + '/img/**/*.+(png|jpg|gif|ico|svg|webp)',
  },

  clean: './' + dist_folder + '/'
}

const {
  src,
  dest
} = require('gulp'),
  gulp = require('gulp'),
fileInclude = require('gulp-file-include'), //hook up html files
del = require('del'),
scss = require('gulp-sass')(require('sass')),
browsersync = require("browser-sync").create(),
autoprefixer = require("gulp-autoprefixer");
groupMedia = require("gulp-group-css-media-queries");
cleanCss = require("gulp-clean-css");
rename = require("gulp-rename");
uglify = require("gulp-uglify-es").default;
imageMin = require("gulp-imagemin");
webP = require("gulp-webp");
webPHTML = require("gulp-webp-html");
webPCss = require("gulp-webpcss");

function browserSync() {
  browsersync.init({
    server: {
      baseDir: './' + dist_folder + '/'
    },
    port: 3000,
    notify: false
  })
}

function html() {
  return src(path.src.html)
    .pipe(fileInclude())
    .pipe(webPHTML())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
}

function clean() { //update dist (delete and create)
  return del(path.clean)
}

function watchFiles() {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
}

function css() {
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: 'expanded'
      }).on('error', scss.logError)
    )
    .pipe(groupMedia())
    .pipe(autoprefixer({
      overrideBrowserList: ['last 5 versions'],
      cascade: true
    }))
    .pipe(webPCss())
    .pipe(dest(path.build.css))
    .pipe(cleanCss())
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream());
}

function js() {
  return src(path.src.js)
    .pipe(fileInclude())
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
}

function images() {
  return src(path.src.img)
    .pipe(webP({
      quality: 70
    }))
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(imageMin({
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }],
      interlaced: true,
      optimizationLevel: 3 //0 to 7
    }))
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream());
}



let build = gulp.series(clean, gulp.parallel(js, css, html, images))
let watch = gulp.parallel(build, browserSync, watchFiles)

exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
