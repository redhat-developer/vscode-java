'use strict';
const gulp = require('gulp');
const gulp_tslint = require('gulp-tslint');
//...
gulp.task('tslint', () => {
    return gulp.src(['**/*.ts', '!**/*.d.ts', '!node_modules/**'])
      .pipe(gulp_tslint())
      .pipe(gulp_tslint.report());
});