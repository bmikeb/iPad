 ix = 0, prefix= 0,imgLength = thumbImages.length,
    IMG_WIDTH=1024, IMG_HEIGHT=768, GAP=10, GAP_P= 5, STAR_W = 25,
    H_counter=0, V_counter=0 ;

 localTrip = false, resumed = false;
 captionPanelOpened = false;

function addStars(i) {
    var starsSelected = false,
    prevStars;

    for (i = 0; i < 5; i++) {
        $('<li/>').css({left:STAR_W * i + GAP + 'px'})
            .on('hover', function () {
                if( !starsSelected){
                    prevStars = $(this).prevAll().andSelf();
                    prevStars.css({"background-position-y":"-21px"});
                    prevStarsLen = prevStars.length;
                    $(this).nextAll().css({"background-position-y":"0"});
                }
            })
            .on('mouseleave', function () {
                $(this).parent().children().css({"background-position-y":"0"});//reset
                $(this).parent().children(':lt(' + prevStarsLen + ')').css({"background-position-y":"-21px"});
            })
            .on('click touchend', function (e) {
                e.stopPropagation();
                starsSelected = true;

                return false;
            })
            .appendTo($('#stars'));
    }
}
function previewsHandler() {
    for (var i = 0; i < thumbImages.length; i++) {

//$(img).prop returns absolute path to file

        $('<div><img src="img/thumbs/' + i + '.jpg"></div>')
            .css({left: 60 + (100 + GAP_P)* i + 'px'})
            .on('touchstart', function(){

            })
		.on('mousedown', function () {
            //.on('touchend', function () {
                el = $(this);
                dup = $(this).clone().appendTo(previewPanel)
                    .css({'margin-left':"-10px", 'margin-top':"-10px"})
                    .children().addClass('activeThumb')

                var thisID = parseInt($('img', this).attr('src').match(/[0-9]+/)[0]);
                var currPageID = parseInt($('.sliderSpot > img').attr('src').match(/[0-9]+/)[0]);

                displaynext(thisID - currPageID);

                 setTimeout(function(){
                     dup.remove();
                     el.addClass('currentThumb');

                 }, 300)
            })
            .appendTo(previewPnl);
    }
    arrowsHandler();
}
function arrowsHandler(){
    var cw = 20, ch = 1.3*cw;
    var leftArr = '<div><canvas id="LA" width='+cw+'"px" height="30"></canvas></div>';
    $(leftArr).prependTo(previewPnl);

    var LActx = $('#LA')[0].getContext('2d');
    with(LActx){
        beginPath(), moveTo(cw,0), lineTo(0,ch/2), lineTo(cw,ch);
        fillStyle = "4f4f4f";
        fill();
    }

    var rightArr = '<div><canvas id="RA" width='+cw+'"px" height="30"></canvas></div>';
    $(rightArr).appendTo(previewPnl);

    var RActx = $('#RA')[0].getContext('2d');
    RActx.beginPath(); LActx.moveTo(cw,0), LActx.lineTo(0,ch/2), LActx.lineTo(cw,ch);
    RActx.fillStyle = "4f4f4f";
    RActx.fill();
}
function handleCaptionText(){
    $('body')
        .on('click', function(e){
            if(evt.pageY < 700)
                return;

            e.originalEvent.stopPropagation();
            e.originalEvent.cancelBubble=true;

            if(captionPanelClosed){
                $('#caption').show();
                captionInput.css({visibility:'hidden'})
            }else{
                captionInput
                    .val( $("#caption").text() )//make text updateable
                    .css({visibility:'visible'})
                    .focus()
                    .on('keypress', function(e){
                        if(e.keyCode==13){
                            $('#caption').text( captionInput.val().trim() )
                                .show()
                            captionInput.css({visibility:'hidden'})
                        }
                    })
                $('#caption').hide();
            }
    })
    captionPanelClosed = false;
}
function captionHandler() {
    addStars();

    starsSelected = false;
}
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

    startWatchTime = new Date();

    html='<div id="sliderContainer">';
    html+='    <div id="slider">';
    html+='        <div class="sliderSpot"><img src="img/0.jpg">';
    html+='            <div class="captionContainer">';
    html+='                <ul id="stars"></ul>';
    html+='                <span id="caption"></span>';
    html+='            </div>';
    html+='        </div>';
    html+='     </div>';
    html+='</div>';
    $('#base').html(html);

    slider = $('#slider');
    captionInput = $('#captionInput');
    previewPnl = $("#previewPanel");
    caption = $('.captionContainer');

    captionHandler();
    previewsHandler();

    initGestures();

    resumed = true;

    displaynext( prevSessionPage);
}

