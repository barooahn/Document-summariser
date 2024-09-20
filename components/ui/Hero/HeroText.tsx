import Logo from '../../../public/logo.svg';
import Image from 'next/image';

export function HeroText() {
  return (
    <div className="my-auto">
      <div className="hidden lg:block mb-0">
        <Image priority height={50} src={Logo} alt="Chat Clause logo full" />
      </div>
      <div className="">
        <p className="italic text-xs lg:text-lg xl:text-lg font-bold mb-4">
          Summarise and chat with your documents
        </p>

          <p className="text-xs lg:text-m xl:text-xl mb-4">
            Welcome to the Future of Legal Document Understanding!
          </p>
          <p className="text-xs lg:text-m xl:text-xl mb-4">
            Analyze, Decode, and Uncover Hidden Legal Pitfalls with AI!
          </p>
          <p className="text-xs lg:text-m xl:text-xl mb-4">
            Spotting Hazards, Clarifying Doubts - Your AI Legal Companion!
          </p>
          <p className="text-xs lg:text-m xl:text-xl">
            Empowering You to Make Informed and Safe Legal Decisions!
          </p>
        
      </div>
    </div>
  );
}
