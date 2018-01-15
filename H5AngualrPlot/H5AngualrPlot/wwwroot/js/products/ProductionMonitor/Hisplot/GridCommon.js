﻿angular.module("Grid", ["minicolors", "xeditable", "angularMoment"]).factory("GridCommon", function ($http, moment, $rootScope, $timeout) {
    var main = this;

    main.List = []; //位号列表

    main.startDate = "2016-01-01 00:00:00";
    main.endDate = "2016-01-01 02:00:00";
    main.timeOffset = "";   //间隔时间
    main.isReal = true; //是否实时刷新
    main.isCheck = true;
    main.realHisClass = "glyphicon glyphicon-play";
    main.realHisColor = "btn btn-primary";
    main.tagDetailList = [];
    var gridViewModel = function (id, color, name, text, unit, status, isCheck, min, max, timeOffset, minScale, maxScale) {
        var self = this;
        self.Id = id;
        self.Name = name;
        self.Text = text;
        self.Unit = unit;
        self.Status = status;
        self.IsCheck = isCheck;
        self.currMin = min;
        self.currMax = max;
        self.Min = min;
        self.Max = max;
        self.TimeOffset = timeOffset;
        self.minScale = minScale;
        self.maxScale = maxScale;
        self.rowClass = "";
        self.setMinMax = function (min, max, compMin, compMax) {
            self.currMin = parseFloat(compMin.toFixed(3));
            self.currMax = parseFloat(compMax.toFixed(3));
            if (self.IsCheck) {
                self.Min = parseFloat(min.toFixed(3));
                self.Max = parseFloat(max.toFixed(3));
            } else {
                self.Min = parseFloat(self.minScale.toFixed(3));
                self.Max = parseFloat(self.maxScale.toFixed(3));
            }

            self.changeModel.canvasMin = self.Min;
            self.changeModel.canvasMax = self.Max;
        };
        self.updateMinMax = function (send) {
            if (!self.IsCheck) {
                self.Min = self.minScale;
                self.Max = self.maxScale;
            } else {
                self.Min = self.currMin;
                self.Max = self.currMax;

            }
            self.changeModel.autoMinMax = self.IsCheck;
            self.changeModel.canvasMin = self.Min;
            self.changeModel.canvasMax = self.Max;
            if (send) {
                main.gridConfigChanged("UpdateMinMax", main.getChangeModes());
            }

        };
        self.changeModel = new changeModel();
        self.showOrHideClick = function (index) {
            if (self.rowClass == "danger") {
                self.rowClass = "";
                self.changeModel.display = true;

            } else {
                self.rowClass = "danger";
                self.changeModel.display = false;
            }

            main.gridConfigChanged("ShowOrHide", main.getChangeModes());
        };

        self.minSaveClick = function () {
            self.changeModel.canvasMin = self.Min;
            self.minScale = self.Min;
            self.IsCheck = false;
            self.changeModel.autoMinMax = self.IsCheck;
            main.gridConfigChanged("UpdateMinMax", main.getChangeModes());
        };
        self.maxSaveClick = function () {

            self.changeModel.canvasMax = self.Max;
            self.maxScale = self.Max;
            self.IsCheck = false;
            self.changeModel.autoMinMax = self.IsCheck;
            main.gridConfigChanged("UpdateMinMax", main.getChangeModes());
        };

        self.offsetStr = function (value) {
            if (value < 10) {
                return "0" + value;
            } else {
                return value;
            }
        };
        self.offsetDirect = true; //偏移方向 加
        self.offsetClass = "glyphicon glyphicon-plus";
        self.offsetChange = function () {

            if (self.offsetDirect) {
                self.offsetClass = "glyphicon glyphicon-minus";
            } else {
                self.offsetClass = "glyphicon glyphicon-plus";
            }
            self.offsetDirect = !self.offsetDirect;
            self.offsetTimeChange();

            return false;
        };

        //偏移量时间 事件 属性
        self.offsetHour = 00;
        self.initOffset = function () {
            if (self.TimeOffset >= 0) {
                self.offsetDirect = true;
                self.offsetClass = "glyphicon glyphicon-plus";
            } else {
                self.offsetDirect = false;
                self.offsetClass = "glyphicon glyphicon-minus";
            }
            self.offsetHour = Math.abs(parseInt(self.TimeOffset / 3600));
            self.offsetMinutes = parseInt((Math.abs(self.TimeOffset) - self.offsetHour * 3600) / 60);
            self.offsetSecond = Math.abs(self.TimeOffset) - self.offsetHour * 3600 - self.offsetMinutes * 60;
        };

        self.offsetTotalSeconds = 0;
        //偏移量时间变化事件
        self.offsetTimeChange = function () {
            var dict = 1;
            self.offsetTotalSeconds = self.offsetHour * 3600 + self.offsetMinutes * 60 + self.offsetSecond;
            if (!self.offsetDirect) {
                dict = -1;
            }
            self.changeModel.offsetValue = self.offsetTotalSeconds * dict;
            main.gridConfigChanged("OffsetTime", main.getChangeModes());
            main.changeHisEvent();

        };
        self.offsetMinutes = 00;


        self.offsetSecond = 00;


        self.tagDbClick = function (index) {
            main.config.currModelTitle = self.Name;

            while (main.tagDetailList.length > 0) {
                main.tagDetailList.pop();
            }
            main.currId = self.Id;
            $("#myModal").modal("show");
            main.loadDetailListEvent(index, main.tagDetailList);
        };

        //线条颜色设置
        self.Color = color;
        self.Width = 1;
        self.Style = "solid"; //实线
        self.CssStyle = {
            'border-color': self.Color,
            'border-style': self.Style,
            'border-width': self.Width + "px",

        };
        self.CssDbClick = function () {
            main.config.currModelStyle = self.CssStyle;
            main.config.currModelTitle = self.Name;
            main.config.currColor = self.Color;
            main.config.currTitleBg = {
                "color": self.Color
            };
            main.config.currBordColor = {
                "border-color": self.Color
            };
            main.currId = self.Id;
            main.config.currRadioValue = self.Style + "_" + self.Width;
            $("#colorModal").modal("show");

        };

        self.remove = function (index) {
            main.List.splice(index, 1);
            main.gridConfigChanged("Remove", index);
        }
    };


    var rangSilderModel = function () {
        var self = this;
        self.startSilder = null;
        self.endSilder = null;

        //间隔时间 
        self.offsetTotalSeconds = 7200;
        self.offsetDay = 0;
        self.offsetHour = 2;
        self.offsetMinutes = 0;
        self.offsetSecond = 0;
        self.preSilderEvent = function () {

            var temp = moment(main.endDate).diff(main.startDate, 's') / 2;
            main.endDate = moment(main.startDate).add(temp, 's');
            main.startDate = moment(main.startDate).add(-temp, 's');
            main.changeHisEvent();
            main.silderStartEndChanged(main.startDate, main.endDate, false, -1);
        };
        self.nextSilderEvent = function () {
            var temp = moment(main.endDate).diff(main.startDate, 's') / 2;
            main.startDate = moment(main.endDate).add(-temp, 's');
            main.endDate = moment(main.endDate).add(temp, 's');
            main.changeHisEvent();
            main.silderStartEndChanged(main.startDate, main.endDate, false, 1);
        };
        self.offsetBtnChange = function (val, id) {
            $(".grid_btn_silder").removeClass("btn-primary");
            $(id).addClass("btn-primary");
            var start = moment(main.endDate).add(-val, 's');
            self.offsetTotalSeconds = val;
            self.offsetChange(val);
            main.changeHisEvent();
            main.silderStartEndChanged(start, moment(main.endDate), true, 0);
        };

        self.offsetModalBtnChange = function (val, id) {
            $(".group_silder .grid_btn_silder").removeClass("btn-primary");
            $(id).addClass("btn-primary");
            self.offsetChange(val);
            self.offsetUpdate(false);
        };
        self.offsetUpdate = function (remove) {
            if (remove) {
                $(".group_silder .grid_btn_silder").removeClass("btn-primary");
            }
            var endTime = moment($("#modal_start").val()).add(self.offsetDay, 'd');
            endTime = endTime.add(self.offsetHour, 'h');
            endTime = endTime.add(self.offsetMinutes, 'm');
            endTime = endTime.add(self.offsetSecond, 's');
            main.endDate = endTime.format("YYYY-MM-DD HH:mm:ss");

        };
        self.startChange = function () {
            var endTime = moment($("#modal_start").val()).add(self.offsetDay, 'd');
            endTime = endTime.add(self.offsetHour, 'h');
            endTime = endTime.add(self.offsetMinutes, 'm');
            endTime = endTime.add(self.offsetSecond, 's');
            main.endDate = endTime.format("YYYY-MM-DD HH:mm:ss");
        };
        self.endChange = function () {
            var endTime = moment($("#modal_end").val()).add(-self.offsetDay, 'd');
            endTime = endTime.add(-self.offsetHour, 'h');
            endTime = endTime.add(-self.offsetMinutes, 'm');
            endTime = endTime.add(-self.offsetSecond, 's');
            main.startDate = endTime.format("YYYY-MM-DD HH:mm:ss");
        };
        self.offsetChange = function (val) {
            if (val / 3600 >= 24) {
                self.offsetDay = val / (3600 * 24);
                self.offsetHour = 0;
                self.offsetMinutes = 0;
                self.offsetSecond = 0;
            } else {
                self.offsetDay = 0;
                self.offsetMinutes = 0;
                self.offsetSecond = 0;
                self.offsetHour = val / 3600;
            }

        };
        self.getTotalSeconds = function () {
            return self.offsetDay * 86400 + self.offsetHour * 3600 + self.offsetMinutes * 60 + self.offsetSecond;
        };
        self.offsetApply = function () {
            var id = $(".group_silder button[class$='btn-primary']").attr("id");
            $("#gridtooblr .grid_btn_silder").removeClass("btn-primary");
            if (id != null) {
                $("." + id).addClass("btn-primary");
            }
            main.changeHisEvent();
            main.startEndChangedEvent($("#modal_start").val(), $("#modal_end").val());

        };
        self.silderUpdateOffset = function (seconds) {
            self.offsetDay = parseInt(seconds / 86400);
            self.offsetHour = parseInt((seconds - self.offsetDay * 86400) / 3600);
            self.offsetMinutes = parseInt((seconds - self.offsetDay * 86400 - self.offsetHour * 3600) / 60);
            self.offsetSecond = seconds - self.offsetDay * 86400 - self.offsetHour * 3600 - self.offsetMinutes * 60;
        };

    };

    var changeModel = function (index) {
        this.index = index;
        this.color = "";
        this.style = "";
        this.width = "";
        this.display = true;
        this.canvasMin = null;
        this.canvasMax = null;
        this.autoMinMax = true;
        this.offsetValue = 0;

    };
    main.getChangeModes = function () {
        var nodes = [];
        main.List.forEach(function (item) {
            nodes.push(item.changeModel);
        });
        return nodes;
    };
    var gridConfigModel = function () {
        var self = this;
        self.currModelStyle = {};
        self.currModelTitle = "";
        self.currColor = "#990099";
        self.currTitleBg = {
            "color": self.currColor
        };

        self.currBordColor = {
            "border-color": self.currColor
        };
        //minicolors 配置
        self.customSettings = {
            control: 'brightness',
            theme: 'bootstrap',
            position: 'bottom left'

        };
        self.currRadioValue = "";
        self.applyCurr = function () {
            var value = self.currRadioValue.split('_');
            var index = -1;
            for (var c in main.List) {
                if (main.List[c].Id == main.currId) {
                    index = c;
                    break;
                }
            }
            if (index != -1) {
                var model = main.List[index];
                model.Color = main.config.currColor;
                model.Width = value[1];
                model.Style = value[0];
                model.changeModel.width = value[1];
                model.changeModel.color = model.Color;
                model.changeModel.style = model.Style;
                model.CssStyle = {
                    'border-color': model.Color,
                    'border-style': model.Style,
                    'border-width': model.Width + "px",
                };
                main.gridConfigChanged("StyleChange", main.getChangeModes());

            }
        };
        self.export = function () {
            var index = -1;
            for (var c in main.List) {
                if (main.List[c].Id == main.currId) {
                    index = c;
                    break;
                }
            }
            if (index != -1) {
                main.exportExcel(index);
            }
        };
    };
    main.silder = new rangSilderModel();

    main.config = new gridConfigModel();
    //实时 历史切换事件
    main.realOrHisEvent = function () {

        if (main.isReal) {
            main.realHisClass = "glyphicon glyphicon-stop";
            main.realHisColor = "btn btn-danger";
            main.updateRealOrHis(false);

        } else {
            main.realHisClass = "glyphicon glyphicon-play";
            main.realHisColor = "btn btn-primary";
            main.updateRealOrHis(true);
        }
        main.isReal = !main.isReal;
    };
    main.changeHisEvent = function () {
        main.isReal = false;
        main.realHisClass = "glyphicon glyphicon-stop";
        main.realHisColor = "btn btn-danger";
        main.updateRealOrHis(false);
    };
    main.updateRealOrHis = null;
    main.silderStartEndChanged = null;
    main.loadDetailListEvent = null;
    main.gridConfigChanged = null;
    main.offsetStr = function (value) {
        if (parseInt(value) < 10 && parseInt(value) >= 0) {
            return "0" + value;
        } else {
            return value;
        }
    };
    main.startEndChangedEvent = null;
    main.exportExcel = null;

    main.checkClick = function () {

        main.List.forEach(function (value) {
            value.IsCheck = !main.isCheck;
            value.updateMinMax(false);
        });
        main.gridConfigChanged("UpdateMinMax", main.getChangeModes());
        main.isCheck = !main.isCheck;
    };

    main.currId = 0;
    main.reseizeWindow = function () {
        if ($(window).width() < 800) {
            $(".navbar-left,.navbar-right").hide();
            $("#navbar").hide();
            $("#top_container").hide();
            $("#rowTimeBtns").hide();
            $(".table_grid tr").each(function (item) {
                $("td:gt(4)", $(this)).hide();
                $("td:lt(1)", $(this)).hide();

            })
        } else {
            $(".navbar-left,.navbar-right").show();
            $("#rowTimeBtns").show();
            $("#navbar").show();
            $("#top_container").show();

            $(".table_grid tr").each(function (item) {
                $("td:gt(4)", $(this)).show();
                $("td:lt(1)", $(this)).show();
            })
        }
    };
    main.lineId = 0;
    main.init = function () {
        moment.locale("zh-cn");

        $('.datetimepicker').datetimepicker({
            locale: "zh-cn",
            format: "YYYY-MM-DD HH:mm:ss"
        });

    };
    main.loadData = function (data) {
        for (var c in data) {
            if (typeof (data[c]).TagName == "undefined") {
                break;
            }
            var temp = new gridViewModel(main.lineId, data[c].Color, data[c].TagName, data[c].Text, data[c].Unit, data[c].Status, true, data[c].Min, data[c].Max, data[c].TimeOffset, data[c].MinScale, data[c].MaxScale);
            temp.initOffset();
            main.List.push(temp);
            main.lineId++;
        }
    };
    main.setMinMaxValue = function (arr) {
        if (main.List.length == arr.length) {
            for (var c in arr) {
                ///当前绘图最大小值 自动计算绘图最大小值

                main.List[c].setMinMax(arr[c].MinValue, arr[c].MaxValue, arr[c].CompMin, arr[c].CompMax);
                main.List[c].changeModel.offsetValue = arr[c].OffsetValue;
            }
        }
    };
    return main;
})