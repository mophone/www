var searchResult = {
    currentPage: 0,
    selectedCategory: 0,
    keyword: null,
    itemCount: 5,
    totalItemCount: 0,
    loading: false,
    scroll: null,
    parent: null,
    setupPaging: function (results) {

        var listener = function () {
            var scrollBottom = this.scrollHeight - this.clientHeight;
            var scrollPosition = this.scrollTop;
            if (scrollPosition + 150 >= scrollBottom && (searchResult.currentPage + 1) * searchResult.itemCount < searchResult.totalItemCount && !searchResult.loading) {
                searchResult.loading = true;
                searchResult.currentPage++;
                searchResult.search("appended");
            }
        }

        searchResult.parent.querySelector("#content").removeEventListener("onscroll", listener, false);
        searchResult.parent.querySelector("#content").onscroll = listener;
    },
    putLoader: function () {
        if ((searchResult.currentPage + 1) * searchResult.itemCount < searchResult.totalItemCount) {
            var bookList = searchResult.parent.querySelector("#bookList");
            bookList.style.height = (bookList.clientHeight + 100) + "px";
            var loader = document.createElement('li');
            loader.className = "books_loader";
            loader.id = "bookListLoader";
            bookList.appendChild(loader);
            global.openLoader("#searchResult #bookListLoader");
        }
    },
    search: function (type) {
       
        searchResult.parent = document.getElementById("searchResult");
        var booksContainer = searchResult.parent.querySelector("#bookList");

        global.openLoader("#searchResult #content");

        global.get(global.apiAddress + "books/search?keyword=" + searchResult.keyword + "&count=" + searchResult.itemCount + "&page=" + searchResult.currentPage + "&categoryID=" + searchResult.selectedCategory, function (results) {

            var categoryContainer = searchResult.parent.querySelector("#categories");
            if (categoryContainer.innerHTML == "") {
                categoryContainer.innerHTML += '<div class="item fastbutton active" data-action="0">Tümü</div>';
                for (var i = 0; i < results.FoundCategories.length; i++) {
                    categoryContainer.innerHTML += '<div class="item fastbutton"  data-action="' + results.FoundCategories[i].ID + '">' + results.FoundCategories[i].Name + '</div>';
                }
                //
                var categoryScroll = new IScroll('#searchResult #categoriesWrapper', { scrollX: true, scrollY: false, mouseWheel: true, bounce: false });

                var categoryButtons = categoryContainer.querySelectorAll(".item");
                for (var i = 0; i < categoryButtons.length; i++) {
                    Hammer(categoryButtons[i]).on("tap", function (event) {

                        [].forEach.call(categoryButtons, function (el) {
                            el.removeClassName("active");
                        });

                        this.addClassName("active");

                        categoryScroll.scrollToElement(this, 200, -100);

                        booksContainer.innerHTML = "";
                        searchResult.currentPage = 0;
                        searchResult.selectedCategory = this.getAttribute("data-action");
                        searchResult.search("categoryChange");
                    });
                }
                Hammer(searchResult.parent.querySelector('#searchResult #categoriesWrapper')).on("swipeleft", function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    return false;
                });

                Hammer(searchResult.parent.querySelector('#searchResult #categoriesWrapper')).on("swiperight", function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    return false;
                });
            }


            var items = "";
            var elems = [];
            var fragment = document.createDocumentFragment();
            fragment.innerHTML = "";
            for (var i = 0; i < results.Result.length; i++) {
                var div = document.createElement('div');
                div.innerHTML = books.getBookItemHtml(results.Result[i].BookID, results.Result[i].BookName);
                var elem = div.childNodes[0];
                fragment.appendChild(elem);
                elems.push(elem);
            }


            searchResult.totalItemCount = results.FilteredResultCount;
            var msnry = Masonry.data(booksContainer);
            booksContainer.appendChild(fragment);




            $("#home #bookList").imagesLoaded(function (instance) {
                //searchResult.parent.querySelector("#content").style.overflowY = "hidden";
                if ($("#searchResult #bookList").hasClass("isotope") && type == "appended") {
                    $("#searchResult #bookList").isotope("appended", $(elems),
                        function () {
                            if (searchResult.parent.querySelector("#bookListLoader") != null)
                                searchResult.parent.querySelector("#bookListLoader").remove();
                            searchResult.loading = false;
                            $("#searchResult #bookList li").css({ opacity: 1 });
                            //searchResult.parent.querySelector("#content").style.overflowY = "auto";
                            searchResult.putLoader();
                            //searchResult.scroll.refresh();
                        })
                }
                else {
                    if ($("#searchResult #bookList").hasClass("isotope"))
                        $("#searchResult #bookList").isotope('destroy');

                    $("#searchResult #bookList").isotope({
                        itemSelector: '.item'
                    }, function () {
                        global.closeLoader();
                        booksContainer.style.opacity = 1;
                        searchResult.setupPaging();
                        searchResult.loading = false;
                        $("#searchResult #bookList li").css({ opacity: 1 });
                        searchResult.parent.querySelector("#content").style.overflowY = "auto";
                        searchResult.putLoader();
                        //searchResult.scroll = new IScroll('#content', { probeType: 3});
                        //searchResult.scroll.on('scroll', searchResult.updatePosition);

                    });
                }

            });
        }, "jsonp");
    }
}
