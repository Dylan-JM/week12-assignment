import { useState } from "react";
import { Input } from "@/components/ui/input";

const MessageInput = ({ onSubmit, disabled }) => {
  const [input, setInput] = useState("");

  const handleChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(input);
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="text"
        value={input}
        onChange={handleChange}
        disabled={disabled}
        placeholder={
          disabled ? "This input has been disabled." : "Your message here"
        }
      />
    </form>
  );
};
export default MessageInput;
