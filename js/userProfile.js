function userProfile(id, userID) {
    this.elementID = id;
    this.elem = document.getElementById(id);
    this.currentUserID = userID;
    this.activeTab = "books";

    this.getUserInfo();
}

userProfile.prototype.getUserInfo = function () {
    var userProfileObject = this;

    global.openLoader("#" + this.elementID);
    global.get(global.apiAddress + "user/" + this.currentUserID, function (data) {
        global.closeLoader(userProfileObject.elementID);
        userProfileObject.elem.querySelector("#avatar").setAttribute("src", "http://www.mobidik.com/resim/kullanici/" + data.ID + "/300/300.jpg");
        userProfileObject.elem.querySelector("#name").innerHTML = data.Name;
        userProfileObject.elem.querySelector("#location").innerHTML = data.Location;
        userProfileObject.elem.querySelector("#info").innerHTML = data.Description;


        if (data.TotalBookCount != 0)
            userProfileObject.elem.querySelector("#bookCount .number").innerHTML = data.TotalBookCount;
        else {
            userProfileObject.elem.querySelector("#bookCount").remove();
            userProfileObject.activeTab = "library";
        }

        if (data.TotalShelfCount != 0) {
            userProfileObject.elem.querySelector("#libraryCount .number").innerHTML = data.TotalShelfCount + " raf";
            userProfileObject.library = new library(data.TotalShelfCount);
        }
        else {
            userProfileObject.elem.querySelector("#libraryCount").remove();
            userProfileObject.activeTab = "followers";
        }


        userProfileObject.elem.querySelector("#followerCount .number").innerHTML = data.TotalFollowerCount;
        userProfileObject.elem.querySelector("#followingCount .number").innerHTML = data.TotalFollowsCount;

        userProfileObject.followers = new followers(data.TotalFollowerCount);
        userProfileObject.followings = new followings(data.TotalFollowsCount);


        var menuObjects = userProfileObject.elem.querySelectorAll("#menu li");
        for (var i = 0; i < menuObjects.length; i++) {
            Hammer(menuObjects[i]).on("tap", function () {
                userProfileObject.changeTab(this.getAttribute("data-target"));
            });
        }

        userProfileObject.elem.querySelector("#userProfile").style.display = "block";

        userProfileObject.contentScroll = new IScroll('#' + userProfileObject.elementID + ' #scrollable', { probeType: 3, mouseWheel: true, bounce: true, momentum: true, click: true });
        userProfileObject.contentScroll.on('scrollEnd', function () {
            if (this.y < (this.maxScrollY) + 50) {
                if (userProfileObject.activeTab == "library")
                    if ((userProfileObject.library.currentPage + 1) * userProfileObject.library.countInPage < userProfileObject.library.shelfCount && !userProfileObject.library.loading) {
                        userProfileObject.library.currentPage++;
                        userProfileObject.getLibrary(true);
                    }
            }
        });
        userProfileObject.changeTab(userProfileObject.activeTab);
    }, "jsonp");
}

userProfile.prototype.changeTab = function (target) {
    if (this.elem.querySelector("#" + this.activeTab) != null) {
        this.elem.querySelector("#" + this.activeTab).style.display = "none";
    }

    this.activeTab = target;
    //this.elem.querySelector("#" + this.activeTab).style.display = "block";

    if (this.elem.querySelector("#menu li.active") != null)
        this.elem.querySelector("#menu li.active").classList.remove("active");

    this.elem.querySelector("#menu li[data-target=" + this.activeTab + "]").classList.add("active");

    if (this.elem.querySelector("#" + this.activeTab).getAttribute("data-loaded") != "true") {
        global.openLoader("#" + this.elementID + " #subContent");


        switch (this.activeTab) {
            case "books":
                break;
            case "library":
                this.getLibrary();
                break;
            case "followers":
                this.getFollowers();
                break;
            case "followings":
                this.getFollowings();
                break;
            default:
                break;
        }
    }
    else {
        this.elem.querySelector("#" + this.activeTab).style.display = "block";
        this.contentScroll.refresh();
    }
}

function library(shelfCount) {
    this.shelfCount = shelfCount;
    this.currentPage = 0;
    this.countInPage = 2;
    this.bookCountInPage = 8;
    this.loading = false;
}

