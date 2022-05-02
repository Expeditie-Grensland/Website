type Props = {
  title: string | string[];
  items: string[];
};

const SidebarList = ({ title, items }: Props) =>
  !items.length ? null : (
    <div>
      <h3 className="text-normal-gray">
        {typeof title === "string"
          ? title
          : items.length === 1
          ? title[0]
          : title[1]}
      </h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );

export default SidebarList;
