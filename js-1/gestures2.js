//(function($){
//    $.fn.initGestures= function(){
function initGestures(arg){
        var startX = 0, startY= 0, curX = 0, curY = 0
            ,startTime=0
            ,MIN_LENGTH_X = 72, MIN_LENGTH_Y = 50
            ,doubleClick = false, paused = false;
        swipeLengthX = 0, swipeLengthY = 0;
//        $this = $(this);
    $this = arg;

//        return this.each(function(){
            $this.on('touchstart mousedown', touchStartHandler);
            $this.on('touchmove mousemove', touchMoveHandler);
            $this.on('touchend mouseup', touchEndHandler);

            function touchStartHandler(e) {
                e.preventDefault();
                startX = e.pageX;
                startY = e.pageY;
                if(startTime == 0) {
                    startTime = new Date();
                }else {
                    var delta = new Date() - startTime;
                    if(delta>75 && delta <300){
                        doubleClick = true;
                    }
                    else if (delta>300){
                        startTime = new Date();
                        doubleClick = false;

                    }else{
                        startTime=0;
                        doubleClick = false;
                    }
                }
            };

            function touchMoveHandler(e) {
                e.preventDefault();
                curX = e.pageX;
                curY = e.pageY;

                setTimeout(function(){
                    if( e.pageY > 700 && (e.pageX > curX-10 && e.pageX < curX+10) ){
                        $('.captionContainer').css({visibility: 'visible'});
                    }
                }, 1000);
                if( e.pageY < 700)
                    $('.captionContainer').css({visibility: 'hidden'});
            };

            function touchEndHandler(e, innerNum) {
                e.preventDefault();

                if ( curX != 0 || curY !=0) {
                    swipeLengthX = Math.abs(curX - startX);
                    swipeLengthY = Math.abs(curY - startY);
                    if ( e.target.className != "caption") {
                        if(swipeLengthX >= MIN_LENGTH_X
                            || swipeLengthY >= MIN_LENGTH_Y
                            && curY > 650){

                            processingRoutine();

                            touchCancelHandler();
                            return;
                        }
                    }
                }
                setTimeout(function(){//passing e as event causes error
                    var tgt = $(e.target);
                    if(doubleClick && tgt[0].className != "caption") {
                        if(tgt.attr('src').indexOf('-')!=-1){
                            tgt.attr({src: "img/"+prefix+ ".jpg"});
                            ix = prefix;
                            populateHotAreas($('#slider').children(":first"));
                            localTrip = false;
                        }
                    }else{
                        curX = curX || startX;
                        curY = curY || startY;
                        var e_parent = tgt[0].parentElement;
                        if ( Math.abs(curX - startX) < 5){
                            if (e_parent.className=='thumbnail') {
                                displayBigThumb(e_parent.id);
                                localTrip = true;
                            }
                        }
                    }
                    touchCancelHandler(e);
                }, 300)
            };
            function touchCancelHandler(event) {
                startX = 0, startY = 0;
                curX = 0, curY = 0;
            };
            function processingRoutine() {
                if ( startX > curX ) {
                    displaynext(1);
                }
                else displaynext(-1);
            };
//         return this;
//        })
    }
//})(jQuery);