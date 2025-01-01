Array.from(document.getElementsByClassName("form-confirm")).forEach((form) =>
  form.addEventListener("submit", () => confirm("Weet je het zeker?"))
);

Array.from(document.getElementsByClassName("form-array-add")).forEach(
  (addElement) =>
    addElement.addEventListener("click", (event) => {
      if (!(event.target instanceof HTMLElement)) return;

      const formArray = event.target.parentElement!;
      const protoItem = formArray
        .getElementsByClassName("form-array-proto")
        .item(0)! as HTMLElement;

      const newItem = protoItem.cloneNode(true) as HTMLElement;
      newItem.removeAttribute("hidden");
      newItem.removeAttribute("disabled");
      newItem.classList.remove("form-array-proto");
      newItem.classList.add("form-array-item");

      Array.from(newItem.querySelectorAll(":disabled")).forEach(
        (disabledInput) => disabledInput.removeAttribute("disabled")
      );

      formArray.insertBefore(newItem, protoItem);

      formArray
        .getElementsByClassName("form-array-remove")
        .item(0)!
        .removeAttribute("disabled");

      return false;
    })
);

Array.from(document.getElementsByClassName("form-array-remove")).forEach(
  (removeElement) =>
    removeElement.addEventListener("click", (event) => {
      if (!(event.target instanceof HTMLElement)) return;

      const formArray = event.target.parentElement!;
      const items = formArray.getElementsByClassName("form-array-item");
      const allowEmpty = formArray.classList.contains("form-array-allow-empty");

      if (items.length < (allowEmpty ? 2 : 3))
        event.target.setAttribute("disabled", "");

      if (items.length > (allowEmpty ? 0 : 1))
        items.item(items.length - 1)!.remove();

      return false;
    })
);