userProfile.prototype.getLibrary = function (append) {
    var userProfileObject = this;
    userProfileObject.library.loading = true;
    if (append) {
        global.openLoader("#" + userProfileObject.elementID + " #newShelfLoader");
    }
    global.get(global.apiAddress + "user/shelves/" + this.currentUserID + "?count=" + this.library.countInPage + "&page=" + this.library.currentPage, function (data) {
        global.closeLoader("subContent");
        userProfileObject.elem.querySelector("#" + userProfileObject.activeTab).setAttribute("data-loaded", "true");

        userProfileObject.elem.querySelector("#" + userProfileObject.activeTab).style.display = "block";
        for (var i = 0; i < data.length; i++) {
            var html = "<li><div class='shelf_header'>" + data[i].ShelfName + "</div><div class='count'>toplam " + data[i].BookCount + " kitap</div><div class='shelf_scroller' id='shelfScroller_" + data[i].ShelfID + "'><ul class='book_list' id='shelf_" + data[i].ShelfID + "'></ul></div></li>";
            userProfileObject.elem.querySelector("#shelfList").insertAdjacentHTML("beforeend", html);

            if (append) {
                userProfileObject.elem.querySelector("#shelfList #newShelfLoader").remove();
            }

            global.openLoader("#" + userProfileObject.elementID + " #shelfList #shelfScroller_" + data[i].ShelfID);

            global.get(global.apiAddress + "shelf/books/" + data[i].ShelfID + "?count=" + userProfileObject.library.bookCountInPage + "&page=0", function (bookData) {
                var bookHtml = "";
                for (var k = 0; k < bookData.Books.length; k++) {
                    bookHtml += books.getBookItemHtml(bookData.Books[k].BookID, bookData.Books[k].BookName, ((global.windowWidth / 3) < 200 ? Math.round(global.windowWidth / 3) : Math.round(global.windowWidth / 5)));
                }
                userProfileObject.elem.querySelector("#shelfList #shelf_" + bookData.ShelfID).insertAdjacentHTML("beforeend", bookHtml);
                global.closeLoader("shelfScroller_" + bookData.ShelfID);

                new IScroll(userProfileObject.elem.querySelector("#shelfList #shelf_" + bookData.ShelfID).parentNode, { probeType: 3, mouseWheel: true, bounce: true, momentum: true, click: true, scrollX: true, scrollY: true, eventPassthrough: 'vertical' });

                Hammer(userProfileObject.elem.querySelector("#shelfList #shelf_" + bookData.ShelfID).parentNode).on("swipeleft", function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    return false;
                });

                Hammer(userProfileObject.elem.querySelector("#shelfList #shelf_" + bookData.ShelfID).parentNode).on("swiperight", function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    return false;
                });

                $("#shelf_" + bookData.ShelfID).imagesLoaded(function (instance) {
                    userProfileObject.contentScroll.refresh();
                });

            }, "jsonp");
            userProfileObject.library.loading = false;
        }
        userProfileObject.elem.querySelector("#shelfList").insertAdjacentHTML("beforeend", "<li id='newShelfLoader'></li>");
        userProfileObject.contentScroll.refresh();
    }, "jsonp");
}

function followers(followerCount) {
    this.followerCount = followerCount;
    this.currentPage = 0;
    this.countInPage = 20;
    this.loading = false;
}

userProfile.prototype.getFollowers = function (append) {
    var userProfileObject = this;
    userProfileObject.followers.loading = true;
    $("#" + userProfileObject.elementID + " #followerList li").css("opacity", 0);
    global.get(global.apiAddress + "user/followers/" + this.currentUserID + "?count=" + this.followers.countInPage + "&page=" + this.followers.currentPage, function (data) {
        var html = "";
        for (var i = 0; i < data.length; i++) {
            html += "<li><a href='#page=userProfile&userID=" + data[i].ID + "'><div class='avatar'><img  width='100' height='100' src='http://www.mobidik.com/resim/kullanici/" + data[i].ID + "/200/200.jpg' />" +
                "<div class='name'>" + data[i].Name + "</div></a></li>";
        }
        userProfileObject.elem.querySelector("#followerList").insertAdjacentHTML("beforeend", html);
        userProfileObject.elem.querySelector("#" + userProfileObject.activeTab).style.display = "block";
        $("#" + userProfileObject.elementID + " #followerList").imagesLoaded(function (instance) {

            $("#" + userProfileObject.elementID + " #followerList").isotope({
                itemSelector: 'li'
            }, function () {
                global.closeLoader("subContent");
                $("#" + userProfileObject.elementID + " #followerList li").css("opacity", 1);
                userProfileObject.contentScroll.refresh();
                userProfileObject.elem.querySelector("#" + userProfileObject.activeTab).setAttribute("data-loaded", "true");
            });
        });
    }, "jsonp");
}

function followings(followingCount) {
    this.followingCount = followingCount;
    this.currentPage = 0;
    this.countInPage = 20;
    this.loading = false;
}

userProfile.prototype.getFollowings = function (append) {
    var userProfileObject = this;
    userProfileObject.followings.loading = true;
    $("#" + userProfileObject.elementID + " #followingList li").css("opacity", 0);
    global.get(global.apiAddress + "user/followings/" + this.currentUserID + "?count=" + this.followings.countInPage + "&page=" + this.followings.currentPage, function (data) {
        var html = "";
        for (var i = 0; i < data.length; i++) {
            html += "<li><a href='#page=userProfile&userID=" + data[i].ID + "'><div class='avatar'><img  width='100' height='100' src='http://www.mobidik.com/resim/kullanici/" + data[i].ID + "/200/200.jpg' />" +
                "<div class='name'>" + data[i].Name + "</div></a></li>";
        }
        userProfileObject.elem.querySelector("#followingList").insertAdjacentHTML("beforeend", html);

        userProfileObject.elem.querySelector("#" + userProfileObject.activeTab).style.display = "block";
        $("#" + userProfileObject.elementID + " #followingList").imagesLoaded(function (instance) {

            $("#" + userProfileObject.elementID + " #followingList").isotope({
                itemSelector: 'li'
            }, function () {
                global.closeLoader("subContent");
                $("#" + userProfileObject.elementID + " #followingList li").css("opacity", 1);
                userProfileObject.contentScroll.refresh();
                userProfileObject.elem.querySelector("#" + userProfileObject.activeTab).setAttribute("data-loaded", "true");
            });
        });
    }, "jsonp");
}