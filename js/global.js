
Element.prototype.hasClassName = function (name) {
    return new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)").test(this.className);
};

Element.prototype.addClassName = function (name) {
    if (!this.hasClassName(name)) {
        this.className = this.className ? [this.className, name].join(' ') : name;
    }
};

Element.prototype.removeClassName = function (name) {
    if (this.hasClassName(name)) {
        var c = this.className;
        this.className = c.replace(new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)", "g"), "");
    }
};

Element.prototype.remove = function () {
    this.parentElement.removeChild(this);
}

var leftMenu = {
    status: false,
    openned: false,
    curtainDisplay: null,
    toggle: function () {
        var menu = document.getElementById("leftMenu");
        if (!leftMenu.openned) {
            leftMenu.open();
        }
        else {
            leftMenu.close();
        }
    },
    open: function () {
        document.getElementById("content").style.overflowY = "hidden";
        var menu = document.getElementById("leftMenu");
        var curtain = document.getElementById("leftMenuCurtain");
        menu.style.transform = "translate(250px,0px)";
        menu.style.MozTransform = "translate(250px,0px)";
        menu.style.webkitTransform = "translate(250px,0px)";
        clearTimeout(leftMenu.curtainDisplay);
        curtain.style.right = "0";
        curtain.style.opacity = "0.4";
        menu.setAttribute('data-closed', false);

        if (!leftMenu.status) {
            setTimeout(function () {
                $.get("./leftMenu.html?t=" + (new Date().getTime()), function (data) {
                    menu.insertAdjacentHTML("afterbegin", data);
                    var links = document.querySelectorAll("menu a");
                    for (var i = 0; i < links.length; i++) {
                        links[i].addEventListener("click", function () {
                            alert("");
                        });
                    }
                });
            }, 500);

            leftMenu.status = true;
        }
        leftMenu.openned = true;
    },
    close: function () {
        document.getElementById("content").style.overflowY = "auto";
        var menu = document.getElementById("leftMenu");
        var curtain = document.getElementById("leftMenuCurtain");
        menu.style.transform = "translate(0px,0px)";
        menu.style.MozTransform = "translate(0px,0px)";
        menu.style.webkitTransform = "translate(0px,0px)";
        curtain.style.opacity = "0";

        leftMenu.curtainDisplay = setTimeout(function () {
            curtain.style.right = "auto";
        }, 300);
        menu.setAttribute('data-closed', true);
        leftMenu.openned = false;
    }
}

var headerSearch = {
    status: false,
    toggle: function () {
        if (!headerSearch.status) {
            document.getElementById("headerTitle").style.display = "none";
            document.getElementById("headerSearchArea").style.display = "block";
            document.getElementById("btnHeaderSearch").style.right = document.getElementById("txtHeaderSearch").clientWidth - 20 + "px";
            document.getElementById("txtHeaderSearch").focus();
            headerSearch.status = true;
        }
        else {
            document.getElementById("headerTitle").style.display = "block";
            document.getElementById("btnHeaderSearch").style.right = "0px";
            document.getElementById("headerSearchArea").style.display = "none";
            setTimeout(function () {
                headerSearch.status = false;
            }, 300);
        }
    },
    submit: function () {


        if (global.activePage != "searchResult") {
            global.goToPage("searchResult", true);
        }
        else {
            global.goToPage("searchResult", false);
        }
    }
}

