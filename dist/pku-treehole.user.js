// ==UserScript==
// @name       pku-treehole
// @namespace  npm/vite-plugin-monkey
// @version    0.0.0
// @author     monkey
// @icon       https://vitejs.dev/logo.svg
// @match      https://treehole.pku.edu.cn/*
// @run-at     document-body
// ==/UserScript==

(o=>{const e=document.createElement("style");e.dataset.source="vite-plugin-monkey",e.textContent=o,document.head.append(e)})(" .holy-controller{position:fixed;right:0;top:0;background-color:#00000080;color:#fff;width:30vw;max-height:50vh;overflow-y:scroll} ");

(function () {
  'use strict';

  var __spreadArray = globalThis && globalThis.__spreadArray || function(to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar)
            ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
  function purry(fn, args, lazy) {
    var diff = fn.length - args.length;
    var arrayArgs = Array.from(args);
    if (diff === 0) {
      return fn.apply(void 0, arrayArgs);
    }
    if (diff === 1) {
      var ret = function(data) {
        return fn.apply(void 0, __spreadArray([data], arrayArgs, false));
      };
      if (lazy || fn.lazy) {
        ret.lazy = lazy || fn.lazy;
        ret.lazyArgs = args;
      }
      return ret;
    }
    throw new Error("Wrong number of arguments");
  }
  function _reduceLazy(array, lazy, indexed) {
    var newArray = [];
    for (var index = 0; index < array.length; index++) {
      var item = array[index];
      var result = indexed ? lazy(item, index, array) : lazy(item);
      if (result.hasMany === true) {
        newArray.push.apply(newArray, result.next);
      } else if (result.hasNext) {
        newArray.push(result.next);
      }
    }
    return newArray;
  }
  function uniqBy() {
    return purry(_uniqBy, arguments, lazyUniqBy);
  }
  function _uniqBy(array, transformer) {
    return _reduceLazy(array, lazyUniqBy(transformer));
  }
  function lazyUniqBy(transformer) {
    var set = /* @__PURE__ */ new Set();
    return function(value) {
      var appliedItem = transformer(value);
      if (set.has(appliedItem)) {
        return {
          done: false,
          hasNext: false
        };
      }
      set.add(appliedItem);
      return {
        done: false,
        hasNext: true,
        next: value
      };
    };
  }
  const Controller = () => {
    const controller = document.createElement("div");
    controller.className = "holy-controller";
    const titleDiv = document.createElement("div");
    controller.appendChild(titleDiv);
    const messagesDiv = document.createElement("div");
    controller.appendChild(messagesDiv);
    function message(text) {
      const div = document.createElement("div");
      div.innerText = text;
      messagesDiv.appendChild(div);
      title("共发现" + messagesDiv.children.length + "条新消息");
    }
    function title(text) {
      titleDiv.innerText = text;
    }
    document.body.appendChild(controller);
    return { message, title };
  };
  const originalXMLHttpRequest = window.XMLHttpRequest;
  let totalRequest = 0;
  window.XMLHttpRequest = class extends originalXMLHttpRequest {
    constructor() {
      super();
      this.addEventListener("readystatechange", () => {
        if (this.readyState === 4) {
          console.log(
            totalRequest++,
            "XMLHttpRequest info:",
            this.responseURL,
            this.status,
            this.statusText
          );
        }
      });
    }
    open(method, url, async = true, user, password) {
      console.log("XMLHttpRequest open:", method, url);
      super.open(method, url, async, user, password);
    }
    send(body) {
      console.log("XMLHttpRequest send:", body);
      super.send(body);
    }
  };
  (async () => {
    const $ = (s, element = document) => element.querySelector(s);
    const $$ = (s, element = document) => Array.from(element.querySelectorAll(s));
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    function getParser() {
      let lastId = -1;
      return () => {
        const messages = $$(".flow-item").map((item) => {
          const id = Number($(".box-id", item).innerText.slice(1).trim());
          const content = $(".box-content", item).innerText;
          return [id, content];
        });
        const newMessages = messages.filter(([id]) => id > lastId);
        lastId = messages[0][0];
        return newMessages;
      };
    }
    async function search(text) {
      const input = $("input.control-search");
      if (!input)
        return;
      input.value = text;
      input.dispatchEvent(new Event("input"));
      await sleep(1e3);
      const searchBtn = $(".search-btn > button");
      console.log("CLICK");
      searchBtn.click();
      return new Promise((r) => {
        const target = $(".flow-chunk");
        const observer = new MutationObserver((mutations, observer2) => {
          const messages = $("div", target);
          console.debug(mutations, observer2);
          if (messages) {
            observer2.disconnect();
            r();
          }
        });
        observer.observe(target, { childList: true });
      });
    }
    const keywords = ["kml", "qdb", "健身房"];
    const parsers = keywords.map((_) => getParser());
    async function batchSearch() {
      const results = [];
      for (let i = 0; i < keywords.length; i++) {
        const keyword = keywords[i];
        await search(keyword);
        const parser = parsers[i];
        const messages = parser();
        results.push(...messages);
      }
      return uniqBy(results, ([id]) => id);
    }
    const { message } = Controller();
    await batchSearch();
    setInterval(async () => {
      const res = await batchSearch();
      if (res) {
        res.forEach(([id, content]) => {
          message(`#${id} ${content}`);
        });
      }
      await sleep(Math.random() * 1e3 * 10);
    }, 1e3 * 60 * 15);
  })();

})();
