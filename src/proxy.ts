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

  open(method: string, url: string | URL): void;
  open(
    method: string,
    url: string,
    async: boolean = true,
    user?: string,
    password?: string
  ) {
    console.log("XMLHttpRequest open:", method, url);
    super.open(method, url, async, user, password);
  }

  send(body?: Document | XMLHttpRequestBodyInit | null): void {
    console.log("XMLHttpRequest send:", body);
    super.send(body);
  }
};
