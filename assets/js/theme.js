// alertbar later
$(document).scroll(function () {
    var y = $(this).scrollTop();
    if (y > 280) {
        $('.alertbar').fadeIn();
    } else {
        $('.alertbar').fadeOut();
    }
});

// Hide Header on on scroll down
let didScroll;
let lastScrollTop = 0;
const delta = 5;
let navbarHeight;

function closeMenu() {
    const $toggler = $('nav button.navbar-toggler');
    if (!$toggler.hasClass('collapsed'))
        $toggler.click();
}

function hasScrolled() {
    var st = $(this).scrollTop();
    $nav = $('nav');

    // Make sure they scroll more than delta
    if(Math.abs(lastScrollTop - st) <= delta)
        return;

    closeMenu();

    // If they scrolled down and are past the navbar, add class .navbar-hidden.
    // This is necessary so you never see what is "behind" the navbar.
    if (st > lastScrollTop && st > navbarHeight){
        // Scroll Down
        $nav.removeClass('navbar-visible').addClass('navbar-hidden');

    } else {
        // Scroll Up
        if(st + $(window).height() < $(document).height()) {
            $nav.removeClass('navbar-hidden').addClass('navbar-visible');
        }
    }

    lastScrollTop = st;
}

function getCookie(name) {
    const dc = document.cookie;
    const prefix = name + "=";
    let begin = dc.indexOf("; " + prefix);
    let end = null;
    if (begin === -1) {
        begin = dc.indexOf(prefix);
        if (begin !== 0) return null;
    } else {
        begin += 2;
        end = document.cookie.indexOf(";", begin);
        if (end === -1) {
            end = dc.length;
        }
    }
    return decodeURI(dc.substring(begin + prefix.length, end));
}

function setCookie(name, value, path = '/', global = false) {   // TODO: add relative expiry time parameter
    document.cookie = `${name}=${value}; path=${path}` + (global ? '; domain=pwutseltronics.nl' : '')
}

// theme stuff
let theme = 'dark';
const osDarkPreference = matchMedia('(prefers-color-scheme: dark)');

osDarkPreference.onchange = (e) => {    // switch theme if OS preference changes
    switchTheme(e.matches ? 'dark' : 'light');
};

function initBodyTheme() {
    $body = $('body');
    let initTheme = getCookie('theme');

    if (initTheme !== 'light' && initTheme !== 'dark') {
        initTheme = osDarkPreference.matches ? 'dark' : 'light';    // default to OS/browser preferred color scheme
    }

    if (theme != initTheme)  $body.removeClass(theme).addClass(initTheme);

    $('meta[name="theme-color"]').attr('content', getComputedStyle($body[0]).getPropertyValue('--grayscale-93').trim());

    theme = initTheme;
    setCookie('theme', theme, '/', true);
}

function switchTheme(newTheme) {
    let lastTheme = theme;

    $body.removeClass(lastTheme).addClass(newTheme);

    $('meta[name="theme-color"]').attr('content', getComputedStyle($body[0]).getPropertyValue('--grayscale-93').trim());

    $themeSwitch.prop('checked', newTheme == 'light');

    theme = newTheme;
    setCookie('theme', theme, '/', true);
}

function initThemeSwitch() {
    $themeSwitch = $('#themeSwitch > input');

    if (theme == 'dark') {
        $themeSwitch.prop('checked', false);
    } else if (theme == 'light') {
        $themeSwitch.prop('checked', true);
    } else {
        console.warn('invalid theme "' + theme + '" set while initiating theme switch');
    }

    $themeSwitch.change(function() {    // event listener for switching themes
        switchTheme(this.checked ? 'light' : 'dark');
    });
}

function loadSearch(){
    // Create a new Index
    idx = lunr(function(){
        this.field('id');
        this.field('title', { boost: 10 });
        this.field('summary');
    });

    // Send a request to get the content json file
    $.getJSON('/content.json', function(data){

        // Put the data into the window global so it can be used later
        window.searchData = data;

        // Loop through each entry and add it to the index
        $.each(data, function(index, entry){
            idx.add($.extend({"id": index}, entry))
        })
    });

    // When search is pressed on the menu toggle the search box
    $('#search').on('click', function(){
        $('.searchForm').toggleClass('show')
    });

    // When the search form is submitted
    $('#searchForm').on('submit', function(e){
        // Stop the default action
        e.preventDefault();

        // Find the results from lunr
        results = idx.search($('#searchField').val());

        // Empty #content and put a list in for the results
        $('#content').html('<h1>Search Results (' + results.length + ')</h1>');
        $('#content').append('<ul id="searchResults"></ul>');

        // Loop through results
        $.each(results, function(index, result){
            // Get the entry from the window global
            entry = window.searchData[result.ref];

            // Append the entry to the list.
            $('#searchResults').append('<li><a href="' + entry.url + '">' + entry.title + '</li>')
        })
    })
}

// Smooth on external page
$(function () {
    // Hide Header on on scroll down
    navbarHeight = $('nav').outerHeight();

    $(window).scroll(function (event) {
        didScroll = true;
    });

    setInterval(function () {
        if (didScroll) {
            hasScrolled();
            didScroll = false;
        }
    }, 250);


    setTimeout(function () {
        if (location.hash) {
            /* we need to scroll to the top of the window first, because the browser will always jump to the anchor first before JavaScript is ready, thanks Stack Overflow: http://stackoverflow.com/a/3659116 */
            window.scrollTo(0, 0);
            target = location.hash.split('#');
            smoothScrollTo($('#' + target[1]));
        }
    }, 1);

    // taken from: https://css-tricks.com/snippets/jquery/smooth-scrolling/
    $('a[href*=\\#]:not([href=\\#])').click(function () {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            smoothScrollTo($(this.hash));
            return false;
        }
    });

    function smoothScrollTo(target) {
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');

        if (target.length) {
            $('html,body').animate({
                scrollTop: target.offset().top
            }, 1000);
        }
    }
});
