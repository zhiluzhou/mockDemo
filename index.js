var http = require('http') // Node.js提供了http模块，用于搭建HTTP服务端和客户端
var url = 'http://www.imooc.com/learn/348'; //输入任何网址都可以
var fs = require('fs');
var cheerio = require('cheerio');
const Koa = require('koa')
const path = require('path')
const static = require('koa-static')
var cors = require('koa2-cors');
const app = new Koa()
const staticPath = './static' //静态文件夹
app.use(cors({
    origin: function (ctx) {
        if (ctx.url === '/index') {
            return false;
        }
        return '*';
    }
}))
app.use(static(
    path.join(__dirname, staticPath) ////设置静态文件地址，这里本来想用路由的但是觉得没必要启动。
))
app.use(async (ctx) => {  //在我们的页面输出hello world，这里只是为了演示下koa的入门。我们访问我们的静态资源在地址栏加/index.json
    // ctx.body = 'hello world'
    ctx.body = filterChapters(html)
})
app.listen(3000, () => {  //启动一个3000的端口
    console.log('[demo] static-use-middleware is starting at port 3000')
})







var html = ''
http.get(url, function (res) {  //发送get请求
    
    res.on('data', function (data) {
        html += data  //字符串的拼接
    })
    res.on('end', function () {
        // console.log(html)
        var courseData = filterChapters(html)
        let content = courseData.map((o) => {
            return JSON.stringify(o) // JSON.stringify() 方法用于将 JavaScript 值转换为 JSON 字符串。
        })
        fs.writeFile('./index.json', content, function (err) { //文件路经，写入的内容，回调函数
            if (err) throw new Error('写文件失败' + err);
            console.log("成功写入文件")
        })
    })

}).on('error', function () {
    console.log('获取资源出错！')
})
function filterChapters(html) {
    var $ = cheerio.load(html)
    var chapters = $('.course-wrap')  //在html里寻找我们需要的资源的class
    var courseData = [] // 创建一个数组，用来保存我们的资源
    chapters.each(function (item) {  //遍历我们的html文档
        var chapter = $(this)
        var chapterTitle = chapter.find('h3').text().replace(/\s/g, "")
        var videos = chapter.find('.video').children('li')  //使用childern去获取下个节点
        var chapterData = {
            chapterTitle: chapterTitle,
            videos: []
        }
        videos.each(function (item) {  //遍历视频中的资源，title，id， url
            var video = $(this).find('.J-media-item') //同样的方式找到我们需要的class部分
            var videoTitle = video.text().replace(/\n/g, "").replace(/\s/g, "");
            var id = video.attr('href').split('video/')[1]; //切割我们的href的到我们的id
            var url = `http://www.imooc.com/video/${id}` // es6字符串模板的方式去通过id拿到我们的视频url
            chapterData.videos.push({
                title: videoTitle,
                id: id,
                url: url
            })
        })
        courseData.push(chapterData)
    })
    return courseData //返回我们需要的资源
}



