var data = {nickname: "Tom", name: "James"};
var tmpl = $.templates("#personTmpl");
var html = tmpl.render(data);
console.log(html);