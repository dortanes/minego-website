const copy = function (text) {
  var $tempInput =  $("<textarea>");
  $("body").append($tempInput);
  $tempInput.val(text).select();
  document.execCommand("copy");
  $tempInput.remove();
};

const copyIp = function () {
  copy('mc.minego.me');
  toastr.success('IP скопирован!');
  return false;
};

$(function() {
    $.get('/api/ping', function (data) {
        $('#online').text(data.online + '/' + data.max);
    }).fail(function () {
        $('#online').text('Ошибка');
    });

    $(".shop_section .shop_container .right_side .slider .product_block").on({
        mouseenter: function() {
            var image = $(this).find('img');
            if ($(this).hasClass('active')) return;
            image.attr("src", `images/products/${$(this).data('icon')}_hover.svg`);
        },
        mouseleave: function() {
            if (!$(this).hasClass('active')) {
                var image = $(this).find('img');
                image.attr("src", `images/products/${$(this).data('icon')}.svg`);
            } else {
                var image = $(this).find('img');
                image.attr("src", `images/products/${$(this).data('icon')}_hover.svg`);
            }

        }
    });

    $(".shop_section .shop_container .right_side .slider .product_block").click(function() {
        let elem = $(this);
        $(".shop_section .shop_container .right_side .slider .product_block").each(function() {
            if ($(this) != elem) {
                $(this).removeClass('active');
                var image = $(this).find('img');
                image.attr("src", `images/products/${$(this).data('icon')}.svg`);
            }

        })
        $(this).addClass('active');
        var image = $(this).find('img');
        image.attr("src", `images/products/${$(this).data('icon')}_hover.svg`);
        $('input[name="id_pack"]').val($(this).data('id'));
        $('.shop_section .shop_container .right_side .footer .price').removeClass('hidden');
        $('.shop_section .shop_container .right_side .footer .price .value').html(`${$(this).data('price')}₽`)
            // var image = $(this).find('img');
            // image.attr("src", `images/products/${$(this).data('id')}.svg`);
    });
    $('header .mobile_nav').click(function() {
        $(this).toggleClass('show');
        $('header nav').toggleClass('show');
        $('html').toggleClass('no_scroll');
    })

    $('.shop_section .shop_container .slider').slick({
        // infinite: true,
        slidesToShow: 5,
        slidesToScroll: 1,

        responsive: [{
                breakpoint: 1050,
                settings: {

                    slidesToShow: 3
                }
            },
            {
                breakpoint: 790,
                settings: {

                    slidesToShow: 4
                }
            },
            {
                breakpoint: 500,
                settings: {

                    slidesToShow: 3
                }
            },
            {
                breakpoint: 390,
                settings: {

                    slidesToShow: 2
                }
            }

        ],
        prevArrow: $('.shop_section .shop_container .right_side .header_slider .arrows img.left'),
        nextArrow: $('.shop_section .shop_container .right_side .header_slider .arrows img.right'),

    });
    $('header .row .menu .mobile_menu').click(function() {
        $(this).toggleClass('active');
        $('header .row .menu .menu_list').toggleClass('active');
        $('html').toggleClass('active');
    })
    $('.mode_section .row .slider').slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        // arrows: false,
        prevArrow: $('.mode_section .row .arrows img.left'),
        nextArrow: $('.mode_section .row .arrows img.right'),
        responsive: [{
                breakpoint: 1050,
                settings: {

                    slidesToShow: 2
                }
            },
            {
                breakpoint: 790,
                settings: {

                    slidesToShow: 1
                }
            },

        ],
    });
})