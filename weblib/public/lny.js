//全局Lny
var Lny = window.Lny = function (apiNames, domain) {
   	this.domain = domain ? domain : "http://qyh.weidingplus.com/";
    //this.domain = "http://wyongan.xicp.net/wdplus-web/";
    //this.domain = domain ? domain : "http://localhost:8080/wdplus-web/";
    this.apiNames = apiNames || {};
}
Lny.dev = true;//是不是开发环境，是开发环境时有Lny.log
!function ($, L) {


    //jq-page插件默认配置
    if ($.fn.page) {
        $.fn.page.defaults = {
            pageSize: 10,
            pageBtnCount: 9,
            firstBtnText: '首页',
            lastBtnText: '尾页',
            prevBtnText: '上一页',
            nextBtnText: '下一页',
            showJump: true,
            jumpBtnText: 'GO',
            showPageSizes: true,
            pageSizeItems: [10, 20, 40],
            remote: {
                pageIndexName: 'currentPage',     //请求参数，当前页数，索引从1开始
                pageSizeName: 'pageSize',       //请求参数，每页数量
                totalName: 'totalNumber'              //指定返回数据的总数据量的字段名
            }
        };
    }

    //Lny的静态方法start
    L.log = (L.dev && window.console) ? (console.log ? console.log : function () { }) : function () { }
    L.onlyInt = function (me, event) {
        event = event || window.event || arguments.callee.caller.arguments[0];
        var charCode2;
        if ('charCode' in event) {//IE7 and IE8 no charCode
            charCode2 = event.charCode;
        } else {
            charCode2 = event.keyCode;
        }
        if (event.keyCode === 8/*back*/ || event.keyCode === 13/*Enter*/ || event.keyCode === 9/*Tab*/ || event.keyCode === 37/*<- */ || event.keyCode === 39/* ->*/) {
            return true;
        } else if (charCode2 < 48 || charCode2 > 57) {/*0-9*/
            if (isNaN(Number($(me).val()) - 0)) {
                $(me).val('');
            }
            event.returnValue = false;
            return false;
        } else {
            var num = $(me).val() + (charCode2 - 48);
            var max = $(me).attr("max") ? parseInt($(me).attr("max"), 10) : Number.MAX_VALUE;
            var min = parseInt($(me).attr("min"), 10)
            if (num >= min && num <= max) {
                return true;
            } else {
                return false;
            }
        }
    };
    L.getUrlParam = function (k) {//获取地址栏参数，k为键名
        var m = new RegExp("(^|&)" + k + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(m);
        if (r != null) return decodeURI(r[2]); return null;
    };
    L.dateFormat = function (d, fmt) {//格式化日期，d未new Date(),fmt为格式
        var o = {
            "M+": d.getMonth() + 1, //月份   
            "d+": d.getDate(), //日   
            "H+": d.getHours(), //小时   
            "m+": d.getMinutes(), //分   
            "s+": d.getSeconds(), //秒   
            "q+": Math.floor((d.getMonth() + 3) / 3), //季度   
            "S": d.getMilliseconds() //毫秒   
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
    L.dateToUnix = function (str) {//转unix时间戳，str是带有“-”格式化日期字符串
        return new Date(Date.parse(str.toString().replace(/-/g, "/"))).getTime()
    }
    //Lny的静态方法end

    //Lny的动态方法start
    L.prototype = {
        getTableCheckedData: function (table) {
            var checkBoxs = table.$("[name=checkbox]:checked")
            var checkedData = [];
            if (checkBoxs.length > 0) {
                for (var i = 0; i < checkBoxs.length; i++) {
                    checkedData.push(table.row(checkBoxs.eq(i).attr("data-rowIndex")).data())
                }
            }
            return checkedData
        },
        delTableRow: function (idKey, listKey, urlname, data, callback) {
            var params = {};
            var arr = []
            for (var i = 0; i < data.length; i++) {
                var param = {};
                param[idKey] = data[i][idKey]
                arr.push(param)
            }
            params[listKey] = arr;
            l.ajax(urlname, params, function (data) {
                callback(data)
            })
        },
        delTableRowById: function (idKey, urlname, data, callback) {
            var params = {};
            params[idKey] = data[idKey];
            l.ajax(urlname, params, function (data) {
                callback(data)
            })
        },
        addApi: function (apis) {
            apis = apis || {}
            for (var key in apis) {
                this.apiNames[key] = apis[key]
            }
            return this.apiNames
        },
        getApiUrl: function (apiName) {
            apiName = apiName || ""
            if (!this.apiNames[apiName]) {
                L.log(apiName, "尚未在mainjs中定义")
            }
            return this.domain + this.apiNames[apiName]
        },
        ajax: function (apiName, params, success) {
            var loader = layer.load(1, {
                shade: [0.3, '#000'] //0.1透明度的白色背景
            });
            //AJAX跨域配置
            $.support.cors = true;
            $.ajax({
                url: this.getApiUrl(apiName),
                type: 'POST',
                dataType: 'json',
                data: JSON.stringify(params),
                contentType: "application/json; charset=utf-8",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                    // xhr.withCredentials = true; //跨域时携带cookies
                },
                complete: function (result) {
                    layer.close(loader)
                },
                error: function (result, status, error) {//服务器响应失败处理函数
                    L.log(apiName, error)
                },
                success: function (result) {
                    L.log(apiName, result)
                    if (result.success) {
                        success(result.data, result.message)
                    } else {
                        layer.alert(result.message, { icon: 0, }, function (index) {
                            layer.close(index);
                        });
                    }
                }
            })
        },
        log: L.log,
        getUrlParam: L.getUrlParam,//获取地址栏参数，k未键名
        dateFormat: L.dateFormat,//格式化日期，d未new Date(),fmt为格式
        dateToUnix: L.dateToUnix//带有“-”格式化日期字符串转unix时间戳
    }
    //Lny的动态方法end

    //筛选表单jq插件
    $.fn.filterfrom = function (options) {
        var $me = this;
        var defaults = {
            maxLength: 5,
            conditions: [],
            onSearch: function () { },
            onReset: function () { }
        }
        options = $.extend({}, defaults, options)

        var tableHtml = '<table class="from-table"><tr>'
        var cArr = options.conditions;
        $me.selectListDatas = {};
        $me.ajaxing = {};
        var createHtml = function (e) {
            var domHtml = '';
            switch (e.type) {
                case "text":
                    domHtml = '<td><label class="form-label">' + e.label + '：</label></td><td><input type="text" name="' + e.name + '" placeholder="' + (e.placeholder ? e.placeholder : '') + '" value="' + (e.defaultValue ? e.defaultValue : '') + '" class="input-text"></td>'
                    break
                case "number":
                    domHtml = '<td><label class="form-label">' + e.label + '：</label></td><td><input min="1" style="width:100%" type="number" name="' + e.name + '" placeholder="' + (e.placeholder ? e.placeholder : '') + '" value="' + (e.defaultValue ? e.defaultValue : '') + '" class="input-text"></td>'
                    break
                case "select":
                    var optionHtml = "", sl = [];
                    if (e.ajax) {
                        if (e.ajax.api) {
                            $me.ajaxing[e.name] = true;
                            l.ajax(e.ajax.api, { selectFlag: 1 }, function (selectList) {
                                $me.selectListDatas[e.name] = [];
                                $.each(selectList, function (index, v) {
                                    $me.selectListDatas[e.name].push({
                                        value: v[e.ajax.valueName || "value"] || "",
                                        text: v[e.ajax.textName || "text"] || "",
                                        children: v[e.ajax.childrenName || "children"] || []
                                    })
                                })
                                $me.resetSelect(e.name, $me.selectListDatas[e.name])
                                if (e.ajax.child) {
                                    var childAjax = {}
                                    $.each(cArr, function (index, v) {
                                        if (v.name == e.ajax.child) {
                                            for (var key in v.ajax) {
                                                childAjax[key] = v.ajax[key]
                                            }
                                        }
                                    })
                                    $me.find("select[name=" + e.name + "]").on("change", function (event) {
                                        $.each($me.selectListDatas[e.name], function (index, v) {
                                            if (v.value == event.target.value) {
                                                $me.selectListDatas[e.ajax.child] = [];
                                                $.each(v.children, function (index2, v2) {
                                                    $me.selectListDatas[e.ajax.child].push({
                                                        value: v2[childAjax.valueName || "value"] || "",
                                                        text: v2[childAjax.textName || "text"] || "",
                                                    })
                                                })
                                                $me.resetSelect(e.ajax.child, $me.selectListDatas[e.ajax.child])
                                            }
                                        })
                                    })
                                    $me.selectListDatas[e.ajax.child] = [];
                                    $.each($me.selectListDatas[e.name][0].children, function (index, v) {
                                        $me.selectListDatas[e.ajax.child].push({
                                            value: v[childAjax.valueName || "value"] || "",
                                            text: v[childAjax.textName || "text"] || "",
                                        })
                                    })
                                    $me.resetSelect(e.ajax.child, $me.selectListDatas[e.ajax.child])
                                }
                                $me.ajaxing[e.name] = false;
                            })
                        } else if (e.ajax.parent && $me.selectListDatas[e.name]) {

                            sl = $me.selectListDatas[e.name]
                        }
                    } else {
                        $me.selectListDatas[e.name] = e.selectList
                        sl = $me.selectListDatas[e.name]
                    }
                    for (var i = 0; i < sl.length; i++) {
                        optionHtml += '<option value="' + sl[i].value + '" ' + ((sl[i].selected) ? 'selected' : '') + '>' + sl[i].text + '</option>'
                    }
                    domHtml = '<td><label class="form-label">' + e.label + '：</label></td><td><div class="select-box"><select class="select" size="1" name="' + e.name + '">' + optionHtml + '</select></div></td>'
                    break
                case "date":
                    var datePickerOption = (e.minDate ? 'minDate:' + e.minDate + ',' : '') + (e.maxDate ? 'maxDate:' + e.maxDate + ',' : '') + (e.dateFmt ? 'dateFmt:\'' + e.dateFmt + '\',' : '')
                    domHtml = '<td><label class="form-label">' + e.label + '：</label></td><td><input type="text" name="' + e.name + '" placeholder="" value="' + (e.defaultValue ? e.defaultValue : '') + '" onfocus="WdatePicker({' + datePickerOption + '})" id="' + e.id + '" class="input-text Wdate"></td>'
                    break
            }
            return domHtml
        }
        for (var i = 0; i < cArr.length; i++) {
            if (i % options.maxLength == 0 && i != 0) {
                tableHtml += '</tr><tr>'
            }
            tableHtml += createHtml(cArr[i]);
        }
        if (cArr.length % options.maxLength == 0) {
            tableHtml += '</tr><tr>'
        }
        tableHtml += '<td width="20"></td><td><button data-name="search" class="btn btn-primary" type="button"><i class="Hui-iconfont">&#xe709;</i> 查询</button><button data-name="reset" class="btn ml-20  btn-primary" type="button"><i class="Hui-iconfont">&#xe66c;</i> 重置</button></td>'
        tableHtml += '</tr></table>'
        var $table = $(tableHtml)
        $me.append($table)
        $me.on("click", "button", function () {
            var name = $(this).attr("data-name");
            switch (name) {
                case "search":
                    options.onSearch($me.serializeArray())
                    break;
                case "reset":
                    $me[0].reset()
                    options.onReset($me.serializeArray())
                    break;
            }
        })
        $me.resetSelect = function (name, sl) {
            var $select = $me.find("select[name=" + name + "]");
            $select.html("");

            for (var i = 0; i < sl.length; i++) {
                $select.append('<option value="' + sl[i].value + '" ' + ((sl[i].selected) ? 'selected' : '') + '>' + sl[i].text + '</option>');
            }

        };
        return $me
    }

    //详情弹窗jq插件
    $.fn.detailLayer = function (options) {
        var $me = this;
        // 参数配置start
        var defaults = {
            controlKey: null,
            conditions: [],
            onSave: function () { L.log("保存") },
            onAdd: function () { L.log("新增") },
        }
        options = $.extend({}, defaults, options);
        // 参数配置end

        //属性声明start
        $me.idName = $me.attr("id");
        $me.conditions = options.conditions;//环境参数集合
        $me.items = [];//表单子元素集合

        $me.mylayer = {};//弹出层对象
        $me.isAdd = true;//弹出层是否是为"新增"态
        $me.layerTitle = options.layerTitle;//弹出层标题
        $me.layerArea = options.layerArea;//弹出层尺寸
        $me.addCallback = options.onAdd;//弹出层“新增”态，保存按钮回调函数
        $me.saveCallback = options.onSave;//弹出层“编辑”态，保存按钮回调函数

        $me.selectListDatas = {};//下拉列表数据集合
        $me.addressData = [];//地址数据

        $me.ajaxing = {};//ajaxing请求状态集合

        // 特殊控制声明
        $me.controlKey = options.controlKey || null//根据哪个key来执行特殊控制
        $me.controlValue = null//哪些controlKey字段的value属性值执行特殊控制       
        //属性声明end

        //结构构建start
        var $page = $('<div class="page-container" ></div>')//页面容器
        var $detailForm = $('<form class="form form-horizontal"></form>')//详情表单容器
        var $detailFormControlLine = $('<div class="row cl"></div>')//详情表单控制行
        var $detailFormControlBtnBox = $('<div class="col-9 f-l col-offset-2"></div>')//详情表单控制按钮组
        var $btnSave = $('<button data-name="save" class="btn btn-primary" type="button"><i class="Hui-iconfont">&#xe632;</i> 确定</button>')//保存按钮
        var $btnClose = $('<button data-name="close" class="btn btn-primary ml-10" type="button">&nbsp;&nbsp;取消&nbsp;&nbsp;</button>')//取消按钮
        $btnSave.on("click", function () {
            if ($me.isAdd) {
                $me.addCallback($me, $me.getDatas())
            } else {
                $me.saveCallback($me, $me.getDatas())
            }
        })
        $btnClose.on("click", function () {
            $me.close()
        })
        $detailFormControlBtnBox.append([$btnSave, $btnClose])
        $detailFormControlLine.append($detailFormControlBtnBox)

        //表单子元素构造函数start
        function FormItem(condition, key) {
            // L.log(key)
            if (!condition.type) {
                L.log("FormItem:key为" + key + "的type不存在")
            }
            if (!condition.name) {
                L.log("FormItem:key为" + key + "的name不存在")
            }
            var that = this;
            this.condition = condition;
            this.key = key;
            this.type = condition.type;//类型
            this.name = condition.name;//名字
            this.remind = condition.remind;//提示

            this.label = condition.label || "";//标题
            this.must = condition.must || false;//是否必填

            this.immutable = condition.immutable//仅编辑禁用
            this.immutableAdd = condition.immutableAdd//新增也禁用         

            this.defaultValue = condition.defaultValue//text,number,textarea,date,hidden类型特有
            this.placeholder = condition.placeholder//text,number,textarea,date类型特有
            this.ajax = condition.ajax//select,address,pickTree类型特有
            this.maxLen = condition.maxLen || 99//pickTree,upload类型特有

            this.minDate = condition.minDate//date类型特有
            this.maxDate = condition.maxDate//date类型特有
            this.dateFmt = condition.dateFmt//date类型特有
            this.id = condition.id//date类型特有



            this.pickType = condition.pickType//pickTree类型特有
            this.noMultiple = condition.noMultiple//pickTree类型特有

            this.min = condition.min//number类型特有
            this.max = condition.max//number类型特有

            this.btnName = condition.btnName//upload类型特有
            this.fileType = condition.fileType//upload类型特有


            this.selectList = condition.selectList//selectList类型特有

            this.minOptionNum = condition.minOptionNum || 2;//option类型特有

            this.controlHide = condition.controlHide//类型特有
            this.controlLabel = condition.controlLabel//类型特有

            this.ueOptions = condition.ueOptions || {};//Ueditor特有
            this.ueOptions.zIndex = 99999999;
            this.ue = null;//Ueditor特有
            this.$dom = this.createDom()
            return this
        }
        FormItem.prototype.setValue = function (newValue) {
            var that = this;
            var immutable = false;
            if ($me.isAdd) {
                immutable = that.immutableAdd || false
            } else {
                immutable = that.immutableAdd || that.immutable || false
            }

            switch (that.type) {
                case "address":
                    var val = newValue || that.defaultValue || "1_2_6";
                    var valArr = val.split("_")
                    var $addressSelect = [that.$dom.find("[name=" + that.name + "][data-addressName=address1]"), that.$dom.find("[name=" + that.name + "][data-addressName=address2]"), that.$dom.find("[name=" + that.name + "][data-addressName=address3]")]
                    var selectData = [];
                    $.each($addressSelect, function (ii, item) {
                        var val = valArr[ii]
                        if (val && val != "") {
                            if (ii == 0) {
                                selectData[ii] = $me.updateSelect($me.addressData, item, that.ajax);
                            }
                            item.val(val);
                            if (ii != $addressSelect.length - 1) {
                                $.each(selectData[ii], function (j, m) {
                                    if (m.value == val) {
                                        selectData[ii + 1] = $me.updateSelect(m.children, $addressSelect[ii + 1], that.ajax)
                                    }
                                })
                            }
                        } else {
                            $me.updateSelect([], item, that.ajax)
                            item.val('');
                        }
                    })
                    break
                case "upload":
                    resetUploadList(($me.idName + that.name), newValue || [], immutable)
                    break;
                case "pickMember":
                    drawPickMember(newValue[0] || [], newValue[1] || []);
                    break;
                case "pickTree":
                    var d = {};
                    for (var key in that.pickType) {
                        if (that.pickType[key]) {
                            if (newValue) {
                                d[key] = newValue[that.pickType[key]]
                            } else {
                                d[key] = []
                            }
                        }
                    }
                    if (immutable) {
                        that.$dom.find(".pickTreeAdd").hide();
                    } else {
                        that.$dom.find(".pickTreeAdd").show();
                    }
                    myPickTree.drawCurData(($me.idname + that.name), d, immutable)
                    break;
                case "date":
                    that.$dom.find("[name=" + that.name + "]").val(l.dateFormat(new Date(newValue || that.defaultValue || new Date()), that.dateFmt || "yyyy-mm-dd"))
                    break;
                case "option":
                    that.$dom.find('.optionAdd').remove();
                    that.$dom.find('[name=content]').val("")
                    var dataArr = newValue || that.defaultValue || []
                    for (var j = 0; j < dataArr.length; j++) {
                        if (j < that.minOptionNum) {
                            that.$dom.find('[name=content]').eq(j).val(dataArr[j].content || "")
                        } else {
                            var $optionAdd = $('<div class="mb-15 optionAdd" style="position:relative"><input type="text" name="content" value="' + dataArr[j].content + '" class="input-text"></div>')
                            var $removeBtn = $('<a title="删除" class="removeBtn" href="javascript:;" class="ml-5 delete" style="text-decoration: none;font-size: 20px;position: absolute;right: -25px;top: -1px;"><i class="icon Hui-iconfont"></i></a>')
                            $removeBtn.click(function () {
                                $(this).parents(".optionAdd").remove()
                            })
                            if (!immutable) {
                                $optionAdd.append($removeBtn)
                            }
                            that.$dom.find('.optionAddBox').append($optionAdd)
                        }
                    }
                    if (immutable) {
                        that.$dom.find(".addBtn").hide();
                    } else {
                        that.$dom.find(".addBtn").show();
                    }
                    break;
                case "editor":
                    var ueReadySetConent = function () {
                        that.ue.setContent(newValue || that.defaultValue || "");
                        that.ue.off('ready', ueReadySetConent)
                    };
                    that.ue = UE.getEditor($me.idName + that.name, that.ueOptions);
                    that.ue.on('ready', ueReadySetConent);
                    break;
                default://hidden,text,number,textarea,select
                    that.$dom.find("[name=" + that.name + "]").val(newValue || that.defaultValue || "")
                    break;
            }
            that.$dom.find("[name=" + that.name + "]").attr("disabled", immutable);
            return that
        }
        FormItem.prototype.getValue = function () {
            var that = this;
            var d = "";
            switch (that.type) {
                case "upload":
                case "pickMember":
                    L.log(that.type + "类型暂不可使用getValue")
                    break;
                case "address":
                    d = "";
                    d += (that.$dom.find("[data-addressName=address1]").val() ? that.$dom.find("[data-addressName=address1]").val() : "");
                    d += (that.$dom.find("[data-addressName=address2]").val() ? "_" + that.$dom.find("[data-addressName=address2]").val() : "");
                    d += (that.$dom.find("[data-addressName=address3]").val() ? "_" + that.$dom.find("[data-addressName=address3]").val() : "");
                    break
                case "pickTree":
                    d = myPickTree.getDataByName($me.idname + that.name)
                    break
                case "option":
                    d = [];
                    var con = that.$dom.find('[name=content]')
                    for (var j = 0; j < con.length; j++) {
                        if ($.trim(con.eq(j).val()) != "") {
                            d.push({ "content": $.trim(con.eq(j).val()) })
                        }
                    }
                    break;
                case "editor":
                    d = that.ue.getContent()
                    break;
                default://hidden,text,number,textarea,select,date
                    d = that.$dom.find("[name=" + that.name + "]").val()
                    break;
            }
            return d
        }
        FormItem.prototype.createDom = function () {
            var that = this;
            var $domHtml = $('<div data-key="' + that.key + '"  class="row cl"><label class="form-label  col-2 f-l"><i style="color:red;' + (that.must ? '' : 'display:none') + '">* </i><span>' + that.label + '</span>：</label></div>')
            var $dom;
            switch (that.type) {
                case "hidden"://隐藏域
                    $dom = $('<div><input data-key="' + that.key + '" type="hidden" name="' + that.name + '" value="' + (that.defaultValue ? that.defaultValue : '') + '"></div>')
                    $domHtml = $dom;
                    break
                case "text"://单行文本
                    $dom = $('<div class="col-9 f-l"><input  type="text" name="' + that.name + '" placeholder="' + (that.placeholder ? that.placeholder : '') + '" value="' + (that.defaultValue ? that.defaultValue : '') + '" class="input-text"></div>')
                    $domHtml.append($dom);
                    break
                case "number"://数字文本
                    $dom = $('<div class="col-9 f-l"></div>')
                    var $num = $('<input min="' + (that.min ? that.min : 1) + '" max="' + (that.max ? that.max : "") + '" style="width:100%" onKeyUp="Lny.onlyInt(this,event)" onKeyPress="return Lny.onlyInt(this,event)" onpaste="return false"  type="text" name="' + that.name + '" placeholder="' + (that.placeholder ? that.placeholder : '') + '" value="' + (that.defaultValue ? that.defaultValue : '') + '" class="input-text">')
                    $dom.append($num)
                    $domHtml.append($dom);
                    break
                case "textarea"://多行文本
                    $dom = $('<div class="col-9 f-l"><textarea class="textarea" name="' + that.name + '" placeholder="' + (that.placeholder ? that.placeholder : '') + '">' + (that.defaultValue ? that.defaultValue : '') + '</textarea></div>')
                    $domHtml.append($dom)
                    break
                case "date"://日期插件
                    var datePickerOption = (that.minDate ? 'minDate:' + that.minDate + ',' : '') + (that.maxDate ? 'maxDate:' + that.maxDate + ',' : '') + (that.dateFmt ? 'dateFmt:\'' + that.dateFmt + '\',' : '')
                    $dom = $('<div class="col-9 f-l"><input type="text" name="' + that.name + '" placeholder="" value="' + (that.defaultValue ? that.defaultValue : '') + '" onfocus="WdatePicker({' + datePickerOption + '})" id="' + that.id + '" class="input-text Wdate"></div>')
                    $domHtml.append($dom);
                    break
                case "select"://下拉列表
                    $dom = $('<div class="col-9 f-l"></div>')
                    var optionHtml = "", sl = [];
                    if (that.ajax) {
                        if (that.ajax.api) {
                            $me.ajaxing[that.name] = true;
                            l.ajax(that.ajax.api, {}, function (selectList) {
                                $me.selectListDatas[that.name] = [];
                                $.each(selectList, function (index, v) {
                                    $me.selectListDatas[that.name].push({
                                        value: v[that.ajax.valueName || "value"] || "",
                                        text: v[that.ajax.textName || "text"] || "",
                                        children: v[that.ajax.childrenName || "children"] || []
                                    })
                                })
                                $me.resetSelectHtml($me.selectListDatas[that.name], $me.find("select[name=" + that.name + "]"))
                                if (that.ajax.child) {
                                    var childAjax = {}
                                    $.each($me.conditions, function (index, v) {
                                        if (v.name == that.ajax.child) {
                                            for (var key in v.ajax) {
                                                childAjax[key] = v.ajax[key]
                                            }
                                        }
                                    })
                                    $me.find("select[name=" + that.name + "]").on("change", function (event) {
                                        $.each($me.selectListDatas[that.name], function (index, v) {
                                            if (v.value == event.target.value) {
                                                $me.selectListDatas[that.ajax.child] = [];
                                                $.each(v.children, function (index2, v2) {
                                                    $me.selectListDatas[that.ajax.child].push({
                                                        value: v2[childAjax.valueName || "value"] || "",
                                                        text: v2[childAjax.textName || "text"] || "",
                                                    })
                                                })
                                                $me.resetSelectHtml($me.selectListDatas[that.ajax.child], $me.find("select[name=" + that.ajax.child + "]"))
                                            }
                                        })
                                    })
                                    $me.selectListDatas[that.ajax.child] = [];
                                    $.each($me.selectListDatas[that.name][0].children, function (index, v) {
                                        $me.selectListDatas[that.ajax.child].push({
                                            value: v[that.ajax.valueName || "value"] || "",
                                            text: v[that.ajax.textName || "text"] || "",
                                            children: v[that.ajax.childrenName || "children"] || []
                                        })
                                    })
                                    $me.resetSelectHtml($me.selectListDatas[that.ajax.child], $me.find("select[name=" + that.ajax.child + "]"))
                                }
                                $me.ajaxing[that.name] = false;
                            })
                        } else if (that.ajax.parent && $me.selectListDatas[that.name]) {
                            sl = $me.selectListDatas[that.name]
                        }
                    } else {
                        if (that.selectList) {
                            $me.selectListDatas[that.name] = that.selectList
                            sl = $me.selectListDatas[that.name];
                        } else {
                            L.log(that.name + "，selectList和ajax没有设置")
                        }

                    }


                    for (var i = 0; i < sl.length; i++) {
                        optionHtml += '<option value="' + sl[i].value + '" ' + ((sl[i].selected) ? 'selected' : '') + '>' + sl[i].text + '</option>'
                    }
                    var $sel = $('<select name="' + that.name + '" value="' + that.defaultValue + '" class="select"></select>')
                    $sel.append(optionHtml)
                    $dom.append($sel);
                    $domHtml.append($dom);
                    break
                case "address"://地址联动
                    $dom = $('<div class="col-9 f-l row" style="margin-top: 0;padding-left:0;padding-right:0;margin-left:0"></div>');
                    var $col = $('<div class="f-l col-4"></div>')
                    var $addressSelect1 = $('<select name="' + that.name + '" data-addressName="address1" class="select"></select>')
                    var $addressSelect2 = $('<select name="' + that.name + '" data-addressName="address2" class="select"></select>')
                    var $addressSelect3 = $('<select name="' + that.name + '" data-addressName="address3" class="select"></select>')
                    var selectData1 = [];
                    var selectData2 = [];
                    var selectData3 = [];
                    $addressSelect1.on("change", function () {
                        var val = $(this).val()
                        $.each(selectData1, function (i, v) {
                            if (v.value == val) {
                                selectData2 = $me.updateSelect(v.children, $addressSelect2, that.ajax)
                                selectData3 = $me.updateSelect(selectData2[0].children, $addressSelect3, that.ajax)
                            }
                        })
                    })
                    $addressSelect2.on("change", function () {
                        var val = $(this).val()
                        $.each(selectData2, function (i, v) {
                            if (v.value == val) {
                                selectData3 = $me.updateSelect(v.children, $addressSelect3, that.ajax)
                            }
                        })
                    })
                    if ($me.addressData.lenght > 0) {
                        selectData1 = $me.updateSelect($me.addressData, $addressSelect1, that.ajax)
                        selectData2 = $me.updateSelect(selectData1[0].children, $addressSelect2, that.ajax)
                        selectData3 = $me.updateSelect(selectData2[0].children, $addressSelect3, that.ajax)
                    } else {
                        $me.ajaxing[that.name] = true;
                        l.ajax(that.ajax.api, {}, function (data) {
                            $me.addressData = data;
                            selectData1 = $me.updateSelect($me.addressData, $addressSelect1, that.ajax)
                            selectData2 = $me.updateSelect(selectData1[0].children, $addressSelect2, that.ajax)
                            selectData3 = $me.updateSelect(selectData2[0].children, $addressSelect3, that.ajax)
                            $me.ajaxing[that.name] = false;
                        })
                    }
                    $dom.append($col.clone().append($addressSelect1));
                    $dom.append($col.clone().append($addressSelect2));
                    $dom.append($col.clone().append($addressSelect3));
                    $domHtml.append($dom);
                    break;
                case "pickTree"://树形选择
                    $dom = $('<div class="col-9 f-l"></div>')
                    var $pickTree = $('<div data-id="pickTree" data-name="' + $me.idname + that.name + '" class="pickTree"></div>')
                    var $pickTreeList = $('<ul data-id="pickTreeList" class="cl"></ul>')
                    var $pickTreeAdd = $('<button data-id="pickTreeAdd" class="pickTreeAdd" type="button"></button>')
                    myPickTree.initDataWidthName($me.idname + that.name)
                    $pickTreeAdd.on("click", function () {
                        myPickTree.open(($me.idname + that.name), that.pickType, that.maxLen)
                    })
                    $pickTree.append($pickTreeList);
                    $pickTree.append($pickTreeAdd);
                    $dom.append($pickTree);
                    $domHtml.append($dom);
                    break

                case "pickMember"://旧的成员选择
                    $dom = $('<div class="col-9 f-l"><div id="pickMember" class="pickMember"><ul id="pickMemberList" class="cl"></ul><button data-name="pickMemberAdd" class="pickMemberAdd" type="button"></button></div></div>')
                    $domHtml.append($dom);
                    break

                case "upload"://上传组件唯一
                    accessoryList[$me.idName + that.name] = []
                    $dom = $('<div class="col-9 f-l"><div class="uploadFile" data-name="' + ($me.idName + that.name) + '" data-maxLen="' + that.maxLen + '"><ul class="uploadList"></ul><label style="position: relative;" for="uploadBtn_' + ($me.idName + that.name) + '" name="' + that.name + '" class="btn btn-primary size-S">' + (that.btnName ? that.btnName : '添加') + '<input  id="uploadBtn_' + ($me.idName + that.name) + '" data-fileType=\'' + JSON.stringify(that.fileType ? that.fileType : []) + '\' name="filesName" size="2" class="inputFile"  type="file" /></label><span class="ml-10">' + (that.remind ? that.remind : (that.fileType ? ('上传格式要求：' + JSON.stringify(that.fileType)) : '')) + '</span></div></div>')
                    $domHtml.append($dom);
                    break
                case "option"://option
                    $dom = $('<div class="col-9 f-l"></div>')
                    var $option = $('<div class="mb-15 option" style="position:relative"><input type="text" name="content" placeholder="' + (that.placeholder ? that.placeholder : '') + '" class="input-text"></div>')
                    var $optionAddBox = $('<div class="optionAddBox"></div>')
                    var $optionAdd = $('<div class="mb-15 optionAdd" style="position:relative"><input type="text" name="content" placeholder="' + (that.placeholder ? that.placeholder : '') + '" class="input-text"></div>')
                    var $removeBtn = $('<a title="删除" class="removeBtn" href="javascript:;" class="ml-5 delete" style="text-decoration: none;font-size: 20px;position: absolute;right: -25px;top: -1px;"><i class="icon Hui-iconfont"></i></a>')
                    $removeBtn.click(function () {
                        $(this).parents(".optionAdd").remove()
                    })
                    $optionAdd.append($removeBtn.clone(true))
                    var $addBtn = $('<span class="addBtn btn btn-primary size-S"><i class="Hui-iconfont">&#xe600;</i> 添加选项</span>')
                    $addBtn.click(function () {
                        $optionAddBox.append($optionAdd.clone(true))
                    })
                    for (var i = 0; i < that.minOptionNum; i++) {
                        $optionAddBox.append($option.clone())
                    }
                    $dom.append($optionAddBox)
                    $dom.append($addBtn)
                    $domHtml.append($dom)
                    break
                case "editor":
                    $dom = $('<div class="col-9 f-l"></div>')
                    var $editor = $('<script id="' + $me.idName + that.name + '" type="text/plain" style="width:100%;height:200px;"></script>')
                    $dom.append($editor)
                    $domHtml.append($dom)
                    break;
                default:
                    $dom = $('')
                    $domHtml.append($dom)
                    break
            }
            L.log("{key:" + that.key + ",name:" + that.name + ",type:" + that.type + "} create success!")
            return $domHtml
        }
        //表单子元素构造函数end

        $.each($me.conditions, function (index, condition) {
            if (condition) {
                var item = new FormItem(condition, index)
                $me.items.push(item);
                $detailForm.append(item.$dom);
            }
        })
        $detailForm.append($detailFormControlLine)
        $page.append($detailForm)
        $me.append($page)
        //结构构建send

        // 打开弹窗start
        $me.open = function (data) {
            if ($me.isAjaxInit()) {
                $me.setOpenData(data, $me._open)
            } else {
                layer.alert("数据正在初始化，请稍后再试！", { icon: 0, }, function (index) {
                    layer.close(index);
                });
            }
        }
        // 打开弹窗start

        // 判断数据是否初始化成功start
        $me.isAjaxInit = function () {
            for (var key in $me.ajaxing) {
                if ($me.ajaxing[key]) {
                    return false
                }
            }
            return true
        }
        // 判断数据是否初始化成功start

        // 设置弹窗打开形式start
        $me.setOpenData = function (data, callback) {
            if (!data) {
                data = { isAdd: true };
                $me.isAdd = true;
            } else if (data.isAdd) {
                $me.isAdd = true
            } else {
                $me.isAdd = false;
            }
            if ($me.controlKey) {
                $me.controlValue = data[$me.controlKey]
            }
            for (var i = 0; i < $me.items.length; i++) {
                if ($me.isHide($me.items[i])) {
                    $me.items[i].$dom.hide()
                } else {
                    $me.items[i].$dom.show()
                    if ($me.isLabel($me.items[i])) {//特殊
                        $me.items[i].$dom.find('label span').html($me.items[i].label + "(分)")
                    } else {
                        $me.items[i].$dom.find('label span').html($me.items[i].label)
                    }
                    switch ($me.items[i].type) {
                        case "select":
                            if (!$me.isAdd) {
                                if ($me.items[i].ajax && $me.items[i].ajax.parent) {
                                    $.each($me.selectListDatas[$me.items[i].ajax.parent], function (index, v) {
                                        if (v.value == data[$me.items[i].ajax.parent]) {
                                            $me.selectListDatas[$me.items[i].name] = [];
                                            $.each(v.children, function (index2, v2) {
                                                $me.selectListDatas[$me.items[i].name].push({
                                                    value: v2[$me.items[i].ajax.valueName || "value"] || "",
                                                    text: v2[$me.items[i].ajax.textName || "text"] || "",
                                                    children: v2[$me.items[i].ajax.childrenName || "children"] || [],
                                                    selected: (v2[$me.items[i].ajax.valueName || "value"] == data[$me.items[i].name]) ? true : false,
                                                })
                                            })
                                            $me.resetSelectHtml($me.selectListDatas[$me.items[i].name], $me.find("select[name=" + $me.items[i].name + "]"))
                                        }
                                    });
                                } else {
                                    $me.items[i].setValue(data[$me.items[i].name]);
                                }
                            } else {
                                if ($me.items[i].ajax && $me.items[i].ajax.parent) {
                                    $me.selectListDatas[$me.items[i].name] = []
                                    $.each($me.selectListDatas[$me.items[i].ajax.parent][0].children, function (index, v) {
                                        $me.selectListDatas[$me.items[i].name].push({
                                            value: v[$me.items[i].ajax.valueName || "value"] || "",
                                            text: v[$me.items[i].ajax.textName || "text"] || "",
                                            children: v[$me.items[i].ajax.childrenName || "children"] || [],
                                        })
                                    })
                                    $me.resetSelectHtml($me.selectListDatas[$me.items[i].name], $me.find("select[name=" + $me.items[i].name + "]"))
                                } else {
                                    $me.items[i].setValue("")
                                }
                            }
                            break;
                        case "pickMember":
                            $me.items[i].setValue([data["oaDepartmentList"], data["oaMemberList"]])
                            break;
                        default://hidden,text,number,textarea,date,address,option,pickTree,upload
                            $me.items[i].setValue(data[$me.items[i].name]);
                            break
                    }
                }
            }
            if (callback) {
                callback(data.layerTitle, data.layerArea)
            }
        };
        // 设置弹窗打开形式end

        // 打开弹窗start
        $me._open = function (layerTitle, layerArea) {
            $me.mylayer = layer.open({
                type: 1,
                title: layerTitle || $me.layerTitle || ($me.isAdd ? '新增' : "详情"),
                area: layerArea || $me.layerArea || ['800px', '80%'],
                content: $me
            });
        };
        // 打开弹窗end

        // 获取数据start
        $me.getDatas = function () {
            var dataObj = {};
            for (var i = 0; i < $me.items.length; i++) {
                if (!$me.isHide($me.items[i])) {
                    switch ($me.items[i].type) {
                        case "option":
                            var d = $me.items[i].getValue()
                            if ($me.items[i].must && d.length < $me.items[i].minOptionNum) {
                                layer.alert("至少添加" + $me.items[i].minOptionNum + "个选项！", { icon: 0, }, function (index) {
                                    layer.close(index);
                                });
                                return
                            }
                            dataObj[$me.items[i].name] = d;
                            break
                        case "pickMember":
                            if ($me.items[i].must && getPickMember("department").length == 0 && getPickMember("member").length == 0) {
                                layer.alert($me.items[i].label + "不能为空！", { icon: 0, }, function (index) {
                                    layer.close(index);
                                });
                                return
                            }
                            dataObj["oaDepartmentList"] = getPickMember("department")
                            dataObj["oaMemberList"] = getPickMember("member")
                            break;

                        case "upload":
                            dataObj[$me.items[i].name] = getUploadList($me.idName + $me.items[i].name)
                            break;
                        case "pickTree":
                            var d = $me.items[i].getValue()
                            var len = 0;
                            dataObj[$me.items[i].name] = {};
                            for (var key in $me.items[i].pickType) {
                                if ($me.items[i].pickType[key]) {
                                    len = len + d[key].length;
                                    dataObj[$me.items[i].name][$me.items[i].pickType[key]] = d[key];
                                }
                            }
                            if ($me.items[i].must && len == 0) {
                                layer.alert($me.items[i].label + "不能为空！", { icon: 0, }, function (index) {
                                    layer.close(index);
                                });
                                return
                            }
                            if ($me.items[i].noMultiple && len > 1) {
                                layer.alert($me.items[i].label + "只能选择一个", { icon: 0, }, function (index) {
                                    layer.close(index);
                                });
                                return
                            }
                            break;
                        case "editor":
                            var d = $me.items[i].getValue()
                            if ($me.items[i].must && $me.items[i].ue.hasContents()) {
                                layer.alert($me.items[i].label + "不能为空！", { icon: 0, }, function (index) {
                                    layer.close(index);
                                });
                                return false
                            }
                            dataObj[$me.items[i].name] = d
                            break
                        default://hidden,text,number,textarea,date,select,address
                            var d = $me.items[i].getValue()
                            if ($me.items[i].must && $.trim(d) == "") {
                                layer.alert($me.items[i].label + "不能为空！", { icon: 0, }, function (index) {
                                    layer.close(index);
                                });
                                return false
                            }
                            dataObj[$me.items[i].name] = $me.items[i].type == "date" ? l.dateToUnix(d) : d
                            break
                    }
                }
            }
            return dataObj
        }
        // 获取数据end

        // 关闭弹窗start
        $me.close = function () {
            layer.close($me.mylayer)
        };
        // 关闭弹窗end
        // 重置下拉列表内容start
        $me.resetSelectHtml = function (data, $s) {
            $s.html("");
            if (data) {
                $.each(data, function (i, v) {
                    $s.append('<option value="' + v.value + '" ' + ((v.selected) ? 'selected' : '') + '>' + v.text + '</option>');
                })
            }
            return $s
        };
        // 重置下拉列表内容end

        // 刷新联动下拉列表数据start
        $me.updateSelect = function (data, $s, ajax) {
            var d = [];
            if (data && data.length > 0) {
                $.each(data, function (i, v) {
                    d.push({
                        value: v[ajax.valueName],
                        text: v[ajax.textName],
                        children: v[ajax.childrenName],
                    })
                })
            }
            if (d.length > 0) {
                $me.resetSelectHtml(d, $s).show()
            } else {
                $me.resetSelectHtml(d, $s).hide()
            }
            return d
        }
        // 刷新联动下拉列表数据start

        // 重置默认值start
        $me.resetDefaultValue = function (name, newDefaultValue) {
            for (var i = 0; i < $me.items.length; i++) {
                if ($me.items[i].name == name) {
                    $me.items[i].defaultValue = newDefaultValue;
                    break;
                }
            }
        }
        // 重置默认值end

        // 根据controlValue字段判断是否隐藏start
        $me.isHide = function (item) {
            var hideState = false;
            if (item.controlHide) {
                var hideArr = item.controlHide.split(",");
                for (var j = 0; j < hideArr.length; j++) {
                    if ($me.controlValue == hideArr[j]) {
                        hideState = true; break
                    }
                }
            }
            return hideState
        }
        // 根据controlValue字段判断是否隐藏end

        // 根据controlValue字段判断是否改变Label start
        $me.isLabel = function (item) {
            var labelState = false;
            if (item.controlLabel) {
                var labelArr = item.controlLabel.split(",");
                for (var j = 0; j < labelArr.length; j++) {
                    if ($me.controlValue == labelArr[j]) {
                        labelState = true; break
                    }
                }
            }
            return labelState
        }
        // 根据controlValue字段判断是否改变Label end
        return $me
    }
}(jQuery, Lny)
