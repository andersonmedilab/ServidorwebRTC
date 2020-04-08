function adaptImage(targetimg) {
    var wheight = $(window).height();
    var wwidth = $(window).width(); 

 
    targetimg.removeAttr("width")
    .removeAttr("height")
    .css({ width: "", height: "" }); 

    var imgwidth = targetimg.width(); 
    var imgheight = targetimg.height(); 

    var destwidth = wwidth; 
    var destheight = wheight; 

   
    if(imgheight < wheight) {

    destwidth = (imgwidth * wheight)/imgheight;

    $('#fundo img').height(destheight);
        $('#fundo img').width(destwidth);
    }

  
    destheight = $('#fundo img').height();
    var posy = (destheight/2 - wheight/2);
    var posx = (destwidth/2 - wwidth/2);

 
    if(posy > 0) {
    posy *= -1;
    }
    if(posx > 0) {
    posx *= -1;
    }
m
    $('#fundo').css({'top': posy + 'px', 'left': posx + 'px'});
    }


    $(window).resize(function() {
    adaptImage($('#fundo img'));
});

$(window).load(function() {
    $(window).resize();
});