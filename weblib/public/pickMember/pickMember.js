var pickMemberLayer, zTree, zTreeData;
var checkedData = {
    department: [],//部门数据
    member: []//成员数据
};
var checkedDataCache = {
    department: [],//部门数据
    member: []//成员数据
};
$("#pickMemberTab").Huitab({ index: 0 });
$("body").on("click", "button", function () {
    var name = $(this).attr("data-name");
    switch (name) {
        case "pickMemberAdd":
            openPickMember()
            break;
        case "pickMemberSave":
            savePickMember()
            break;
        case "pickMemberClose":
            layer.close(pickMemberLayer)
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
                checkedDataCache.department = [];
                $.each(arr, function (index, item) {
                    checkedDataCache.department.push(item)
                })
                drawPickMemberCache()
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
                l.ajax('getMember', params, function (data) {
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
$("body").on("click", "#pickMemberList .pickMemberItem .remove", function () {
    var key = $(this).attr("data-key")
    var index = $(this).attr("data-index")
    var data = checkedData[key];
    data.splice(index, 1)
    drawPickMember();
})
$("body").on("click", "#pickMemberListCache .pickMemberItem .remove", function () {
    var key = $(this).attr("data-key")
    var index = $(this).attr("data-index")
    var data = checkedDataCache[key];
    if (key == "department") {
        data[index].checked = false;
        zTree.updateNode(data[index], true)
    } else {
        if ($("[data-userid=" + data[index].userid + "]").length > 0) {
            $("[data-userid=" + data[index].userid + "]")[0].checked = false;
            if ($("[name=memberList]").length == $("[name=memberList]:checked").length + 1) {
                $("[name=memberList][value=all]")[0].checked = false;
            }
        }
    }
    data.splice(index, 1)
    drawPickMemberCache();
})
$("body").on("change", "#memberList input[name=memberList]", function () {
    var arr = [];
    if ($(this).val() == "all") {
        if ($(this).is(":checked")) {
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
        } else {
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
    if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].checked) {
                checkedDataCache.member.push({
                    name: arr[i].name,
                    userid: arr[i].userid,
                    orgId: arr[i].orgId
                })
            } else {
                for (var j = 0; j < checkedDataCache.member.length; j++) {
                    if (checkedDataCache.member[j].userid == arr[i].userid) {
                        checkedDataCache.member.splice(j, 1)
                    }
                }
            }
        }
    }
    drawPickMemberCache()
})

function openPickMember() {
    if (zTreeData) {
        updatePickMemberCache(zTreeData)
    } else {
        l.ajax('getDepartment', {}, function (data) {
            zTreeData = data;
            $.fn.zTree.init($("#pickMemberTreeM"), setting.member, zTreeData);
            updatePickMemberCache(zTreeData)
        })
    }
}
function updatePickMemberCache(data) {
    checkedDataCache = {
        department: [],//部门数据
        member: []//成员数据
    };
    for (var i = 0; i < data.length; i++) {
        data[i].checked = false;
        $.each(checkedData.department, function (j, item) {
            if (data[i].id == item.id) {
                data[i].checked = true;
            }
        })
    }
    zTree = $.fn.zTree.init($("#pickMemberTreeD"), setting.department, data)
    checkedDataCache.department = zTree.getCheckedNodes(true);
    checkedDataCache.member = checkedData.member
    drawPickMemberCache()
    pickMemberLayer = layer.open({
        type: 1,
        title: '选择人员',
        area: ['800px', '80%'],
        content: $("#pickMemberLayer")
    });
}
function savePickMember() {
    checkedData = {
        department: [],//部门数据
        member: []//成员数据
    };
    $.each(checkedDataCache.department, function (index, item) {
        checkedData.department.push({
            id: item.id,
            name: item.name,
            orgId: item.orgId,
            parentid: item.parentid,
        });
    })
    $.each(checkedDataCache.member, function (index, item) {
        checkedData.member.push({
            name: item.name,
            userid: item.userid,
            orgId: item.orgId,
        })
    })
    drawPickMember();
    layer.close(pickMemberLayer)
}
function drawPickMember(department, member) {
    if (department) { checkedData.department = department }
    if (member) { checkedData.member = member }
    $("#pickMemberList").html("");
    $.each(checkedData.department, function (i, item) {
        $("#pickMemberList").append("<li class='pickMemberItem f-l'>" + item.name + "<i data-index='" + i + "' data-key='department' class='remove icon Hui-iconfont pl-10 pr-10'></i></li>")
    })
    $.each(checkedData.member, function (i, item) {
        $("#pickMemberList").append("<li class='pickMemberItem f-l'>" + item.name + "<i data-index='" + i + "' data-key='member' class='remove icon Hui-iconfont pl-10 pr-10'></i></li>")
    })
}
function drawPickMemberCache() {
    $("#pickMemberListCache").html("");
    $.each(checkedDataCache.department, function (i, item) {
        $("#pickMemberListCache").append("<li class='pickMemberItem f-l'>" + item.name + "<i data-index='" + i + "' data-key='department' class='remove icon Hui-iconfont pl-10 pr-10'></i></li>")
    })
    $.each(checkedDataCache.member, function (i, item) {
        $("#pickMemberListCache").append("<li class='pickMemberItem f-l'>" + item.name + "<i data-index='" + i + "' data-key='member' class='remove icon Hui-iconfont pl-10 pr-10'></i></li>")
    })
}
//人员
function loadMemberList(arr) {
    var num = 0;
    $("#memberList").html("");
    $.each(arr, function (i, item) {
        for (var j = 0; j < checkedDataCache.member.length; j++) {
            if (checkedDataCache.member[j].userid == item.userid) {
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
        $("#memberList").append(new MemberItem({
            name: item.name,
            userid: item.userid,
            orgId: item.orgId
        }))
    })
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
function getPickMember(name) {
    return checkedData[name]
}
