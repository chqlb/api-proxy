/**
 * 简单代理服务器，用于捕获接口的请求和返回数据
 *
 * @author chqlb
**/ 

var http=require('http');
var https=require('https');
var url=require('url');
var util = require('util');
var colors = require('colors');

var myhost = "user.app.loukou.com";

console.log("proxy started ......");

//创建http服务器
http.createServer(function(req,res){
    //获得请求body
    var body='';
    req.on('data',function(chunk){
            body+=chunk;
    });
    req.on('end',function(){
            //代理请求
            var request_url=req.url;
            var option=url.parse(request_url);
            var httpObj='http:'==option.protocol?http:https;
            req.headers.host=option.host;
            //option.path=option.path?option.path:option.pathname+(option.search?option.search:'');
            req.headers.path=option.path;
            option.method=req.method;
            option.headers=req.headers;

            var responseBody = '';
            httpObj.request(option,function(result){
                //设置header
                for(var key in result.headers){
                    res.setHeader(key,result.headers[key]);
                }
                result.on('data',function(chunk){
                    responseBody += chunk;
                    res.write(chunk);
                });
                result.on('end',function(){
                    // 输出日志，只输出 myhost 的日志
                    if (req.headers.host == myhost) {
                        console.log();
                        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~".red);
                        console.log("request info ".green);
                        console.log("url: " + req.url);
                        console.log("method: " + req.method);
                        console.log("headers: " + util.inspect(req.headers));
                        try {
                            if (body != '') {
                                body = JSON.parse(body)
                            }
                        }
                        catch (e) {
                            console.error(e);
                        }
                        console.log("body: " + util.inspect(body, { depth: null }));

                        console.log("response info ".green);
                        console.log("headers: " + util.inspect(res.headers));
                        try {
                            responseBody = JSON.parse(responseBody);
                        } 
                        catch(e) {
                            console.error(e);
                        }
                        console.log("body: " + util.inspect(responseBody, { depth: null }));
                    }
                    
                    res.end();
                });
            }).on('error',function(error){
                res.end('remote http.request error'+error)}).end(body);

    });
}).listen(8888);
