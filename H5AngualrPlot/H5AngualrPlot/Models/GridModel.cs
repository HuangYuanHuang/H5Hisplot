using HanaTechHisPlot.HanaTechWCFService;
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
        WCFAspenClient wcfAspen;


        protected WCFAspenClient WcfClient
        {
            get
            {
                if (wcfAspen == null || wcfAspen.State == System.ServiceModel.CommunicationState.Closed || wcfAspen.State == System.ServiceModel.CommunicationState.Closing || wcfAspen.State == System.ServiceModel.CommunicationState.Faulted)
                {
                    wcfAspen = new WCFAspenClient();


                }

                return wcfAspen;
            }
        }

        public void Close()
        {
            if (WcfClient != null)
            {
                WcfClient.Close();
            }
        }


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
        public async Task<List<GridModel>> LoadGrids(List<QueryModel> query)
        {

            List<TagProperty> list = null;
            try
            {
                list = await Task<List<TagProperty>>.Factory.FromAsync(WcfClient.BeginFetchDataByTagPropertyList,
                                 WcfClient.EndFetchDataByTagPropertyList, query.Select(d => d.TagName).ToList(), null);

            }
            catch (Exception ex)
            {

                throw new Exception($"WCF获取数据ERROR:{ex.Message}");
            }
            int index = 0;
            List<GridModel> listRes = new List<GridModel>();
            foreach (var item in list)
            {
                var node = new GridModel()
                {
                    Color = query[index].Color?.Length<1 ? DefaultColors[index]: query[index].Color,
                    TagName = query[index].TagName,
                    Text = item.描述 ?? "",
                    Unit = item.ENG_UNITS ?? "",
                    Status = item.DC_STATUS ?? "",
                    Width = query[index].Width,
                    Max = query[index].Max,
                    Min = query[index].Min,
                    TimeOffset = query[index].OffsetValue,
                    MaxScale = query[index].MaxScale >= 99999 ? Convert.ToDouble(item.GRAPH_MAXIMUM?.Length < 1 ? "100" : item.GRAPH_MAXIMUM) : query[index].MaxScale,
                    MinScale = query[index].MinScale <= -99999 ? Convert.ToDouble(item.GRAPH_MINIMUM?.Length < 1 ? "0" : item.GRAPH_MINIMUM) : query[index].MinScale
                };
                listRes.Add(node);
                index++;
            }
            return listRes;
        }

    }
}