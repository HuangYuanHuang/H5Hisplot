﻿angular.module("QueryModule", ["angularMoment"]).factory("QueryModel", function ($location, moment, $http, $timeout, $rootScope) {

    var main = this;
    main.saveTagUrl = "";
    main.groupTagUrl = "/dbweb/api/Interface/GetGrid?view=HT_PRODUCT_HISPLOTDETAIL&HISPLOTID=";
    var model = function (tag, start, end, color) {
        this.TagName = tag;
        this.Start = start;
        this.End = end;
        this.Color = color;
        this.Width = 1; //绘图宽度
        this.Display = true;  //是否显示
        this.Min = -1;
        this.Max = -1;
        this.AutoMinMax = true;
        this.OffsetValue = 0;  //时间偏移量（秒）
        this.MinScale = -99999;
        this.MaxScale = 99999;
    };

    var tagViewModel = function (tagName, color, name) {
        this.TAG_NAME = tagName;
        this.HISPLOTDETAIL_LINECOLOR = color;
        this.HISPLOTDETAIL_TAGNAME = name;
        this.HISPLOTDETAIL_MAXVALUE = 100;
        this.HISPLOTDETAIL_MINIVALUE = 0;
    };
    main.defaultColors = ["#0066dd", "#990000", "#008000", "#800080", "#998000", "#000000", "#00ced1", "#fa8072", "#92eq06", "#cc0066", "#008080", "#663300", "#00008b", "#00cc00", "#b22222", "#00cccc"];
    main.updateTime = function (start, end) {
        main.Querys.forEach(function (item) {
            item.Start = start;
            item.End = end;
        })
    };
    main.updateDisplay = function (index, val) {
        main.Querys[index].Display = val;
    };
    main.updateStyle = function (index, width, color) {
        main.Querys[index].Color = color;
        main.Querys[index].Width = width;
    };
    main.updateMinMax = function (index, min, max, auto) {
        main.Querys[index].Min = min;
        main.Querys[index].Max = max;
        main.Querys[index].AutoMinMax = auto;
    };
    main.updateOffset = function (index, offset) {
        main.Querys[index].OffsetValue = offset;

    };
    main.removeTag = function (index) {
        main.Querys.splice(index, 1);
        main.addUrlParms();
    };
    main.addTag = function (name) {
        if (main.Querys.length == main.defaultColors.length) {
            alert("已经达到位号最大数量,无法添加！");
            return;
        };
        var list = JSLINQ(main.Querys);
        var color = "#080808";
        for (var c in main.defaultColors) {
            var obj = list.First(function (d) { return d.Color == main.defaultColors[c] });
            if (obj == null) {
                color = main.defaultColors[c];
                break;
            }
        };


        var node = new model(name, "", "", color);
        if (main.Querys.length > 0) {
            node.Start = main.Querys[0].Start;
            node.End = main.Querys[0].End;
        }
        var index = 0;
        var tagList = "";
        for (var c in main.Querys) {
            tagList += (main.Querys[c].TagName + "|");
            if (main.Querys[c].TagName == name) {
                index = -1;

            }
        };
        if (index == 0) {
            main.Querys.push(node);
        };
        $location.search("TagName", tagList + name);
        $location.replace();
        return index;
    };

    main.addUrlParms = function () {
        var tagList = "";
        for (var c in main.Querys) {
            tagList += ("|" + main.Querys[c].TagName);

        };
        $location.search("TagName", tagList.substring(1));
    };
    main.Querys = [];
    main.isHisotory = false;
    main.isPlay = false;
    main.initPush = function (name, min, max) {
        var temp = new model(name, "", "", "");
        temp.AutoMinMax = false;
        temp.Min = min;
        temp.Max = max;
        temp.MinScale = min;
        temp.MaxScale = max;
        main.Querys.push(temp);
    };
    main.DefaultInit = function () {
        $(".btn_two").addClass("btn-primary");


        var search = $location.search();
        var nodes = [];
        if (typeof (search.Id) != "undefined") {
            $http.get(main.groupTagUrl + search.Id).success(function (json) {
                var data = JSON.parse(json);
                data.forEach(function (item) {
                    var obj = new model(item.HISPLOTDETAIL_SERVER + ":" + item.HISPLOTDETAIL_TAGNAME, "", "", item.HISPLOTDETAIL_LINECOLOR);
                    obj.MinScale = item.HISPLOTDETAIL_MINIVALUE;
                    obj.MaxScale = item.HISPLOTDETAIL_MAXVALUE;
                    nodes.push(obj);
                });
                nodes.forEach(function (item) {
                    main.Querys.push(item);
                });
                $rootScope.$broadcast("ngRepeatFinished");
            }).error(function () {
                $rootScope.$broadcast("ngRepeatFinished");

            })

        }
        else {
            if (typeof (search.TagName) != "undefined") {
                search.TagName.split('|').forEach(function (item) {
                    nodes.push(new model(item, "", "", ""));
                })
            }
            else {
                nodes.push(new model("LYB#H145.PV", "", "", ""));
                nodes.push(new model("LYB#H147.PV", "", "", ""));
              
            }
            if (typeof (search.TagColor) != "undefined") {
                var arrColors = search.TagColor.split('|');
                for (var c in arrColors) {
                    nodes[c].Color = arrColors[c];
                }
            }

            if (typeof (search.TagMinScaleList) != "undefined") {
                var tagMinScaleList = search.TagMinScaleList.split('|');
                for (var c in tagMinScaleList) {
                    nodes[c].MinScale = tagMinScaleList[c];
                }
            }
            if (typeof (search.TagMaxScaleList) != "undefined") {
                var tagMaxScaleList = search.TagMaxScaleList.split('|');
                for (var c in tagMaxScaleList) {
                    nodes[c].MaxScale = tagMaxScaleList[c];
                }
            }
            if (typeof (search.StartDate) != "undefined" && typeof (search.EndDate) != "undefined") {
                var startDates = search.StartDate.split('|');
                var endDates = search.EndDate.split('|');

                if (startDates.length == endDates.length) {
                    $(".btn_two").removeClass("btn-primary");
                    main.isHisotory = true;
                    var minDate = moment(startDates[0]);
                    for (var c in startDates) {
                        nodes[c].Start = startDates[c];

                    }
                    nodes.forEach(function (item) {
                        item.OffsetValue = moment(item.Start).diff(minDate, 'seconds');

                        item.Start = moment(minDate).format("YYYY-MM-DD HH:mm:ss");


                    });

                    for (var c in endDates) {
                        nodes[c].End = endDates[c];
                        nodes[c].End = moment(nodes[c].End).add(-(nodes[c].OffsetValue), 'seconds').format("YYYY-MM-DD HH:mm:ss");

                    }
                }
            }
            if (typeof (search.AutoMinMax) != "undefined") {
                var autos = search.AutoMinMax.split('|');
                for (var c in autos) {
                    nodes[c].AutoMinMax = (autos[c] != 'false');
                    nodes[c].Max = nodes[c].MaxScale;
                    nodes[c].Min = nodes[c].MinScale;
                }
            }
            nodes.forEach(function (item) {
                main.Querys.push(item);
            });
            if (typeof (search.PlayDate) != "undefined") {
                main.isPlay = true;
                main.isHisotory = true;
                $(".btn_two").removeClass("btn-primary");
                var playDates = search.PlayDate;
                for (var c in main.Querys) {
                    main.Querys[c].Start = moment(playDates);
                    main.Querys[c].End = moment(playDates).add(180 * 60, "seconds");
                }
            }
        }
    };
    main.queryParms = function () {
        return angular.toJson(main.Querys);
    };

    var saveTagModel = function () {
        var self = this;
        self.groupName = "";
        self.groupSort = 1;
        self.groupDetail = "";
        self.alertClass = "alert alert-success";
        self.alertShow = false;
        self.alertMessage = "正在保存....";
        self.save = function () {
            var url = main.saveTagUrl + "?method=SaveHisplotGroup&type=HisplotGroup&DATA_JSON=";
            var jsonData = [];
            main.Querys.forEach(function (item) {
                jsonData.push(new tagViewModel(item.TagName, item.Color, item.TagName.split(':')[1]));
            });
            var orgID = JSON.parse($.cookie("ckequipdata")).ID;
            var postData = "&EQUIPID=" + orgID + "&HISPLOT_RELATIVE=1&HISPLOT_STARTTIME=&HISPLOT_ENDTIME=&HISPLOT_PUBLIC=0&HISPLOT_NAME=" + escape(self.groupName) + "&HISPLOT_DETAIL=" + escape(self.groupDetail) + "&SHOW_ORDER=" + self.groupSort;
            $http.post(url + escape(angular.toJson(jsonData)) + postData).success(function (data) {
                self.alertShow = true;
                self.alertMessage = data.Message;
                if (data.IsError) {
                    self.alertClass = "alert alert-danger";
                } else {
                    self.alertClass = "alert alert-success";
                    $timeout(function () { $("#saveTagModal").modal("hide"); }, 1000);
                }

            });
        };
        self.open = function () {
            self.alertShow = false;
            self.groupName = "";
            self.groupSort = 1;
            self.groupDetail = "";
            $("#saveTagModal").modal("show");
        }
    };

    main.saveTag = new saveTagModel();
    return main;
});