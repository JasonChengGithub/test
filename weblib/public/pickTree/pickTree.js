function PickTree() {
    this.layer;

    this.zTree;
    this.zTreeData;

    this.totalData = {};
    this.currentName = "";
    this.cacheData = {
        department: [],//部门数据
        member: []//成员数据
    };

    this.getDepartmentApiName = "getDepartment";
    this.getMemberApiName = "getMember";
}
PickTree.prototype.initDataWidthName = function (name) {
    var me = this;
    if (!me.totalData[name]) {
        me.totalData[name] = {
            department: [],//部门数据
            member: []//成员数据
        }
    }
}
PickTree.prototype.open = function (name, showType, maxLen) {
    var me = this;
    me.currentName = name;
    me.maxLen = maxLen || 99
    $("#memberList").html("");
    $("#pickTreeTab").Huitab({ index: 0 });
    if (me.zTreeData) {
        me.updateCacheData(showType)
    } else {
        l.ajax(me.getDepartmentApiName, {}, function (data) {
            me.zTreeData = data;
            me.updateCacheData(showType)
        })
    }
}
PickTree.prototype.updateCacheData = function (showType) {
    var me = this;
    me.cacheData = {
        department: [],//部门数据
        member: []//成员数据
    };
    for (var key in showType) {
        if (showType[key]) {
            switch (key) {
                case "department":
                    $("#pickTreeTabD").show();
                    var _data = [];
                    if (me.zTreeData) {
                        for (var i = 0; i < me.zTreeData.length; i++) {
                            var _item = {}
                            for (var key in me.zTreeData[i]) {
                                _item[key] = me.zTreeData[i][key]
                            }
                            _data.push(_item)
                            _data[i].checked = false;
                            if (me.totalData[me.currentName].department) {
                                $.each(me.totalData[me.currentName].department, function (j, item) {
                                    if (_data[i].id == item.id) {
                                        _data[i].checked = true;
                                    }
                                })
                            }
                        }
                    }
                    me.zTree = $.fn.zTree.init($("#pickTreeTreeD"), setting.department, _data)
                    me.cacheData.department = me.zTree.getCheckedNodes(true);
                    break;
                case "member":
                    $("#pickTreeTabM").show()
                    $.fn.zTree.init($("#pickTreeTreeM"), setting.member, me.zTreeData);
                    me.cacheData.member = me.totalData[me.currentName].member
                    break;
            }
        } else {
            switch (key) {
                case "department":
                    $("#pickTreeTab").Huitab({ index: 1 });
                    $("#pickTreeTabD").hide()
                    break;
                case "member":
                    $("#pickTreeTabM").hide()
                    break;
            }
        }
    }
    me.drawCacheData()
    me.layer = layer.open({
        type: 1,
        title: '选择人员',
        area: ['800px', '80%'],
        content: $("#pickTreeLayer")
    });
}
PickTree.prototype.drawCacheData = function () {
    $("#pickTreeListCache").html("");
    if (myPickTree.cacheData.department) {
        $.each(myPickTree.cacheData.department, function (i, item) {
            $("#pickTreeListCache").append("<li class='pickTreeItem f-l'>" + item.name + "<i data-index='" + i + "' data-key='department' class='remove icon Hui-iconfont pl-10'></i></li>")
        })
    }
    if (myPickTree.cacheData.member) {
        $.each(myPickTree.cacheData.member, function (i, item) {
            $("#pickTreeListCache").append("<li class='pickTreeItem f-l'>" + item.name + "<i data-index='" + i + "' data-key='member' class='remove icon Hui-iconfont pl-10'></i></li>")
        })
    }
}
PickTree.prototype.saveCurData = function () {
    var me = this;
    Lny.log(me.currentName)
    me.totalData[me.currentName] = {
        department: [],//部门数据
        member: []//成员数据
    };
    if (me.cacheData.department) {
        $.each(me.cacheData.department, function (index, item) {
            me.totalData[me.currentName].department.push(item);
        })
    }
    if (me.cacheData.member) {
        $.each(me.cacheData.member, function (index, item) {
            me.totalData[me.currentName].member.push(item)
        })
    }

    var curLen = me.totalData[me.currentName].member.length + me.totalData[me.currentName].department.length
    if (curLen >= me.maxLen) {
        layer.alert("选择人员或部门总计不能超过" + me.maxLen + "个", { icon: 0, }, function (index) {
            layer.close(index);
        });
        return false
    }
    me.drawCurData(me.currentName);
    layer.close(me.layer)
}
PickTree.prototype.drawCurData = function (name, data, disabled) {
    var me = this;
    if (data) {
        for (var key in data) {
            me.totalData[name][key] = data[key]
        }
    }
    $("[data-name=" + name + "] [data-id=pickTreeList]").html("");
    if (me.totalData[name].department) {
        $.each(me.totalData[name].department, function (i, item) {
            $("[data-name=" + name + "] [data-id=pickTreeList]").append("<li class='pickTreeItem f-l'>" + item.name + (disabled ? "" : "<i data-index='" + i + "' data-key='department' class='remove icon Hui-iconfont pl-10'></i>") + "</li>")
        })
    }
    if (me.totalData[name].department) {
        $.each(me.totalData[name].member, function (i, item) {
            $("[data-name=" + name + "] [data-id=pickTreeList]").append("<li class='pickTreeItem f-l'>" + item.name + (disabled ? "" : "<i data-index='" + i + "' data-key='member' class='remove icon Hui-iconfont pl-10'></i>") + "</li>")
        })
    }
}
PickTree.prototype.getDataByName = function (name) {
    var data = this.totalData[name]
    var _data = {};
    for (var key in data) {
        if (key == "department") {
            _data[key] = [];
            if (data[key]) {
                for (var i = 0; i < data[key].length; i++) {
                    var item = data[key][i];
                    _data[key].push({
                        id: item.id,
                        name: item.name,
                        orgId: item.orgId,
                        parentid: item.parentid,
                    })
                }
            }
        } else if (key == "member") {
            _data[key] = [];
            if (data[key]) {
                for (var i = 0; i < data[key].length; i++) {
                    var item = data[key][i];
                    _data[key].push({
                        name: item.name,
                        userid: item.userid,
                        orgId: item.orgId,
                    })
                }
            }
        } else {
            _data[key] = data[key]
        }
    }
    return _data
}
var myPickTree = new PickTree();

