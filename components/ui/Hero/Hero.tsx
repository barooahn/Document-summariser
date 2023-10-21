import Logo from '../../../public/logo.svg';
import { HeroText } from './HeroText';
import VideoPlayer from '@/components/VideoPlayer';
import Image from 'next/image';

export function Hero() {
  return (
    <div className="flex flex-col lg:flex-row sm:pl-2 lg:px-10 w-full">
      <div className="block lg:hidden p-2 s:p-4">
        <Image priority height={40} src={Logo} alt="Chat Clause logo full" />
      </div>
      <div className="w-full lg:w-1/2 p-2 s:p-4 lg:px-0 flex">
        <HeroText />
      </div>
      <div className="w-full lg:w-1/2 p-2 s:p-4 lg:px-0">
        <VideoPlayer />
      </div>
    </div>
  );
}
