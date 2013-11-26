function bookDetail(id, bookID) {
    this.elementID = id;
    this.elem = document.getElementById(id);
    this.currentBookID = bookID;
    this.init();
    return this;
}

bookDetail.prototype.init = function () {
    this.fixedHeader = false;
    this.bookName = null;
    this.lastScrollPosition = 0;
    this.categoryScroll = null;
    this.autoScroll = false;
    this.scrollPosition = "top";
    this.subScroll = null;
    this.activeTab = "bookDetailDetails";
    this.setupBook();
}

bookDetail.prototype.getBookDetail = function () {
    this.comments = new comments();
    this.shelves = new shelves();
    var bookDetailObject = this;
    var bookDetailElement = this.elem;

    global.openLoader("#" + this.elementID + " #loader");

    global.get(global.apiAddress + "book/" + this.currentBookID, function (data) {

        bookDetailElement.querySelector("#cover").style.backgroundImage = 'url("http://www.mobidik.com/resim/kitap/' + bookDetailObject.currentBookID + '/' + global.windowWidth * 2 + '/0.jpg")';

        bookDetailElement.querySelector("#creatorAvatar").innerHTML = '<img  width="40" height="40" src="http://www.mobidik.com/resim/kullanici/' + data.AddedByUserID + '/100/100.jpg" />';

        bookDetailElement.querySelector("#bookName").innerHTML = data.BookName;
        bookDetailObject.bookName = data.BookName;

        bookDetailElement.querySelector("#authors").innerHTML = data.AuthorNames[0];
        bookDetailElement.querySelector("#rating").setAttribute("data-value", data.TotalRating);
        bookDetailElement.querySelector("#commentCount").innerHTML = "(" + data.TotalComment + " yorum)";
        bookDetailElement.querySelector("#purchaseButton").innerHTML = data.Price == 0 ? "kütüphaneme ekle" : utils.formatPrice(data.Price) + " / satın al";

        if (data.ShortDescription != null)
            bookDetailElement.querySelector("#shortDescription").innerHTML = "\"" + data.ShortDescription + "\"";

        bookDetailElement.querySelector("#description").innerHTML = data.Description;
        bookDetailElement.querySelector("#specs").innerHTML += "<li>" + data.Language + "</li>";
        bookDetailElement.querySelector("#specs").innerHTML += "<li>" + data.AddedByUserName + " yayınladı</li>";

        if (data.TranslatorName != null)
            bookDetailElement.querySelector("#specs").innerHTML += "<li>" + data.TranslatorName + "</li>";

        if (data.HasAdultContent)
            bookDetailElement.querySelector("#specs").innerHTML += "<li>+18 içerik içerir</li>";

        for (var i = 0; i < data.Categories.length; i++) {
            if (data.Categories[i] != "")
                bookDetailElement.querySelector("#specs").innerHTML += "<li>" + data.Categories[i] + "</li>";
        }

        if (data.Keywords.length > 0)
            for (var i = 0; i < data.Keywords.length; i++) {
                if (data.Keywords[i] != "")
                    bookDetailElement.querySelector("#tags").innerHTML += "<li>" + data.Keywords[i] + "</li>";
            }
        else
            bookDetailElement.querySelector("#tags").style.display = "none";

        bookDetailElement.querySelector("#bookDetailContent").style.display = "block";
        bookDetailElement.querySelector("#bookDetailSubContent").style.display = "block";

        bookDetailElement.querySelector("#titleArea").style.display = "table";
        bookDetailElement.querySelector("#loader").style.display = "none";

        bookDetailObject.setDetailArea(true, false);

        global.closeLoader("bookDetail");

        bookDetailObject.categoryScroll = new IScroll('#' + bookDetailObject.elementID, { probeType: 3, mouseWheel: true, bounce: false, momentum: false });
        bookDetailObject.categoryScroll.on('scrollEnd', function () { bookDetailObject.scrollEnd(this) });

        var buttons = document.querySelectorAll("#menu li");
        for (var i = 0; i < buttons.length; i++) {
            Hammer(buttons[i]).on("tap", function () {
                for (var i = 0; i < buttons.length; i++) {
                    buttons[i].classList.remove("active");
                }
                this.classList.add("active");
                bookDetailObject.changeTab(this.getAttribute("data-target"), this);
            });
        }

        global.loadStars();

    }, "jsonp");
}

bookDetail.prototype.setupBook = function () {
    this.getBookDetail();
}

