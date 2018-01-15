using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using H5AngualrPlot.Models;

namespace H5AngualrPlot.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
        [HttpPost]

        public JsonResult List([FromBody]IEnumerable<QueryModel> querys)
        {

            var canvasModel = new MainCanvasModel();
            var res = canvasModel.InitData(querys.ToList());

            return Json(res);
        }

        [HttpPost]
        public JsonResult Grid([FromBody]IEnumerable<QueryModel> querys)
        {
            var gridModel = new GridModel();

            var res = gridModel.LoadGrids(querys.ToList());
            return Json(res);


        }

        [HttpPost]
        public JsonResult Search(string id)
        {
            var tagModel = new TagMainModel();
            var list = tagModel.GetTagList(id);
            return Json(list);
        }
        public IActionResult About()
        {
            ViewData["Message"] = "Your application description page.";

            return View();
        }

        public IActionResult Contact()
        {
            ViewData["Message"] = "Your contact page.";

            return View();
        }

        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
