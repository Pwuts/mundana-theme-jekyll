module.exports = {
    // These are the files that Purgecss will search through
    content: ["./_site/**/*.html"],

    // These are the stylesheets that will be subjected to the purge
    css: ["./_site/assets/css/*.css"],

    whitelistPatterns: [/carousel-item(-(next|prev|left|right))?/],
    whitelistPatternsChildren: [/^a2a_/]
};