var global = {
    device: null,
    windowWidth: 0,
    windowHeight: 0,
    itemCount: 2,
    bookItemImageWidth: 0,
    apiAddress: "http://192.168.2.77:1002/",
    history: new Array(),
    statusHistory: new Array(),
    loadHistory: new Array(),
    hashHistory: new Array(),
    currentHash: null,
    currentAjax: null,
    activePage: null,
    firstLoad: true,
    returnBack: false,
    openPage: false,
    currentPageLevel: 1,
    setupBindings: function () {
        Hammer(document.getElementById("btnLeftMenu")).on("tap", function () {
            leftMenu.toggle();
        });

        Hammer(document.getElementById("leftMenuCurtain")).on("tap", function () {
            leftMenu.toggle();

        });

        Hammer(document.getElementById("btnHeaderSearch")).on("tap", function () {
            if (!headerSearch.status)
                headerSearch.toggle();
        });

        Hammer(document.getElementById("btnBack")).on("tap", function () {
            window.history.back();
        });

        document.getElementById("txtHeaderSearch").addEventListener("blur", function () {
            if (this.value == "")
                headerSearch.toggle();
        });

        Hammer(document).on("swipeleft", function (event) {
            leftMenu.close();
        });

        Hammer(document).on("swiperight", function (event) {
            leftMenu.open();
        });

        document.getElementById("frmSearchBook").addEventListener("submit", function (e) {
            headerSearch.submit();
            e.preventDefault();
            return false;
        });

        document.getElementById("btnCancelSearch").addEventListener("click", function () {

        });

        $(document).on("click", "a", function () {
            global.openPage = true;
        });
    },
    loadHoverable: function () {
        var hoverable = document.querySelector(".hoverable");
        hoverable.addEventListener("touchstart", function () {
            hoverable.classList.add("active");
        });

        hoverable.addEventListener("touchend", function () {
            hoverable.classList.remove("active");
        });
    },
    get: function (url, callback, type) {
        global.currentAjax = $.ajax({
            url: url + (type != "jsonp" ? ".html?t=" + (new Date().getTime()) : ""),
            dataType: type == "jsonp" ? "jsonp" : "html",
            method: "GET",
            beforeSend: function (xhr) {
                if (type == "jsonp") {
                    xhr.setRequestHeader('Accept', 'application/json');
                    xhr.setRequestHeader('Content-Type', 'application/json');
                }
                else {
                    xhr.setRequestHeader('Content-Type', 'text/html');
                }
            }
        }).done(function (data) {
            if (type != "jsonp") {
                global.closeLoader("container");
                document.getElementById("container").insertAdjacentHTML("beforeend", data);
                document.getElementById("container").lastElementChild.setAttribute("id", "page_" + global.currentPageLevel);
                document.getElementById("page_" + global.currentPageLevel).style.zIndex = global.currentPageLevel;
                global.initPageFunctions(url);
            }
            if (callback != null)
                callback(data);
        }).fail(function (jqXHR, textStatus, errorThrown) { });

    },
    goToPage: function (url, pushHistory, parameters) {
        if (pushHistory) {
            global.openPage = true;
            $.bbq.pushState({ "page": url });
        }
        else {
            if (document.getElementById(global.activePage) != null)
                document.getElementById(global.activePage).remove();

            global.activePage = url;
            global.openLoader("#container");

            global.currentAjax = global.get(url, null, null);
        }
    },
    goToBack: function (index) {
        var state = $.bbq.getState();
        if (global.currentAjax != null)
            global.currentAjax.abort();

        if (index <= 0) {
            document.getElementById("page_" + (global.currentPageLevel)).remove();
            global.activePage = global.history[global.history.length - 1];
            global.history.splice(global.history.length - 1, 1);
            global.hashHistory.splice(global.hashHistory.length - 1, 1);

            global.currentPageLevel--;
        }
        else {
            var length = global.history.length;
            for (var i = index ; i < length; i++) {
                document.getElementById("page_" + (i + 2)).remove();
                global.currentPageLevel--;
                global.activePage = global.history[global.history.length - 1];
                global.history.splice(global.history.length - 1, 1);
                global.hashHistory.splice(global.history.length - 1, 1);
            }
        }

        if (global.history.length == 0) {
            //if (global.device = "IOS") {
            document.getElementById("btnBack").style.display = "none";
            document.getElementById("btnLeftMenu").style.display = "block";
            //}
        }

        document.getElementById("page_" + global.currentPageLevel).style.display = "block";

        global.returnBack = true;
        global.statusHistory[global.activePage] = true;
        document.getElementById("txtHeaderSearch").value = "";
        if (headerSearch.status)
            headerSearch.toggle();
    },
    initPageFunctions: function (url) {
        switch (url) {
            case "home":
                homeBooks.loadPage();
                homeBooks.pageID = "page_" + global.currentPageLevel;
                if (global.firstLoad) {
                    global.hashChange();
                    global.firstLoad = false;
                }
                break;
            case "searchResult":
                var state = $.bbq.getState();
                var searchResultObject = new searchResult("page_" + global.currentPageLevel);
                var keyword = document.getElementById("txtHeaderSearch").value;
                if (keyword != "") {
                    searchResultObject.keyword = keyword;
                }
                if (typeof state.category != "undefined") {
                    searchResultObject.selectedCategory = state.category;
                    searchResultObject.keyword = "";
                }

                searchResultObject.search();

                document.getElementById("txtHeaderSearch").blur();
                break;
            case "bookDetail":
                var state = $.bbq.getState();
                new bookDetail("page_" + global.currentPageLevel, state.bookID);
                break;
            case "categories":
                categories.getCategories();
                break;
            default:
                break;
        }
    },
    openLoader: function (query) {
        if (document.querySelector(query + " .spinner") == null)
            global.loadSpinner(document.querySelector(query));
    },
    closeLoader: function (id) {
        if (document.querySelector("#" + id + " .spinner") != null)
            document.querySelector("#" + id + " .spinner").remove();
    },
    loadSpinner: function (target) {
        var opts = {
            lines: 13, // The number of lines to draw
            length: 0, // The length of each line
            width: 7, // The line thickness
            radius: 21, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: '#444', // #rgb or #rrggbb or array of colors
            speed: 1.4, // Rounds per second
            trail: 66, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: false, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            top: '20px', // Top position relative to parent in px
            left: 'auto' // Left position relative to parent in px
        };
        var spinner = new Spinner(opts).spin(target);
    },
    setupSizes: function () {
        global.windowWidth = window.innerWidth;
        global.windowHeight = window.innerHeight;
        global.itemCount = 2;

        if (global.windowWidth > 800)
            global.itemCount = 6;
        else if (global.windowWidth > 600)
            global.itemCount = 4;
        else if (global.windowWidth > 480)
            global.itemCount = 3;

        global.bookItemImageWidth = Math.round(((global.windowWidth - global.itemCount * 16) / global.itemCount) * window.devicePixelRatio);
        //alert(((global.windowWidth - global.itemCount * 16) / global.itemCount));
    },
    loadStars: function () {
        var ratingObjects = document.querySelectorAll(".rating");
        for (var i = 0; i < ratingObjects.length; i++) {
            var object = ratingObjects[i];
            object.innerHTML = "<div class='full'></div>";
            var width = utils.parseDouble(object.getAttribute("data-value")) * 16;
            object.querySelector(".full").style.width = width + "px";
        }
    },
    hashChange: function () {
        if (leftMenu.openned) {
            leftMenu.close();
        }
        var state = $.bbq.getState();

        var page = "";
        if (typeof state.page != "undefined")
            page = state.page;
        else
            page = "home";

        if (typeof state.unique != "undefined") {
            global.openPage = false;
            //for (var i = 2; i <= global.history.length; i++) {
            //    document.getElementById("page_" + i).remove();
            //    global.currentPageLevel--;
            //    global.activePage = global.history[global.history.length - 1];
            //    global.history.splice(i, 1);
            //    global.hashHistory.splice(i, 1);
            //}
        }

        if ((!global.firstLoad || (global.firstLoad && page != "home")) && !global.returnBack) {
            if (global.history.indexOf(page) > -1 && !global.openPage) {
                global.goToBack(global.history.indexOf(page));
            }
            else {
                if (!global.loadHistory["page_" + global.currentPageLevel])
                    global.statusHistory["page_" + global.currentPageLevel] = false;
                else
                    document.getElementById("page_" + global.currentPageLevel).style.display = "none";

                document.getElementById("page_" + global.currentPageLevel).style.zIndex = global.currentPageLevel;
                global.currentPageLevel++;
                global.history.push(global.activePage);
                global.hashHistory.push(global.currentHash);
                //if (global.device = "IOS") {
                document.getElementById("btnBack").style.display = "block";
                document.getElementById("btnLeftMenu").style.display = "none";

                global.activePage = state.page;
                global.currentHash = state;
                global.openLoader("#container");
                global.statusHistory["page_" + global.currentPageLevel] = true;
                global.currentAjax = global.get(state.page, null, null);
            }
        }
        global.openPage = false;
        global.returnBack = false;
    },
    ready: function () {
        global.setupSizes();
        global.setupBindings();

        global.loadHoverable();

        initFastButtons();

        global.goToPage("home", false);


        $(window).bind('hashchange', function (e) {
            global.hashChange();
        });
    }
}

