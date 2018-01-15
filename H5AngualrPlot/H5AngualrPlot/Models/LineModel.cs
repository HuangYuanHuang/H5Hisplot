using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using HanaTechHisPlot.HanaTechWCFService;
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




        public async Task<MainCanvasModel> InitData(List<QueryModel> listParam)
        {
            //判断是否url参数同位号比对 时间参数偏移
            //bool isSameCompare = false;
            //if (listParam.GroupBy(d => d.TagName).Count() > 0)
            //{
            //    isSameCompare = true;
            //}

            List<QueryParam> query = new List<QueryParam>();

            foreach (var item in listParam)
            {
                var temp = new QueryParam()
                {
                    位号名称 = item.TagName,

                };
                if (item.Start?.Length > 5)
                {
                    temp.开始日期 = DateTime.Parse(item.Start).AddSeconds(item.OffsetValue).ToString("yyyy-MM-dd HH:mm:ss");
                    temp.结束日期 = DateTime.Parse(item.End).AddSeconds(item.OffsetValue).ToString("yyyy-MM-dd HH:mm:ss");

                }
                else
                {
                    temp.开始日期 = DateTime.Now.AddMinutes(-120).AddSeconds(item.OffsetValue).ToString("yyyy-MM-dd HH:mm:ss");
                    temp.结束日期 = DateTime.Now.AddSeconds(item.OffsetValue).ToString("yyyy-MM-dd HH:mm:ss");
                }
                item.Start = temp.开始日期;
                item.End = temp.结束日期;
                query.Add(temp);
            }

            Dictionary<string, List<TagValueList>> list = new Dictionary<string, List<TagValueList>>(); ;

            try
            {
                list = await Task<Dictionary<string, List<TagValueList>>>.Factory.FromAsync(WcfClient.BeginGetTagProcessDataListByMap,
                                   WcfClient.EndGetTagProcessDataListByMap, query, null);

            }
            catch (Exception ex)
            {
                throw new Exception($"WCF获取数据ERROR:{ex.Message}");
            }

            List<LineModel> listRes = new List<LineModel>();
            int index = 0;
            foreach (var item in listParam)
            {
                var key = item.ToString();
                if (!list.ContainsKey(key))
                {
                    continue;
                }
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
                    Data = list[key].Select(d => new LineDataNode() { Time = DateTime.Parse(d.位号值时间).AddSeconds(-item.OffsetValue).ToString("yyyy-MM-dd HH:mm:ss"), ValueStr = d.位号值, Confidence = d.可信度 }).Where(d => d.ValueStr != "非数字").ToList()

                };
                temp.SetMinMaxValue(item.AutoMinMax, item.Min, item.Max);
                listRes.Add(temp);

            }

            index = 0;
            foreach (var item in query)
            {
                //item.开始日期 = DateTime.Parse(item.开始日期).AddSeconds(isSameCompare ? 0 : -listParam[index].OffsetValue).ToString();
                item.开始日期 = DateTime.Parse(item.开始日期).AddSeconds(-listParam[index].OffsetValue).ToString();
                item.结束日期 = DateTime.Parse(item.结束日期).AddSeconds(-listParam[index++].OffsetValue).ToString();
            }
            var resMain = new MainCanvasModel()
            {
                StartTime = query.Min(d => d.开始日期),
                EndTime = query.Max(d => d.结束日期),
                Lines = listRes


            };

            return resMain;
        }


    }



}