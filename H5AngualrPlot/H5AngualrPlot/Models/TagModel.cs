using HanaTechHisPlot.HanaTechWCFService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace H5AngualrPlot.Models
{
    public class TagModel
    {
        public string name { get; set; }
        public string text { get; set; }

        public string service { get; set; }
    }

    public class TagMainModel : BaseWcfModel
    {
        static List<string> ListService = new List<string>();
        static string strRTDBType = "";
        static TagMainModel()
        {
          //  strRTDBType = System.Configuration.ConfigurationManager.AppSettings["RTDBType"];
        }
        public TagMainModel()
        {
            if (ListService.Count == 0)
            {

                try
                {
                    ListService = WcfClient.GetRTDBHostList();
                }
                catch (Exception)
                {

                }

            }
        }
        public async Task<IEnumerable<TagModel>> GetTagList(string tag)
        {
            List<TagList> listRes = new List<TagList>();
            try
            {
                foreach (var item in ListService)
                {
                    //标准
                    var list = await Task<List<TagList>>.Factory.FromAsync(WcfClient.BeginGetTagList,
                                 WcfClient.EndGetTagList, tag, item, null);

                    //上海石化
                    //var list = await Task<List<TagList>>.Factory.FromAsync(WcfClient.BeginGetTagList,
                    //               WcfClient.EndGetTagList, string.Format("{0}{1}", item.Replace(strRTDBType, ""), tag), item, null);

                    listRes.AddRange(list);
                }
            }
            catch
            {

            }
            return listRes.Select(d => new TagModel()
            {
                service = d.服务器名称,
                name = d.位号名称,
                text = d.描述,
            });
        }
    }
}