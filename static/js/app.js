var TRI_HEIGHT = 200;
var isRender = false;
var triangle = null;
var blogBackground = null;
var blogTitleText = null;
var blogDescription = null;
var shares = null;
var share = null;
var isIE = document.all && !window.atob;


function rerenderView() {
    isRender = true;
    var triWidth = $(window).width();
    var originalPosition = $(window).scrollTop();
    var position = originalPosition / 1.4;
    var titleMaxTop = -80;
    var titleMaxScale = 0.6;
    var triHeight = TRI_HEIGHT - position;

    if(triWidth <= 560) {
        titleMaxSize = 32;
    }

    if(originalPosition > 284) {
        $('#wrapper').addClass('overlay');
    }
    else {
        $('#wrapper').removeClass('overlay');
        if(triHeight > 0) {
            triangle.css({
                'transform': 'translate(0, ' + (position + 1) + 'px)',
                'border-bottom-width': triHeight + 'px',
                'border-left-width': triWidth + 'px',
            });
        }

        var titletop = -1 * position;
        if(titletop < titleMaxTop) titletop = titleMaxTop;
        titleScale = (TRI_HEIGHT - originalPosition / 3) / TRI_HEIGHT;
        if(titleScale < titleMaxScale) titleScale = titleMaxScale;

        blogTitleText.css({
            'transform': 'translate(0, ' + titletop + 'px) scale(' + titleScale + ', ' + titleScale + ')',
        });

        blogBackground
            .css('background-position-y', -0.3 * originalPosition + 'px')

        var opacity = originalPosition < 80 ? 1 - originalPosition / 80 : 0;
        share.css('opacity', opacity);

        blogDescription.css({
            opacity: opacity,
            transform: 'translate(0, ' + titletop + 'px)'
        });
    }


    isRender = false;
}

$('.share-link').click(function (){
    var dataType = $(this).attr('data-type');
    var _pageURL = encodeURIComponent(pageURL);
    if(dataType == 'facebook') {
        window.open('https://www.facebook.com/sharer/sharer.php?u=' + _pageURL);
    }
    else if(dataType == 'twitter') {
        window.open('https://twitter.com/home?status=' + _pageURL);
    }
    else if(dataType == 'link') {
      try {
        var range = document.createRange();
        range.selectNode(document.querySelector('#page-link'));
        window.getSelection().addRange(range);
        var success = document.execCommand('copy');
        $('.share p').text("Link copied");
        setTimeout(function() { $('.share p').text("Share this post"); }, 2000);
      }
      catch(err) {
        alert('브라우저가 링크 복사를 지원하지 않습니다.');
      }
    }
});

$(window).on('scroll resize', function() {
    if(isIE) return;
    if(isRender) return;
    if(requestAnimationFrame)
        requestAnimationFrame(rerenderView);
    else
        rerenderView();
});

$(function() {
    if(isIE) return;
    blogDescription = $('#blog-title p');
    blogTitleText = $('#blog-title h1');
    blogBackground = $('#blog-background-wrapper');
    triangle = $('#triangle');
    shares = $('#post-share-link, .share');
    share = $('.share');
    rerenderView();
});
