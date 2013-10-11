var homeBooks = {
    tabs: ["promoted", "newest", "sell"],
    activeTab: 0,
    activeAjax: null,
    openTab: function (el) {

        homeBooks.activeTab = el.getAttribute("data-action") * 1;
        homeBooks.getBooks();

    },
    getBooks: function () {

        var bookList = document.getElementById("bookList");

        //document.getElementById("content").style.overflowY = "hidden";

        var homeButtons = document.querySelectorAll(".sub_menu .item");

        [].forEach.call(homeButtons, function (el) {
            el.removeClassName("active");
        });

        var el = document.querySelector("[data-action='" + homeBooks.activeTab + "']");
        el.addClassName("active");

        var type = homeBooks.tabs[homeBooks.activeTab];

        bookList.innerHTML = "";
        bookList.style.height = "auto";
        bookList.style.opacity = 0;

        global.openLoader("#home #content");

        if (global.currentAjax != null)
            global.currentAjax.abort();

        global.get(global.apiAddress + "books/" + type, function (data) {
            var html = "";
            for (var i = 0; i < data.length; i++) {
                html += books.getBookItemHtml(data[i].BookID, data[i].BookName);
            }

            bookList.innerHTML = html;

            imagesLoaded('#home #bookList', function (instance) {
                if ($("#home #bookList").hasClass("isotope"))
                    $("#home #bookList").isotope('destroy');

                $("#home #bookList").isotope({
                    itemSelector: '.item',
                    resizable: false
                }, function () {
                    global.closeLoader();
                    //document.getElementById("content").style.overflowY = "auto";
                    bookList.style.opacity = 1;
                    $("#home #bookList li").css({ opacity: 1 });

                    //myScroll = new IScroll('#content');
                });
            });
        }, "jsonp");


    },
    prevTab: function () {
        if (homeBooks.activeTab != 0) {
            homeBooks.activeTab--;
            homeBooks.getBooks();
        }
    },
    nextTab: function () {
        if (homeBooks.activeTab + 1 != homeBooks.tabs.length) {
            homeBooks.activeTab++;
            homeBooks.getBooks();
        }
    },
    setupBindings: function () {
        var homeButtons = document.querySelectorAll(".sub_menu .item");

        for (var i = 0; i < homeButtons.length; i++) {
            homeButtons[i].addEventListener("click", function () {
                homeBooks.openTab(this);
            });
        }

        //Hammer(document).on("swipeleft", function (event) {
        //    homeBooks.nextTab();
        //});

        //Hammer(document).on("swiperight", function (event) {
        //    homeBooks.prevTab();
        //});
    },
    loadPage: function () {
        homeBooks.setupBindings();
        homeBooks.openTab(document.getElementById("btnPromotedBooks"));
        initFastButtons();
    }
}
