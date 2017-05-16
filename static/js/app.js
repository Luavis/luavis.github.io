var TRI_HEIGHT = 200;

function rerenderView(){
    var triWidth = $(window).width();
    var originalPosition = $('#scroll-space').scrollTop();
    var position = originalPosition / 1.4;
    var titleMaxTop = -160;
    var titleMaxScale = 0.6;
    var triHeight = TRI_HEIGHT - position;

    if(triWidth <= 560) {
        titleMaxSize = 32;
    }

    if(triHeight < 0)
        triHeight = 0;

    $('#triangle').css({
        'top': -1 * (TRI_HEIGHT - 1) + 'px',
        'border-width': position + 'px 0px ' + triHeight + 'px  ' + triWidth + 'px'
    });

    titletop = -1 * position;
    if(titletop < titleMaxTop)
        titletop = titleMaxTop;
    titleScale = (TRI_HEIGHT - originalPosition / 10) / TRI_HEIGHT;
    if(titleScale < titleMaxScale) titleScale = titleMaxScale;

    $('#blog-title h1 a').css({
        'transform': 'translate(0, ' + titletop + 'px) scale(' + titleScale + ', ' + titleScale + ')',
        'transform-origin': 'left top'
    });

    if(originalPosition < 80) {
        $('.share').css('opacity', 1 - originalPosition / 80);
        $('#post-share-link').css('display', 'none');
    }
    else {
        $('.share').css('opacity', '0');
        $('#post-share-link').css('display', 'block');
    }

    var opacity = (TRI_HEIGHT - originalPosition) / TRI_HEIGHT;
    if(opacity < 0)
        opacity = 0;

    $('#blog-title p').css({
        opacity: opacity,
        'transform': 'translate(0, ' + titletop + 'px)'
    });
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
})

$('#scroll-space').on('scroll resize', rerenderView);
$(window).on('scroll resize', rerenderView);
$(rerenderView);
