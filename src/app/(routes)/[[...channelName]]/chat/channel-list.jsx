import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const ChannelList = ({ channels }) => {
  const currentPath = usePathname();

  const createLi = (channel) => {
    return (
      <li key={channel.path}>
        <Link
          href={channel.path}
          className={clsx("flex items-center", {
            "font-bold": currentPath === channel.path,
          })}
        >
          {channel.label}
        </Link>
      </li>
    );
  };

  return <ul>{channels.map(createLi)}</ul>;
};

export default ChannelList;