bookDetail.prototype.changeTab = function (tabName, elem) {
    if (this.scrollPosition == "top") {
        this.scrollToMenu();
    }

    this.activeTab = tabName;
    this.elem.querySelector("#bookDetailSubContent .active").style.display = "none";
    this.elem.querySelector("#bookDetailSubContent .active").classList.remove("active");

    this.elem.querySelector("#" + tabName).style.display = "block";
    this.elem.querySelector("#" + tabName).classList.add("active");

    if (elem.getAttribute("data-loaded") == "false") {
        global.openLoader("#" + tabName);
        elem.setAttribute("data-loaded", "true");
        if (tabName == "bookDetailComments") {
            this.loadComments();
        }
        else if (tabName == "bookDetailShelves") {
            this.loadShelves();
        }
        else if (tabName == "bookDetailShare") {
            global.closeLoader("bookDetailShare");
            var bookDetailObject = this;
            Hammer(this.elem.querySelector("#bookDetailShare .facebook")).on("tap", function () {
                var new_window = window.open("https://www.facebook.com/sharer/sharer.php?u=http://www.mobidik.com/e-kitap/" + bookDetailObject.currentBookID + "/", "facebookWindow", "resizable=0")
            });

            Hammer(this.elem.querySelector("#bookDetailShare .twitter")).on("tap", function () {
                var new_window = window.open("https://twitter.com/intent/tweet?url=" + encodeURIComponent("http://www.mobidik.com/e-kitap/" + bookDetailObject.currentBookID) + "&text=" + encodeURIComponent(bookDetailObject.bookName + " mobidikcom'da"), "twitterWindow", "resizable=0")
            });

            Hammer(this.elem.querySelector("#bookDetailShare .google")).on("tap", function () {
                var new_window = window.open("https://plus.google.com/share?url=http://www.mobidik.com/e-kitap/" + bookDetailObject.currentBookID + "/", "googleWindow", "resizable=0")
            });

            this.setDetailArea(false, true);
        }
    }
    else {
        this.setDetailArea(false, true);
    }
}

bookDetail.prototype.scrollEnd = function (elem) {

    var top = this.categoryScroll.y * -1;
    if (!this.autoScroll) {
        if (top - this.lastScrollPosition > global.windowHeight / 5) {
            this.scrollToMenu();
        }
        else if (this.lastScrollPosition - top > 0 || this.scrollPosition == "top") {
            this.scrollToTop();
        }
        else {
            this.scrollToMenu();
        }
        this.autoScroll = true;
        this.categoryScroll.disable();
    }
    else {
        this.autoScroll = false;
        this.categoryScroll.enable();
    }
    this.lastScrollPosition = top;
}

bookDetail.prototype.scrollToMenu = function () {
    var titleAreaHeight = this.elem.querySelector("#titleArea").clientHeight;
    var headerHeight = document.querySelector("#layoutHeader").clientHeight;
    var purchaseHeight = this.elem.querySelector("#purchase").clientHeight;
    var subMenu = this.elem.querySelector("#menu").clientHeight;
    var scrollDifference = titleAreaHeight + headerHeight + subMenu + purchaseHeight;
    this.categoryScroll.scrollTo(0, (global.windowHeight - scrollDifference) * -1, 400);

    this.scrollPosition = "bottom";
}

bookDetail.prototype.scrollToTop = function () {
    this.categoryScroll.scrollTo(0, 0, 400);

    this.scrollPosition = "top";
}
bookDetail.prototype.setDetailArea = function (init, scrollToTop) {
    var titleAreaHeight = document.getElementById("titleArea").clientHeight;
    var headerHeight = document.getElementById("layoutHeader").clientHeight;
    var purchaseHeight = document.getElementById("purchase").clientHeight;
    var subMenu = document.getElementById("menu").clientHeight;
    var scrollDifference = titleAreaHeight + headerHeight + subMenu + purchaseHeight;

    this.elem.querySelector("#bookDetailContent").style.height = global.windowHeight - 50 + "px";
    this.elem.querySelector("#bookDetailSubContent").style.height = (global.windowHeight - scrollDifference) + "px";
    //document.getElementById("bookDetail").querySelector("#bookDetailSubContent #scrollArea").style.minHeight = (global.windowHeight - scrollDifference) + "px";

    var bookDetailObject = this;

    if (init) {
        this.subScroll = new IScroll('#bookDetailSubContent', { probeType: 3, mouseWheel: true, bounce: true, momentum: true });
        this.subScroll.on('scroll', function (e) {
            if ((this.startY < 0 && this.directionY == -1) || this.directionY == 1) {
                bookDetailObject.categoryScroll.disable();
                document.getElementById("menu").classList.add("shadow");
            }
            else if (this.directionY != 0) {
                bookDetailObject.categoryScroll.enable();

            }
        });
        this.subScroll.on('scrollEnd', function (e) {
            // bookDetailObject.categoryScroll.enable(); -open later-

            if (this.y > -50) {
                bookDetailObject.elem.querySelector("#menu").classList.remove("shadow");
            }
            if (this.y < (this.maxScrollY) + 5) {
                if (bookDetailObject.activeTab == "bookDetailComments" && (bookDetailObject.comments.currentPage + 1) * bookDetailObject.comments.countInPage < bookDetailObject.comments.totalCount) {
                    global.openLoader("#" + bookDetailObject.elementID + " #bookDetailComments #loaderMore");
                    bookDetailObject.comments.currentPage++;
                    bookDetailObject.loadComments();
                }
            }
        });
    }
    else {
        if (scrollToTop)
            this.subScroll.scrollTo(0, 0, 0);
        //bookDetail.subScroll.destroy();
        var bookDetailObject = this;
        setTimeout(function () {
            bookDetailObject.subScroll.refresh();
            document.getElementById("menu").classList.remove("shadow");
        }, 50);
        //
    }
}

