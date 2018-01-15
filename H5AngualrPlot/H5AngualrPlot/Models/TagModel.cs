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

        public IEnumerable<TagModel> GetTagList(string tag)
        {

            Random rando = new Random();
            for (int i = 0; i < 5; i++)
            {
                yield return new TagModel()
                {
                    service = "PHD",
                    name = $"{tag}TES00{rando.Next(1, 8)}",
                    text = "测试数据",
                };

            }

        }
    }
}