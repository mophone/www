function searchResult(id) {
    this.elementID = id;
    this.elem = document.getElementById(id);
    this.currentPage = 0;
    this.selectedCategory = 0;
    this.keyword = null;
    if (global.windowHeight > 500)
        this.itemCount = 10;
    else
        this.itemCount = 5;
    this.totalItemCount = 0;
    this.loading = false;
    this.scroll = null;
    return this;
}

searchResult.prototype.setupPaging = function (results) {

    var searchResultObject = this;
    var listener = function () {
        var scrollBottom = this.scrollHeight - this.clientHeight;
        var scrollPosition = this.scrollTop;
        console.log(scrollBottom)
        if (scrollPosition + 150 >= scrollBottom && (searchResultObject.currentPage + 1) * searchResultObject.itemCount < searchResultObject.totalItemCount && !searchResultObject.loading) {
            searchResultObject.loading = true;
            searchResultObject.currentPage++;
            searchResultObject.search("appended");
        }
    }
    this.categoryScroll = new IScroll('#' + this.elementID + ' #scrollable', { probeType: 3, mouseWheel: true, bounce: true, momentum: true });
}

searchResult.prototype.putLoader = function () {
    if ((this.currentPage + 1) * this.itemCount < this.totalItemCount) {
        var bookList = this.elem.querySelectorAll("#bookList")[0];
        bookList.style.height = (bookList.clientHeight + 100) + "px";
        var loader = document.createElement('li');
        loader.className = "books_loader";
        loader.id = "bookListLoader";
        bookList.appendChild(loader);
        global.openLoader("#" + this.elementID + " #bookListLoader");
    }
}

searchResult.prototype.search = function (type) {

    var searchResultObject = this;
    var booksContainer = this.elem.querySelectorAll("#bookList")[0];

    global.openLoader("#" + this.elementID + " #content");

    this.elem.querySelector("#noResult").style.display = "none";

    global.get(global.apiAddress + "books/search?keyword=" + this.keyword + "&count=" + this.itemCount + "&page=" + this.currentPage + "&categoryID=" + this.selectedCategory, function (results) {
        try {
            if (results.ResultCount > 0) {


                var categoryContainer = searchResultObject.elem.querySelector("#categories");
                if (categoryContainer.innerHTML == "") {
                    booksContainer.innerHTML = "";

                    if (searchResultObject.selectedCategory == 0)
                        categoryContainer.innerHTML += '<div class="item active" data-action="0">T�m�</div>';
                    else
                        categoryContainer.innerHTML += '<div class="item active" data-action="' + searchResultObject.selectedCategory + '">T�m�</div>';
                    for (var i = 0; i < results.FoundCategories.length; i++) {
                        if (searchResultObject.selectedCategory == 0) {
                            categoryContainer.innerHTML += '<div class="item"  data-action="' + results.FoundCategories[i].ID + '">' + results.FoundCategories[i].Name + '</div>';
                        }
                        else if (searchResultObject.selectedCategory == results.FoundCategories[i].ID) {
                            for (var k = 0; k < results.FoundCategories[i].ChildCategories.length; k++) {
                                categoryContainer.innerHTML += '<div class="item"  data-action="' + results.FoundCategories[i].ChildCategories[k].ID + '">' + results.FoundCategories[i].ChildCategories[k].Name + '</div>';
                            }
                        }
                    }
                    //
                    var categoryScroll = new IScroll('#' + searchResultObject.elementID + ' #categoriesWrapper', { scrollX: true, scrollY: false, mouseWheel: true, bounce: false });

                    var categoryButtons = categoryContainer.querySelectorAll(".item");
                    for (var i = 0; i < categoryButtons.length; i++) {
                        Hammer(categoryButtons[i]).on("tap", function (event) {

                            [].forEach.call(categoryButtons, function (el) {
                                el.removeClassName("active");
                            });

                            this.addClassName("active");

                            categoryScroll.scrollToElement(this, 200, -100);

                            booksContainer.innerHTML = "";
                            searchResultObject.currentPage = 0;
                            searchResultObject.selectedCategory = this.getAttribute("data-action");
                            searchResultObject.search("categoryChange");
                        });
                    }
                    Hammer(searchResultObject.elem.querySelectorAll('#categoriesWrapper')[0]).on("swipeleft", function (event) {
                        event.stopPropagation();
                        event.preventDefault();
                        return false;
                    });

                    Hammer(searchResultObject.elem.querySelectorAll('#categoriesWrapper')[0]).on("swiperight", function (event) {
                        event.stopPropagation();
                        event.preventDefault();
                        return false;
                    });
                }

                var items = "";
                var elems = [];
                var fragment = document.createDocumentFragment();
                fragment.innerHTML = "";
                var html = "";
                for (var i = 0; i < results.Result.length; i++) {
                    var div = document.createElement('div');
                    div.innerHTML = books.getBookItemHtml(results.Result[i].BookID, results.Result[i].BookName);
                    var elem = div.childNodes[0];
                    fragment.appendChild(elem);
                    elems.push(elem);
                }


                searchResultObject.totalItemCount = results.FilteredResultCount;
                $("#" + searchResultObject.elementID + " #bookList")[0].appendChild(fragment);

                $("#" + searchResultObject.elementID + " #bookList").imagesLoaded(function (instance) {

                    global.closeLoader(searchResultObject.elementID);
                    //searchResult.parent.querySelector("#content").style.overflowY = "hidden";
                    if ($("#" + searchResultObject.elementID + " #bookList").hasClass("isotope") && type == "appended") {
                        $("#" + searchResultObject.elementID + " #bookList").isotope("appended", $(elems),
                            function () {
                                if (searchResultObject.elem.querySelector("#bookListLoader") != null)
                                    searchResultObject.elem.querySelector("#bookListLoader").remove();
                                searchResultObject.loading = false;
                                $("#" + searchResultObject.elementID + " #bookList li").css({ opacity: 1 });
                                //searchResult.parent.querySelector("#content").style.overflowY = "auto";
                                searchResultObject.putLoader();
                                //searchResult.scroll.refresh();
                            })
                    }
                    else {
                        if ($("#" + searchResultObject.elementID + " #bookList").hasClass("isotope"))
                            $("#" + searchResultObject.elementID + " #bookList").isotope('destroy');

                        $("#" + searchResultObject.elementID + " #bookList").isotope({
                            itemSelector: '.item'
                        }, function () {
                            global.closeLoader();
                            booksContainer.style.opacity = 1;
                            searchResultObject.setupPaging();
                            searchResultObject.loading = false;

                            $("#" + searchResultObject.elementID + " #bookList li").css({ opacity: 1 });
                            searchResultObject.elem.querySelectorAll("#content")[0].style.overflowY = "auto";
                            searchResultObject.putLoader();
                            //searchResult.scroll = new IScroll('#content', { probeType: 3});
                            //searchResult.scroll.on('scroll', searchResult.updatePosition);

                        });
                    }

                });
            }
            else {
                global.closeLoader(searchResultObject.elementID);
                booksContainer.innerHTML = "";
                searchResultObject.elem.querySelector("#noResult").style.display = "block";
            }
        }
        catch (ex) {
            console.log(ex);
        }

    }, "jsonp");
}

