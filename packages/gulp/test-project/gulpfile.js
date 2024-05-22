var gulp = require('gulp');

gulp.task('default', function(done) {
  console.log("Hello");
  setTimeout(function() {
    console.log("End");
    done();
  }, 3000);
});

var realFavicon = require('@realfavicongenerator/gulp-real-favicon');
var fs = require('fs');

// File where the favicon markups are stored
var FAVICON_DATA_FILE = 'faviconData.json';

// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
gulp.task('generate-favicon', function(done) {
	realFavicon.generateFavicon({
		masterIcon: 'sample_picture_1.png',
		dest: 'images/',
		settings: {
			icon: {
				desktop: {
					regularIconTransformation: {
						type: "none"
					},
					darkIconType: "none"
				},
				touch: {
					transformation: {
						type: "none"
					},
					appTitle: null
				},
				webAppManifest: {
					transformation: {
						type: "none"
					},
					backgroundColor: "#ffffff",
					name: "Example",
					shortName: "Ex",
					themeColor: "#ffffff"
				}	
			},
			path: '/'
		},
		markupFile: FAVICON_DATA_FILE
	}, function() {
		done();
	});
});

// Inject the favicon markups in your HTML pages. You should run
// this task whenever you modify a page. You can keep this task
// as is or refactor your existing HTML pipeline.
gulp.task('inject-favicon-markups', function() {
	return gulp.src([ 'index.html' ])
		.pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE))))
		.pipe(gulp.dest('out'));
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
gulp.task('check-for-favicon-update', function(done) {
	var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
	realFavicon.checkForUpdates(currentVersion, function(err) {
		if (err) {
			throw err;
		}
		done();
	});
});
