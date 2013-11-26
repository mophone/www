var categories = {
    getCategories: function () {
        global.get(global.apiAddress + "books/categories", function (results) {
            var html = "";
            for (var i = 0; i < results.length; i++) {
                if (results[i].ParentID == 0) {
                    html += "<a href='#page=searchResult&category=" + results[i].ID + "'><li style='background-image:url(img/categories/" + results[i].ID + ".jpg);'><div class='text'>" + results[i].Name + "</div></li></a>";
                }
            }
            document.querySelector("#categoryList").innerHTML = html;
        },"jsonp");
    }
}