$("body").on("click", "button", function () {
    var name = $(this).attr("data-name");
    switch (name) {
        case "pickTreeSave":
            myPickTree.saveCurData()
            break;
        case "pickTreeClose":
            layer.close(myPickTree.layer)
            break;
    }
})
var setting = {
    department: {
        view: {
            showIcon: false
        },
        check: {
            chkboxType: { "Y": "", "N": "" },
            enable: true,
        },
        callback: {
            onClick: function (event, treeId, treeNode) {
                $.fn.zTree.getZTreeObj(treeId).checkNode(treeNode, true, true, true)
            },
            onCheck: function (event, treeId, treeNode) {
                var arr = $.fn.zTree.getZTreeObj(treeId).getCheckedNodes(true)
                myPickTree.cacheData.department = [];
                if (arr) {
                    $.each(arr, function (index, item) {
                        myPickTree.cacheData.department.push(item)
                    })
                }
                myPickTree.drawCacheData()
            }
        },
        data: {
            simpleData: {
                enable: true,
                idKey: "id",
                pIdKey: "parentid"
            }
        }
    },
    member: {
        view: {
            showIcon: false
        },
        check: {
            chkboxType: { "Y": "", "N": "" },
            enable: true,
            chkStyle: "radio",
            radioType: "all"
        },
        callback: {
            onClick: function (event, treeId, treeNode) {
                $.fn.zTree.getZTreeObj(treeId).checkNode(treeNode, true, true, true)
            },
            onCheck: function (event, treeId, treeNode) {
                var params = {
                    id: treeNode.id,
                    orgId: treeNode.orgId
                }
                l.ajax(myPickTree.getMemberApiName, params, function (data) {
                    loadMemberList(data)
                })
            }
        },
        data: {
            simpleData: {
                enable: true,
                idKey: "id",
                pIdKey: "parentid"
            }
        }
    }
}
$("body").on("click", "[data-id=pickTreeList] .pickTreeItem .remove", function () {
    var key = $(this).attr("data-key")
    var index = $(this).attr("data-index")
    var name = $(this).parents("[data-id=pickTree]").attr("data-name")
    myPickTree.totalData[name][key].splice(index, 1)
    myPickTree.drawCurData(name);
})
$("body").on("click", "#pickTreeListCache .pickTreeItem .remove", function () {
    var key = $(this).attr("data-key")
    var index = $(this).attr("data-index")
    if (key == "department") {
        myPickTree.cacheData[key][index].checked = false;
        myPickTree.zTree.updateNode(myPickTree.cacheData[key][index], true)
    } else {
        if ($("[data-userid=" + myPickTree.cacheData[key][index].userid + "]").length > 0) {
            $("[data-userid=" + myPickTree.cacheData[key][index].userid + "]")[0].checked = false;
            if ($("[name=memberList]").length == $("[name=memberList]:checked").length + 1) {
                $("[name=memberList][value=all]")[0].checked = false;
            }
        }
    }
    myPickTree.cacheData[key].splice(index, 1)
    myPickTree.drawCacheData()
})
$("body").on("change", "#memberList input[name=memberList]", function () {
    var arr = [];
    if ($(this).val() == "all") {
        if ($(this).is(":checked")) {
            if ($("[name=memberList]")) {
                $.each($("[name=memberList]"), function (i, item) {
                    if (!$(item).is(":checked") && $(item).val() != "all") {
                        item.checked = true;
                        arr.push({
                            name: $(item).attr("data-name"),
                            userid: $(item).attr("data-userid"),
                            orgId: $(item).attr("data-orgId"),
                            checked: true
                        })
                    }
                })
            }
        } else {
            if ($("[name=memberList]")) {
                $.each($("[name=memberList]"), function (i, item) {
                    if ($(item).is(":checked") && $(item).val() != "all") {
                        item.checked = false;
                        arr.push({
                            name: $(item).attr("data-name"),
                            userid: $(item).attr("data-userid"),
                            orgId: $(item).attr("data-orgId"),
                            checked: false
                        })
                    }
                })
            }
        }
    } else {
        if ($(this).is(":checked")) {
            if ($("[name=memberList]").length == $("[name=memberList]:checked").length + 1) {
                $("[name=memberList][value=all]")[0].checked = true;
            }
        } else {
            $("[name=memberList][value=all]")[0].checked = false;
        }
        arr = [{
            name: $(this).attr("data-name"),
            userid: $(this).attr("data-userid"),
            orgId: $(this).attr("data-orgId"),
            checked: $(this).is(":checked")
        }]
    }
    if (arr && arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].checked) {
                myPickTree.cacheData.member.push({
                    name: arr[i].name,
                    userid: arr[i].userid,
                    orgId: arr[i].orgId
                })
            } else {
                if (myPickTree.cacheData.member) {
                    for (var j = 0; j < myPickTree.cacheData.member.length; j++) {
                        if (myPickTree.cacheData.member[j].userid == arr[i].userid) {
                            myPickTree.cacheData.member.splice(j, 1)
                        }
                    }
                }
            }
        }
    }
    myPickTree.drawCacheData()
})