function comments() {
    this.countInPage = 5;
    this.currentPage = 0;
    this.totalCount = 0;
}

bookDetail.prototype.loadComments = function () {
    var bookDetailObject = this;
    global.get(global.apiAddress + "book/comments/" + this.currentBookID + "?page=" + this.comments.currentPage + "&count=" + this.comments.countInPage, function (data) {
        var html = "";
        for (var i = 0; i < data.CommentList.length; i++) {
            var d = new Date(data.CommentList[i].DateAdded);
            var curr_date = d.getDate();
            var curr_month = d.getMonth() + 1;
            var curr_year = d.getFullYear();
            var dateString = curr_date + "." + curr_month + "." + curr_year;
            html += "<li>" +
                "<div class='avatar'><img src='http://www.mobidik.com/resim/kullanici/" + data.CommentList[i].UserID + "/100/100.jpg'></div>" +
                "<div class='details'><div class='username'>" + data.CommentList[i].UserName + "</div>" +
                "<div class='date'>" + dateString + "</div>" +
                "<div class='rating' data-value='" + data.CommentList[i].Rating + "'></div>" +
                "<div class='comment'>" + data.CommentList[i].Text + "</div>";
            if (data.CommentList[i].ReplyList.length > 0) {
                html += "<ul class='replies'>";
                for (var k = 0; k < data.CommentList[i].ReplyList.length; k++) {
                    d = new Date(data.CommentList[i].ReplyList[k].DateAdded);
                    curr_date = d.getDate();
                    curr_month = d.getMonth() + 1;
                    curr_year = d.getFullYear();
                    dateString = curr_date + "." + curr_month + "." + curr_year;
                    html += "<li>" +
                     "<div class='avatar'><img src='http://www.mobidik.com/resim/kullanici/" + data.CommentList[i].ReplyList[k].UserID + "/100/100.jpg'></div>" +
                     "<div class='details'><div class='username'>" + data.CommentList[i].ReplyList[k].UserName + "</div>" +
                     "<div class='date'>" + dateString + "</div>" +
                     "<div class='comment'>" + data.CommentList[i].ReplyList[k].Text + "</div></div>" +
                    "</li>";
                }
            }
            html += "</div></li>";
        }

        bookDetailObject.comments.totalCount = data.CommentCount;
        if (bookDetailObject.comments.totalCount > bookDetailObject.comments.countInPage * (bookDetailObject.comments.currentPage + 1))
            html += "<div id='loaderMore' class='loadMore'></div>";

        if (bookDetailObject.elem.querySelector("#bookDetailComments #loaderMore") != null)
            document.querySelector("#bookDetailComments #loaderMore").remove();

        global.closeLoader("bookDetailComments");

        document.getElementById("commentList").innerHTML += html;
        global.loadStars();
        bookDetailObject.setDetailArea(false, false);
    }, "jsonp");
}

function shelves() {
    this.countInPage = 5;
    this.currentPage = 0;
    this.totalCount = 0;
}
bookDetail.prototype.loadShelves = function () {
    var bookDetailObject = this;
    global.get(global.apiAddress + "book/shelves/" + this.currentBookID + "?page=" + this.shelves.currentPage + "&count=" + this.shelves.countInPage, function (data) {
        var html = "";
        for (var i = 0; i < data.ShelfList.length; i++) {

            html += "<li>" +
                "<div class='avatar'><img src='http://www.mobidik.com/resim/kullanici/" + data.ShelfList[i].UserID + "/200/200.jpg'></div>" +
                "<div class='details'><div class='name'>" + data.ShelfList[i].ShelfName + "</div>" +
                "<div class='username'>" + data.ShelfList[i].Username + "</div>" +
                "</li>";
        }

        bookDetailObject.shelves.totalCount = data.ShelfCount;
        if (bookDetailObject.shelves.totalCount > bookDetailObject.shelves.countInPage * (bookDetailObject.shelves.currentPage + 1))
            html += "<div id='loaderMore' class='loadMore'></div>";

        if (document.querySelector("#bookDetailShelves #loaderMore") != null)
            document.querySelector("#bookDetailShelves #loaderMore").remove();

        global.closeLoader("bookDetailShelves");

        document.getElementById("shelfList").innerHTML += html;
        global.loadStars();

        bookDetailObject.setDetailArea(false, false);
    }, "jsonp");
}
