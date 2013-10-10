var searchResult = {
    currentPage: 0,
    selectedCategory: 0,
    keyword: null,
    itemCount: 5,
    totalItemCount: 0,
    loading: false,
    scroll: null,
    //updatePosition: function () {
    //    var scrollBottom = this.scrollHeight - this.clientHeight;
    //    var scrollPosition = this.scrollTop;
        
    //    if (this.y < this.maxScrollY && (searchResult.currentPage + 1) * searchResult.itemCount < searchResult.totalItemCount && !searchResult.loading) {
    //        console.log(this);
    //        searchResult.loading = true;
    //        searchResult.currentPage++;
    //        document.getElementById("bookList").style.height = (document.getElementById("bookList").clientHeight + 100) + "px";
    //        //searchResult.scroll = new IScroll('#content', { probeType: 3 });
    //        //.scroll.scrollTo(0, this.maxScrollY, 200);
    //        searchResult.scroll.refresh();
           

    //        //this.scrollTop += 400;
    //        var loader = document.createElement('li');
    //        loader.className = "books_loader";
    //        loader.id = "bookListLoader";
    //        document.getElementById("bookList").appendChild(loader);
    //        global.openLoader("bookListLoader");
    //        searchResult.scroll.scrollTo(0, searchResult.scroll.maxScrollY, 200);
    //        searchResult.search();
    //    }

    //},
    setupPaging: function (results) {

        var listener = function () {
            var scrollBottom = this.scrollHeight - this.clientHeight;
            var scrollPosition = this.scrollTop;
            if (scrollPosition+50 >= scrollBottom && (searchResult.currentPage + 1) * searchResult.itemCount < searchResult.totalItemCount && !searchResult.loading) {
                searchResult.loading = true;
                searchResult.currentPage++;
                document.getElementById("content").style.overflowY = "hidden";
               
                document.getElementById("bookList").style.height = (document.getElementById("bookList").clientHeight + 100) + "px";
                
               
                var loader = document.createElement('li');
                loader.className = "books_loader";
                loader.id = "bookListLoader";
                document.getElementById("bookList").appendChild(loader);
                global.openLoader("bookListLoader");
                this.scrollTop += 100;
                document.getElementById("content").style.overflowY = "auto";
                searchResult.search();
            }
        }

        document.getElementById("content").removeEventListener("onscroll", listener, false);
        document.getElementById("content").onscroll = listener;
    },
    search: function () {
        global.openLoader("content");
        global.get(global.apiAddress + "books/search?keyword=" + searchResult.keyword + "&count=" + searchResult.itemCount + "&page=" + searchResult.currentPage, function (results) {
            var categoryContainer = document.getElementById("categories");
            if (categoryContainer.innerHTML == "") {
                categoryContainer.innerHTML += '<div class="item fastbutton active" data-action="0">Tümü</div>';
                for (var i = 0; i < results.FoundCategories.length; i++) {
                    categoryContainer.innerHTML += '<div class="item fastbutton"  data-action="' + results.FoundCategories[i].ID + '">' + results.FoundCategories[i].Name + '</div>';
                }

                new IScroll('#categories_wrapper', { scrollX: true, scrollY: false, mouseWheel: true, bounce: false });

                Hammer(document.getElementById('categories_wrapper')).on("swipeleft", function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    return false;
                });

                Hammer(document.getElementById('categories_wrapper')).on("swiperight", function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    return false;
                });
            }

            var booksContainer = document.getElementById("bookList");
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
            //if (typeof msnry == "undefined") {
            booksContainer.appendChild(fragment);
            //}
            document.getElementById("content").style.overflowY = "hidden";
            imagesLoaded("#bookList", function (instance) {
                if ($("#bookList").hasClass("isotope")) {
                    $("#bookList").isotope("appended", $(elems),
                        function () {
                           
                            document.getElementById("bookListLoader").remove();
                            searchResult.loading = false;
                            $("#bookList li").css({ opacity: 1 });
                            document.getElementById("content").style.overflowY = "auto";
                            //searchResult.scroll.refresh();
                        })
                }
                else
                    $("#bookList").isotope({
                        itemSelector: '.item'
                    }, function () {
                        global.closeLoader();
                        bookList.style.opacity = 1;
                        searchResult.setupPaging();
                        searchResult.loading = false;
                        $("#bookList li").css({ opacity: 1 });
                        document.getElementById("content").style.overflowY = "auto";
                        //searchResult.scroll = new IScroll('#content', { probeType: 3});
                        //searchResult.scroll.on('scroll', searchResult.updatePosition);
                        
                    });
            });
        }, "jsonp");
    }
}
