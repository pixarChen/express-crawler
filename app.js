const express = require('express');
const superagent = require('superagent');
const cheerio = require('cheerio');
const fs = require('fs');

let app = express();

app.get('/',function(req, res, next) {
	superagent
		.get('https://www.rails365.net/playlists/nodejs-express-shi-xian-duo-yong-hu-bo-ke-xi-tong')
		.end((err,sres)=>{
			if (err) { return next(err);}
			// console.dir(sres);
			let $ = cheerio.load(sres.text);
			let urls = [];
			// console.dir($.html());
			$('.video-box .title .real-ray').each(function(index, element) {
				urls.push(element.attribs.href);
				let content = fs.readFileSync('urls.txt', 'utf-8');
				fs.writeFileSync('urls.txt', content+'\n'+element.attribs.href, 'utf-8');
			});
			res.json(urls);
		})
})

//下载视频
app.get('/download',function(req, res, next) {
	let dirPath = './videos';
	if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }

	let urls = fs.readFileSync('urls.txt', 'utf-8');
	let base_url = 'https://www.rails365.net'
	urls = urls.split('\n');
	// console.log(urls);
	// res.send(urls);
	urls.forEach(function(url, index) {
		url = base_url + url;
		// console.log(url);
		superagent
			.get(url)
			.end((err, sres) => {
				if (err) {
					return next(err);
				}

				let $ = cheerio.load(sres.text);

				// let video_url = sres.text.split('url: "')[1];
				// 	video_url = video_url.split('.mp4')[0];
				// 	video_url = video_url+'.mp4';

				if (index == 0 || index == 1 || index == 2) {
					let video_url = sres.text.split('url: "')[1];
					video_url = video_url.split('.mp4')[0]+'.mp4';
					// console.log(video_url);

					try{
						var writeStream = fs.createWriteStream('./videos/'+index+'.mp4');
						    writeStream.on('close', function() {
						        console.log(index+'.mp4');
						    })

						let req_result = superagent.get(video_url);
						req_result.pipe(writeStream);
					} catch(err) {
						console.dir(err);	
					}
				}
			});
		res.send('ok');
	});
})

app.listen('3000',function() {
	console.log('listenling at port 3000');
})