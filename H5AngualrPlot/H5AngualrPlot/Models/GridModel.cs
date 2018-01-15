using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace H5AngualrPlot.Models
{

    public class BaseWcfModel
    {
        protected static string[] DefaultColors = { "#0066dd", "#990000", "#008000", "#800080", "#998000", "#000000", "#00ced1",
            "#fa8072", "#92eq06", "#cc0066", "#008080", "#663300","#00008b","#00cc00","#b22222","#00cccc" };



    }
    public class GridModel : BaseWcfModel
    {
        public string TagName { get; set; }

        public string Color { get; set; }

        public int Width { get; set; }
        public string Text { get; set; }

        public string Unit { get; set; }

        public string Status { get; set; }

        public double Min { get; set; }

        public double Max { get; set; }

        public double MinScale { get; set; }

        public double MaxScale { get; set; }

        /// <summary>
        /// 时间偏移量
        /// </summary>
        public int TimeOffset { get; set; }
        public  List<GridModel> LoadGrids(List<QueryModel> query)
        {


            int index = 0;
            List<GridModel> listRes = new List<GridModel>();
            foreach (var item in query)
            {
                var node = new GridModel()
                {
                    Color = query[index].Color?.Length < 1 ? DefaultColors[index] : query[index].Color,
                    TagName = query[index].TagName,
                    Text = "描述",
                    Unit = "单位",
                    Status = "状态",
                    Width = query[index].Width,
                    Max = query[index].Max,
                    Min = query[index].Min,
                    TimeOffset = query[index].OffsetValue,
                    MaxScale = query[index].MaxScale >= 99999 ? Convert.ToDouble("100") : query[index].MaxScale,
                    MinScale = query[index].MinScale <= -99999 ? Convert.ToDouble("0") : query[index].MinScale
                };
                listRes.Add(node);
                index++;
            }
            return listRes;
        }

    }
}