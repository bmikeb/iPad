//(function($){
//    $.fn.initGestures= function(){
captionPanelClosed = true

function initCaption(e, curX) {
    evt = e.originalEvent;
    var Y = e.pageY || evt.changedTouches[0].pageY;


    if (Y > 700 && !swiping && captionPanelClosed) {
        $('.captionContainer').animate({opacity:0.4}, 1000, handleCaptionText );
    }
}
function returnToPages(tgt) {
    if (tgt.attr('src').indexOf('-') != -1) {
        tgt.attr({src:"img/" + prefix + ".jpg"});
        ix = prefix;
        populateHotAreas($('#slider').children(":first"));

        previewPnl.show();
        caption.show();
    }
}
function initGestures(/*arg*/){
    var startX = 0, startY= 0, liveX = 0, liveY = 0 ,startTime=0
        ,MIN_LENGTH_X = 72, MIN_LENGTH_Y = 50;

    deltaX = 0, deltaY = 0;
    touchStarted = false;
    adjusting = false;
    swiping = false;
    $this = $('body');

//for iPad version
//    $this.on('touchstart', touchStartHandler);
//    $this.on('touchmove', touchMoveHandler);
//    $this.on('touchend /*mouseup*/', touchEndHandler);

  $this.on('mousedown', touchStartHandler);
    $this.on('mousemove', touchMoveHandler);
    $this.on('mouseup', touchEndHandler);

    function touchStartHandler(e) {
        e.preventDefault();
        var evt = e.originalEvent;

        startX = e.pageX || evt.changedTouches[0].pageX;
        startY = e.pageY || evt.changedTouches[0].pageY;

        touchStarted = true;
        startTime = new Date();

        img = $(".sliderSpot > img");
        startImgX = img.offset().left, startImgY = img.offset().top;
        startImgW = img.width(), startImgH = img.height();

        var el = $(evt.target);

        if( /thumbs/.test(el.attr('src')) ){
            el.parent().trigger('mouseover');
            origX =startX, origY = startY;
        }
    }

    function touchMoveHandler(e) {
        e.preventDefault();
        var evt = e.originalEvent;

        liveX = e.pageX || evt.changedTouches[0].pageX;
        liveY = e.pageY || evt.changedTouches[0].pageY;

        if(touchStarted){
            deltaX = liveX - startX;
            deltaY = liveY - startY;

            if( new Date() - startTime>750){
                adjusting = true;
            }
        }
    };

    function touchEndHandler(e) {
        e.preventDefault();
        var tgt = $(e.target) || $(e.originalEvent.target);

//for desktop only
       // tgt.trigger('click');

        if ( tgt.attr('id') != "undefined" && tgt.attr('id') != "captionContent" ) {
            console.log(tgt.attr('id'))

            var dX = Math.abs(deltaX), dY = Math.abs(deltaY);
            if(dX >= MIN_LENGTH_X || dY >= MIN_LENGTH_Y){
                captionPanelClosed = true
                doSwipe();
            }
            if( Math.abs(deltaX) < 5 ){
                if(localTrip){

                    returnToPages(tgt);

                    localTrip = false;
                }else{
                    var e_parent = tgt[0].parentElement;
                    if (e_parent.className=='thumbnail') {

                        displayBigThumb(e_parent.id);

                        localTrip = true;
                    }
                }
            }
        }
        if( !localTrip)
            initCaption(e, liveX);///for not to show on localTrip

        touchCancelHandler();
    };
    function touchCancelHandler(e) {
        deltaX = 0;
        touchStarted = false;
        adjusting = false;
        swiping = false;
    };
    function doSwipe() {
        swiping=true;
        if ( startX > liveX ) {
            displaynext(1);
        }
        else displaynext(-1);
    };
//     return this;
 }
//})(jQuery);
