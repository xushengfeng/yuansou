import "../css/css.css";

var url_search = new URLSearchParams(decodeURIComponent(location.search));

let text = url_search.get("w");

type e_type = "baidu" | "bing" | "google";
let e: e_type[] = url_search.get("e") ? (url_search.get("e").split(",") as e_type[]) : ["baidu", "bing", "google"];

let proxy = url_search.get("proxy") || "";
if (proxy && proxy[proxy.length - 1] != "/") proxy = proxy + "/";

let result = [];

function search(text: string, e: e_type[]) {
    for (let i of e) {
        switch (i) {
            case "baidu":
                baidu(text);
                break;
            case "bing":
                bing(text);
                break;
            case "google":
                google(text);
                break;
            default:
                break;
        }
    }
}

function baidu(text: string) {
    fetch(`${proxy}https://www.baidu.com/s?ie=UTF-8&wd=${encodeURIComponent(text)}`)
        .then((v) => v.text())
        .then(async (v) => {
            let tmp_div = document.createElement("div");
            tmp_div.innerHTML = v;
            console.log(tmp_div);
            let sl = tmp_div.querySelectorAll("h3");
            let n = 0;
            for await (let i of sl) {
                let p = i.parentElement;
                let title = i.innerText;
                let body = p.innerText.replace(title, "").trim();
                let href = i.querySelector("a").href;
                try {
                    href = (await fetch(href)).url;
                } catch (error) {}
                let t = true;
                for (let i of result) {
                    if (i?.href == href) {
                        t = false;
                        break;
                    }
                }
                if (t) {
                    result[n * 3] = { title, body, href };
                    n++;
                }
            }
            r();
        });
}

function bing(text: string) {
    fetch(`${proxy}https://cn.bing.com/search?q=${encodeURIComponent(text)}`)
        .then((v) => v.text())
        .then(async (v) => {
            let tmp_div = document.createElement("div");
            tmp_div.innerHTML = v;
            console.log(tmp_div);
            let sl = tmp_div.querySelectorAll("li.b_algo");
            let n = 0;
            for await (let i of sl) {
                let title = (<HTMLElement>i.querySelector(".b_title"))?.innerText;
                let body = (<HTMLElement>i.querySelector(".b_attribution").nextElementSibling)?.innerText;
                let href = (<HTMLAnchorElement>i.querySelector(".b_title > a"))?.href;
                let t = true;
                for (let i of result) {
                    if (i?.href == href) {
                        t = false;
                        break;
                    }
                }
                if (t) {
                    result[n * 3 + 2] = { title, body, href };
                    n++;
                }
            }
            r();
        });
}

function google(text: string) {
    fetch(`${proxy}https://www.google.com/search?q=${encodeURIComponent(text)}`)
        .then((v) => v.text())
        .then(async (v) => {
            let tmp_div = document.createElement("div");
            tmp_div.innerHTML = v;
            console.log(tmp_div);
            let sl = tmp_div.querySelectorAll("h3");
            let n = 0;
            for await (let i of sl) {
                let title = i.innerText;
                let body = (<HTMLElement>i.parentElement.parentElement.parentElement.nextElementSibling).innerText;
                let href = (<HTMLAnchorElement>i.parentElement).href;
                let t = true;
                for (let i of result) {
                    if (i?.href == href) {
                        t = false;
                        break;
                    }
                }
                if (t) {
                    result[n * 3 + 2] = { title, body, href };
                    n++;
                }
            }
        });
}

function r() {
    console.log(result);
    for (const i of result) {
        if (!i) continue;
        let div = `<div>
            <h2><a href="${i.href}" target="_blank">${i.title}</a></h2><p>${i.body}</p></div>`;
        document.getElementById("result").insertAdjacentHTML("beforeend", div);
    }
}

if (text) {
    search(text, e);
}
