export const Controller = () => {
  const controller = document.createElement("div");
  controller.className = "holy-controller";

  const titleDiv = document.createElement("div");
  controller.appendChild(titleDiv);

  const messagesDiv = document.createElement("div");
  controller.appendChild(messagesDiv);

  function message(text: string) {
    const div = document.createElement("div");
    div.innerText = text;
    messagesDiv.appendChild(div);
    title("共发现" + messagesDiv.children.length + "条新消息");
  }
  function title(text: string) {
    titleDiv.innerText = text;
  }

  document.body.appendChild(controller);

  return { message, title };
};

export default Controller;
