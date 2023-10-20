import Logo from '../../../public/logo.svg';
import { HeroText } from './HeroText';
import VideoPlayer from '@/components/VideoPlayer';
import Image from 'next/image';

export function Hero() {
  return (
    <div className="flex flex-col lg:flex-row lg:p-10 items-center w-full">
      <div className="block lg:hidden">
        <Image priority height={40} src={Logo} alt="Chat Clause logo full" />
      </div>
      <div className="w-full lg:w-1/2 px-4 lg:px-0">
        <HeroText />
      </div>
      <div className="w-full lg:w-1/2 px-4 lg:px-0">
        <VideoPlayer />
      </div>
    </div>
  );
}
