var gulp = require('gulp');
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var runSequence = require('run-sequence');
const del = require('del');
var less = require('gulp-less');

function addExtensionToDis(dirArr, ext)
{
	var len = dirArr.length;
	var newArr = [];
	for(var i=0;i< len; i++)
	{
		var newDir= dirArr[i]+ext;
		newArr.push(newDir);
	}

	return newArr;
}

var dirsWithCSS =['assets/**/*',"app/**/*"];
var cssDirs = addExtensionToDis(dirsWithCSS, ".css");
var lessDirs =addExtensionToDis(dirsWithCSS, ".less");

var tsProject = ts.createProject('tsconfig.json',{typescript: require('typescript')});

gulp.task('compile-ts', function() {

	console.log("TypeScript version", tsProject.typescript.version);
	var outputDir = '.';
	return tsProject.src()
		.pipe(sourcemaps.init())
		.pipe(tsProject())
		.pipe(gulp.dest(outputDir));
});

gulp.task('compile-less', function () {
	return gulp.src(lessDirs,{ base: '.' })
		.pipe(less())
		.pipe(gulp.dest('.'));
});

gulp.task('clean', function () {
	var x = ['app/**/*.js','app/**/*.jsx','app/**/*.map','app/**/*.css', 'dist'].concat(cssDirs);
	return del(x);
});

gulp.task('dist', function() {
	return gulp.src(['assets/**'], {base: '.'})
		.pipe(gulp.dest('dist'));
});
gulp.task('compileAll', function () {
	runSequence('clean', ['compile-less','compile-ts'] );
});