function displaynext(shift){

    if(shift!=0 || !resumed) saveToStorage(ix);

    var tgt = (shift) ? slider.children(":last") : slider.children(":first");
    var next = (shift) ? tgt.before(tgt.clone(true)) : tgt.after(tgt.clone(true));

    //before animation being invisible
    $(".thumbnail", next).remove();
    $(".captionContainer", next).css({visibility: 'hidden'});

    H_counter += Number(shift);

    $('#previewPanel > div').removeClass('currentThumb');

    ix = normalizeIndex(ix + Number(shift));
    imgLength = (localTrip) ? thumbImages[prefix].length : thumbImages.length;

    if(!localTrip){
        populateHotAreas(next)
    }
    setImage(next, slider, shift);

    slider.animate({left: left+'px'}, 800, function(){
        if(shift) slider.children(':first').remove();
        else slider.children(':last').remove();

        data.lastPage = ix;
        localStorage.setItem(CURR_USER, JSON.stringify(data));

        updateThumbPanel(ix);

        $(".captionContainer", next).css({visibility: 'visible', opacity:0});
        setCaption(ix);

        doCache();
    });
}
function updateThumbPanel(ix){
    $('#previewPanel > div').removeClass('currentThumb');
    $('#previewPanel > div').eq(ix+1).addClass('currentThumb');//shift for arrow
}
function doCache(){
    var imgC = new Image();
    $.each(thumbImages[ix], function(i){
        imgC.src = "img/"+ix+"-"+i+".jpg";
    })

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
    $('>img:first', next).attr({'src': "img/"+ (localTrip ? prefix+"-":"") +ix+".jpg"});
    left = parseInt(slider.css('left')) - shift*IMG_WIDTH;
}
function setCaption(ix){
    pageInfo = JSON.parse(localStorage.getItem(CURR_USER)).pages[ix];
    currCaption = ( !pageInfo ) ? '' : pageInfo.caption;
    var currStars = ( !pageInfo ) ? 0 : pageInfo.stars;

    $('#stars >li').each(function(i){
        if(i<currStars) $(this).css({"background-position-y": "-21px"})
        else $(this).css({"background-position-y": "0"})
    })
    if( !localTrip) $('#caption').text(currCaption);
}
function populateHotAreas(next){
    $.each(thumbImages[ix], function(i, info){
        $('<div/>').attr({'class':"thumbnail", 'id':ix+"-"+i})
            .css({top:info[1]+'px', left:info[2]+'px', width:info[3]+'px', height:info[4]+'px'})
            .html(' <img src="img/spacer.gif" style ="width:'+info[3]+'px; height:'+info[4]+'px" >')
            .appendTo( next);
    });
    $('img[src$="jpg"]').on('click', function(e){
        e.stopPropagation ? e.stopPropagation() : (e.cancelBubble=true)
    })
}
function displayBigThumb(id){

    previewPnl.hide();

    $('.sliderSpot>img').attr({src: 'img/'+id+'.jpg'});
    ix = Number(id.split('-')[1]);
    prefix = Number(id.split('-')[0]);
    $('.sliderSpot > .thumbnail').remove();

    var base = id.split('-')[0];
    for(i=0; i<thumbImages[base].length; i++){
        var img = new Image();
        img.src = "img/"+base+'-'+i+'.jpg';
    }
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
        }
    ).length;
    data.lastPage = ix;

    localStorage.setItem(CURR_USER, JSON.stringify(data))
}

//resumeState();
