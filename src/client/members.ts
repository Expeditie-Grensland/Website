document
  .querySelectorAll<HTMLFormElement>("form[data-confirm-msg]")
  .forEach((form) =>
    form.addEventListener("submit", (e) => {
      const msg = e.submitter?.dataset.confirmMsg || form.dataset.confirmMsg;
      if (!confirm(msg)) e.preventDefault();
    })
  );

const updateRemoveDisabled = (formArray: HTMLElement) => {
  const buttons = formArray.querySelectorAll(
    ".form-array-row > .form-array-remove"
  );

  buttons.forEach((button) => {
    if (buttons.length <= (parseInt(formArray.dataset.minSize!) || 0)) {
      button.setAttribute("disabled", "");
    } else {
      button.removeAttribute("disabled");
    }
  });
};

const onRemove = (event: Event) => {
  event.preventDefault();

  const arrayRow = (event.target as HTMLElement).parentElement!;
  const formArray = arrayRow.parentElement!;

  arrayRow.remove();
  updateRemoveDisabled(formArray);
};

document
  .querySelectorAll(".form-array-remove")
  .forEach((el) => el.addEventListener("click", onRemove));

const onAdd = (event: Event) => {
  event.preventDefault();

  const formArray = (event.target as HTMLElement).parentElement!;
  const protoRow = formArray.querySelector(".form-array-proto")!;

  const newRow = protoRow.cloneNode(true) as HTMLElement;
  newRow.removeAttribute("hidden");
  newRow.className = "form-array-row";

  newRow
    .querySelectorAll(".form-array-item > *")
    .forEach((child) => child.removeAttribute("disabled"));

  newRow
    .querySelector(".form-array-remove")!
    .addEventListener("click", onRemove);

  formArray.insertBefore(newRow, protoRow);

  updateRemoveDisabled(formArray);
};

document
  .querySelectorAll(".form-array-add")
  .forEach((el) => el.addEventListener("click", onAdd));

const onColorChange = function (this: HTMLInputElement) {
  this.parentElement
    ?.querySelectorAll<HTMLInputElement>("input")
    .forEach((el) => {
      if (el == this) return;

      if (el.type == "color" && !this.value.match(/^#[0-9a-f]{6}$/)) {
        el.value = "#000000";
      } else {
        el.value = this.value;
      }
    });
};

document
  .querySelectorAll<HTMLInputElement>(".input-color > input")
  .forEach((el) => {
    el.addEventListener("change", onColorChange);
    el.addEventListener("input", onColorChange);
  });
