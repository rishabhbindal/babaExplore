const gulp = require('gulp');
const uglify = require('gulp-uglifyjs');
const webpack = require('webpack');
const gutil = require('gulp-util');
const path = require('path');
const concat = require('gulp-concat');
const rev = require('gulp-rev');
const revReplace = require('gulp-rev-replace');
const copy = require('gulp-contrib-copy');
const argv = require('yargs').argv;
const git = require('git-rev-sync');
const template = require('gulp-template');

gulp.task('webpack', callback => {
    const webpackConfig = require('./webpack.config.js');
    const apiFile = argv.apiHost === 'production' ? 'production' : 'development';

    webpackConfig.resolve.alias.config = path.join(
        __dirname,
        `config/${apiFile}.js`
    );

    webpack(webpackConfig.getConfig({
        isProduction: argv.production,
        apiHost: argv.apiHost,
        gateway: argv.gateway
    }), (err, stats) => {
        if (err) throw new gutil.PluginError('webpack', err);
        gutil.log('[webpack]', stats.toString({}));
        callback();
    });
});


gulp.task('uglify', ['webpack'], () => {
    gulp.src('public/main.js')
        .pipe(uglify())
        .pipe(gulp.dest('public/'));

    // gulp.src('public/vendor.js')
    //     .pipe(uglify())
    //     .pipe(gulp.dest('public/'));
});

function version(src, filetype) {
    let files = `${src}/*`;

    if (filetype) {
        files = `${files}.${filetype}`;
    }
    return () => gulp.src(files)
        .pipe(rev())
        .pipe(gulp.dest(`dist/${src}`))
        .pipe(rev.manifest({
            path: path.join(__dirname, 'dist/rev-manifest.json'),
            cwd: path.join(__dirname, 'dist'),
            merge: true
        }))
        .pipe(gulp.dest('dist'));
}

gulp.task('version-js', ['copy-js'], version('public', 'js'));
gulp.task('copy-appmin', () => gulp.src('./js/app-min.js')
        .pipe(copy())
        .pipe(gulp.dest('dist/js')));

gulp.task('copy-pannellum', () => gulp.src('./public/pannellum.htm')
        .pipe(copy())
        .pipe(gulp.dest('dist/public')));

gulp.task('copy-js', ['copy-pannellum', 'copy-appmin', 'version-css']);

gulp.task('version-css', ['version-vendorcss']);
gulp.task('version-vendorcss', ['version-explorecss'], version('public', 'css'));
gulp.task('version-explorecss', () => gulp.src(['public/app-migrate.css', 'css/explore.css', 'public/scss-styles.css'])
    .pipe(rev())
    .pipe(gulp.dest('dist/css'))
    .pipe(rev.manifest({
        path: path.join(__dirname, 'dist/rev-manifest.json'),
        cwd: path.join(__dirname, 'dist'),
        merge: true
    }))
    .pipe(gulp.dest('dist')));

gulp.task('copy-images', () => gulp.src('./images/*')
        .pipe(copy())
        .pipe(gulp.dest('dist/images')));

gulp.task('copy-location-icons', () => gulp.src('./images/location-icons/*')
        .pipe(copy())
        .pipe(gulp.dest('dist/images/location-icons')));

gulp.task('copy-img', () => gulp.src('./img/*')
        .pipe(copy())
        .pipe(gulp.dest('dist/img')));

gulp.task('copy-fonts', () => gulp.src('./font/*')
        .pipe(copy())
        .pipe(gulp.dest('dist/font')));

gulp.task('copy-public-fonts', () => gulp.src('./public/fonts/*')
        .pipe(copy())
        .pipe(gulp.dest('dist/public/fonts')));

gulp.task('copy-public-images', () => gulp.src('./public/images/**/*')
        .pipe(copy())
        .pipe(gulp.dest('dist/public/images')));

gulp.task('copy-assets', ['copy-images', 'copy-location-icons', 'copy-img',
        'copy-fonts', 'copy-public-fonts', 'copy-public-images']);

gulp.task('build', ['version-js', 'copy-assets'], () => {
    const dest = 'dist';
    const manifest = gulp.src(`./${dest}/rev-manifest.json`);

    return gulp.src(['./angular.html', './react.html'])
        .pipe(template({
            appGitVer: git.short(),
            appEnv: argv.apiHost === 'production' ? 'production' : 'development'
        }))
        .pipe(revReplace({ manifest }))
        .pipe(gulp.dest(dest));
});
gulp.task('compile', ['uglify']);
gulp.task('default', ['compile']);
