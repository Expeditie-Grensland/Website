document
  .querySelectorAll(".form-confirm")
  .forEach((form) =>
    form.addEventListener("submit", () => confirm("Weet je het zeker?"))
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
