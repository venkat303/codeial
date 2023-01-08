// install gulp-cli,gulp,gulp-sass,gulp-cssnano,gulp-rev

// const gulp = require('gulp');
import gulp from 'gulp';
// const sass = require('gulp-sass')(require('node-sass'));
import nodeSass from 'node-sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(nodeSass);
// const cssnano = require('gulp-cssnano');
import cssnano from 'gulp-cssnano';
// const rev = require('gulp-rev');
import rev from 'gulp-rev';
// const uglify = require('gulp-uglify-es').default;
import uglify from 'gulp-uglify-es';
// const imagemin = require('gulp-imagemin');
import imagemin from 'gulp-imagemin';
// const del = require('del');
import gulpdel from 'del';


gulp.task('css',function(done){
    console.log('minnifying css..');
    gulp.src('./assets/sass/**/*.scss')
    .pipe(sass())
    .pipe(cssnano())
    .pipe(gulp.dest('./assets.css'))

    gulp.src('./assets/**/*.css')
    .pipe(rev())
    .pipe(gulp.dest('./public/assets'))
    .pipe(rev.manifest({
        cwd: 'public',
        merge: true
    }))
    .pipe(gulp.dest('./public/assets'));
    done();
});

gulp.task('js', function(done){
    console.log('minifying js...');
     gulp.src('./assets/**/*.js')
    .pipe(uglify())
    .pipe(rev())
    .pipe(gulp.dest('./public/assets'))
    .pipe(rev.manifest({
        cwd: 'public',
        merge: true
    }))
    .pipe(gulp.dest('./public/assets'));
    done()
});

gulp.task('images', function(done){
    console.log('compressing images...');
    gulp.src('./assets/**/*.+(png|jpg|gif|svg|jpeg)')
    .pipe(imagemin())
    .pipe(rev())
    .pipe(gulp.dest('./public/assets'))
    .pipe(rev.manifest({
        cwd: 'public',
        merge: true
    }))
    .pipe(gulp.dest('./public/assets'));
    done();
});


// empty the public/assets directory
gulp.task('clean:assets', function(done){
    // dele.sync('./public/assets');
    gulpdel.sync(['./public/assets'], { force:true });
    done();
});

gulp.task('build', gulp.series('clean:assets', 'css', 'js', 'images'), function(done){
    console.log('Building assets');
    done();
});