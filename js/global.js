
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
    curtainDisplay: null,
    toggle: function () {
        var menu = document.getElementById("leftMenu");
        if (menu.getAttribute('data-closed') == "true") {
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
                $.get("./leftMenu.html", function (data) {
                    menu.insertAdjacentHTML("afterbegin", data);
                });
            }, 500);

            leftMenu.status = true;
        }
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
        searchResult.keyword = document.getElementById("txtHeaderSearch").value;
        searchResult.currentPage = 0;
        global.goToPage("searchResult", true);
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
    currentAjax: null,
    activePage: null,
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
            if (global.currentAjax != null)
                global.currentAjax.abort();
            
            document.getElementById(global.activePage).remove();
            document.getElementById(global.history[global.history.length - 1]).style.display = "block";
            global.activePage = global.history[global.history.length - 1];

            document.getElementById("txtHeaderSearch").value = "";
            if(headerSearch.status)
                headerSearch.toggle();
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
            url: url + (type != "jsonp" ? ".html" : ""),
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
                global.closeLoader();
                document.getElementById("container").insertAdjacentHTML("beforeend", data);
                global.initPageFunctions(url);
            }
            if (callback != null)
                callback(data);
        }).fail(function (jqXHR, textStatus, errorThrown) { });

    },
    goToPage: function (url, pushHistory) {
        if (pushHistory) {
            document.getElementById(global.activePage).style.display = "none";
            global.history.push(global.activePage);
            //global.history.push({ html: document.getElementById("container").innerHTML, page: global.activePage });
            //if (global.device = "IOS") {
            document.getElementById("btnBack").style.display = "block";
            document.getElementById("btnLeftMenu").style.display = "none";
            //}
        }
        global.activePage = url;
        global.openLoader("#container");

        global.currentAjax = global.get(url, null, null);
    },
    initPageFunctions: function (url) {
        switch (url) {
            case "home":
                homeBooks.loadPage();
                break;
            case "searchResult":
                searchResult.search();
                document.getElementById("txtHeaderSearch").blur();
                break;
            default:
                break;
        }
    },
    openLoader: function (query) {
        if (document.querySelector(query + " .spinner") == null)
            global.loadSpinner(document.querySelector(query));
    },
    closeLoader: function () {
        if (document.querySelector(".spinner") != null)
            document.querySelector(".spinner").remove();
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
    }
}

var books = {
    getBookItemHtml: function (bookID, bookName) {
        return '<li class="item" style="width:' + ((global.windowWidth - global.itemCount * 16) / global.itemCount) + 'px;">' +
                   '<div class="cover">' +
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
                 '</li>';
    },
}
$(document).ready(function () {

    global.setupSizes();
    global.setupBindings();

    global.loadHoverable();

    initFastButtons();

    global.goToPage("home", false);
});