//人员
function loadMemberList(arr) {
    var num = 0;
    $("#memberList").html("");
    if (arr) {
        $.each(arr, function (i, item) {
            if (myPickTree.cacheData.member) {
                for (var j = 0; j < myPickTree.cacheData.member.length; j++) {
                    if (myPickTree.cacheData.member[j].userid == item.userid) {
                        $("#memberList").append(new MemberItem({
                            name: item.name,
                            userid: item.userid,
                            orgId: item.orgId,
                            checked: true
                        }))
                        num++;
                        return
                    }
                }
            }
            $("#memberList").append(new MemberItem({
                name: item.name,
                userid: item.userid,
                orgId: item.orgId
            }))
        })
    }

    if (num == arr.length) {
        $("#memberList").prepend("<li><label class='memberItem'><input checked name='memberList' value='all' type='checkbox'/>全部</label></li>");
    } else {
        $("#memberList").prepend("<li><label class='memberItem'><input name='memberList' value='all' type='checkbox'/>全部</label></li>");
    }
}
function MemberItem(o) {
    var d = {
        name: "",
        userid: "",
        orgId: "",
        checked: false,
    }
    o = $.extend({}, d, o);
    var $input = $("<input name='memberList' type='checkbox'/>")
    $input.attr("checked", o.checked)
    $input.attr("data-name", o.name)
    $input.attr("data-userid", o.userid)
    $input.attr("data-orgId", o.orgId)
    var $label = $("<label class='memberItem'></label>")
    var $li = $("<li></li>")
    $label.append($input)
    $label.append(o.name)
    $li.append($label)
    this.$dom = $li;
    return this.$dom
}






