using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Threading.Tasks;

namespace H5AngualrPlot.Models
{
    public class LineModel
    {

        public string TagName { get; set; }

        public string Color { get; set; }
        public int Width { get; set; }

        public bool Display { get; set; }

        public float MinValue { get; private set; }

        public float MaxValue { get; private set; }

        public float CompMin { get; set; }
        public float CompMax { get; set; }

        public bool AutoMinMax { get; set; }
        public int OffsetValue { get; set; }
        public List<LineDataNode> Data { get; set; } = new List<LineDataNode>();

        public void SetMinMaxValue(bool val, double min, double max)
        {

            if (Data.Count() > 0)
            {
                Data.Sort(new LineDataNode());
                CompMin = Data.Min(d => d.Value);
                CompMax = Data.Max(d => d.Value);

                var temp = (CompMax - CompMin) / 10;
                CompMin -= temp;
                CompMax += temp;
            }
            if (!val)
            {
                this.MinValue = (float)min;
                this.MaxValue = (float)max;

            }
            else
            {
                this.MaxValue = this.CompMax;
                this.MinValue = this.CompMin;
            }
            if (CompMax - CompMin < 0.001)
            {
                CompMax += 1;
                CompMin -= 1;
            }
            if (MaxValue - MinValue < 0.001)
            {
                MaxValue += 1;
                MinValue -= 1;
            }
        }

    }

    public class LineDataNode : IComparer<LineDataNode>
    {


        public string Time { get; set; }

        public string ValueStr { get; set; }

        public float Value
        {
            get
            {

                double temp = double.NaN;
                return (float)(Double.TryParse(ValueStr, out temp) ? temp : double.NaN);


            }
        }


        public string Confidence { get; set; }
        public int Compare(LineDataNode x, LineDataNode y)
        {
            return DateTime.Parse(x.Time).CompareTo(DateTime.Parse(y.Time));
        }


    }

    public class MainCanvasModel : BaseWcfModel
    {

        public string StartTime { get; set; }

        public string EndTime { get; set; }

        public IEnumerable<LineModel> Lines { get; set; }




        public MainCanvasModel InitData(List<QueryModel> listParam)
        {


            foreach (var item in listParam)
            {

                if (string.IsNullOrEmpty(item.Start))
                {
                    item.Start = DateTime.Now.AddHours(-2).ToString("yyyy-MM-dd HH:mm:ss");
                }
                if (string.IsNullOrEmpty(item.End))
                {
                    item.End = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                }
            }
            List<LineModel> listRes = new List<LineModel>();
            int index = 0;
         
            if (listParam?.Count == 0)
            {
                return new MainCanvasModel()
                {
                    StartTime = DateTime.Now.AddHours(-2).ToString("yyyy-MM-dd HH:mm:ss"),
                    EndTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
                    Lines = listRes


                };
            }
            Func< QueryModel, Random,List < LineDataNode>> getData = (node, rand) =>
            {
                List<LineDataNode> listNode = new List<LineDataNode>();
                var start = DateTime.Parse(node.Start);
                var end = DateTime.Parse(node.End);
                int secondes = 30;
                if ((end - start).TotalSeconds > 3600 * 24 * 4)
                {
                    secondes = (int)((end - start).TotalSeconds)/800;
                }
                while (start <= end)
                {
                    listNode.Add(new LineDataNode()
                    {
                        Confidence = "Confidence",
                        Time = start.ToString("yyyy-MM-dd HH:mm:ss"),
                        ValueStr = $"{Math.Cos(rand.Next(1, 10)) * rand.Next(1, 10) * 10}"

                    });
                    start = start.AddSeconds(secondes);
                }


                return listNode;
            };
            foreach (var item in listParam)
            {
                var key = item.ToString();

                if (index > DefaultColors.Length - 1)
                {
                    break;
                }
                var temp = new LineModel()
                {
                    Display = item.Display,
                    Width = item.Width,
                    OffsetValue = item.OffsetValue,
                    TagName = item.TagName,
                    AutoMinMax = item.AutoMinMax,
                    Color = item.Color?.Length < 1 ? DefaultColors[index++] : item.Color,
                    Data = getData(item, new Random((int)DateTime.Now.Ticks))

                };
                Task.Delay(100);
                temp.SetMinMaxValue(item.AutoMinMax, item.Min, item.Max);
                listRes.Add(temp);

            }



            var resMain = new MainCanvasModel()
            {
                StartTime = listParam.Min(d => d.Start),
                EndTime = listParam.Max(d => d.End),
                Lines = listRes


            };

            return resMain;
        }


    }



}