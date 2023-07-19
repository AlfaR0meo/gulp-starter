const gulp = require('gulp');
const includeFiles = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const sourceMaps = require('gulp-sourcemaps');
const server = require('gulp-server-livereload');
const clean = require('gulp-clean');
const fs = require('fs');
//const groupMedia = require('gulp-group-css-media-queries');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');

const webpack = require('webpack-stream');
const changed = require('gulp-changed');

// const babel = require('gulp-babel');
// const imagemin = require('gulp-imagemin');
// const sassGlob = require('gulp-sass-glob');


const sassOptions = {
    //indentWidth : 2,
    //outputStyle: "compressed"
};
const includeFilesSettings = {
    prefix: '@@',
    basepath: '@file'
};
const serverSettings = {
    livereload: true,
    open: true
};
const plumberNotifySettings = (title) => {
	return {
		errorHandler: notify.onError({
			title: title,
			message: 'Error <%= error.message %>',
			sound: false,
		}),
	};
};


// Таск: Удаление папки build
gulp.task('clean', function(done) {
    if (fs.existsSync('./build/')) {
        return (
            gulp.src('./build/', { read: false })
                .pipe(clean({ force: true }))
        )
    }
    done();
});

// Таск: Подлючение HTML и его блоков
gulp.task('html', function() {
    return (
        gulp.src(['./src/html/**/*.html', '!./src/html/blocks/*.html'])
            .pipe(changed('./build/', {hasChanged: changed.compareContents}))
            .pipe(plumber(plumberNotifySettings('HTML')))
            .pipe(includeFiles(includeFilesSettings))
            .pipe(gulp.dest('./build/'))
    )
});

// Таск: Компиляция SCSS в CSS
gulp.task('sass', function() {
    return (
        gulp.src('./src/scss/*.scss')
            .pipe(changed('./build/css/'))
            .pipe(plumber(plumberNotifySettings('SCSS')))
            .pipe(sourceMaps.init())
            //.pipe(groupMedia())
            .pipe(sass(sassOptions))
            .pipe(sourceMaps.write())
            .pipe(gulp.dest('./build/css/'))
    )
});

// Таск: Копирование картинок в папку дистрибутив (dist or build) (production-ready compiled version of your code)
gulp.task('images', function() {
    return (
        gulp.src('./src/img/**/*')
            .pipe(changed('./build/img/'))
            .pipe(gulp.dest('./build/img/'))
    )
});

// Таск: Копирование шрифтов
gulp.task('fonts', function() {
    return (
        gulp.src('./src/fonts/**/*')
            .pipe(changed('./build/fonts/'))
            .pipe(gulp.dest('./build/fonts/'))
    )
});

// Таск: Копирование файлов
gulp.task('files', function() {
    return (
        gulp.src('./src/files/**/*')
            .pipe(changed('./build/files/'))
            .pipe(gulp.dest('./build/files/'))
    )
});

// Таск: JS
gulp.task('js', function() {
    return (
        gulp.src('./src/js/*.js')
            .pipe(changed('./build/js/'))
            .pipe(plumber(plumberNotifySettings('JS')))
            .pipe(webpack(require('./webpack.config.js')))
            .pipe(gulp.dest('./build/js/'))
    )
});


// Таск: Запуск сервера
gulp.task('server', function() {
    return (
        gulp.src('./build/')
            .pipe(server(serverSettings))
    )
});

// Таск: Слежение за изменениями
gulp.task('watch', function() {
    gulp.watch('./src/scss/**/*.scss', gulp.parallel('sass'));
    gulp.watch('./src/html/**/*.html', gulp.parallel('html'));
    gulp.watch('./src/img/**/*', gulp.parallel('images'));
    gulp.watch('./src/fonts/**/*', gulp.parallel('fonts'));
    gulp.watch('./src/files/**/*', gulp.parallel('files'));
    gulp.watch('./src/js/**/*.js', gulp.parallel('js'));
})

// Таск: Дефолтный таск – запуск сборки
gulp.task('default', gulp.series(
    'clean', 
    gulp.parallel('html', 'sass', 'images', 'fonts', 'files', 'js'),
    gulp.parallel('server', 'watch')
));
