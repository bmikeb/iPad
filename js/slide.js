var ix = 0, prefix= 0,imgLength = thumbImages.length,
    IMG_WIDTH=1024, IMG_HEIGHT=768, GAP=10, STAR_X = 25,
    H_counter=0, V_counter=0 ;
var localTrip = false, resumed = false, next, prevStars=0;



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
    caption = $('.captionText');

    for(i=0; i<5; i++){
        $('<li/>').css({left: 25*i+GAP+'px'})
            .on('mouseover', function(){
                $(this).prevAll().andSelf().css({"background-position-y": "-21px"});
                $(this).nextAll().css({"background-position-y": "0"});
            })
            .on('mouseleave', function(){
                $(this).parent().children().css({"background-position-y": "0"});//reset
                $(this).parent().children(':lt('+prevStars+')').css({"background-position-y": "-21px"});
            })
            .on('click ', function(e){
                e.stopPropagation();
                prevStars = $(this).prevAll().andSelf().length;
                return false;
            })
        .appendTo($('#stars'));
    }

    $('.captionContainer').on('click', function(e){
        e.stopPropagation();
        caption.css({visibility:'visible'}).val($("#caption").text()).focus();
    });

    $('.sliderSpot').on('click', function(){
        if(caption.val().length!=0)
            $("#caption").text(caption.val().trim());
        caption.val('').css({visibility:'hidden'});
    });

//    $('#base').initGestures();
    initGestures()

    resumed = true;

    displaynext( prevSessionPage);
}

function displaynext(shift){

    if(shift!=0 || !resumed) saveToStorage(ix);

    var tgt = (shift) ? slider.children(":last") : slider.children(":first");
    var next = (shift) ? tgt.before(tgt.clone(true)) : tgt.after(tgt.clone(true));

    //before animation for being invisible
    $(".thumbnail", next).remove();
    $(".captionContainer", next).css({visibility:'hidden'});

    H_counter += Number(shift);

    ix = normalizeIndex(ix + Number(shift));
    imgLength = (localTrip) ? thumbImages[prefix].length : thumbImages.length;

    if(!localTrip){
        populateHotAreas(next)
    }
    setImage(next, slider, shift);

    slider.animate({left: left+'px'}, 1000, function(){
        if(shift) slider.children(':first').remove();
        else slider.children(':last').remove();

        data.lastPage = ix;
        localStorage.setItem(CURR_USER, JSON.stringify(data));

        prepareCaption();
        doCache();
    });
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
function prepareCaption(){
    pageInfo = JSON.parse(localStorage.getItem(CURR_USER)).pages[ix];
    currCaption = ( !pageInfo ) ? '' : pageInfo.caption;
    var currStars = ( !pageInfo ) ? 0 : pageInfo.stars;

    $('#stars >li').each(function(i){
        if(i<currStars) $(this).css({"background-position-y": "-21px"})
        else $(this).css({"background-position-y": "0"})
    })
    $('.captionContainer').children('span').text(currCaption);
}
function populateHotAreas(next){
    $.each(thumbImages[ix], function(i, info){
        $('<div/>').attr({'class':"thumbnail", 'id':ix+"-"+i}).css({top:info[1]+'px', left:info[2]+'px', width:info[3]+'px', height:info[4]+'px'})
            .html(' <img src="img/spacer.gif" style ="width:'+info[3]+'px; height:'+info[4]+'px" >')
            .appendTo( next);
    });
    $('img[src$="jpg"]').on('click', function(e){
        e.stopPropagation ? e.stopPropagation() : (e.cancelBubble=true)
    })
}
function displayBigThumb(id){
    $('.sliderSpot>img').attr({src: 'img/'+id+'.jpg'});
    ix = Number(id.split('-')[1]), prefix = Number(id.split('-')[0]);
    $('.sliderSpot>div').remove();

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
    }).length;
    data.lastPage = ix;

    localStorage.setItem(CURR_USER, JSON.stringify(data))
}

resumeState();