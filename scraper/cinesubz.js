const axios = require("axios")
const nexara = require("@dark-yasiya/nexara")
const cheerio = require("cheerio")
const CREATOR = "Dark Yasiya"

function isValidUrl(url) {
    const httpsRegex = /^https:\/\/[^\s/$.?#].[^\s]*$/;
    return httpsRegex.test(url);
}

function extractLinks(dl2) {
    const regexLink = /dlLink:\s*\["(.*?)"]/g;
    const regexSize = /size:\s*"(.*?)"/g;
    const regexQuality = /resolution:\s*"(.*?)"/g;

    const links = [...dl2.matchAll(regexLink)].map(match => match[1]);
    const sizes = [...dl2.matchAll(regexSize)].map(match => match[1]);
    const qualities = [...dl2.matchAll(regexQuality)].map(match => match[1]);

    return links.map((link, index) => ({
        link: link.split('"')[0],
        size: sizes[index]?.split('"')[0] || "",
        quality: qualities[index]?.split('"')[0] || "",
    }));
}


async function ApiReq(data, url) {
    try {
        const res = await axios.post(url, data, {
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "PostmanRuntime/7.42.2"
            }
        });
        return res?.data;
    } catch (error) {
        console.error('Error making the request:', error);
    }
}


async function replaceUrl(query) {
    try {
        if (!query) throw new Error("Query is empty!");

        let link = query;

        const url1 = ["https://google.com/server11/1:/", "https://google.com/server12/1:/", "https://google.com/server13/1:/"];
        const url2 = ["https://google.com/server21/1:/", "https://google.com/server22/1:/", "https://google.com/server23/1:/"];
        const url3 = ["https://google.com/server3/1:/"];
        const url4 = ["https://google.com/server4/1:/"];
        const url5 = ["https://google.com/server5/1:/"];

        if (url1.some(u => query.includes(u))) {
            link = query.replace(url1.find(u => query.includes(u)), 'https://drive1.cscloud12.online/server1/');
        } else if (url2.some(u => query.includes(u))) {
            link = query.replace(url2.find(u => query.includes(u)), 'https://drive1.cscloud12.online/server2/');
        } else if (url3.some(u => query.includes(u))) {
            link = query.replace(url3.find(u => query.includes(u)), 'https://drive1.cscloud12.online/server3/');
        } else if (url4.some(u => query.includes(u))) {
            link = query.replace(url4.find(u => query.includes(u)), 'https://drive1.cscloud12.online/server4/');
        } else if (url5.some(u => query.includes(u))) {
            link = query.replace(url5.find(u => query.includes(u)), 'https://drive1.cscloud12.online/server5/');
        }

        if (link.includes(".mp4?bot=cscloud2bot&code=")) link = link.replace(".mp4?bot=cscloud2bot&code=", "?ext=mp4&bot=cscloud2bot&code=");
        if (link.includes(".mp4")) link = link.replace(".mp4", "?ext=mp4");
        if (link.includes(".mkv?bot=cscloud2bot&code=")) link = link.replace(".mkv?bot=cscloud2bot&code=", "?ext=mkv&bot=cscloud2bot&code=");
        if (link.includes(".mkv")) link = link.replace(".mkv", "?ext=mkv");
        if (link.includes(".zip")) link = link.replace(".zip", "?ext=zip");

        return link;
    } catch (error) {
        console.error({ status: false, error: error.message });
        return query; // Return the original query if there is an error
    }
}


//====================================================================

