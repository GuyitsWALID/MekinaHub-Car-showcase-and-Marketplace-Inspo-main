"use client";

interface ButtonProps {
  isDisabled?: boolean;
  btnType?: "button" | "submit" | "reset";
  containerStyles?: string;
  textStyles?: string;
  title: string;
  rightIcon?: string;
  handleClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ isDisabled, btnType, containerStyles, textStyles, title, rightIcon, handleClick }) => (
  <button
    disabled={isDisabled}
    type={btnType || "button"}
    className={`custom-btn ${containerStyles}`}
    onClick={handleClick}
  >
    <span className={`flex-1 ${textStyles}`}>{title}</span>
    {rightIcon && (
      <div className="relative w-6 h-6">
        <img
          src={rightIcon}
          alt="arrow_left"
          className="object-contain w-full h-full"
        />
      </div>
    )}
  </button>
);

export default Button;
