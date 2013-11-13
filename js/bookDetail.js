var bookDetail = {
    currentBookID: 0,
    fixedHeader: false,
    lastScrollPosition: 0,
    categoryScroll: null,
    autoScroll: false,
    scrollPosition: "top",
    getBookDetail: function () {
        var bookDetailElement = document.getElementById("bookDetail");
        global.openLoader("#bookDetail #loader");
        global.get(global.apiAddress + "book/" + bookDetail.currentBookID, function (data) {
            console.log(data);
            document.getElementById("cover").style.backgroundImage = 'url("http://www.mobidik.com/resim/kitap/' + bookDetail.currentBookID + '/' + global.windowWidth * 2 + '/0.jpg")';

            document.getElementById("creatorAvatar").innerHTML = '<img  width="40" height="40" src="http://www.mobidik.com/resim/kullanici/' + data.AddedByUserID + '/100/100.jpg" />';
            document.getElementById("bookName").innerHTML = data.BookName;
            document.getElementById("authors").innerHTML = data.AuthorNames[0];
            document.getElementById("rating").setAttribute("data-value", data.TotalRating);
            document.getElementById("commentCount").innerHTML = "(" + data.TotalComment + " yorum)";
            document.getElementById("purchaseButton").innerHTML = data.Price == 0 ? "kütüphaneme ekle" : utils.formatPrice(data.Price) + " / satın al";
            console.log(document.getElementById("bookName").innerHTML)
            $("#bookDetail #cover").imagesLoaded(function (instance) {
                document.querySelector("#bookDetail #bookDetailContent").style.height = global.windowHeight - 50 + "px";
                bookDetailElement.querySelector("#bookDetailContent").style.display = "block";
                bookDetailElement.querySelector("#titleArea").style.display = "table";
                bookDetailElement.querySelector("#loader").style.display = "none";
                global.closeLoader("bookDetail");
                bookDetail.categoryScroll = new IScroll('#bookDetail', { probeType: 3, mouseWheel: true, bounce: false, momentum: false });
                bookDetail.categoryScroll.on('scroll', function () { bookDetail.onScroll(this) });
                bookDetail.categoryScroll.on('scrollEnd', function () { bookDetail.scrollEnd(this) });
                global.loadStars();
            });

        }, "jsonp");
    },
    setupBook: function () {
        bookDetail.getBookDetail();

    },
    onScroll: function (elem) {
        var top = bookDetail.categoryScroll.y;
        //document.getElementById("titleAreaBackground").style.backgroundPositionY = top+10 + "px";

        //document.querySelector("#bookDetail #cover").style.height = (global.windowHeight - top+50+45) + "px";


        //if (top > 85 && bookDetail.lastScrollPosition < top) {
        //    document.querySelector("#bookDetail #purchase").style.position = "fixed";
        //}
        //else if (top < 95 && bookDetail.lastScrollPosition > top) {
        //    document.querySelector("#bookDetail #purchase").style.position = "absolute";
        //}
        //
        //bookDetail.lastScrollPosition = top;
    },
    scrollEnd: function (elem) {

        var top = bookDetail.categoryScroll.y * -1;
        if (!bookDetail.autoScroll) {
            if (top - bookDetail.lastScrollPosition > global.windowHeight / 5) {
                bookDetail.scrollToMenu();
            }
            else if (bookDetail.lastScrollPosition - top > 0 || bookDetail.scrollPosition == "top") {
                bookDetail.scrollToTop();
            }
            else {
                bookDetail.scrollToMenu();
            }
            bookDetail.autoScroll = true;
            bookDetail.categoryScroll.disable();
        }
        else {
            bookDetail.autoScroll = false;
            bookDetail.categoryScroll.enable();
        }
        bookDetail.lastScrollPosition = top;
    },
    scrollToMenu: function () {
        var titleAreaHeight = document.getElementById("titleArea").clientHeight;
        var headerHeight = document.getElementById("layoutHeader").clientHeight;
        var purchaseHeight = document.getElementById("purchase").clientHeight;
        var subMenu = document.getElementById("menu").clientHeight;
        var scrollDifference = titleAreaHeight + headerHeight + subMenu + purchaseHeight;

        bookDetail.categoryScroll.scrollTo(0, (global.windowHeight - scrollDifference) * -1, 400);
        
        bookDetail.scrollPosition = "bottom";
    },
    scrollToTop: function () {
        bookDetail.categoryScroll.scrollTo(0, 0, 400);
        
        bookDetail.scrollPosition = "top";
    }
}