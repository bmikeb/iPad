function initGestures(){
    var startX = 0, startY= 0, curX = 0, curY = 0
        ,startTime=0
        ,MIN_LENGTH_X = 72, MIN_LENGTH_Y = 50
        ,doubleClick = false, paused = false;
    swipeLengthX = 0, swipeLengthY = 0;

    $('#base').on('touchstart mousedown', touchStartHandler);
    $('#base').on('touchmove mousemove', touchMoveHandler);
    $('#base').on('touchend mouseup', touchEndHandler);

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
}

var ix = 0, prefix= 0, pages,
    IMG_WIDTH=1024,
    IMG_HEIGHT=768,
    H_counter=0, V_counter= 0,
    localTrip = false, resumed = false, next;



function resumeState(){
    IP = "testSite";
    CURR_USER = 'album.'+IP;
    pageInfo = {caption:'', times:[], stars:0 };
    if (localStorage.getItem(CURR_USER)==null){
        data = { lastPage:1, pages:[pageInfo] };
        localStorage.setItem(CURR_USER, JSON.stringify(data));
        prevSessionPage = 0;
    } else {
        data = JSON.parse(localStorage.getItem(CURR_USER));
        prevSessionPage = data.lastPage;
    }

    pages = JSON.parse(data);
    startWatchTime = new Date();

    html='<div id="sliderContainer">';
    html+='    <div id="slider">';
    html+='        <div class="sliderSpot">' + pages[0] + '</div>';
    html+='     </div>';
    html+='</div>';
    $('#base').html(html);

    slider = $('#slider');

    initGestures();

    resumed = true;

    displaynext( prevSessionPage);
}

function displaynext(shift){

    if(shift!=0 || !resumed) saveToStorage(ix);

    //var tgt = (shift) ? slider.children()":last") : slider.children(":first");
    var tgt =  slider.children();
    var next = (shift) ? tgt.before(tgt.clone(true)) : tgt.after(tgt.clone(true));

    H_counter += Number(shift);

    ix = normalizeIndex(ix + Number(shift));
    imgLength = (localTrip) ? thumbImages[prefix].length : thumbImages.length;

    setImage(next, slider, shift);

    slider.animate({left: left+'px'}, 1000, function(){
        if(shift) slider.children(':first').remove();
        else slider.children(':last').remove();

        data.lastPage = ix;
        localStorage.setItem(CURR_USER, JSON.stringify(data));

//        doCache();
    });
}
function doCache(){
    var imgC = new Image();
    $.each(pages[ix], function(i){
        imgC.src = "img/"+ix+"-"+i+".jpg";
    });

    cacheF = normalizeIndex(ix+1);
    imgC.src = "img/"+cacheF+".jpg";

    cacheB = normalizeIndex(ix-1);
    imgC.src = "img/"+cacheB+".jpg";
}
function normalizeIndex(ix){
    ix = ix > imgLength-1 ? 0 : ix;
    ix = ix < 0 ? imgLength-1 : ix;
    return ix;
}
function setImage(next, slider, shift){
    next.css({'left': IMG_WIDTH*H_counter+'px'});
    $('>div', next).html(pages[ix]);
    left = parseInt(slider.css('left')) - shift*IMG_WIDTH;
}
function saveToStorage(ix){
    var secs = parseInt((new Date()-startWatchTime)/1000);
    var info = data.pages[ix];
    if (!info)
        data.pages[ix] = {caption:'', times:[], stars:0 };
    data.pages[ix].times.push(secs);
    data.pages[ix].caption= $("#caption").text();
    data.pages[ix].stars = $.map($('#stars>li'), function(el){
        return (parseInt($(el).css("background-position-y")) == 0) ? null : 1;
    }).length;
    data.lastPage = ix;

    localStorage.setItem(CURR_USER, JSON.stringify(data))
}

resumeState();