var utils = {
    formatPrice: function (price) {
        var dplaces = 2;
        price = price.toFixed(dplaces) + " TL";
        return price;
    },
    parseDouble: function (val) {
        val = val.toString().replace(",", ".");
        val = (Math.round(val * 100) / 100);
        return parseFloat(val);
    }
}

var books = {
    getBookItemHtml: function (bookID, bookName) {
        return '<li  class="item" style="width:' + ((global.windowWidth - global.itemCount * 16) / global.itemCount) + 'px;">' +
                   '<a href="#page=bookDetail&bookID=' + bookID + '"><div class="cover">' +
                         '<img width="' + ((global.windowWidth - global.itemCount * 16) / global.itemCount) + 'px" src="http://www.mobidik.com/resim/kitap/' + bookID + '/' + global.bookItemImageWidth + '/0.jpg" />' +
                     '</div>' +
                     '<div class="info">' +
                         '<div class="name">' +
                        bookName +
                         '</div>' +
                         '<div class="authors">' +
                         'Arzach Mills' +
                         '</div>' +
                     '</div>' +
                 '</a></li>';
    },
    openBook: function (bookID) {
        bookDetail.currentBookID = bookID;
        global.goToPage("bookDetail", true, [{ "bookID": bookID }]);
    }
}
$(document).ready(function () {
    global.ready();


});