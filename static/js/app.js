var TRI_HEIGHT = 200;

function rerenderView(){
    var triWidth = $(window).width();
    var triHeight = TRI_HEIGHT;
    var originalPosition = $('#scroll-space').scrollTop();
    var titleMaxSize = 42;
    var titleMaxTop = 180;
    var titleMaxThreshold = -163;
    var descriptionMaxTop = 245;

    // mobile
    if(triWidth <= 560) {
        titleMaxSize = 32;
        titleMaxTop = 125;
        descriptionMaxTop = 195;
        titleMaxThreshold = -108;
    }

    var position = originalPosition / 1.4;
    triHeight = triHeight - position;

    if(triHeight < 0)
        triHeight = 0;

    $('#triangle').css({
        'top': -1 * (TRI_HEIGHT - 1) + 'px',
        'border-width': position + 'px 0px ' + triHeight + 'px  ' + triWidth + 'px'
    });
    if(originalPosition < 80) {
        $('.share').css('opacity', 1 - originalPosition / 80);
    }
    else {
        $('.share').css('opacity', '0');
    }

    if(originalPosition < TRI_HEIGHT) {
        $('#blog-title').css('background-position-y', -0.3 * originalPosition + 'px');
        var fontPosition = -1 * originalPosition;
        if(fontPosition < titleMaxThreshold + 5) fontPosition = titleMaxThreshold;
        var fontSize = titleMaxSize - ((titleMaxSize - 22) * (originalPosition / TRI_HEIGHT));
        if(fontSize < 22) fontSize = 22;

        $('#blog-title h1 a').css({
            'font-size': fontSize + 'px',
            'top': (titleMaxTop + fontPosition) + 'px'
        });
        var opacity = (TRI_HEIGHT - originalPosition) / TRI_HEIGHT;
        if(opacity < 0)
            opacity = 0;
        $('#blog-title p').css({
            opacity: opacity,
           'top': (descriptionMaxTop + fontPosition) + 'px'
        });
        $('#post-share-link').css('display', 'none');
    }
    else {
        $('#blog-title h1 a').css({
            'top': '17px',
            'font-size': '22px',
        });

        $('#post-share-link').css('display', 'block');
    }
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
