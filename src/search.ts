import "../css/css.css";

var url_search = new URLSearchParams(decodeURIComponent(location.search));

let text = url_search.get("w");

type e_type = "baidu" | "bing" | "google";
let e: e_type[] = url_search.get("e") ? (url_search.get("e").split(",") as e_type[]) : ["baidu", "bing", "google"];

let proxy = url_search.get("proxy") || "";
if (proxy && proxy[proxy.length - 1] != "/") proxy = proxy + "/";

let result: [e_r[], e_r[], e_r[]] = [[], [], []];

function search(text: string, e: e_type[]) {
    document.body.classList.add("show_result");
    e.forEach((i, n) => {
        switch (i) {
            case "baidu":
                baidu(text).then((l) => {
                    add_r(l, n);
                    r();
                });
                break;
            case "bing":
                bing(text).then((l) => {
                    add_r(l, n);
                    r();
                });
                break;
            case "google":
                google(text).then((l) => {
                    add_r(l, n);
                    r();
                });
                break;
            default:
                break;
        }
    });
    function add_r(l: e_r[], n: number) {
        for (let i of l) {
            result[n].push(i);
        }
    }
}

function page(n: number, e: e_type) {
    switch (e) {
        case "baidu":
            return `&pn=${n}0`;
        case "bing":
            let num = 0;
            if (n == 1) {
                num == 1;
            } else {
                num = (n - 2) * 10 + 6;
            }
            return `&first=${num}`;
    }
}

var page_n = 1;

type e_r = { title: string; body: string; href: string };
type e_f = (l: e_r[]) => void;

function baidu(text: string) {
    return new Promise((re: e_f) => {
        fetch(`${proxy}https://www.baidu.com/s?ie=UTF-8&wd=${encodeURIComponent(text)}${page(page_n, "baidu")}`)
            .then((v) => v.text())
            .then(async (v) => {
                let tmp_div = document.createElement("div");
                tmp_div.innerHTML = v;
                console.log(tmp_div);
                let sl = tmp_div.querySelectorAll("h3");
                let l = [];
                for await (let i of sl) {
                    let p = i.parentElement;
                    let title = i.innerText;
                    let body = p.innerText.replace(title, "").trim();
                    let href = i.querySelector("a").href;
                    try {
                        href = (await fetch(href)).url;
                    } catch (error) {}
                    l.push({ title, body, href });
                }
                re(l);
            });
    });
}

function bing(text: string) {
    return new Promise((re: e_f) => {
        fetch(`${proxy}https://cn.bing.com/search?q=${encodeURIComponent(text)}${page(page_n, "bing")}`)
            .then((v) => v.text())
            .then(async (v) => {
                let tmp_div = document.createElement("div");
                tmp_div.innerHTML = v;
                console.log(tmp_div);
                let sl = tmp_div.querySelectorAll("li.b_algo");
                let l = [];
                for await (let i of sl) {
                    let title = (<HTMLElement>i.querySelector(".b_title"))?.innerText;
                    let body = (<HTMLElement>i.querySelector(".b_attribution").nextElementSibling)?.innerText;
                    let href = (<HTMLAnchorElement>i.querySelector(".b_title > a"))?.href;
                    l.push({ title, body, href });
                }
                re(l);
            });
    });
}

function google(text: string) {
    return new Promise((re: e_f) => {
        fetch(`${proxy}https://www.google.com/search?q=${encodeURIComponent(text)}${page(page_n, "google")}`)
            .then((v) => v.text())
            .then(async (v) => {
                let tmp_div = document.createElement("div");
                tmp_div.innerHTML = v;
                console.log(tmp_div);
                let sl = tmp_div.querySelectorAll("h3");
                let l = [];
                for await (let i of sl) {
                    let title = i.innerText;
                    let body = (<HTMLElement>i.parentElement.parentElement.parentElement.nextElementSibling).innerText;
                    let href = (<HTMLAnchorElement>i.parentElement).href;
                    l.push({ title, body, href });
                }
                re(l);
            });
    });
}

function r() {
    console.log(result);
    let r: e_r[] = [];
    for (let i in result) {
        for (let j in result[i]) {
            r[Number(j) * 3 + Number(i)] = result[i][j];
        }
    }
    for (const i of r) {
        if (!i) continue;
        let div = document.createElement("div"),
            h2 = document.createElement("h2"),
            a = document.createElement("a"),
            p = document.createElement("p");
        if (document.querySelector(`a[href="${i.href}"]`)) {
        } else {
            div.append(h2, p);
            h2.append(a);
            a.href = i.href;
            a.target = "_blank";
            a.innerText = i.title;
            p.innerText = i.body;
            document.getElementById("result").append(div);
        }
    }
}

const search_el = document.getElementById("search") as HTMLInputElement;

if (text) {
    search_el.value = text;
    search(text, e);
}

search_el.onchange = () => {
    result = [[], [], []];
    search(search_el.value, e);
};
