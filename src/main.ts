import "./style.css";
import { uniqBy } from "remeda";
import Controller from "./controller";
import "./proxy";

(async () => {
  // @ts-ignore
  function getCookie(key: string): string | null {
    const cookies = document.cookie;
    const cookiesArray = cookies.split("; ");

    let token = null;
    cookiesArray.forEach((cookie) => {
      const [name, value] = cookie.split("=");
      if (name === key) {
        token = value;
      }
    });

    return token;
  }

  const $ = <T extends HTMLElement = HTMLElement>(
    s: string,
    element: ParentNode = document
  ) => element.querySelector(s) as T;

  const $$ = <T extends HTMLElement = HTMLElement>(
    s: string,
    element: ParentNode = document
  ) => Array.from(element.querySelectorAll(s)) as T[];

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  function getParser() {
    let lastId = -1;

    return () => {
      const messages = $$(".flow-item").map((item) => {
        const id = Number($(".box-id", item).innerText.slice(1).trim());
        const content = $(".box-content", item).innerText;
        return [id, content] satisfies [number, string];
      });

      const newMessages = messages.filter(([id]) => id > lastId);
      lastId = messages[0][0];
      return newMessages;
    };
  }

  async function search(text: string) {
    const input = $<HTMLInputElement>("input.control-search");
    if (!input) return;
    input.value = text;
    input.dispatchEvent(new Event("input"));

    await sleep(1000);

    const searchBtn = $(".search-btn > button");
    console.log("CLICK");
    searchBtn.click();

    return new Promise<void>((r) => {
      const target = $(".flow-chunk");
      const observer = new MutationObserver((mutations, observer) => {
        const messages = $("div", target);
        console.debug(mutations, observer);
        if (messages) {
          observer.disconnect();
          r();
        }
      });
      observer.observe(target, { childList: true });
    });
  }

  const keywords = ["kml", "qdb", "健身房"];
  const parsers = keywords.map((_) => getParser());

  // 对每个 keyword，搜索然后使用对应的 parsers 来解析
  async function batchSearch() {
    const results = [];
    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      await search(keyword);
      const parser = parsers[i];
      const messages = parser();
      results.push(...messages);
      // await sleep(1000);
    }
    return uniqBy(results, ([id]) => id);
  }

  // controller
  const { message } = Controller();

  // 初次加载，什么都不看
  await batchSearch();

  setInterval(async () => {
    const res = await batchSearch();
    if (res) {
      res.forEach(([id, content]) => {
        message(`#${id} ${content}`);
      });
    }

    await sleep(Math.random() * 1000 * 10);
  }, 1000 * 60 * 15);
})();
