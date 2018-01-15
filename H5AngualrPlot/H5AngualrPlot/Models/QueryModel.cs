using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace H5AngualrPlot.Models
{
    public class QueryModel
    {
       

        public string TagName { get; set; }

        public string Start { get; set; }

        public string End { get; set; }

        public string Color { get; set; }

        public int Width { get; set; }

        public bool Display { get; set; }


        public double Min { get; set; }

        public double Max { get; set; }

        /// <summary>
        /// 是否自动计算绘图最大小值
        /// </summary>
        public bool AutoMinMax { get; set; }
        public int OffsetValue { get; set; }

        public double MinScale { get; set; }

        public double MaxScale { get; set; }

        public override string ToString() => $"{TagName}|{Start}|{End}";



    }
}