var gulp = require('gulp');
var markdown = require('gulp-markdown');
var phantom = require('phantom');
var filenames = require("gulp-filenames");

var destDir = "./dist";

gulp.task('markdown', function() {
    return gulp.src('src/*.md')
        .pipe(markdown())
        .pipe(gulp.dest(destDir))
});

gulp.task('copy', function() {
    return gulp.src('src/*.css')
        .pipe(gulp.dest(destDir));
});

gulp.task('default', function() {
    gulp.watch('src/*.md', ['markdown']);
    gulp.watch('src/*.css', ['copy']);
});

gulp.task('pdf', function() {
    var gethtmls = gulp.src("./dist/*.html")
        .pipe(filenames("htmls"));   
    return gethtmls.on("end", function()   {
        var htmls = filenames.get("htmls", "all");
            console.log(htmls);

        return phantom.create().then(function(ph) {
            ph.createPage().then(function(page) {
                htmls.forEach(function(html) {
                    page.open("file:///" + html.full).then(function(status) {
                        console.log('Status: ' + status);
                        page.render(destDir + '/' + 'google.pdf').then(function() {
                            console.log('Page Rendered');
                            ph.exit();
                        });
                    });
                })
            });
        });
    });
    
});



gulp.task('compile', ['markdown', 'copy'])