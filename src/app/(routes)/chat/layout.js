import ChatLayoutClient from "./ChatLayoutClient";

export const metadata = {
  title: "Messages",
  description: "Message clients and freelancers on TrueHire. Secure in-platform chat.",
};

export default function ChatLayout({ children }) {
  return <ChatLayoutClient>{children}</ChatLayoutClient>;
}