module.exports = class Cinesubz {
    constructor() {}

async search(query) {
    try {
	    
        if (!query) throw new Error("Query cannot be empty!");

        const response = await fetch("https://cinesubz.co/?s=" + encodeURIComponent(query));
        const html = await response.text();
        const $ = cheerio.load(html);

        let movies = [];
        $("#contenedor > div.module > div.content.rigth.csearch > div > div > article").each((i, el) => {
            const imdb = $(el).find("div.details > div.meta > span.rating:nth-child(1)").text().toUpperCase().replace("IMDB ", "");
            const year = $(el).find("div.details > div.meta > span.year").text();
            const title = $(el).find("div.details > div.title > a").text();
            const link = $(el).find("div.details > div.title > a").attr("href");
            const image = $(el).find("div.image > div > a > img").attr("src");
            const type = $(el).find("div.image > div > a > span").text().trim();
            const description = $(el).find("div.details > div.contenido > p").text().trim();
            movies.push({ title, imdb, year, link, image, type, description });
        });

        if (movies.length === 0) {
            const apiResponse = await fetch(`https://cinesubz.co/wp-json/dooplay/search/?keyword=${encodeURIComponent(query)}&nonce=03dfb5c5ca`);
            const jsonData = await apiResponse.json();

            const jsonArray = Object.values(jsonData);
            let type = "TV";

            jsonArray.forEach(el => {
                const title = el.title;
                const imdb = el.extra.imdb;
                const year = el.extra.date;
                const link = el.url;
                const image = el.img;
                if (link.includes("movies")) type = "Movie";
                const description = "";
                movies.push({ title, imdb, year, link, image, type, description });
            });
        }

        const mvList = movies.filter(i => i.type === "Movie");
        const tvList = movies.filter(i => i.type === "TV");

        return { data: movies, movies: mvList, tvshows: tvList };
    } catch (error) {
        console.error({
            status: false,
            error: error.message,
        });
        return null; // Return null if error occurs
    }
}


//================================================

async movieDl(query) {
    try {
	    
if (!isValidUrl(query)) {
    console.log("Invalid URL. Please provide a valid HTTPS URL.");
    return;
}


	const url = await axios.get(query)
        const $ = await cheerio.load(url.data);

        const cast = [];
        const images = [];

        $("#cast > div.persons:nth-child(4) > div").each((i, el) => {
            const name = $(el).find("meta").attr("content");
            const link = $(el).find("div > a").attr("href");
            cast.push({name, link})
        })

        
        $("div.g-item").each((i, el) => {
            const link = $(el).find("a").attr("href")
            const imageUrl = link.replace("\n", "")
            images.push(imageUrl)
        })
        

        const title = $("#single > div.content.right > div.sheader > div.data > h1").text();
        const date = $("#single > div.content.right > div.sheader > div.data > div.extra > span.date").text();
        const categorydata = $("#single > div.content.right > div.sheader > div.data > div.sgeneros > a").text().trim();
        const category = categorydata.match(/([A-Z][a-z]+|\d+\+?)/g);
        const country = $("#single > div.content.right > div.sheader > div.data > div.extra > span.country").text();
        const duration = $("#single > div.content.right > div.sheader > div.data > div.extra > span.runtime").text();
        const movie_link = $("#single > div.content.right > div.dt-breadcrumb.breadcrumb_bottom > ol > li > li > a").attr("href");
        const imdbRate = $("#repimdb > strong").text();
        const imdbv = $("#repimdb").text().trim()
        const imdbv2 = imdbv.replace(imdbRate+' ', '')
        const imdbVoteCount = imdbv2.replace(' votes', '')
        const mainImage = $("#single > div.content.right > div.sheader > div.poster > img").attr("src");
        const image = $("#info > div > span > p > img").attr("src")
        const image2 = $("div.g-item > a > img").attr("src")
        const image3 = $("#info > div > span > div:nth-child(1) > p:nth-child(1) > img").attr("src")
        const director = $("#cast > div > div > meta").attr("content");
        const subtitle_author = $("#info > div:nth-child(3) > center > span").text().trim();
        const desc = $("p.empty").text().trim();
        const cineVoteCount = $("span.dt_rating_vgs").text();


        const downLink1 = [];
        $("div.links_table > div.fix-table > table > tbody > tr").each((i, el) => {
            const quality = $(el).find("td > a > strong").text()
            const size = $(el).find("td:nth-child(2)").text()
            const link = $(el).find("td > a").attr("href")
            downLink1.push({quality, size, link})
        })

        const downlink2= [];
        $("#info > div:nth-child(2) > span > center:nth-child(6) > a").each((i, el) => {
            const quality = $(el).text().trim();
            const size = ''
            const link = $(el).attr("ping");
            downlink2.push({ quality, size, link })
        })

        const dl2 = $("#info > div > span > div > script").text();

        const downLink3 = extractLinks(dl2);
        

if(downLink1.length > 0) {
        
        const detailedDownlinkPromises = downLink1.map(async (item) => {
            try {
                const detailPage = await axios.get(item.link);
                const $detail = cheerio.load(detailPage.data);
                const link = $detail("#link").attr("href")?.trim(); 
                return { ...item, link };
            } catch (error) {
                console.error(`Error fetching details for link ${item.link}: ${error.message}`);
                return item;
            }
        });

        const detailedDownlink = await Promise.all(detailedDownlinkPromises);

        const result = {
            data: {
                title: title,
                date: date,
                country: country,
                duration: duration,
                category: category,
                movie_link: query,
                mainImage: mainImage || "",
                image: image || image3 || image2 || "",
                imdbRate: imdbRate,
                imdbVoteCount: imdbVoteCount,
                cineVoteCount: cineVoteCount,
                subtitle_author: subtitle_author,
                director: director,
                desc: desc,
                images: images,
                cast: cast,
                dl_links: detailedDownlink,

            }
        };

        // console.dir(result, { depth: null, colors: true });
        return result
    

} else if(downlink2.length > 0){


    const result = {
        data: {
            title: title,
            date: date,
            country: country,
            duration: duration,
            category: category,
            movie_link: query,
            mainImage: mainImage || "",
            image: image || image3 || image2 || "",
            imdbRate: imdbRate,
            imdbVoteCount: imdbVoteCount,
            cineVoteCount: cineVoteCount,
            subtitle_author: subtitle_author,
            director: director,
            desc: desc,
            images: images,
            cast: cast,
            dl_links: downlink2,

        }
    };

    // console.dir(result, { depth: null, colors: true });
    return result

} else if(downLink3.length > 0){
    

    const result = {
            data: {
                title: title,
                date: date,
                country: country,
                duration: duration,
                category: category,
                movie_link: query,
                mainImage: mainImage || "",
                image: image || image3 || image2 || "",
                imdbRate: imdbRate,
                imdbVoteCount: imdbVoteCount,
                cineVoteCount: cineVoteCount,
                subtitle_author: subtitle_author,
                director: director,
                desc: desc,
                images: images,
                cast: cast,
                dl_links: downLink3
            }}

        // console.dir(result, { depth: null, colors: true });
        return result

    } else {

        const hideUrl = $("#info > div:nth-child(2) > span > h1 > a").attr("href");
        const extraUrl = hideUrl.replace("https://test.warunaenterprises-xyz.workers.dev/", "https://cinesubz.co/episodes/")
        const getUrl = await axios.get(extraUrl);
        const $$ = cheerio.load(getUrl.data)

        const downlinks = [];
        $$("div.links_table > div.fix-table > table > tbody > tr").each((i, el) => {
            const quality = $$(el).find("td > a > strong").text()
            const size = $$(el).find("td:nth-child(2)").text()
            const link = $$(el).find("td > a").attr("href")
            downlinks.push({quality, size, link})
        })

        const detailedDownlinkPromises = downlinks.map(async (item) => {
            try {
                const detailPage = await axios.get(item.link);
                const $detail = cheerio.load(detailPage.data);
                const link = $detail("#link").attr("href")?.trim(); 
                return { ...item, link };
            } catch (error) {
                console.error(`Error fetching details for link ${item.link}: ${error.message}`);
                return item;
            }
        });

        const detailedDownlink = await Promise.all(detailedDownlinkPromises);
        
        const result = {
            data: {
                title: title,
                date: date,
                country: country,
                duration: duration,
                category: category,
                movie_link: query,
                mainImage: mainImage || "",
                image: image || image3 || image2 || "",
                imdbRate: imdbRate,
                imdbVoteCount: imdbVoteCount,
                cineVoteCount: cineVoteCount,
                subtitle_author: subtitle_author,
                director: director,
                desc: desc,
                images: images,
                cast: cast,
                dl_links: detailedDownlink
            }}

        // console.dir(result, { depth: null, colors: true });
        return result

    }
    } catch (error) {
        const errors = {
            status: false,
            creator: CREATOR,
            error: error.message
        };
        console.log(errors);
    }
}

//================================================

async tvshow(query) {
    try {
	    
if (!isValidUrl(query)) {
    console.log("Invalid URL. Please provide a valid HTTPS URL.");
    return;
}


        const $ = await nexara(query);

        const cast = [];

        $("#cast > div.persons:nth-child(4) > div").each((i, el) => {
            const name = $(el).find("meta").attr("content");
            const link = $(el).find("div > a").attr("href");
            cast.push({name, link})
        })
    

        const title = $("#single > div.content.right > div.sheader > div.data > h1").text();
        const first_air_date = $("#single > div.content.right > div.sheader > div.data > div.extra > span.date").text();
        const last_air_date = $("#info > div:nth-child(6) > span").text();
        const categorydata = $("#single > div.content.right > div.sheader > div.data > div.sgeneros > a").text().trim();
        const category = categorydata.match(/([A-Z][a-z]+|\d+\+?)/g);
        const episode_count = $("#info > div:nth-child(9) > span").text();
        const duration = $("#single > div.content.right > div.sheader > div.data > div.extra > span.runtime").text();
        const movie_link = $("#single > div.content.right > div.dt-breadcrumb.breadcrumb_bottom > ol > li > li > a").attr("href");
        const tmdbRate = $("#repimdb > strong").text();
        const tmdbv = $("#repimdb").text().trim()
        const tmdbv2 = tmdbv.replace(tmdbRate+' ', '')
        const tmdbVoteCount = tmdbv2.replace(' votes', '')
        const mainImage = $("#single > div.content.right > div.sheader > div.poster > img").attr("src");
        const image = $("#info > div > span > p > img").attr("src")
        const director = $("#cast > div > div > meta").attr("content");


        const episodes = [];
        $("#seasons > div > div.se-a > ul > li").each((i, el) => {
            const number = $(el).find("div.numerando").text()
            const name = $(el).find("div.episodiotitle > a").text()
            const link = $(el).find("div.episodiotitle > a").attr("href")
            const date = $(el).find("div.episodiotitle > span").text()
            const image = $(el).find("div > img").attr("src")
            episodes.push({number, name, date, image, link})
        })
    

        const result = {
            data: {
                title: title,
                first_air_date: first_air_date,
                last_air_date: last_air_date,
                category: category,
                movie_link: query,
                mainImage: mainImage || "",
                image: image || "",
                tmdbRate: tmdbRate,
                tmdbVoteCount: tmdbVoteCount,
                director: director,
                cast: cast,
                episode_count: episodes.length,
                episodes: episodes

            }
        };

        // console.dir(result, { depth: null, colors: true });
        return result

    } catch (error) {
        const errors = {
            status: false,
            creator: CREATOR,
            error: error.message
        };
        console.log(errors);
    }
}

//=================================================

async episodeDl(query) {
    try {
        const httpsRegex = /^https:\/\/[^\s/$.?#].[^\s]*$/;
        if (!query || !httpsRegex.test(query)) {
            console.log("Invalid URL. Please provide a valid HTTPS URL.");
            console.log("මොකක්ද මනුස්සයෝ කරන්නෙ cinesubz.co EPISODE URL එකක් දාපන්");
            return;
        }

        const { data } = await axios.get(query);
        const $ = cheerio.load(data);

        const images = [];
        $("div.g-item a").each((i, el) => {
            const imageUrl = $(el).attr("href")?.trim();
            if (imageUrl) images.push(imageUrl);
        });

        const title = $("#info > h1").text().replace(/WEBRip.*Download/g, "").trim();
        const episode_name = $("#info > div > h3").text().trim();
        const date = $("#info > span").text().trim();
        const duration = $(".extra > span.runtime").text().trim();
        const movie_link = $("#single .dt-breadcrumb.breadcrumb_bottom ol li a").attr("href");
        const director = $("#cast > div > div > meta").attr("content");

        const downlink = [];
        $("div.links_table > div.fix-table > table > tbody > tr").each((i, el) => {
            const quality = $(el).find("td > a > strong").text().trim();
            const size = $(el).find("td:nth-child(2)").text().trim();
            const link = $(el).find("td > a").attr("href");
                downlink.push({ quality, size, link });
        });

        const down_link = [];
        $("#info > center > a").each((i, el) => {
            const link = $(el).attr("href")?.trim();
            const quality = $(el).text().trim();
            down_link.push({ quality, size: null, link });
        });

        if (downlink.length > 0) {

            const detailedDownlink = await Promise.all(
                downlink.map(async (item) => {
                    try {
                        const { data } = await axios.get(item.link);
                        const $detail = cheerio.load(data);
                        const directLink = $detail("#link").attr("href")?.trim();
        
                        // Remove Telegram links and return only valid links
                        if (directLink && !directLink.includes("https://t.me/")) {
                            return { ...item, link: directLink };
                        }
                    } catch (error) {
                        console.error(`Error fetching details for link ${item.link}: ${error.message}`);
                        return item;
                    }
                })
            );

            const filteredLinks = detailedDownlink.filter(item => item && item.link);

            return {
                data: {
                    title,
                    episode_name,
                    date,
                    images,
                    movie_link: query,
                    dl_links: filteredLinks
                }
            };
        } else if (down_link.length > 0) {
            return {
                data: {
                    title,
                    episode_name,
                    date,
                    images,
                    movie_link: query,
                    dl_links: down_link
                }
            };
        }

    } catch (error) {
        console.error(`Error fetching episode details: ${error.message}`);

        try {
            const { data } = await axios.get(query);
            const $ = cheerio.load(data);

            const images = [];
            $("div.g-item a").each((i, el) => {
                const imageUrl = $(el).attr("href")?.trim();
                if (imageUrl) images.push(imageUrl);
            });

            const title = $("#info > h1").text().replace(/WEBRip.*Download/g, "").trim();
            const episode_name = $("#info > div > h3").text().trim();
            const date = $("#info > span").text().trim();

            const dl2 = $("#info > div").text();
            let link = dl2.match(/dlLink: \["(.*?)"\]/)?.[1] || "";
            let size = dl2.match(/size: "(.*?)"/)?.[1] || "";
            let quality = dl2.match(/resolution: "(.*?)"/)?.[1] || "";

            return {
                data: {
                    title,
                    episode_name,
                    date,
                    images,
                    movie_link: query,
                    dl_links: [{ quality, size, link }]
                }
            };
        } catch (err) {
            console.error(`Error fetching backup data: ${err.message}`);
            return { error: "Failed to fetch episode details." };
        }
    }
}


async download(query) {
    
    try {
	    
        const link = await replaceUrl(query);
	const $ = cheerio.load(await (await fetch(link)).text());
	const title = $("#box > div.download-section > p:nth-child(2) > span").text().trim();

        const requests = {
            gdrive: ApiReq({ gdrive: true }, link),
            gdrive2: ApiReq({ gdrive: true, second: true }, link),
            direct: ApiReq({ direct: true }, link),
            mega: ApiReq({ "mega": true }, link),
            pixel: ApiReq({ pix: true, nc: true }, link),
            pixel2: ApiReq({ pix: true }, link),
        };

        const responses = await Promise.allSettled(Object.entries(requests).map(([key, promise]) => promise.then(data => ({ key, data }))));

        let result = { title: title, gdrive: null, gdrive2: null, direct: null, mega: null, pixel: null, pixel2: null, mimetype: null };
        
        responses.forEach(({ status, value }) => {
            if (status === "fulfilled" && value.data) {
                result[value.key] = value?.data?.url || value?.data?.mega || null;
                if (value.key === "gdrive" && value.data.mime) result.mimetype = value.data.mime;
            }
        });
        
        return { result: result };
	    
} catch (error) {
	    
    return { result: { gdrive: null, gdrive2: null, direct: null, mega: null, pixel: null, pixel2: null, mimetype: null }};
	    
    }
  }
}
