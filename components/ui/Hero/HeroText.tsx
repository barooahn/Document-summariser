import Logo from '../../../public/logo.svg';
import Image from 'next/image';

export function HeroText() {
  return (
    <div className="">
      <div className="hidden lg:block mb-4">
        <Image priority height={50} src={Logo} alt="Chat Clause logo full" />
      </div>
      <div className="">
        <p className="italic text-xl sm:text-2xl font-bold mb-4">
          Summarise and chat with your documents
        </p>
        <ul className="list-disc pl-5">
          <li className="text-lg sm:text-xl mb-2">
            Welcome to the Future of Legal Document Understanding!
          </li>
          <li className="text-lg sm:text-xl mb-2">
            Analyze, Decode, and Uncover Hidden Legal Pitfalls with AI!
          </li>
          <li className="text-lg sm:text-xl mb-2">
            Spotting Hazards, Clarifying Doubts - Your AI Legal Companion!
          </li>
          <li className="text-lg sm:text-xl">
            Empowering You to Make Informed and Safe Legal Decisions!
          </li>
        </ul>
      </div>
    </div>
  );
}
